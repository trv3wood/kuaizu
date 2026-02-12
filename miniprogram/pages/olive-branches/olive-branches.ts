// pages/olive-branches/olive-branches.ts
import { userApi, oliveBranchApi } from '../../api/index'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'

type OliveBranchVO = components['schemas']['OliveBranchVO']
type OliveBranchStatus = components['schemas']['OliveBranchStatus']

Page({
    behaviors: [listPaginationBehavior],

    data: {
        // 橄榄枝列表（由behavior管理）
        branches: [] as OliveBranchVO[],

        // 当前视图模式: 'received' | 'sent'
        viewMode: 'received' as 'received' | 'sent',

        // 当前筛选状态
        currentStatus: null as OliveBranchStatus | null,

        // 状态标签
        statusTabs: [
            { value: null, label: '全部' },
            { value: 0, label: '待处理' },
            { value: 1, label: '已接受' },
            { value: 2, label: '已拒绝' }
        ],

        // 处理中的邀请
        processingId: null as number | null
    },

    onLoad(options) {
        // 支持通过参数指定初始视图模式
        const mode = options.mode as 'received' | 'sent' | undefined
        if (mode === 'sent') {
            this.setData({ viewMode: 'sent' })
            wx.setNavigationBarTitle({ title: '发出的橄榄枝' })
        }
        ; (this as any).initListConfig({ listKey: 'branches', pageSize: 10 })
            ; (this as any).loadList()
    },

    onPullDownRefresh() {
        ; (this as any).refreshList()
    },

    onReachBottom() {
        ; (this as any).loadMoreList()
    },

    /**
     * 实现数据获取方法（behavior要求）
     */
    async fetchListData(params: { page: number, size: number }): Promise<ListResponse<OliveBranchVO>> {
        const { viewMode, currentStatus } = this.data
        const queryParams = {
            ...params,
            ...(currentStatus !== null ? { status: currentStatus } : {})
        }

        let res
        if (viewMode === 'sent') {
            res = await oliveBranchApi.getMySentOliveBranches(queryParams)
        } else {
            res = await userApi.getMyReceivedOliveBranches(queryParams)
        }

        return {
            list: res.data?.list || [],
            pageInfo: res.data?.pageInfo
        }
    },

    /**
     * 提供筛选参数
     */
    getListParams() {
        const { currentStatus } = this.data
        return currentStatus !== null ? { status: currentStatus } : {}
    },

    /**
     * 切换视图模式
     */
    handleViewModeChange(e: WechatMiniprogram.TouchEvent) {
        const { mode } = e.currentTarget.dataset as { mode: 'received' | 'sent' }
        if (mode === this.data.viewMode) return

        this.setData({
            viewMode: mode,
            currentStatus: null,
            branches: []
        })
        wx.setNavigationBarTitle({ title: mode === 'sent' ? '发出的橄榄枝' : '收到的橄榄枝' })
            ; (this as any).loadList()
    },

    /**
     * 切换状态筛选
     */
    handleStatusChange(e: WechatMiniprogram.TouchEvent) {
        const { value } = e.currentTarget.dataset
        this.setData({ currentStatus: value })
            ; (this as any).loadList()
    },

    /**
     * 接受邀请
     */
    async handleAccept(e: WechatMiniprogram.TouchEvent) {
        const { id } = e.currentTarget.dataset
        await this.processInvitation(id, 'ACCEPT')
    },

    /**
     * 拒绝邀请
     */
    async handleReject(e: WechatMiniprogram.TouchEvent) {
        const { id } = e.currentTarget.dataset

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

    /**
     * 处理邀请
     */
    async processInvitation(id: number, action: 'ACCEPT' | 'REJECT') {
        if (this.data.processingId) return

        this.setData({ processingId: id })

        try {
            await oliveBranchApi.handleOliveBranch(id, action)

            wx.showToast({
                title: action === 'ACCEPT' ? '已接受' : '已拒绝',
                icon: 'success'
            })

            // 更新本地列表中的状态
            const newStatus = (action === 'ACCEPT' ? 1 : 2) as OliveBranchStatus
            const branches = this.data.branches.map(b => {
                if (b.id === id) {
                    return { ...b, status: newStatus }
                }
                return b
            })
            this.setData({ branches })
        } catch (error) {
            console.error('处理邀请失败:', error)
            wx.showToast({ title: '操作失败', icon: 'none' })
        } finally {
            this.setData({ processingId: null })
        }
    },

    /**
     * 查看发送者详情
     */
    handleViewSender(e: WechatMiniprogram.TouchEvent) {
        const { sender } = e.currentTarget.dataset as { sender: OliveBranchVO['sender'] }
        if (sender?.id) {
            // 如果有人才卡片可以跳转，这里暂时用提示代替
            wx.showToast({ title: '查看用户资料', icon: 'none' })
        }
    },

    /**
     * 查看接收者详情（发出视图）
     */
    handleViewReceiver(e: WechatMiniprogram.TouchEvent) {
        const { receiver } = e.currentTarget.dataset as { receiver: OliveBranchVO['receiver'] }
        if (receiver?.id) {
            wx.showToast({ title: '查看用户资料', icon: 'none' })
        }
    },

    /**
     * 查看项目详情
     */
    handleViewProject(e: WechatMiniprogram.TouchEvent) {
        const { projectId } = e.currentTarget.dataset
        if (projectId) {
            wx.navigateTo({ url: `/pages/project-detail/project-detail?id=${projectId}&contact=true` })
        }
    }
})
