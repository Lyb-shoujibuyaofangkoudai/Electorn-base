import { QueryRunner, MigrationInterface, Table } from "typeorm";

export class V_2 implements MigrationInterface {
  down(queryRunner: QueryRunner): Promise<any> {
    return Promise.resolve(undefined);
  }

  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "search_history",
        columns: [
          {
            name: "id",
            type: "integer",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "summonerName",
            type: "varchar",
          },
          {
            name: "avatar",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "searchTime",
            type: "datetime",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "region",
            type: "varchar",
            isNullable: true,
          },
          {
            name: "regionDetail",
            type: "varchar",
            isNullable: true,
          }
        ],
      }),
    );

    // 更新数据库版本
    await queryRunner.query(
      `UPDATE db_versions SET value = json('2') WHERE key = 'version'`,
    );

    return Promise.resolve(undefined);
  }
}
