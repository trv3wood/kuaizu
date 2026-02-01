// pages/login/login.ts
import { authApi } from '../../api/index'
import { userStore } from '../../stores/index'

Page({
    data: {
        loading: false
    },

    /**
     * 微信一键登录
     */
    async handleWechatLogin() {
        if (this.data.loading) return

        this.setData({ loading: true })

        try {
            // 1. 获取微信登录 code
            const { code } = await wx.login()

            // 2. 调用后端登录接口
            const res = await authApi.loginWithWechat(code)

            if (res.data?.token) {
                // 3. 保存 token
                wx.setStorageSync('token', res.data.token)

                // 4. 更新用户状态
                if (res.data.user) {
                    userStore.setUser(res.data.user)
                } else {
                    // 如果接口没返回用户信息，手动获取
                    await userStore.fetchUser()
                }

                // 5. 提示并跳转
                wx.showToast({
                    title: res.data.isNewUser ? '欢迎新用户！' : '登录成功',
                    icon: 'success'
                })

                // 返回上一页或跳转首页
                const pages = getCurrentPages()
                if (pages.length > 1) {
                    wx.navigateBack()
                } else {
                    wx.switchTab({ url: '/pages/home/home' })
                }
            }
        } catch (error: any) {
            console.error('登录失败:', error)
            wx.showToast({
                title: error.message || '登录失败',
                icon: 'none'
            })
        } finally {
            this.setData({ loading: false })
        }
    },

    /**
     * 跳过登录（游客模式）
     */
    handleSkip() {
        wx.switchTab({ url: '/pages/home/home' })
    }
})
