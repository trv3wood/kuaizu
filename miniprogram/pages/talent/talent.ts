// pages/talent/talent.ts
import { talentApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import { majorPickerBehavior } from '../../behaviors/majorPicker'
import type { components } from '../../api/schema'

type TalentProfileVO = components['schemas']['TalentProfileVO']

Page({
    behaviors: [schoolPickerBehavior, majorPickerBehavior],

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

        // 人才列表
        talents: [] as TalentProfileVO[],
        loading: true,
        loadingMore: false,
        hasMore: true,
        page: 1,
        size: 10
    },

    onLoad() {
        ; (this as any).loadSchools()
            ; (this as any).loadMajors()
        this.loadTalents()
    },

    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({ active: 1 })
        }
    },

    onPullDownRefresh() {
        this.setData({ page: 1, hasMore: true })
        this.loadTalents().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    onReachBottom() {
        if (this.data.hasMore && !this.data.loadingMore) {
            this.loadMoreTalents()
        }
    },

    /**
     * 加载人才列表
     */
    async loadTalents() {
        this.setData({ loading: true })

        try {
            const { keyword, filters, size } = this.data

            const params: any = { page: 1, size }
            if (keyword) params.keyword = keyword
            if (filters.schoolId !== undefined) params.schoolId = filters.schoolId
            if (filters.majorId !== undefined) params.majorId = filters.majorId

            const res = await talentApi.listTalentProfiles(params)

            const talents = res.data?.list || []
            const pageInfo = res.data?.pageInfo
            const hasMore = pageInfo ? (pageInfo.page || 1) < (pageInfo.totalPages || 1) : false

            this.setData({
                talents,
                page: 1,
                hasMore,
                loading: false
            })
        } catch (error) {
            console.error('加载人才列表失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 加载更多人才
     */
    async loadMoreTalents() {
        if (!this.data.hasMore || this.data.loadingMore) return

        this.setData({ loadingMore: true })

        try {
            const { keyword, filters, page, size, talents } = this.data
            const nextPage = page + 1

            const params: any = { page: nextPage, size }
            if (keyword) params.keyword = keyword
            if (filters.schoolId !== undefined) params.schoolId = filters.schoolId
            if (filters.majorId !== undefined) params.majorId = filters.majorId

            const res = await talentApi.listTalentProfiles(params)

            const newTalents = res.data?.list || []
            const pageInfo = res.data?.pageInfo
            const hasMore = pageInfo ? (pageInfo.page || 1) < (pageInfo.totalPages || 1) : false

            this.setData({
                talents: [...talents, ...newTalents],
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
        this.loadTalents()
    },

    /**
     * 取消搜索
     */
    handleSearchCancel() {
        this.setData({ keyword: '' })
        this.loadTalents()
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
        this.loadTalents()
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
        this.loadTalents()
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
