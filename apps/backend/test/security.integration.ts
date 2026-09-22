import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';
import { AdminsService } from '../src/modules/admins/admins.service';
import { MailService } from '../src/modules/admins/mail.service';
import { UserEntity } from '../src/modules/users/entities/user.entity';
import { RoleEntity } from '../src/modules/roles/entities/role.entity';
import { AdminInvitationEntity } from '../src/modules/admins/entities/admin-invitation.entity';
import { seedRoles } from '../src/database/seeds/roles.seed';
import { seedAdmin } from '../src/database/seeds/admin.seed';
import { AppDataSource } from '../src/database/data-source';

const mockGetUser = jest.fn();
jest.mock('@supabase/supabase-js', () => ({ createClient: () => ({ auth: { getUser: mockGetUser } }) }));

describe('deployment security against PostgreSQL', () => {
  let app: INestApplication;
  let db: DataSource;
  let auth: AuthService;
  const password = 'StrongPass1';
  const register = (role = 'client') => auth.register({ email: randomUUID() + '@example.com', password, firstName: 'Test', lastName: 'User', role });
  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    await AppDataSource.destroy();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailService).useValue({ sendAdminInvitation: jest.fn() }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
    db = app.get(DataSource);
    auth = app.get(AuthService);
    await db.transaction(seedRoles);
  });
  beforeEach(async () => { await db.query('DELETE FROM auth_rate_limits'); mockGetUser.mockReset(); });
  afterAll(async () => { if (app) await app.close(); });

  it('provisions roles and an initial admin idempotently without elevating existing accounts', async () => {
    const env = { BOOTSTRAP_ADMIN: 'true', BOOTSTRAP_ADMIN_EMAIL: 'bootstrap@example.com', BOOTSTRAP_ADMIN_PASSWORD: password, BOOTSTRAP_ADMIN_FIRST_NAME: 'Initial', BOOTSTRAP_ADMIN_LAST_NAME: 'Admin' };
    await db.transaction(async m => { await seedRoles(m); await seedAdmin(m, env); });
    const counts = [await db.getRepository(UserEntity).count(), await db.getRepository(RoleEntity).count()];
    await db.transaction(async m => { await seedRoles(m); await seedAdmin(m, env); });
    expect([await db.getRepository(UserEntity).count(), await db.getRepository(RoleEntity).count()]).toEqual(counts);
    const user = await register();
    await expect(db.transaction(m => seedAdmin(m, { ...env, BOOTSTRAP_ADMIN_EMAIL: user.user.email }))).rejects.toThrow('Refusing');
  });

  it('persists password sessions, refreshes once, and rejects concurrent reuse and logout replay', async () => {
    const account = await register();
    const signedIn = await auth.login({ email: account.user.email, password });
    const attempts = await Promise.allSettled([auth.refresh(signedIn.refreshToken), auth.refresh(signedIn.refreshToken)]);
    expect(attempts.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    const rotated = (attempts.find(result => result.status === 'fulfilled') as PromiseFulfilledResult<{ refreshToken: string }>).value;
    expect(rotated.refreshToken).not.toBe(signedIn.refreshToken);
    await auth.logout(rotated.refreshToken);
    await expect(auth.refresh(rotated.refreshToken)).rejects.toMatchObject({ status: 401 });
  });

  it('rejects expired, revoked, and inactive sessions', async () => {
    const account = await register();
    const payload = jwt.decode(account.refreshToken) as jwt.JwtPayload;
    await db.query('UPDATE sessions SET expires_at = now() - interval \'1 second\' WHERE id = $1', [payload.jti]);
    await expect(auth.refresh(account.refreshToken)).rejects.toMatchObject({ status: 401 });
    const active = await register();
    await db.manager.update(UserEntity, active.user.id, { status: 'suspended' });
    await expect(auth.refresh(active.refreshToken)).rejects.toMatchObject({ status: 401 });
    await request(app.getHttpServer()).get('/api/v1/auth/me').auth(active.accessToken, { type: 'bearer' }).expect(401);
  });

  it('requires access tokens and protects analytics with roles', async () => {
    const client = await register();
    await request(app.getHttpServer()).get('/api/v1/dashboard-analytics/summary').expect(401);
    for (const account of [client, await register('tasker')]) {
      await request(app.getHttpServer()).get('/api/v1/dashboard-analytics/summary').auth(account.accessToken, { type: 'bearer' }).expect(403);
    }
    await request(app.getHttpServer()).get('/api/v1/auth/me').auth(client.refreshToken, { type: 'bearer' }).expect(401);
    const malformed = jwt.sign({ type: 'access' }, process.env.JWT_SECRET!);
    await request(app.getHttpServer()).get('/api/v1/auth/me').auth(malformed, { type: 'bearer' }).expect(401);
    await expect(auth.refresh(client.accessToken)).rejects.toMatchObject({ status: 401 });
  });

  it('rejects forged OAuth and public admin creation', async () => {
    await request(app.getHttpServer()).post('/api/v1/auth/oauth-login').send({ email: 'victim@example.com', role: 'admin' }).expect(400);
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('forged') });
    await request(app.getHttpServer()).post('/api/v1/auth/oauth-login').send({ accessToken: 'forged', role: 'client' }).expect(401);
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({ email: 'admin@example.com', firstName: 'Test', lastName: 'User', password, role: 'admin' }).expect(400);
  });

  it('uses verified provider ID and refuses automatic email linking', async () => {
    const identity = { id: randomUUID(), email: randomUUID() + '@example.com', email_confirmed_at: new Date().toISOString(), user_metadata: { full_name: 'OAuth User' } };
    mockGetUser.mockResolvedValue({ data: { user: identity }, error: null });
    const first = await auth.oauthLogin({ accessToken: 'valid-provider-token', role: 'client' });
    const second = await auth.oauthLogin({ accessToken: 'valid-provider-token', role: 'tasker' });
    expect(second.user.id).toBe(first.user.id);
    expect(second.user.roles).toEqual(['client']);
    const passwordUser = await register();
    mockGetUser.mockResolvedValue({ data: { user: { ...identity, id: randomUUID(), email: passwordUser.user.email } }, error: null });
    await expect(auth.oauthLogin({ accessToken: 'valid-provider-token', role: 'client' })).rejects.toMatchObject({ status: 409 });
  });

  it('validates invitations, projects safe responses, and consumes invitations exactly once', async () => {
    const inviter = await auth.login({ email: 'bootstrap@example.com', password });
    const email = randomUUID() + '@example.com';
    await request(app.getHttpServer()).post('/api/v1/admins/invite').auth(inviter.accessToken, { type: 'bearer' }).send({ email: 'invalid', role: 'super_admin' }).expect(400);
    await request(app.getHttpServer()).post('/api/v1/admins/invite').auth(inviter.accessToken, { type: 'bearer' }).send({ email, role: 'admin' }).expect(201);
    const invitation = await db.getRepository(AdminInvitationEntity).findOneByOrFail({ email });
    const pending = await request(app.getHttpServer()).get('/api/v1/admins/invitations/pending').auth(inviter.accessToken, { type: 'bearer' }).expect(200);
    expect(JSON.stringify(pending.body)).not.toMatch(/passwordHash|password_hash|"token"/);
    expect(JSON.stringify(pending.body)).not.toContain(invitation.token);
    await request(app.getHttpServer()).post('/api/v1/admins/invite/' + invitation.token + '/accept').send({ firstName: ' ', lastName: 'Test', password: 'weak' }).expect(400);
    const service = app.get(AdminsService);
    const results = await Promise.allSettled([service.acceptInvitation(invitation.token, { firstName: 'New', lastName: 'Admin', password }), service.acceptInvitation(invitation.token, { firstName: 'New', lastName: 'Admin', password })]);
    expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    const accepted = await auth.login({ email, password });
    expect(accepted.user.roles).toEqual(['admin']);
    const plain = await db.getRepository(UserEntity).findOneByOrFail({ email });
    expect(plain.passwordHash).toBeUndefined();
  });

  it('rolls back registration if its required role is missing', async () => {
    await expect(auth.register({ email: 'invalid@example.com', password, firstName: 'Invalid', lastName: 'User', role: 'missing' })).rejects.toMatchObject({ status: 400 });
    expect(await db.getRepository(UserEntity).findOneBy({ email: 'invalid@example.com' })).toBeNull();
  });

  it('exposes liveness/readiness and enforces shared authentication limits', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
    for (let i = 0; i < 20; i++) await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'none@example.com', password }).expect(401);
    await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: 'none@example.com', password }).expect(429);
    const [row] = await db.query('SELECT max(hits) AS hits FROM auth_rate_limits');
    expect(row.hits).toBe(21);
  });
});
