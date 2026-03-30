import { userApi, oliveBranchApi } from '../../api/index'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'
import { DEFAULT_MBTI_COLOR, MBTI_COLOR_MAP } from '../../utils/constants'
import { buildProjectDetailUrl, buildTalentDetailUrl } from '../../utils/detail-display-strategy'
import { AuthStatus, OliveBranchStatus as OliveBranchStatusEnum } from '../../utils/enum'

type OliveBranchVO = components['schemas']['OliveBranchVO']
type OliveBranchStatus = components['schemas']['OliveBranchStatus']
type UserVO = components['schemas']['UserVO']
type BranchViewMode = 'received' | 'sent'

type BranchCardVO = OliveBranchVO & {
  counterpart?: UserVO
  displayName: string
  avatarUrl?: string
  schoolLabel: string
  majorLabel: string
  gradeLabel: string
  projectLabel: string
  statusText: string
  statusClass: string
  statusDotClass: string
  statusPillClass: string
  isPending: boolean
  isAccepted: boolean
  isRejected: boolean
  isIgnored: boolean
  hasSmsNotice: boolean
  showSmsAction: boolean
  smsActionText: string
  skillTags: string[]
  mbtiLabel: string
  mbtiColor: string
  isVerified: boolean
}

Page({
  behaviors: [listPaginationBehavior],

  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
    showBackButton: false,

    branches: [] as BranchCardVO[],
    viewMode: 'received' as BranchViewMode,
    currentStatus: null as OliveBranchStatus | null,
    statusTabs: [
      { value: null, label: '全部' },
      { value: OliveBranchStatusEnum.Pending, label: '待处理' },
      { value: OliveBranchStatusEnum.Accepted, label: '已接受' },
      { value: OliveBranchStatusEnum.Rejected, label: '已拒绝' }
    ],
    processingId: null as number | null,
    smsNotifiedMap: {} as Record<number, boolean>
  },

  onLoad(options) {
    const menuButton = wx.getMenuButtonBoundingClientRect()
    const systemInfo = wx.getSystemInfoSync()
    const pages = getCurrentPages()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const navBarHeight = menuButton.height + (menuButton.top - statusBarHeight) * 2
    const mode = options.mode as BranchViewMode | undefined

    this.setData({
      statusBarHeight,
      navBarHeight,
      showBackButton: pages.length > 1,
      viewMode: mode === 'sent' ? 'sent' : 'received'
    })

      ; (this as any).initListConfig({ listKey: 'branches', pageSize: 10 })
      ; (this as any).loadList()
  },

  onPullDownRefresh() {
    ; (this as any).refreshList()
  },

  onReachBottom() {
    ; (this as any).loadMoreList()
  },

  async fetchListData(params: { page: number, size: number }): Promise<ListResponse<BranchCardVO>> {
    const { viewMode, currentStatus } = this.data
    const queryParams = {
      ...params,
      ...(currentStatus !== null ? { status: currentStatus } : {})
    }

    const res = viewMode === 'sent'
      ? await oliveBranchApi.getMySentOliveBranches(queryParams)
      : await userApi.getMyReceivedOliveBranches(queryParams)

    return {
      list: (res.data?.list || []).map((item) => this.formatBranchCard(item, viewMode)),
      pageInfo: res.data?.pageInfo
    }
  },

  getListParams() {
    const { currentStatus } = this.data
    return currentStatus !== null ? { status: currentStatus } : {}
  },

  handleViewModeChange(e: WechatMiniprogram.TouchEvent) {
    const { mode } = e.currentTarget.dataset as { mode: BranchViewMode }
    if (mode === this.data.viewMode) return

    this.setData({
      viewMode: mode,
      currentStatus: null,
      branches: []
    })

      ; (this as any).loadList()
  },

  handleStatusChange(e: WechatMiniprogram.TouchEvent) {
    const { value } = e.currentTarget.dataset
    const nextStatus = value === '' || value === 'null' || value === undefined || value === null
      ? null
      : Number(value) as OliveBranchStatus

    this.setData({ currentStatus: nextStatus })
      ; (this as any).loadList()
  },

  async handleAccept(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) return
    await this.processInvitation(id, 'ACCEPT')
  },

  async handleReject(e: WechatMiniprogram.TouchEvent) {
    const id = Number(e.currentTarget.dataset.id)
    if (!id) return

    wx.showModal({
      title: '确认拒绝',
      content: '确定要拒绝这个邀请吗？',
      confirmText: '拒绝',
      confirmColor: '#ee0a24',
      success: async (res) => {
        if (res.confirm) {
          await this.processInvitation(id, 'REJECT')
        }
      }
    })
  },

  async processInvitation(id: number, action: 'ACCEPT' | 'REJECT') {
    if (this.data.processingId) return

    this.setData({ processingId: id })

    try {
      await oliveBranchApi.handleOliveBranch(id, action)

      wx.showToast({
        title: action === 'ACCEPT' ? '已接受' : '已拒绝',
        icon: 'success'
      })

      const newStatus = (
        action === 'ACCEPT' ? OliveBranchStatusEnum.Accepted : OliveBranchStatusEnum.Rejected
      ) as OliveBranchStatus
      const branches = this.data.branches.map((item) => {
        if (item.id === id) {
          return this.formatBranchCard({ ...item, status: newStatus }, this.data.viewMode)
        }
        return item
      })

      this.setData({ branches })
    } catch (error) {
      console.error('处理邀请失败:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      this.setData({ processingId: null })
    }
  },

  handleViewSender(e: WechatMiniprogram.TouchEvent) {
    const { sender } = e.currentTarget.dataset as { sender: OliveBranchVO['sender'] }
    wx.navigateTo({
      url: buildTalentDetailUrl({
        id: 0,
        userId: sender?.id,
        scene: 'project-application-review'
      })
    })
  },

  handleViewReceiver(e: WechatMiniprogram.TouchEvent) {
    const { receiver } = e.currentTarget.dataset as { receiver: OliveBranchVO['receiver'] }
    wx.navigateTo({
      url: buildTalentDetailUrl({
        id: 0,
        userId: receiver?.id,
        scene: 'project-application-review'
      })
    })
  },

  handleViewProject(e: WechatMiniprogram.TouchEvent) {
    const projectId = Number(e.currentTarget.dataset.projectId)
    if (projectId) {
      wx.navigateTo({ url: buildProjectDetailUrl(projectId, 'olive-branch-contact') })
    }
  },

  handleBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
    }
  },

  handleSmsNotify(e: WechatMiniprogram.TouchEvent) {
    wx.showToast({
      title: '开发中',
      icon: 'none'
    })
  },

  formatBranchCard(branch: OliveBranchVO, viewMode: BranchViewMode): BranchCardVO {
    const counterpart = viewMode === 'received' ? branch.sender : branch.receiver
    const gradeLabel = this.formatGrade(counterpart?.grade)
    const majorLabel = counterpart?.major?.majorName || '专业未填写'
    const schoolLabel = counterpart?.school?.schoolName || '学校未填写'
    const projectLabel = branch.projectName || '研发可快速部署的临时盲道解决方案'
    const status = branch.status ?? OliveBranchStatusEnum.Pending
    const skillTags = [gradeLabel]

    if (viewMode === 'sent' && schoolLabel && schoolLabel !== '学校未填写') {
      const shortSchool = this.compactTag(schoolLabel, 6)
      if (shortSchool && skillTags.indexOf(shortSchool) === -1) {
        skillTags.push(shortSchool)
      }
    }

    const hasSmsNotice = !!branch.message || !!this.data.smsNotifiedMap[branch.id || 0]
    const statusMeta = this.getStatusMeta(status, viewMode)
    const mbtiLabel = this.deriveMbtiLabel(counterpart)

    return {
      ...branch,
      counterpart,
      displayName: counterpart?.nickname || '一个名字',
      avatarUrl: counterpart?.avatarUrl,
      schoolLabel,
      majorLabel,
      gradeLabel,
      projectLabel,
      statusText: statusMeta.text,
      statusClass: statusMeta.className,
      statusDotClass: statusMeta.dotClassName,
      statusPillClass: statusMeta.pillClassName,
      isPending: status === OliveBranchStatusEnum.Pending,
      isAccepted: status === OliveBranchStatusEnum.Accepted,
      isRejected: status === OliveBranchStatusEnum.Rejected,
      isIgnored: status === OliveBranchStatusEnum.Ignored,
      hasSmsNotice,
      showSmsAction: viewMode === 'sent' && status === OliveBranchStatusEnum.Pending,
      smsActionText: hasSmsNotice ? '已短信通知' : '短信通知ta',
      skillTags: skillTags.slice(0, 4),
      mbtiLabel,
      mbtiColor: MBTI_COLOR_MAP[mbtiLabel] || DEFAULT_MBTI_COLOR,
      isVerified: counterpart?.authStatus === AuthStatus.Verified
    }
  },

  getStatusMeta(status: OliveBranchStatus, viewMode: BranchViewMode) {
    if (status === OliveBranchStatusEnum.Accepted) {
      return {
        text: viewMode === 'received' ? '已通过' : '已接受',
        className: 'status-accepted',
        dotClassName: 'status-dot-accepted',
        pillClassName: 'status-pill-accepted'
      }
    }

    if (status === OliveBranchStatusEnum.Rejected) {
      return {
        text: '已拒绝',
        className: 'status-rejected',
        dotClassName: 'status-dot-rejected',
        pillClassName: 'status-pill-rejected'
      }
    }

    if (status === OliveBranchStatusEnum.Ignored) {
      return {
        text: '已忽略',
        className: 'status-ignored',
        dotClassName: 'status-dot-ignored',
        pillClassName: 'status-pill-ignored'
      }
    }

    return {
      text: viewMode === 'received' ? '待处理' : '等待对方处理',
      className: 'status-pending',
      dotClassName: 'status-dot-pending',
      pillClassName: 'status-pill-pending'
    }
  },

  formatGrade(grade?: number) {
    const now = new Date()
    const calendarYear = now.getFullYear()
    const month = now.getMonth() + 1
    const academicYear = month >= 9 ? calendarYear : calendarYear - 1
    const currentGrade = academicYear - grade + 1

    if (currentGrade <= 0) {
      return `${grade}级`
    }

    if (currentGrade <= 4) {
      return `本科${['一', '二', '三', '四'][currentGrade - 1]}年级`
    }

    if (currentGrade <= 7) {
      return `研究生${['一', '二', '三'][currentGrade - 5]}年级`
    }

    return `${grade}级`
  },

  compactTag(text: string, maxLen = 5) {
    if (!text) return ''
    return text.length > maxLen ? `${text.slice(0, maxLen)}…` : text
  },

  deriveMbtiLabel(user?: UserVO) {
    if (!user?.id) {
      return 'INFP'
    }

    const mbtiPool = ['INFJ', 'INFP', 'ENFP', 'ISTJ', 'ESFP', 'INTJ', 'ENTP', 'ISFP']
    return mbtiPool[user.id % mbtiPool.length]
  }
})
