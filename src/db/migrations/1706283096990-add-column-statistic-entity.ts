import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnStatisticEntity1706283096990 implements MigrationInterface {
    name = 'AddColumnStatisticEntity1706283096990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statistics" ADD "avgScores" numeric DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "avgScores"`);
    }

}
