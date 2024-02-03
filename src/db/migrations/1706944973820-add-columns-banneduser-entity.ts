import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsBanneduserEntity1706944973820 implements MigrationInterface {
    name = 'AddColumnsBanneduserEntity1706944973820'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bannedusers" ADD "banDate" character varying`);
        await queryRunner.query(`ALTER TABLE "bannedusers" ALTER COLUMN "banReason" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bannedusers" ALTER COLUMN "banReason" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bannedusers" DROP COLUMN "banDate"`);
    }

}
