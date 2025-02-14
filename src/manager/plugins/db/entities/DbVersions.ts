import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('db_versions')
export class DbVersions {
  /**
   * 元信息键
   */
    // @ts-ignore
  @PrimaryColumn({ type: 'varchar' })
  key!: string

  /**
   * 元信息值
   */
    // @ts-ignore
  @Column({ type: 'json' })
  value: any

  static create(key: string, value: any) {
    const m = new DbVersions()
    m.key = key
    m.value = value
    return m
  }
}
