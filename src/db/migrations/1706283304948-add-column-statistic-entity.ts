import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnStatisticEntity1706283304948 implements MigrationInterface {
    name = 'AddColumnStatisticEntity1706283304948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statistics" ADD "avgScores" numeric DEFAULT 'sumScore / (winsCount + lossesCount + drawcount)'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "statistics" DROP COLUMN "avgScores"`);
    }

}
