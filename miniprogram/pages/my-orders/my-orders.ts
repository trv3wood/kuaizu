// pages/my-orders/my-orders.ts
import { orderApi } from '../../api/index'
import { getOrderStatusText } from '../../utils/util'
import type { components } from '../../api/schema'

type OrderVO = components['schemas']['OrderVO']

Page({
    data: {
        // 订单列表
        orders: [] as OrderVO[],
        // 加载状态
        loading: true,
        loadingMore: false,
        hasMore: true,
        // 分页
        page: 1,
        size: 10,
        // 当前筛选状态
        activeTab: 0,  // 0-全部 1-待支付 2-已完成
        tabs: [
            { name: '全部', status: undefined as number | undefined },
            { name: '待支付', status: 0 },
            { name: '已完成', status: 1 }
        ]
    },

    onLoad() {
        this.loadOrders()
    },

    onPullDownRefresh() {
        this.setData({ page: 1, hasMore: true })
        this.loadOrders().then(() => {
            wx.stopPullDownRefresh()
        })
    },

    onReachBottom() {
        if (this.data.hasMore && !this.data.loadingMore) {
            this.loadMoreOrders()
        }
    },

    /**
     * 加载订单列表
     */
    async loadOrders() {
        this.setData({ loading: true })

        try {
            const { tabs, activeTab, size } = this.data
            const status = tabs[activeTab]?.status
            let params: any = { page: 1, size }
            if (status !== undefined) {
                params.status = status
            }

            const res = await orderApi.listMyOrder(params)

            const list = res.data?.list || []
            const orders = this._processOrders(list)
            const pageInfo = res.data?.pageInfo
            const hasMore = pageInfo ? (pageInfo.page || 1) < (pageInfo.totalPages || 1) : false

            this.setData({
                orders,
                page: 1,
                hasMore,
                loading: false
            })
        } catch (error) {
            console.error('加载订单失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 加载更多订单
     */
    async loadMoreOrders() {
        if (!this.data.hasMore || this.data.loadingMore) return

        this.setData({ loadingMore: true })

        try {
            const { tabs, activeTab, page, size, orders } = this.data
            const status = tabs[activeTab]?.status
            const nextPage = page + 1

            const res = await orderApi.listMyOrder({
                page: nextPage,
                size,
                status
            })

            const list = res.data?.list || []
            const newOrders = this._processOrders(list)
            const pageInfo = res.data?.pageInfo
            const hasMore = pageInfo ? (pageInfo.page || 1) < (pageInfo.totalPages || 1) : false

            this.setData({
                orders: [...orders, ...newOrders],
                page: nextPage,
                hasMore,
                loadingMore: false
            })
        } catch (error) {
            console.error('加载更多订单失败:', error)
            this.setData({ loadingMore: false })
        }
    },

    /**
     * 预处理订单数据
     */
    _processOrders(list: OrderVO[]) {
        return list.map(item => {
            return {
                ...item,
                statusText: this._getStatusText(item.status),
                formattedTime: this._formatTime(item.createdAt),
                formattedPrice: this._formatPrice(item.actualPaid)
            }
        })
    },

    _getStatusText(status?: number) {
        return getOrderStatusText(status)
    },

    _formatPrice(price?: number) {
        if (price === undefined || price === null) return '¥0.00'
        return '¥' + price.toFixed(2)
    },

    _formatTime(dateStr?: string) {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const pad = (n: number) => n < 10 ? '0' + n : '' + n
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
    },

    /**
     * 切换标签
     */
    handleTabChange(e: WechatMiniprogram.TouchEvent) {
        const { index } = e.currentTarget.dataset
        if (index === this.data.activeTab) return

        this.setData({
            activeTab: index,
            page: 1,
            hasMore: true,
            orders: []
        })
        this.loadOrders()
    },

    /**
     * 点击订单
     */
    handleOrderTap(e: WechatMiniprogram.TouchEvent) {
        const { order } = e.currentTarget.dataset as { order: OrderVO }
        // 如果是待支付订单，跳转支付
        if (order.status === 0 && order.id) {
            this.handlePayOrder(order)
        }
    },

    /**
     * 支付订单
     */
    async handlePayOrder(order: OrderVO) {
        if (!order.id) return

        wx.showLoading({ title: '正在支付...' })

        try {
            const res = await orderApi.initiatePayment(order.id)
            const payParams = res.data

            if (!payParams) {
                throw new Error('获取支付参数失败')
            }

            // 调用微信支付
            await wx.requestPayment({
                timeStamp: payParams.timeStamp || '',
                nonceStr: payParams.nonceStr || '',
                package: payParams.package || '',
                signType: payParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA' || 'RSA',
                paySign: payParams.paySign || ''
            })

            wx.showToast({ title: '支付成功', icon: 'success' })
            // 刷新列表
            this.loadOrders()
        } catch (error: any) {
            wx.hideLoading()
            if (error.errMsg && error.errMsg.indexOf('cancel') !== -1) {
                wx.showToast({ title: '已取消支付', icon: 'none' })
            } else {
                wx.showToast({ title: '支付失败', icon: 'none' })
            }
        }
    },

    /**
     * 去购买
     */
    goShopping() {
        wx.switchTab({ url: '/pages/home/home' })
    }
})
