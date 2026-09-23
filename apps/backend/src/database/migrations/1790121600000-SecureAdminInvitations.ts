import { createHash } from 'crypto';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecureAdminInvitations1790121600000 implements MigrationInterface {
  name = 'SecureAdminInvitations1790121600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin_invitations" RENAME COLUMN "token" TO "token_hash"`,
    );

    const invitations: Array<{ id: string; token_hash: string }> =
      await queryRunner.query(
        `SELECT "id", "token_hash" FROM "admin_invitations"`,
      );
    for (const invitation of invitations) {
      const tokenHash = createHash('sha256')
        .update(invitation.token_hash)
        .digest('hex');
      await queryRunner.query(
        `UPDATE "admin_invitations" SET "token_hash" = $1 WHERE "id" = $2`,
        [tokenHash, invitation.id],
      );
    }

    await queryRunner.query(
      `ALTER TABLE "admin_invitations" ADD "accepted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_invitations" ADD "revoked_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `UPDATE "admin_invitations" SET "accepted_at" = "updated_at" WHERE "accepted" = true`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_invitations" DROP COLUMN "accepted"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin_invitations" ADD "accepted" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `UPDATE "admin_invitations" SET "accepted" = true WHERE "accepted_at" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_invitations" DROP COLUMN "revoked_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_invitations" DROP COLUMN "accepted_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_invitations" RENAME COLUMN "token_hash" TO "token"`,
    );
  }
}
