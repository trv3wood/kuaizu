// pages/home/home.ts
import { projectApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import type { components } from '../../api/schema'

type ProjectVO = components['schemas']['ProjectVO']
type ProjectStatus = components['schemas']['ProjectStatus']
type Direction = components['schemas']['Direction']

Page({
  behaviors: [schoolPickerBehavior],
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    // 搜索关键词
    keyword: '',

    // 筛选条件
    filters: {
      schoolId: undefined as number | undefined,
      status: undefined as ProjectStatus | undefined,
      direction: undefined as Direction | undefined
    },
    showFilterPopup: false,

    // 项目列表
    projects: [] as ProjectVO[],
    loading: true,
    loadingMore: false,
    hasMore: true,
    page: 1,
    size: 10,

    // 筛选器选项
    directions: [
      { value: 1, label: '创业类' },
      { value: 2, label: '学术类' },
      { value: 3, label: '实践类' }
    ],
    statuses: [
      { value: 0, label: '审核中' },
      { value: 1, label: '进行中' },
      { value: 2, label: '已驳回' },
      { value: 3, label: '已关闭' }
    ]
  },

  onLoad() {
    ; (this as any).loadSchools()
    this.loadProjects()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 0 })
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true })
    this.loadProjects().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMoreProjects()
    }
  },



  /**
   * 加载项目列表
   */
  async loadProjects() {
    this.setData({ loading: true })

    try {
      const { keyword, filters, size } = this.data

      // 构建参数对象，只包含有效值
      const params: any = {
        page: 1,
        size,
        ...filters
      }
      if (keyword) params.keyword = keyword

      const res = await projectApi.listProjects(params)

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
      const { keyword, filters, page, size, projects } = this.data
      const nextPage = page + 1

      // 构建参数对象，只包含有效值
      const params: any = {
        page: nextPage,
        size,
        filters
      }
      if (keyword) params.keyword = keyword

      const res = await projectApi.listProjects(params)

      const newProjects = res.data?.list || []
      const pageInfo = res.data?.pageInfo
      const hasMore = pageInfo ? (pageInfo.page || 1) < (pageInfo.totalPages || 1) : false

      this.setData({
        projects: [...projects, ...newProjects],
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
   * 搜索
   */
  handleSearch(e: any) {
    this.setData({ keyword: e.detail })
    this.loadProjects()
  },

  /**
   * 取消搜索
   */
  handleSearchCancel() {
    this.setData({ keyword: '' })
    this.loadProjects()
  },

  /**
   * 显示筛选面板
   */
  showFilter() {
    this.setData({ showFilterPopup: true })
  },

  /**
   * 关闭筛选面板
   */
  closeFilter() {
    this.setData({ showFilterPopup: false })
    this.loadProjects()
  },

  /**
   * 应用筛选
   */
  applyFilter(e: WechatMiniprogram.CustomEvent) {
    const { schoolId, status, direction } = e.detail
    this.setData({
      'filters.schoolId': schoolId,
      'filters.status': status,
      'filters.direction': direction,
      showFilterPopup: false
    })
    this.loadProjects()
  },

  /**
   * 重置筛选
   */
  resetFilter() {
    this.setData({
      'filters.schoolId': undefined,
      'filters.status': undefined,
      'filters.direction': undefined,
      showFilterPopup: false
    })
    this.loadProjects()
  },

  /**
   * 点击项目卡片
   */
  handleProjectTap(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset
    if (id) {
      wx.navigateTo({ url: `/pages/project-detail/project-detail?id=${id}` })
    }
  },

  /**
   * 发布项目
   */
  handleService() {
    // TODO: 检查登录状态
    wx.navigateTo({ url: '/pages/create-project/create-project' })
  },



  /**
   * 显示学校筛选搜索
   */
  handleShowSchoolFilter() {
    ; (this as any).showSchoolPicker()
  },

  /**
   * 选择学校（筛选用）
   */
  handleSelectSchoolFilter(e: WechatMiniprogram.TouchEvent) {
    const { school } = e.currentTarget.dataset as { school: any }
    this.setData({
      'filters.schoolId': school?.id,
      selectedSchoolName: school?.schoolName || ''
    })
      ; (this as any).closeSchoolPicker()
  },

  /**
   * 选择方向
   */
  handleDirectionChange(e: WechatMiniprogram.TouchEvent) {
    const { value } = e.currentTarget.dataset
    const currentValue = this.data.filters.direction
    // 点击已选中的取消选中
    this.setData({
      'filters.direction': currentValue === value ? undefined : value
    })
  },

  /**
   * 选择状态
   */
  handleStatusChange(e: WechatMiniprogram.TouchEvent) {
    const { value } = e.currentTarget.dataset
    const currentValue = this.data.filters.status
    // 点击已选中的取消选中
    this.setData({
      'filters.status': currentValue === value ? undefined : value
    })
  }
})
