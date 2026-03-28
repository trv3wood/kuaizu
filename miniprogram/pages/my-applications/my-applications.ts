// pages/my-applications/my-applications.ts
import { applicationApi } from '../../api/index'
import { listPaginationBehavior, ListResponse } from '../../behaviors/listPagination'
import type { components } from '../../api/schema'
import { buildProjectDetailUrl } from '../../utils/detail-display-strategy'

type ProjectApplicationVO = components['schemas']['ProjectApplicationVO']
type ApplicationStatus = components['schemas']['ApplicationStatus']

Page({
    behaviors: [listPaginationBehavior],

    data: {
        // 申请列表（由behavior管理）
        applications: [] as ProjectApplicationVO[],

        // 当前筛选状态
        currentStatus: null as ApplicationStatus | null,

        // 状态标签
        statusTabs: [
            { value: null, label: '全部' },
            { value: 0, label: '待审核' },
            { value: 1, label: '已通过' },
            { value: 2, label: '已拒绝' }
        ]
    },

    onLoad() {
        ; (this as any).initListConfig({ listKey: 'applications', pageSize: 10 })
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
    async fetchListData(params: { page: number, size: number }): Promise<ListResponse<ProjectApplicationVO>> {
        const { currentStatus } = this.data
        const queryParams = {
            ...params,
            ...(currentStatus !== null ? { status: currentStatus } : {})
        }

        const res = await applicationApi.listMyApplications(queryParams)

        return {
            list: res.data?.list || [],
            pageInfo: res.data?.pageInfo
        }
    },

    /**
     * 提供筛选参数
     */
    getListParams() {
        const { currentStatus } = this.data
        return currentStatus !== null ? { status: currentStatus } : {}
    },

    /**
     * 切换状态筛选
     */
    handleStatusChange(e: WechatMiniprogram.TouchEvent) {
        const { value } = e.currentTarget.dataset
        this.setData({ currentStatus: value })
            ; (this as any).loadList()
    },

    /**
     * 查看项目详情
     */
    handleViewProject(e: WechatMiniprogram.TouchEvent) {
        const { projectId } = e.currentTarget.dataset
        if (projectId) {
            wx.navigateTo({ url: buildProjectDetailUrl(Number(projectId)) })
        }
    }
})
