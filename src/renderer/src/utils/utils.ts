import { useMsg } from '../hooks/useMsg'

export function copy(value:string,successMsg:string = '复制成功',errorMsg:string = '复制失败') {
  const { message } = useMsg()
  const { text, copy:Copy, copied, isSupported } = useClipboard({ source: value })
  if(isSupported.value) {
    Copy(value)
    if(copied.value) {
      message.success(successMsg)
    } else {
      message.error(errorMsg)
    }
  }
}
