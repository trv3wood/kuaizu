// pages/projects/projects.ts
import { projectApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'
import { ProjectStatus } from '../../utils/enum'
import { buildProjectDetailUrl } from '../../utils/detail-display-strategy'
import { getProjectDirectionText } from '../../utils/util'

type ProjectVO = components['schemas']['ProjectVO']
type Direction = components['schemas']['Direction']
type ProjectCardVO = ProjectVO & {
    directionLabel: string
    directionIcon: string
    schoolLabel: string
    viewLabel: number
}

Page({
    behaviors: [schoolPickerBehavior, listPaginationBehavior],
    options: {
        styleIsolation: 'apply-shared'
    },

    data: {
        statusBarHeight: 0,
        navBarHeight: 44,
        showBackButton: false,

        // 搜索关键词
        keyword: '',

        // 筛选条件
        filters: {
            schoolId: null as number | null,
            direction: null as Direction | null,
            isCrossSchool: null as number | null
        },
        showFilterPopup: false,

        // 项目列表（由behavior管理）
        projects: [] as ProjectCardVO[],

        // 筛选器选项
        directions: [
            { value: 1, label: '落地', icon: '💼' },
            { value: 2, label: '比赛', icon: '🏅' },
            { value: 3, label: '学习', icon: '🔬' }
        ],
        statuses: [
            { value: 0, label: '审核中' },
            { value: 1, label: '进行中' },
            { value: 2, label: '已驳回' },
            { value: 3, label: '已关闭' }
        ],
        crossSchool: [
            { value: 0, label: '本校' },
            { value: 1, label: '跨校' }
        ]
    },

    onLoad() {
        const menuButton = wx.getMenuButtonBoundingClientRect()
        const systemInfo = wx.getSystemInfoSync()
        const pages = getCurrentPages()
        const statusBarHeight = systemInfo.statusBarHeight || 0
        const navBarHeight = menuButton.height + (menuButton.top - statusBarHeight) * 2

        this.setData({
            statusBarHeight,
            navBarHeight,
            showBackButton: pages.length > 1
        })

        ; (this as any).initListConfig({ listKey: 'projects', pageSize: 10 })
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
    async fetchListData(params: { page: number, size: number }): Promise<ListResponse<ProjectCardVO>> {
        const res = await projectApi.listProjects(params)
        const list = (res.data?.list || []).map((project) => this.formatProjectCard(project))
        return {
            list,
            pageInfo: res.data?.pageInfo
        }
    },

    /**
     * 提供筛选参数（behavior可选）
     */
    getListParams() {
        const { keyword, filters } = this.data
        const params: any = { status: ProjectStatus.Approved, ...filters }
        if (keyword) params.keyword = keyword
        return params
    },

    /**
     * 搜索
     */
    handleKeywordInput(e: any) {
        this.setData({ keyword: e.detail.value })
    },

    handleSearch() {
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
    },

    /**
     * 应用筛选
     */
    applyFilter() {
        this.closeFilter()
            ; (this as any).loadList()
    },

    /**
     * 重置筛选
     */
    resetFilter() {
        this.setData({
            'filters.schoolId': null,
            'filters.direction': null,
            'filters.isCrossSchool': null,
            selectedSchoolName: '',
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
            wx.navigateTo({ url: buildProjectDetailUrl(Number(id)) })
        }
    },

    /**
     * 发布项目
     */
    handlePublish() {
        wx.navigateTo({ url: '/pages/edit-project/edit-project' })
    },

    handleBack() {
        if (getCurrentPages().length > 1) {
            wx.navigateBack()
        }
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
            'filters.direction': currentValue === value ? null : value
        })
    },

    /**
     * 选择跨校
     */
    handleCrossSchoolChange(e: WechatMiniprogram.TouchEvent) {
        const { value } = e.currentTarget.dataset
        const currentValue = this.data.filters.isCrossSchool
        // 点击已选中的取消选中
        this.setData({
            'filters.isCrossSchool': currentValue === value ? null : value
        })
    },

    formatProjectCard(project: ProjectVO): ProjectCardVO {
        const direction = this.data.directions.find((item) => item.value === project.direction)

        return {
            ...project,
            directionLabel: getProjectDirectionText(project.direction),
            directionIcon: direction?.icon || '📁',
            schoolLabel: project.schoolName || '未知学校',
            viewLabel: project.viewCount || 0
        }
    }
})
