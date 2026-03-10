// util.ts 
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
    1: '落地',
    2: '比赛',
    3: '学习'
  }
  return direction !== undefined ? directionMap[direction] || '未知' : '未知'
}

/**
 * 获取订单状态文本
 */
export const getOrderStatusText = (status?: number): string => {
  const statusMap: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已退款'
  }
  return status !== undefined ? statusMap[status] || '未知' : '未知'
}


/**
 * 获取认证状态文本
 */
export const getAuthStatusText = (status?: number): string => {
  const statusMap: Record<number, string> = {
    0: '未认证',
    1: '已认证',
    2: '认证失败'
  }
  return status !== undefined ? statusMap[status] || '未知' : '未知'
}

/**
 * 获取状态文本
 */
export const getStatusText = (status?: number): string => {
  switch (status) {
    case 0: return '待处理'
    case 1: return '已接受'
    case 2: return '已拒绝'
    case 3: return '已忽略'
    default: return '未知'
  }
}

/**
 * 获取类型文本
 */
export const getTypeText = (type?: number): string => {
  switch (type) {
    case 1: return '人才互联'
    case 2: return '项目邀请'
    default: return '邀请'
  }
}
