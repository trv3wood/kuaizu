import { authApi } from '../../api/index'
import { userStore, templateStore } from '../../stores/index'


Page({
    data: {
        loading: false,
        showPhoneModal: false,
        registerToken: '',
        phoneCode: ''
    },

    /**
     * 微信一键登录
     */
    async handleWechatLogin() {
        if (this.data.loading) return

        this.setData({ loading: true })

        try {
            // 获取微信登录 code
            const { code } = await wx.login()

            // 调用后端登录接口
            const res = await authApi.loginWithWechat(code)
            console.log(res)

            // 需要提供手机号（新用户）
            if (res.code === 1001) {
                // 保存注册凭证
                const registerToken = (res.data as any)?.registerToken

                if (registerToken) {
                    this.setData({
                        registerToken,
                        showPhoneModal: true
                    })
                    wx.showToast({
                        title: '请绑定手机号',
                        icon: 'none'
                    })
                    return
                }
            }

            // 登录成功
            if (res.code === 200 && (res.data as any)?.token) {
                const loginData = res.data as any
                // 保存 token
                wx.setStorageSync('token', loginData.token)

                // 更新用户状态
                if (loginData.user) {
                    userStore.setUser(loginData.user)
                } else {
                    // 如果接口没返回用户信息，手动获取
                    await userStore.fetchUser()
                }

                // 登录成功后预加载订阅消息模板 ID
                templateStore.fetchAll().catch(() => { })


                // 提示并跳转
                wx.showToast({
                    title: loginData.isNewUser ? '欢迎新用户！' : '登录成功',
                    icon: 'success'
                })

                // 返回上一页或跳转首页
                const pages = getCurrentPages()
                if (pages.length > 1) {
                    wx.navigateBack()
                } else {
                    wx.switchTab({ url: '/pages/home/home' })
                }
            } else {
                throw new Error(res.message || '登录失败')
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
     * 关闭手机号绑定弹窗
     */
    closePhoneModal() {
        this.setData({
            showPhoneModal: false,
            registerToken: '',
            phoneCode: ''
        })
    },

    /**
     * 获取手机号验证码
     */
    async getPhoneNumber(e: any) {
        if (e.detail.errMsg !== 'getPhoneNumber:ok') {
            wx.showToast({
                title: '获取手机号失败',
                icon: 'none'
            })
            return
        }

        this.setData({ loading: true })

        try {
            const { code } = e.detail
            const { registerToken } = this.data

            if (!registerToken) {
                throw new Error('注册凭证已失效，请重新登录')
            }

            // 调用手机号注册接口
            const res = await authApi.registerWithPhone(registerToken, code)

            if (res.code === 200 && res.data?.token) {
                // 保存 token
                wx.setStorageSync('token', res.data.token)

                // 更新用户状态
                if (res.data.user) {
                    userStore.setUser(res.data.user)
                } else {
                    await userStore.fetchUser()
                }

                // 注册并登录成功后预加载订阅消息模板 ID
                templateStore.fetchAll().catch(() => { })


                // 关闭弹窗
                this.closePhoneModal()

                // 提示并跳转
                wx.showToast({
                    title: '注册成功',
                    icon: 'success'
                })

                // 跳转首页
                wx.switchTab({ url: '/pages/home/home' })
            } else {
                throw new Error(res.message || '注册失败')
            }
        } catch (error: any) {
            console.error('手机号绑定失败:', error)
            wx.showToast({
                title: error.message || '手机号绑定失败',
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
