import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class Migration1706203940104 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "statistics",
            new TableColumn({
                name: "avgScores",
                type: "numeric",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("statistics", "avgScores")

    }

}
