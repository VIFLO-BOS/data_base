import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillAuthRoleRecords1790121600001 implements MigrationInterface {
  name = 'BackfillAuthRoleRecords1790121600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "clients" ("user_id")
      SELECT "user_roles"."user_id"
      FROM "user_roles"
      INNER JOIN "roles" ON "roles"."id" = "user_roles"."role_id"
      WHERE "roles"."name" = 'client'
      ON CONFLICT ("user_id") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "taskers" ("user_id", "first_name", "last_name", "email")
      SELECT "users"."id", "profiles"."first_name", "profiles"."last_name", "users"."email"
      FROM "users"
      INNER JOIN "user_roles" ON "user_roles"."user_id" = "users"."id"
      INNER JOIN "roles" ON "roles"."id" = "user_roles"."role_id"
      LEFT JOIN "profiles" ON "profiles"."user_id" = "users"."id"
      WHERE "roles"."name" = 'tasker'
      ON CONFLICT ("user_id") DO NOTHING
    `);
  }

  // Role records become normal application data after backfill and must not be deleted on rollback.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
