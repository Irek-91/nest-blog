import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnUserBlogEntity1706641036990 implements MigrationInterface {
    name = 'AddColumnUserBlogEntity1706641036990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" ADD "userId" character varying`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "userLogin" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "userLogin"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "userId"`);
    }

}
