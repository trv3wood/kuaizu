// pages/talent/talent.ts
import { talentApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import { majorPickerBehavior } from '../../behaviors/majorPicker'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'

type TalentProfileVO = components['schemas']['TalentProfileVO']

Page({
    behaviors: [schoolPickerBehavior, majorPickerBehavior, listPaginationBehavior],

    options: {
        styleIsolation: 'apply-shared'
    },

    data: {
        // 搜索关键词
        keyword: '',

        // 筛选条件
        filters: {
            schoolId: undefined as number | undefined,
            majorId: undefined as number | undefined
        },
        showFilterPopup: false,

        // 人才列表（由behavior管理）
        talents: [] as TalentProfileVO[]
    },

    onLoad() {
        ; (this as any).initListConfig({ listKey: 'talents', pageSize: 10 })
            ; (this as any).loadSchools()
            ; (this as any).loadMajors()
            ; (this as any).loadList()
    },

    onShow() {
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
    async fetchListData(params: { page: number, size: number }): Promise<ListResponse<TalentProfileVO>> {
        const res = await talentApi.listTalentProfiles(params)
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
        const params: any = {}
        if (keyword) params.keyword = keyword
        if (filters.schoolId !== undefined) params.schoolId = filters.schoolId
        if (filters.majorId !== undefined) params.majorId = filters.majorId
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
     * 重置筛选
     */
    resetFilter() {
        this.setData({
            'filters.schoolId': undefined,
            'filters.majorId': undefined,
            selectedSchoolName: '',
            selectedMajorName: '',
            showFilterPopup: false
        })
            ; (this as any).loadList()
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
     * 点击人才卡片
     */
    handleTalentTap(e: WechatMiniprogram.TouchEvent) {
        const { id } = e.currentTarget.dataset
        if (id) {
            wx.navigateTo({ url: `/pages/talent-detail/talent-detail?id=${id}` })
        }
    },

    /**
     * 显示专业筛选搜索
     */
    handleShowMajorFilter() {
        ; (this as any).showMajorPicker()
    },

    /**
     * 专业选择回调
     */
    onMajorSelected(major: any) {
        this.setData({
            'filters.majorId': major?.id,
            selectedMajorName: major?.majorName || ''
        })
    }
})
