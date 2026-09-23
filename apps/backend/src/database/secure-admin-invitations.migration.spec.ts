import { createHash } from 'crypto';
import { QueryRunner } from 'typeorm';
import { SecureAdminInvitations1790121600000 } from './migrations/1790121600000-SecureAdminInvitations';

describe('SecureAdminInvitations migration', () => {
  it('hashes existing raw tokens so already-issued links remain valid', async () => {
    const rawToken = 'already-emailed-invitation-token';
    const query = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([{ id: 'invite-id', token_hash: rawToken }])
      .mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;

    await new SecureAdminInvitations1790121600000().up(queryRunner);

    expect(query).toHaveBeenCalledWith(
      `UPDATE "admin_invitations" SET "token_hash" = $1 WHERE "id" = $2`,
      [createHash('sha256').update(rawToken).digest('hex'), 'invite-id'],
    );
  });
});
