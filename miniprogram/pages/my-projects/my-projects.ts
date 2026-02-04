// pages/my-projects/my-projects.ts
import { applicationApi, projectApi } from '../../api/index'
import type { components } from '../../api/schema'

type ProjectVO = components['schemas']['ProjectVO']
type ProjectApplicationVO = components['schemas']['ProjectApplicationVO']
type ApplicationStatus = components['schemas']['ApplicationStatus']

Page({
    data: {
        projects: [] as ProjectVO[],
        loading: true,
        loadingMore: false,
        hasMore: true,
        page: 1,
        size: 10,

        // 展开的项目ID
        expandedProjectId: null as number | null,
        applications: [] as ProjectApplicationVO[],
        applicationsLoading: false,

        // 审核对话框
        reviewDialogVisible: false,
        currentApplication: undefined as ProjectApplicationVO | undefined,
        reviewAction: 0 as ApplicationStatus, // 1=通过, 2=拒绝
        replyMsg: ''
    },

    onLoad() {
        this.loadMyProjects()
    },

    onReachBottom() {
        if (this.data.hasMore && !this.data.loadingMore) {
            this.loadMoreProjects()
        }
    },

    /**
     * 加载我的项目列表
     */
    async loadMyProjects() {
        this.setData({ loading: true })

        try {
            const res = await applicationApi.listMyProjects({
                page: 1,
                size: this.data.size
            })

            const projects = res.data?.list || []
            const pageInfo = res.data?.pageInfo
            const hasMore = pageInfo ? (pageInfo.page || 1) < (pageInfo.totalPages || 1) : false

            this.setData({
                projects,
                page: 1,
                hasMore,
                loading: false
            })
        } catch (error) {
            console.error('加载项目列表失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 加载更多项目
     */
    async loadMoreProjects() {
        if (!this.data.hasMore || this.data.loadingMore) return

        this.setData({ loadingMore: true })

        try {
            const nextPage = this.data.page + 1
            const res = await applicationApi.listMyProjects({
                page: nextPage,
                size: this.data.size
            })

            const newProjects = res.data?.list || []
            const pageInfo = res.data?.pageInfo
            const hasMore = pageInfo ? (pageInfo.page || 1) < (pageInfo.totalPages || 1) : false

            this.setData({
                projects: [...this.data.projects, ...newProjects],
                page: nextPage,
                hasMore,
                loadingMore: false
            })
        } catch (error) {
            console.error('加载更多失败:', error)
            this.setData({ loadingMore: false })
        }
    },

    /**
     * 切换申请列表展开/收起
     */
    toggleApplications(e: WechatMiniprogram.TouchEvent) {
        const { id } = e.currentTarget.dataset
        const currentExpanded = this.data.expandedProjectId

        if (currentExpanded === id) {
            // 收起
            this.setData({
                expandedProjectId: null,
                applications: []
            })
        } else {
            // 展开并加载申请
            this.setData({ expandedProjectId: id })
            this.loadApplications(id)
        }
    },

    /**
     * 加载项目的申请列表
     */
    async loadApplications(projectId: number) {
        this.setData({ applicationsLoading: true })

        try {
            const res = await applicationApi.listProjectApplications(projectId, {
                page: 1,
                size: 100 // 暂时一次加载所有
            })

            const applications = res.data?.list || []
            this.setData({
                applications,
                applicationsLoading: false
            })
        } catch (error) {
            console.error('加载申请列表失败:', error)
            this.setData({ applicationsLoading: false })
            wx.showToast({ title: '加载申请失败', icon: 'none' })
        }
    },

    /**
     * 处理通过申请
     */
    handleApprove(e: WechatMiniprogram.TouchEvent) {
        const { app } = e.currentTarget.dataset
        this.setData({
            currentApplication: app,
            reviewAction: 1,
            reviewDialogVisible: true,
            replyMsg: ''
        })
    },

    /**
     * 处理拒绝申请
     */
    handleReject(e: WechatMiniprogram.TouchEvent) {
        const { app } = e.currentTarget.dataset
        this.setData({
            currentApplication: app,
            reviewAction: 2,
            reviewDialogVisible: true,
            replyMsg: ''
        })
    },

    /**
     * 关闭对话框
     */
    closeReviewDialog() {
        this.setData({
            reviewDialogVisible: false,
            currentApplication: undefined,
            replyMsg: ''
        })
    },

    /**
     * 输入回复消息
     */
    onReplyInput(e: any) {
        this.setData({ replyMsg: e.detail })
    },

    /**
     * 提交审核
     */
    async submitReview() {
        const { currentApplication, reviewAction, replyMsg } = this.data

        if (!currentApplication) return

        try {
            await applicationApi.reviewApplication(currentApplication.id!, {
                status: reviewAction,
                replyMsg: replyMsg || undefined
            })

            wx.showToast({
                title: reviewAction === 1 ? '已通过' : '已拒绝',
                icon: 'success'
            })

            // 关闭对话框
            this.closeReviewDialog()

            // 重新加载申请列表
            if (this.data.expandedProjectId) {
                this.loadApplications(this.data.expandedProjectId)
            }
        } catch (error) {
            console.error('审核失败:', error)
            wx.showToast({ title: '操作失败', icon: 'none' })
        }
    },

    /**
     * 删除/下架项目
     */
    handleDeleteProject(e: WechatMiniprogram.TouchEvent) {
        const { id, name } = e.currentTarget.dataset

        wx.showModal({
            title: '确认下架',
            content: `确定要下架项目"${name}"吗？下架后将不再展示在项目大厅中。`,
            confirmText: '确认下架',
            confirmColor: '#ee0a24',
            success: async (res) => {
                if (res.confirm) {
                    try {
                        await projectApi.deleteProject(id)
                        wx.showToast({
                            title: '已下架',
                            icon: 'success'
                        })
                        // 重新加载项目列表
                        this.loadMyProjects()
                    } catch (error) {
                        console.error('下架项目失败:', error)
                        wx.showToast({ title: '下架失败', icon: 'none' })
                    }
                }
            }
        })
    },

    /**
     * 编辑项目
     */
    handleEditProject(e: WechatMiniprogram.TouchEvent) {
        const { id } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/edit-project/edit-project?id=${id}`
        })
    },

    /**
     * 获取项目状态文本
     */
    getProjectStatusText(status?: number): string {
        switch (status) {
            case 0: return '待审核'
            case 1: return '进行中'
            case 2: return '已驳回'
            case 3: return '已关闭'
            default: return '未知'
        }
    },

    /**
     * 获取申请状态文本
     */
    getApplicationStatusText(status?: number): string {
        switch (status) {
            case 0: return '待审核'
            case 1: return '已通过'
            case 2: return '已拒绝'
            default: return '未知'
        }
    }
})
