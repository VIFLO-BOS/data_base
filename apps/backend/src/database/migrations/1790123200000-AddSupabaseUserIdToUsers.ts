import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupabaseUserIdToUsers1790123200000
  implements MigrationInterface
{
  name = 'AddSupabaseUserIdToUsers1790123200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "supabase_user_id" uuid
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "UQ_users_supabase_user_id"
      UNIQUE ("supabase_user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT IF EXISTS "UQ_users_supabase_user_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "supabase_user_id"
    `);
  }
}