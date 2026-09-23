import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncUserOAuthColumns1790125200000
  implements MigrationInterface
{
  name = 'SyncUserOAuthColumns1790125200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "supabase_user_id" uuid
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_supabase_user_id"
      ON "users" ("supabase_user_id")
      WHERE "supabase_user_id" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "updated_at"
      TIMESTAMP NOT NULL DEFAULT now()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_users_supabase_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "supabase_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "updated_at"
    `);
  }
}