// pages/talent/talent.ts
import { talentApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import { majorPickerBehavior } from '../../behaviors/majorPicker'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'

type TalentProfileVO = components['schemas']['TalentProfileVO']
type TalentCardVO = TalentProfileVO & {
    mbtiColor: string
    majorLabel: string
    schoolLabel: string
    avatarUrl?: string
    displaySkills: string[]
}

const MBTI_COLOR_MAP: Record<string, string> = {
    INTJ: '#dbb4fd',
    INTP: '#dbb4fd',
    ENTJ: '#dbb4fd',
    ENTP: '#dbb4fd',
    ISTJ: '#5bfdfd',
    ISFJ: '#5bfdfd',
    ESFJ: '#5bfdfd',
    ESTJ: '#5bfdfd',
    INFJ: 'rgba(78, 211, 61, 0.75)',
    INFP: 'rgba(78, 211, 61, 0.75)',
    ENFP: 'rgba(78, 211, 61, 0.75)',
    ENFJ: 'rgba(78, 211, 61, 0.75)',
    ESTP: '#ffd633',
    ESFP: '#ffd633',
    ISTP: '#ffd633',
    ISFP: '#ffd633'
}

Page({
    behaviors: [schoolPickerBehavior, majorPickerBehavior, listPaginationBehavior],

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
            majorId: null as number | null
        },
        showFilterPopup: false,

        // 人才列表（由behavior管理）
        talents: [] as TalentCardVO[]
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

        ; (this as any).initListConfig({ listKey: 'talents', pageSize: 10 })
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
    async fetchListData(params: any): Promise<ListResponse<TalentCardVO>> {
        const res = await talentApi.listTalentProfiles(params)
        return {
            list: (res.data?.list || []).map((talent) => this.formatTalentCard(talent)),
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
        if (filters.schoolId !== null) params.schoolId = filters.schoolId
        if (filters.majorId !== null) params.majorId = filters.majorId
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

    filteredSearch() {
        this.closeFilter()
        ; (this as any).loadList()
    },

    /**
     * 重置筛选
     */
    resetFilter() {
        this.setData({
            'filters.schoolId': null,
            'filters.majorId': null,
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
    },

    /**
     * 点击悬浮按钮，跳转到编辑人才名片
     */
    handleEditCard() {
        wx.navigateTo({ url: '/pages/talent-card/talent-card' })
    },

    handleBack() {
        if (getCurrentPages().length > 1) {
            wx.navigateBack()
        }
    },

    formatTalentCard(talent: TalentProfileVO): TalentCardVO {
        const mbti = (talent.mbti || '').toUpperCase()

        return {
            ...talent,
            mbtiColor: MBTI_COLOR_MAP[mbti] || 'rgba(78, 211, 61, 0.75)',
            schoolLabel: talent.schoolName || '未知学校',
            majorLabel: talent.majorName || '未知专业',
            displaySkills: (talent.skills || []).slice(0, 5)
        }
    }
})
