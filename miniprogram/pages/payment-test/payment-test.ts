// pages/payment-test/payment-test.ts
import { productApi, orderApi } from '../../api/index'
import type { components } from '../../api/schema'

type ProductVO = components['schemas']['ProductVO']
type OrderVO = components['schemas']['OrderVO']

Page({
    data: {
        products: [] as ProductVO[],
        loading: true,
        selectedProduct: null as ProductVO | null,
        ordering: false,
        currentOrder: null as OrderVO | null
    },

    onLoad() {
        this.loadProducts()
    },

    /**
     * 加载商品列表
     */
    async loadProducts() {
        this.setData({ loading: true })

        try {
            const res = await productApi.listProducts()
            this.setData({
                products: res.data || [],
                loading: false
            })
        } catch (error) {
            console.error('加载商品失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 选择商品
     */
    handleSelectProduct(e: WechatMiniprogram.TouchEvent) {
        const { product } = e.currentTarget.dataset
        this.setData({ selectedProduct: product })
    },

    /**
     * 创建订单并支付
     */
    async handlePay() {
        const { selectedProduct, ordering } = this.data
        if (!selectedProduct || ordering) return

        this.setData({ ordering: true })

        try {
            // 1. 创建订单
            wx.showLoading({ title: '创建订单中...' })
            const orderRes = await orderApi.createOrder([{
                productId: selectedProduct.id!,
                quantity: 1
            }])

            const order = orderRes.data
            if (!order?.id) {
                throw new Error('创建订单失败')
            }

            this.setData({ currentOrder: order })
            console.log('订单创建成功:', order)

            // 2. 获取支付参数
            wx.showLoading({ title: '发起支付中...' })
            const payRes = await orderApi.initiatePayment(order.id)
            const payParams = payRes.data

            if (!payParams) {
                throw new Error('获取支付参数失败')
            }

            console.log('支付参数:', payParams)
            wx.hideLoading()

            // 3. 调用微信支付
            wx.requestPayment({
                timeStamp: payParams.timeStamp!,
                nonceStr: payParams.nonceStr!,
                package: payParams.package!,
                signType: payParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA',
                paySign: payParams.paySign!,
                success: () => {
                    wx.showToast({ title: '支付成功！', icon: 'success' })
                    this.checkOrderStatus(order.id!)
                },
                fail: (err) => {
                    console.error('支付失败:', err)
                    if (err.errMsg.includes('cancel')) {
                        wx.showToast({ title: '支付已取消', icon: 'none' })
                    } else {
                        wx.showToast({ title: '支付失败', icon: 'none' })
                    }
                }
            })
        } catch (error) {
            console.error('支付流程失败:', error)
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
        } finally {
            this.setData({ ordering: false })
        }
    },

    /**
     * 检查订单状态
     */
    async checkOrderStatus(orderId: number) {
        try {
            const res = await orderApi.getOrder(orderId)
            const order = res.data
            console.log('订单状态:', order)
            this.setData({ currentOrder: order })

            if (order?.status === 1) {
                wx.showModal({
                    title: '支付成功',
                    content: `订单 ${orderId} 已支付成功！`,
                    showCancel: false
                })
            }
        } catch (error) {
            console.error('查询订单状态失败:', error)
        }
    },

    /**
     * 格式化价格
     */
    formatPrice(price?: number): string {
        if (price === undefined || price === null) return '¥0.00'
        return `¥${price.toFixed(2)}`
    }
})
