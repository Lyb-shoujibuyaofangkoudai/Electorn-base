import { IPlugin } from '../../interface'
import { Core } from '../../Core'

export class Bridge implements IPlugin {
  static id: string = 'bridge'
  name = Bridge.id

  init(manager: Core): void {
  }

}
