// behaviors/listPagination.ts
/**
 * 列表分页 Behavior
 * 提供通用的列表加载、分页、下拉刷新、触底加载更多功能
 *
 * 使用方法:
 * 1. 在页面中引入此behavior
 * 2. 实现 fetchListData(params) 方法，返回 Promise<{ list: T[], pageInfo: PageInfo }>
 * 3. 可选：设置 listKey (默认 'list') 和 pageSize (默认 10)
 *
 * 提供的数据:
 * - [listKey]: 列表数据
 * - listLoading: 首次加载状态
 * - listLoadingMore: 加载更多状态
 * - listHasMore: 是否有更多数据
 * - listPage: 当前页码
 * - listEmpty: 列表是否为空
 *
 * 提供的方法:
 * - loadList(): 加载/重新加载列表（从第1页开始）
 * - loadMoreList(): 加载更多（下一页）
 * - refreshList(): 刷新列表（用于下拉刷新）
 */

export interface PageInfo {
    page?: number
    size?: number
    total?: number
    totalPages?: number
}

export interface ListResponse<T = any> {
    list: T[]
    pageInfo?: PageInfo
}

export interface ListPaginationConfig {
    /** 列表数据在 data 中的 key，默认 'list' */
    listKey?: string
    /** 每页数量，默认 10 */
    pageSize?: number
    /** 是否在加载失败时显示 Toast，默认 true */
    showErrorToast?: boolean
    /** 错误提示文案，默认 '加载失败' */
    errorToastText?: string
}

// 默认配置
const defaultConfig: Required<ListPaginationConfig> = {
    listKey: 'list',
    pageSize: 10,
    showErrorToast: true,
    errorToastText: '加载失败'
}

export const listPaginationBehavior = Behavior({
    data: {
        // 列表状态
        listLoading: false,
        listLoadingMore: false,
        listHasMore: true,
        listPage: 1,
        listEmpty: true,

        // 内部配置
        _listConfig: { ...defaultConfig }
    },

    methods: {
        /**
         * 初始化列表配置
         * 在页面 onLoad 中调用
         */
        initListConfig(config: ListPaginationConfig = {}) {
            this.setData({
                _listConfig: { ...defaultConfig, ...config }
            })
        },

        /**
         * 获取列表数据 key
         */
        _getListKey(): string {
            return (this.data._listConfig as Required<ListPaginationConfig>).listKey
        },

        /**
         * 获取当前列表数据
         */
        _getListData(): any[] {
            const key = this._getListKey()
            return (this.data as any)[key] || []
        },

        /**
         * 计算是否有更多数据
         */
        _calcHasMore(pageInfo?: PageInfo): boolean {
            if (!pageInfo) return false
            const currentPage = pageInfo.page || 1
            const totalPages = pageInfo.totalPages || 1
            return currentPage < totalPages
        },

        /**
         * 加载列表（从第1页开始）
         * 用于首次加载或筛选条件变化后重新加载
         */
        async loadList(): Promise<void> {
            this.setData({ listLoading: true })

            try {
                const config = this.data._listConfig as Required<ListPaginationConfig>
                const params = {
                    page: 1,
                    size: config.pageSize,
                    ...this._getListParams()
                }

                // 调用页面实现的数据获取方法
                const result = await (this as any).fetchListData(params)
                const list = result?.list || []
                const pageInfo = result?.pageInfo

                const listKey = this._getListKey()
                this.setData({
                    [listKey]: list,
                    listPage: 1,
                    listHasMore: this._calcHasMore(pageInfo),
                    listLoading: false,
                    listEmpty: list.length === 0
                })
            } catch (error) {
                console.error('加载列表失败:', error)
                this.setData({ listLoading: false })

                const config = this.data._listConfig as Required<ListPaginationConfig>
                if (config.showErrorToast) {
                    wx.showToast({ title: config.errorToastText, icon: 'none' })
                }
            }
        },

        /**
         * 加载更多（下一页）
         * 用于触底加载
         */
        async loadMoreList(): Promise<void> {
            if (!this.data.listHasMore || this.data.listLoadingMore) return

            this.setData({ listLoadingMore: true })

            try {
                const config = this.data._listConfig as Required<ListPaginationConfig>
                const nextPage = this.data.listPage + 1
                const params = {
                    page: nextPage,
                    size: config.pageSize,
                    ...this._getListParams()
                }

                const result = await (this as any).fetchListData(params)
                const newItems = result?.list || []
                const pageInfo = result?.pageInfo

                const listKey = this._getListKey()
                const currentList = this._getListData()

                this.setData({
                    [listKey]: [...currentList, ...newItems],
                    listPage: nextPage,
                    listHasMore: this._calcHasMore(pageInfo),
                    listLoadingMore: false
                })
            } catch (error) {
                console.error('加载更多失败:', error)
                this.setData({ listLoadingMore: false })
            }
        },

        /**
         * 刷新列表
         * 用于下拉刷新，会自动调用 wx.stopPullDownRefresh
         */
        async refreshList(): Promise<void> {
            this.setData({ listPage: 1, listHasMore: true })
            await this.loadList()
            wx.stopPullDownRefresh()
        },

        /**
         * 获取额外的查询参数
         * 页面可覆盖此方法以提供筛选条件等
         */
        _getListParams(): Record<string, any> {
            // 默认返回空对象，页面可覆盖
            if (typeof (this as any).getListParams === 'function') {
                return (this as any).getListParams()
            }
            return {}
        }
    }
})

export default listPaginationBehavior
