import { Column, Entity, PrimaryColumn } from 'typeorm'

/**
 * 存放了一位灵魂所在
 */
@Entity('settings')
export class Settings {
  /**
   * 设置项唯一标识，e.g. `some-function/setting-1/setting-2`
   */
  // @ts-ignore
  @PrimaryColumn({ type: 'varchar' })
  key!: string

  /**
   * 设置内容
   */
  // @ts-ignore
  @Column({ type: 'json' })
  value: any

  /**
   * 默认config设置
   */
  static defaultSettings = {
    theme: {
      name: 'dark'
    },
    main_window: {
      width: 1200,
      height: 800
    },
    debug: {
      openDevTools: 1,
      recordRequest: 0,
    },
    themeConfig: {
      primary: '#1677ff',
      info: '#722ed1',
      success: '#52c41a',
      warning: '#faad14',
      error: '#f5222d'
    },
    neutralThemeConfig: {
      neutralPopover: {
        color: '#2D3260',
        effects: [ 'popoverColor' ],
        title: 'neutralPopover'
      },
      neutralCard: {
        color: '#2D3260',
        effects: [ 'tableColor', 'cardColor' ],
        title: 'neutralCard'
      },
      neutralModal: {
        color: '#2D3260',
        effects: [ 'modalColor' ],
        title: 'neutralModal'
      },
      neutralBody: {
        color: '#2D3260',
        effects: [ 'bodyColor' ],
        title: 'neutralBody'
      }
    }
  }
}
