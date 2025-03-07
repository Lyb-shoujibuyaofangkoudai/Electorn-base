import { QueryRunner, MigrationInterface, Table } from "typeorm";

export class V_1 implements MigrationInterface {
  down(queryRunner: QueryRunner): Promise<any> {
    return Promise.resolve(undefined);
  }

  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.createTable(
      new Table({
        name: "db_versions",
        columns: [
          {
            name: "key",
            type: "varchar",
            isPrimary: true,
          },
          {
            name: "value",
            type: "json",
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: "settings",
        columns: [
          {
            name: "key",
            type: "varchar",
            isPrimary: true,
          },
          {
            name: "value",
            type: "json",
          },
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: "recent_search",
        columns: [
          {
            name: "puuid",
            type: "varchar",
            isPrimary: true,
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

    // 插入数据版本信息
    await queryRunner.query(
      `INSERT INTO db_versions (key, value) VALUES ('version', json('1'))`,
    );

    return Promise.resolve(undefined);
  }
}
