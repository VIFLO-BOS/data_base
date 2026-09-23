import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthRateLimits1790120000000
  implements MigrationInterface
{
  name = 'CreateAuthRateLimits1790120000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "auth_rate_limits" (
        "key" varchar(64) NOT NULL,
        "hits" integer NOT NULL DEFAULT 1,
        "expires_at" timestamptz NOT NULL,
        CONSTRAINT "PK_auth_rate_limits_key" PRIMARY KEY ("key")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_auth_rate_limits_expires_at"
      ON "auth_rate_limits" ("expires_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_auth_rate_limits_expires_at"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "auth_rate_limits"
    `);
  }
}