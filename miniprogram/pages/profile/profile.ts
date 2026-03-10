// pages/profile/profile.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { userApi } from '../../api/user'
import { ASSETS } from '../../assets/urls'

Page({
    data: {
        assets: ASSETS,
        navPaddingTop: 0,
        // 其他服务列表 (aligned with Figma)
        services: [
            { name: '订单中心', icon: ASSETS.PROFILE.ORDER_CENTER, url: '/pages/my-orders/my-orders' },
            { name: '资讯中心', icon: ASSETS.PROFILE.INFO_CENTER, url: '/pages/about-us/about-us' },
            { name: '我的客服', icon: ASSETS.PROFILE.CUSTOMER_SERVICE, url: '/pages/contact-servicePPL/contact-servicePPL' }
        ]
    },

    storeBindings: null as any,

    onLoad() {
        // Calculate navigation safe area for custom nav
        const menuButton = wx.getMenuButtonBoundingClientRect()
        this.setData({
            navPaddingTop: menuButton.bottom + 10
        })

        // 绑定 userStore
        this.storeBindings = createStoreBindings(this, {
            store: userStore,
            fields: ['user', 'isLoggedIn', 'isVerified', 'displayName', 'avatarUrl', 'oliveBranchCount'],
            actions: ['fetchUser', 'clearUser']
        })
    },

    onShow() {
        // 更新 tabBar 状态 (profile is at index 1 in the list)
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({ active: 1 })
        }
    },

    onUnload() {
        // 清理绑定
        this.storeBindings?.destroyStoreBindings()
    },

    /**
     * 跳转到编辑资料页
     */
    handleEditProfile() {
        wx.navigateTo({ url: '/pages/edit-profile/edit-profile' })
    },

    async handleVerify() {
        if (!(this as any).isVerified) {
            const { confirm } = await wx.showModal({
                title: '提示',
                content: '您还未认证，是否上传认证资料？'
            })

            if (confirm) {
                const { tempFilePaths } = await wx.chooseImage({
                    count: 1,
                    sizeType: ['original', 'compressed'],
                    sourceType: ['album', 'camera']
                })
                await userApi.submitCertification(tempFilePaths[0]!!)
                wx.showToast({ title: '上传成功', icon: 'success' })
            }
        }
    },

    /**
     * 跳转到名片页
     */
    handleBusinessCard() {
        wx.navigateTo({ url: '/pages/talent-card/talent-card' })
    },

    /**
     * 跳转橄榄枝页面
     */
    handleOliveBranchTap() {
        wx.navigateTo({ url: '/pages/olive-branches/olive-branches' })
    },

    /**
     * 跳转到我的项目
     */
    handleMyProjects() {
        wx.navigateTo({ url: '/pages/my-projects/my-projects' })
    },

    /**
     * 跳转到我的申请
     */
    handleMyApplications() {
        wx.navigateTo({ url: '/pages/my-applications/my-applications' })
    },

    /**
     * 服务项点击
     */
    handleServiceTap(e: WechatMiniprogram.TouchEvent) {
        const { url } = e.currentTarget.dataset
        if (url) {
            wx.navigateTo({ url })
        }
    },

    /**
     * 跳转登录
     */
    handleLogin() {
        wx.navigateTo({ url: '/pages/login/login' })
    },

    /**
     * 退出登录
     */
    handleLogout() {
        wx.showModal({
            title: '提示',
            content: '确定要退出登录吗？',
            success: (res) => {
                if (res.confirm) {
                    userStore.clearUser()
                    wx.showToast({ title: '已退出登录', icon: 'success' })
                }
            }
        })
    }
})
