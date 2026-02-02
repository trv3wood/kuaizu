export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

/**
 * 获取项目状态文本
 */
export const getProjectStatusText = (status?: number): string => {
  const statusMap: Record<number, string> = {
    0: '审核中',
    1: '进行中',
    2: '已驳回',
    3: '已关闭'
  }
  return status !== undefined ? statusMap[status] || '未知' : '未知'
}

/**
 * 获取项目方向文本
 */
export const getProjectDirectionText = (direction?: number): string => {
  const directionMap: Record<number, string> = {
    1: '创业类',
    2: '科研类',
    3: '实践类'
  }
  return direction !== undefined ? directionMap[direction] || '未知' : '未知'
}

/**
 * 获取订单状态文本
 */
export const getOrderStatusText = (status?: number): string => {
  const statusMap: Record<number, string> = {
    0: '待支付',
    1: '已完成',
    2: '已取消',
    3: '已退款'
  }
  return status !== undefined ? statusMap[status] || '未知' : '未知'
}
