// pages/my-projects/my-projects.ts
import { applicationApi, projectApi } from '../../api/index'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'

type ProjectVO = components['schemas']['ProjectVO']
type ProjectApplicationVO = components['schemas']['ProjectApplicationVO']
type ApplicationStatus = components['schemas']['ApplicationStatus']

Page({
    behaviors: [listPaginationBehavior],

    data: {
        // 项目列表（由behavior管理）
        projects: [] as ProjectVO[],

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
        ; (this as any).initListConfig({ listKey: 'projects', pageSize: 10 })
            ; (this as any).loadList()
    },

    onReachBottom() {
        ; (this as any).loadMoreList()
    },

    /**
     * 实现数据获取方法（behavior要求）
     */
    async fetchListData(params: { page: number, size: number }): Promise<ListResponse<ProjectVO>> {
        const res = await applicationApi.listMyProjects(params)
        return {
            list: res.data?.list || [],
            pageInfo: res.data?.pageInfo
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
                            ; (this as any).loadList()
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
    }
})
