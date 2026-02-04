// pages/profile/profile.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'

Page({
    data: {
        // 菜单列表
        menuList: [
            { icon: 'gem-o', title: '服务中心', url: '/pages/service/service' },
            { icon: 'orders-o', title: '我的项目', url: '/pages/my-projects/my-projects' },
            { icon: 'service-o', title: '联系客服', url: '/pages/contact/contact' },
            { icon: 'info-o', title: '了解我们', url: '/pages/about/about' },
            { icon: 'setting-o', title: '设置', url: '/pages/settings/settings' }
        ]
    },

    storeBindings: null as any,

    onLoad() {
        // 绑定 userStore
        this.storeBindings = createStoreBindings(this, {
            store: userStore,
            fields: ['user', 'isLoggedIn', 'isVerified', 'displayName', 'avatarUrl', 'oliveBranchCount'],
            actions: ['fetchUser', 'clearUser']
        })
    },

    onShow() {
        // 更新 tabBar 状态 (profile is now at visual index 2)
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({ active: 2 })
        }
        // 刷新用户信息
        if (userStore.isLoggedIn) {
            userStore.fetchUser()
        }
    },

    onUnload() {
        // 清理绑定
        this.storeBindings?.destroyStoreBindings()
    },

    /**
     * 获取认证状态文本
     */
    getAuthStatusText(): string {
        const status = userStore.user?.authStatus
        switch (status) {
            case 0: return '未认证'
            case 1: return '已认证'
            case 2: return '认证失败'
            default: return '未认证'
        }
    },

    /**
     * 跳转到编辑资料页
     */
    handleEditProfile() {
        wx.navigateTo({ url: '/pages/edit-profile/edit-profile' })
    },

    /**
     * 菜单项点击
     */
    handleMenuTap(e: WechatMiniprogram.TouchEvent) {
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
