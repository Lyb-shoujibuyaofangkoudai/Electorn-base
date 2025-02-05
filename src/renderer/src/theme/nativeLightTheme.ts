import { GlobalThemeOverrides } from 'naive-ui'

export const nativeDarkTheme:GlobalThemeOverrides = {
  common: {
    // 基础背景色
    baseColor: '#272B57',
    // 主色调
    primaryColor: '#FFA500',
    // 主色调悬停态，适当提高亮度和饱和度
    primaryColorHover: '#FFBC52',
    // 主色调按压态，降低亮度
    primaryColorPressed: '#CC8400',
    // 主色调补充色，稍微调整色调和亮度
    primaryColorSuppl: '#FFD18C',

    // 信息色，选择蓝色系，与背景和主色调形成对比且和谐
    infoColor: '#2196F3',
    infoColorHover: '#42A5F5',
    infoColorPressed: '#1976D2',
    infoColorSuppl: '#64B5F6',

    // 成功色，绿色系表示成功
    successColor: '#4CAF50',
    successColorHover: '#66BB6A',
    successColorPressed: '#388E3C',
    successColorSuppl: '#81C784',

    // 警告色，黄色系强调警告
    warningColor: '#FF9800',
    warningColorHover: '#FFB74D',
    warningColorPressed: '#F57C00',
    warningColorSuppl: '#FFCC80',

    // 错误色，红色系表示错误
    errorColor: '#F44336',
    errorColorHover: '#EF5350',
    errorColorPressed: '#D32F2F',
    errorColorSuppl: '#E57373',

    // 文本颜色，根据背景色选择合适的白色系
    textColorBase: '#FFFFFF',
    textColor1: '#F0F0F0',
    textColor2: '#E0E0E0',
    textColor3: '#C0C0C0',
    textColorDisabled: '#909090',

    // 占位符颜色
    placeholderColor: '#A0A0A0',
    placeholderColorDisabled: '#808080',

    // 图标颜色
    iconColor: '#FFFFFF',
    iconColorHover: '#F0F0F0',
    iconColorPressed: '#E0E0E0',
    iconColorDisabled: '#909090',

    // 透明度相关
    opacity1: '0.1',
    opacity2: '0.2',
    opacity3: '0.3',
    opacity4: '0.4',
    opacity5: '0.5',

    // 分割线和边框颜色，基于背景色适当调亮
    dividerColor: '#3A3E67',
    borderColor: '#3A3E67',

    // 关闭图标颜色
    closeIconColor: '#FFFFFF',
    closeIconColorHover: '#FF4545',
    closeIconColorPressed: '#E63E3E',
    closeColorHover: '#FF6B6B',
    closeColorPressed: '#FF3B3B',

    // 清除按钮颜色
    clearColor: '#FFFFFF',
    clearColorHover: '#F0F0F0',
    clearColorPressed: '#E0E0E0',

    // 滚动条颜色
    scrollbarColor: '#3A3E67',
    scrollbarColorHover: '#4B4F78',

    // 进度条轨道颜色
    progressRailColor: '#3A3E67',
    railColor: '#3A3E67',

    // 弹出框、表格、卡片、模态框等组件颜色，基于背景色微调
    popoverColor: '#2D3260',
    tableColor: '#272B57',
    cardColor: '#2D3260',
    modalColor: '#2D3260',
    bodyColor: '#272B57',
    tagColor: '#2D3260',
    avatarColor: '#2D3260',

    // 反色，用于强调等场景
    invertedColor: '#FFFFFF',

    // 输入框颜色
    inputColor: '#2D3260',
    inputColorDisabled: '#252954',

    // 代码块颜色
    codeColor: '#2D3260',

    // 标签页颜色
    tabColor: '#2D3260',

    // 操作颜色，与主色调一致
    actionColor: '#FFA500',

    // 表格头部颜色
    tableHeaderColor: '#2D3260',

    // 悬停和按压颜色
    hoverColor: '#3A3E67',
    tableColorHover: '#3A3E67',
    tableColorStriped: '#2B305A',
    pressedColor: '#22264F',

    // 禁用透明度
    opacityDisabled: '0.5',

    // 按钮 2 颜色
    buttonColor2: '#2D3260',
    buttonColor2Hover: '#3A3E67',
    buttonColor2Pressed: '#22264F',

    // 阴影颜色，采用半透明黑色
    boxShadow1: '0 1px 3px rgba(0, 0, 0, 0.2)',
    boxShadow2: '0 2px 4px rgba(0, 0, 0, 0.2)',
    boxShadow3: '0 3px 6px rgba(0, 0, 0, 0.2)'
  },
  Tabs: {
    colorSegment: '#3A3E67',
    tabTextColorLine: '#C0C0C0',
    tabTextColorActiveLine: '#FFA500',
    tabTextColorHoverLine: '#FFBC52',
    tabTextColorDisabledLine: '#909090',
    tabTextColorSegment: '#C0C0C0',
    tabTextColorActiveSegment: '#FFA500',
    tabTextColorHoverSegment: '#FFBC52',
    tabTextColorDisabledSegment: '#909090',
    tabTextColorBar: '#C0C0C0',
    tabTextColorActiveBar: '#FFA500',
    tabTextColorHoverBar: '#FFBC52',
    tabTextColorDisabledBar: '#909090',
    tabTextColorCard: '#C0C0C0',
    tabTextColorHoverCard: '#FFBC52',
    tabTextColorActiveCard: '#FFA500',
    tabTextColorDisabledCard: '#909090',
    barColor: '#FFA500FF',
    closeIconColor: '#FFFFFF',
    closeIconColorHover: '#FF4545',
    closeIconColorPressed: '#E63E3E',
    closeColorHover: '#FF6B6B',
    closeColorPressed: '#FF3B3B',
    tabColor: '#2D3260',
    tabColorSegment: '#2D3260',
    tabBorderColor: '#3A3E67',
    paneTextColor: '#C0C0C0'
  }
}

