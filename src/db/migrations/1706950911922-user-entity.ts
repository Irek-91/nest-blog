import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEntity1706950911922 implements MigrationInterface {
  name = 'UserEntity1706950911922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT true`,
    );
  }
}
