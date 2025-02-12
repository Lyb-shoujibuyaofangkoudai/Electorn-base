import { Column, Entity, PrimaryColumn } from 'typeorm'

/**
 * 存放了一位灵魂所在
 */
@Entity('settings')
export class Settings {
  /**
   * 设置项唯一标识，e.g. `some-function/setting-1/setting-2`
   */
  @PrimaryColumn({ type: 'varchar' })
  key!: string

  /**
   * 设置内容
   */
  @Column({ type: 'json' })
  value: any

  static defaultSettings = {
    theme: {
      name: 'dark'
    },
    main_window: {
      width: 1200,
      height: 800
    }
  }


}
