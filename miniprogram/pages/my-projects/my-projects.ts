// pages/my-projects/my-projects.ts
import { applicationApi, projectApi, productApi, orderApi, emailPromotionApi } from '../../api/index'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'
import Dialog from '@vant/weapp/dialog/dialog'
import { buildTalentDetailUrl } from '../../utils/detail-display-strategy'
import { ApplicationStatus, ProjectStatus } from '../../utils/enum'

type ProjectVO = components['schemas']['ProjectVO']
type ProjectApplicationVO = components['schemas']['ProjectApplicationVO']
type ProductVO = components['schemas']['ProductVO']

Page({
  behaviors: [listPaginationBehavior],

  data: {
    applicationStatusEnum: ApplicationStatus,
    projectStatusEnum: ProjectStatus,
    // 项目列表（由behavior管理）
    projects: [] as ProjectVO[],

    // 展开的项目ID
    expandedProjectId: null as number | null,
    applications: [] as ProjectApplicationVO[],
    applicationsLoading: false,

    // 推广对话框
    promotionDialogVisible: false,
    currentPromotingProjectId: null as number | null,
    promotionQuantity: 10,
    promotionProduct: null as ProductVO | null
  },

  onLoad() {
    ; (this as any).initListConfig({ listKey: 'projects', pageSize: 10 })
  },

  onShow() {
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
      this.setData({
        expandedProjectId: null,
        applications: []
      })
    } else {
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
        size: 100
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
  async handleApprove(e: WechatMiniprogram.TouchEvent) {
    const { app } = e.currentTarget.dataset
    try {
      await Dialog.confirm({
        title: '通过申请',
        message: `确定要通过${app.applicant.nickname}的申请吗？`,
      })

      wx.showLoading({ title: '处理中...', mask: true })
      await applicationApi.reviewApplication(app.id!, { status: ApplicationStatus.Approved })
      wx.showToast({ title: '已通过', icon: 'success' })
      this.loadApplications(this.data.expandedProjectId!)
    } catch (error) {
      if (error !== 'cancel') {
        console.error('审批失败:', error)
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
    }
  },

  /**
   * 处理拒绝申请
   */
  async handleReject(e: WechatMiniprogram.TouchEvent) {
    const { app } = e.currentTarget.dataset
    try {
      await Dialog.confirm({
        title: '拒绝申请',
        message: `确定要拒绝${app.applicant.nickname}的申请吗？`,
        confirmButtonText: '拒绝',
      })

      wx.showLoading({ title: '处理中...', mask: true })
      await applicationApi.reviewApplication(app.id!, { status: ApplicationStatus.Rejected })
      wx.showToast({ title: '已拒绝', icon: 'success' })
      this.loadApplications(this.data.expandedProjectId!)
    } catch (error) {
      if (error !== 'cancel') {
        console.error('操作失败:', error)
        wx.showToast({ title: '操作失败', icon: 'none' })
      }
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
              ; (this as any).loadList()
          } catch (error) {
            console.error('下架项目失败:', error)
            wx.showToast({ title: '下架失败', icon: 'none' })
          }
        }
      }
    })
  },

  async handlePromoteProject(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset
    this.setData({
      currentPromotingProjectId: id,
      promotionDialogVisible: true,
      promotionQuantity: 10
    })

    if (!this.data.promotionProduct) {
      try {
        const res = await productApi.getProductDetail(2)
        if (res.data) {
          this.setData({ promotionProduct: res.data })
        }
      } catch (error) {
        console.error('获取推广商品失败:', error)
      }
    }
  },

  closePromotionDialog() {
    this.setData({
      promotionDialogVisible: false,
      currentPromotingProjectId: null,
      promotionQuantity: 10
    })
  },

  onPromotionQuantityChange(e: any) {
    this.setData({ promotionQuantity: parseInt(e.detail) || 0 })
  },

  async submitPromotion() {
    const { currentPromotingProjectId, promotionQuantity, promotionProduct } = this.data
    if (!currentPromotingProjectId || !promotionProduct) return
    if (promotionQuantity <= 0) {
      wx.showToast({ title: '请输入有效人数', icon: 'none' })
      return
    }

    try {
      wx.showLoading({ title: '处理中...', mask: true })
      const orderRes = await orderApi.createOrder({
        productId: promotionProduct.id!,
        quantity: promotionQuantity
      })
      const orderId = orderRes.data!.id!
      const payRes = await orderApi.initiatePayment(orderId)
      const payParams = payRes.data!

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

      await emailPromotionApi.triggerEmailPromotion({
        orderId,
        projectId: currentPromotingProjectId
      })

      wx.hideLoading()
      wx.showToast({ title: '推广成功', icon: 'success' })
      this.closePromotionDialog()
        ; (this as any).loadList()
    } catch (error: any) {
      wx.hideLoading()
      if (error.errMsg && error.errMsg.indexOf('cancel') > -1) {
        wx.showToast({ title: '支付已取消', icon: 'none' })
      } else {
        wx.showToast({ title: '推广失败', icon: 'none' })
      }
    }
  },

  handleEditProject(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/edit-project/edit-project?id=${id}`
    })
  },

  goToCreate() {
    wx.navigateTo({
      url: '/pages/edit-project/edit-project'
    })
  },

  handleAvatarTap(e: WechatMiniprogram.TouchEvent) {
    const { id, userId } = e.currentTarget.dataset
    if (!id && !userId) {
      return
    }

    wx.navigateTo({
      url: buildTalentDetailUrl({
        id: id || 0,
        userId,
        scene: 'project-application-review'
      })
    })
  }
})
