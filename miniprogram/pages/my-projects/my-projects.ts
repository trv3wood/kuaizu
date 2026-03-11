// pages/my-projects/my-projects.ts
import { applicationApi, projectApi, productApi, orderApi, emailPromotionApi } from '../../api/index'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'

type ProjectVO = components['schemas']['ProjectVO']
type ProjectApplicationVO = components['schemas']['ProjectApplicationVO']
type ApplicationStatus = components['schemas']['ApplicationStatus']
type ProductVO = components['schemas']['ProductVO']

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

        // 推广对话框
        promotionDialogVisible: false,
        currentPromotingProjectId: null as number | null,
        promotionQuantity: 10,
        promotionProduct: null as ProductVO | null
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
            reviewDialogVisible: true
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
            reviewDialogVisible: true
        })
    },

    /**
     * 关闭对话框
     */
    closeReviewDialog() {
        this.setData({
            reviewDialogVisible: false,
            currentApplication: undefined
        })
    },

    /**
     * 提交审核
     */
    async submitReview() {
        const { currentApplication, reviewAction } = this.data

        if (!currentApplication) return

        try {
            await applicationApi.reviewApplication(currentApplication.id!, {
                status: reviewAction
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

    // ==================== 推广相关 ====================

    /**
     * 点击推广按钮
     */
    async handlePromoteProject(e: WechatMiniprogram.TouchEvent) {
        const { id } = e.currentTarget.dataset
        this.setData({
            currentPromotingProjectId: id,
            promotionDialogVisible: true,
            promotionQuantity: 10 // 默认值
        })

        // 获取推广商品信息(ID=2)
        if (!this.data.promotionProduct) {
            try {
                const res = await productApi.getProductDetail(2)
                if (res.data) {
                    this.setData({ promotionProduct: res.data })
                }
            } catch (error) {
                console.error('获取推广商品失败:', error)
                wx.showToast({ title: '获取价格失败', icon: 'none' })
            }
        }
    },

    /**
     * 关闭推广对话框
     */
    closePromotionDialog() {
        this.setData({
            promotionDialogVisible: false,
            currentPromotingProjectId: null,
            promotionQuantity: 10
        })
    },

    /**
     * 推广人数变化
     */
    onPromotionQuantityChange(e: any) {
        this.setData({ promotionQuantity: parseInt(e.detail) || 0 })
    },

    /**
     * 确认推广（创建订单 -> 支付 -> 触发推广）
     */
    async submitPromotion() {
        const { currentPromotingProjectId, promotionQuantity, promotionProduct } = this.data

        if (!currentPromotingProjectId || !promotionProduct) return
        if (promotionQuantity <= 0) {
            wx.showToast({ title: '请输入有效人数', icon: 'none' })
            return
        }

        try {
            wx.showLoading({ title: '处理中...', mask: true })

            // 1. 创建订单
            const orderRes = await orderApi.createOrder([{
                productId: promotionProduct.id!,
                quantity: promotionQuantity
            }])
            const orderId = orderRes.data!.id!

            // 2. 获取支付参数
            const payRes = await orderApi.initiatePayment(orderId)
            const payParams = payRes.data!

            // 3. 发起微信支付
            await new Promise((resolve, reject) => {
                wx.requestPayment({
                    timeStamp: payParams.timeStamp!,
                    nonceStr: payParams.nonceStr!,
                    package: payParams.package!,
                    signType: payParams.signType as any,
                    paySign: payParams.paySign!,
                    success: resolve,
                    fail: reject
                })
            })

            // 4. 支付成功，触发推广
            await emailPromotionApi.triggerEmailPromotion({
                orderId,
                projectId: currentPromotingProjectId
            })

            wx.hideLoading()
            wx.showToast({
                title: '推广成功',
                icon: 'success'
            })
            this.closePromotionDialog()

                // 刷新列表更新状态
                ; (this as any).loadList()

        } catch (error: any) {
            wx.hideLoading()
            console.error('推广流程失败:', error)

            if (error.errMsg && error.errMsg.indexOf('cancel') > -1) {
                wx.showToast({ title: '支付已取消', icon: 'none' })
            } else {
                wx.showToast({ title: '推广失败，请重试', icon: 'none' })
            }
        }
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
     * 处理头像点击事件
     */
    handleAvatarTap(e: WechatMiniprogram.TouchEvent) {
        const { id } = e.currentTarget.dataset
        if (id) {
            wx.navigateTo({
                url: `/pages/talent-detail/talent-detail?id=${id}`
            })
        }
    }
})
