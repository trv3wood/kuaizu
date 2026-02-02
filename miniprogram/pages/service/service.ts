// pages/service/service.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { orderApi, talentApi } from '../../api/index'

Page({
    data: {
        // 快捷数据
        stats: {
            pendingOrders: 0,  // 待支付订单
            certificationStatus: 0,  // 认证状态 0:未认证 1:已认证 2:认证失败
            talentCardStatus: 0  // 人才卡片状态 0:未发布 1:已发布
        },

        // 功能菜单列表
        serviceMenus: [
            {
                title: '订单中心',
                items: [
                    { icon: 'orders-o', title: '我的订单', url: '/pages/my-orders/my-orders', badge: 0 }
                ]
            },
            {
                title: '认证服务',
                items: [
                    { icon: 'certificate', title: '学生认证', url: '/pages/certification/certification', extra: '未认证' }
                ]
            },
            {
                title: '人才服务',
                items: [
                    { icon: 'contact', title: '我的人才名片', url: '/pages/talent-card/talent-card', extra: '去完善' }
                ]
            }
        ] as Array<{
            title: string
            items: Array<{ icon: string; title: string; url: string; badge?: number; extra?: string }>
        }>
    },

    storeBindings: null as any,

    onLoad() {
        // 绑定 userStore
        this.storeBindings = createStoreBindings(this, {
            store: userStore,
            fields: ['user', 'isLoggedIn', 'isVerified'],
            actions: []
        })
    },

    onShow() {
        // 更新 tabBar 状态
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({ active: 2 })
        }

        // 加载数据
        if (userStore.isLoggedIn) {
            this.loadData()
        }
    },

    onUnload() {
        this.storeBindings?.destroyStoreBindings()
    },

    /**
     * 加载页面数据
     */
    async loadData() {
        try {
            // 1. 认证状态
            const certificationStatus = userStore.user?.authStatus || 0
            const certificationText = ['未认证', '已认证', '认证失败'][certificationStatus]

            // 2. 获取待支付订单数量
            let pendingOrders = 0
            try {
                const ordersRes = await orderApi.listMyOrder({ page: 1, size: 1, status: 0 })
                pendingOrders = ordersRes.data?.pageInfo?.total || 0
            } catch {
                pendingOrders = 0
            }

            // 3. 人才卡片状态 - 检查是否有已发布的人才档案
            let talentCardStatus = 0
            try {
                const talentRes = await talentApi.listTalentProfiles({ page: 1, size: 1 })
                talentCardStatus = (talentRes.data?.list?.length || 0) > 0 ? 1 : 0
            } catch {
                talentCardStatus = 0
            }

            // 更新菜单状态文本
            const serviceMenus = [...this.data.serviceMenus]

            // 订单中心 badge
            const orderItem = serviceMenus[0]?.items?.[0]
            if (orderItem && pendingOrders > 0) {
                orderItem.badge = pendingOrders
            }

            // 认证状态文本
            const certItem = serviceMenus[1]?.items?.[0]
            if (certItem) {
                certItem.extra = certificationText
            }

            // 人才卡片状态
            const talentItem = serviceMenus[2]?.items?.[0]
            if (talentItem) {
                talentItem.extra = talentCardStatus === 1 ? '已发布' : '去完善'
            }

            this.setData({
                'stats.certificationStatus': certificationStatus,
                'stats.talentCardStatus': talentCardStatus,
                'stats.pendingOrders': pendingOrders,
                serviceMenus
            })
        } catch (error) {
            console.error('加载数据失败:', error)
        }
    },

    /**
     * 菜单项点击
     */
    handleMenuTap(e: WechatMiniprogram.TouchEvent) {
        const { url } = e.currentTarget.dataset
        if (!userStore.isLoggedIn) {
            wx.navigateTo({ url: '/pages/login/login' })
            return
        }
        if (url) {
            wx.navigateTo({ url })
        }
    }
})
