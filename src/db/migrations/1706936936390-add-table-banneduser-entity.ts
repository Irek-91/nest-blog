import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableBanneduserEntity1706936936390 implements MigrationInterface {
    name = 'AddTableBanneduserEntity1706936936390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bannedusers" ("userId" character varying NOT NULL, "banReason" character varying NOT NULL, CONSTRAINT "PK_24b2d0a53393d4752078686557e" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`ALTER TABLE "bannedusers" ADD CONSTRAINT "FK_24b2d0a53393d4752078686557e" FOREIGN KEY ("userId") REFERENCES "users"("_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bannedusers" DROP CONSTRAINT "FK_24b2d0a53393d4752078686557e"`);
        await queryRunner.query(`DROP TABLE "bannedusers"`);
    }

}
