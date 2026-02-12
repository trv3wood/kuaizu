// pages/projects/projects.ts
import { projectApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'

type ProjectVO = components['schemas']['ProjectVO']
type ProjectStatus = components['schemas']['ProjectStatus']
type Direction = components['schemas']['Direction']

Page({
    behaviors: [schoolPickerBehavior, listPaginationBehavior],
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

        // 项目列表（由behavior管理）
        projects: [] as ProjectVO[],

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
        ; (this as any).initListConfig({ listKey: 'projects', pageSize: 10 })
            ; (this as any).loadSchools()
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
    async fetchListData(params: { page: number, size: number }): Promise<ListResponse<ProjectVO>> {
        const res = await projectApi.listProjects(params)
        return {
            list: res.data?.list || [],
            pageInfo: res.data?.pageInfo
        }
    },

    /**
     * 提供筛选参数（behavior可选）
     */
    getListParams() {
        const { keyword, filters } = this.data
        const params: any = { ...filters }
        if (keyword) params.keyword = keyword
        return params
    },

    /**
     * 搜索
     */
    handleSearch(e: any) {
        this.setData({ keyword: e.detail })
            ; (this as any).loadList()
    },

    /**
     * 取消搜索
     */
    handleSearchCancel() {
        this.setData({ keyword: '' })
            ; (this as any).loadList()
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
            ; (this as any).loadList()
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
            ; (this as any).loadList()
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
            ; (this as any).loadList()
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
    handlePublish() {
        wx.navigateTo({ url: '/pages/edit-project/edit-project' })
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
