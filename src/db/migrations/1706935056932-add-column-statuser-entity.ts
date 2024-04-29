import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnStatuserEntity1706935056932
  implements MigrationInterface
{
  name = 'AddColumnStatuserEntity1706935056932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "status" boolean DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
  }
}
