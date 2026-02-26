// pages/profile/profile.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'

Page({
    data: {
        // 其他服务列表
        services: [
            { name: '订单中心', icon: 'gem-o', url: '/pages/my-orders/my-orders' },
            { name: '了解我们', icon: 'info-o', url: '/pages/about/about' },
            { name: '我的客服', icon: 'service-o', url: '/pages/contact/contact' }
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
        this.updateUserMeta()
    },

    onShow() {
        // 更新 tabBar 状态 (profile is now at visual index 2)
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({ active: 2 })
        }
        // 刷新用户信息
        if (userStore.isLoggedIn) {
            userStore.fetchUser().then(() => {
                this.updateUserMeta()
            })
        }
    },

    onUnload() {
        // 清理绑定
        this.storeBindings?.destroyStoreBindings()
    },

    /**
     * 更新用户元信息显示
     */
    updateUserMeta() {
        const user = userStore.user
        if (!user) {
            this.setData({ userMeta: '' })
            return
        }

        const parts: string[] = []
        if (user.school?.schoolName) parts.push(user.school.schoolName)
        if (user.major?.majorName) parts.push(user.major.majorName)
        if (user.grade) parts.push(`${user.grade}级`)

        this.setData({ userMeta: parts.join(' · ') })
    },

    /**
     * 跳转到编辑资料页
     */
    handleEditProfile() {
        wx.navigateTo({ url: '/pages/edit-profile/edit-profile' })
    },

    /**
     * 跳转到设置页
     */
    handleSettings() {
        wx.navigateTo({ url: '/pages/edit-profile/edit-profile' })
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
