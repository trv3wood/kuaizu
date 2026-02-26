import { observable, action } from 'mobx-miniprogram'
import type { components } from '../api/schema'
import { userApi } from '../api/index'

type UserVO = components['schemas']['UserVO']

/**
 * 用户状态管理 Store
 */
export const userStore = observable({
    // ==================== 状态字段 ====================

    /** 当前用户信息 */
    user: null as UserVO | null,

    /** 是否已登录 */
    get isLoggedIn(): boolean {
        return !!this.user && !!wx.getStorageSync('token')
    },

    /** 是否已认证 */
    get isVerified(): boolean {
        return this.user?.authStatus === 1
    },

    /** 用户昵称（带默认值） */
    get displayName(): string {
        return this.user?.nickname || '快组用户' + this.user?.id
    },

    /** 用户头像（带默认值） */
    get avatarUrl(): string {
        return this.user?.avatarUrl ? 'https://kuaizu-img-file.oss-cn-hangzhou.aliyuncs.com/kuaizu_text_img/' + this.user.avatarUrl : 'https://kuaizu-img-file.oss-cn-hangzhou.aliyuncs.com/kuaizu-img/imges/images/user-avatar.jpg'
    },

    /** 剩余橄榄枝数量 */
    get oliveBranchCount(): number {
        return this.user?.oliveBranchCount || 0
    },

    // ==================== Actions ====================

    /**
     * 设置用户信息
     */
    setUser: action(function (this: typeof userStore, user: UserVO | null) {
        this.user = user
    }),

    /**
     * 获取当前用户信息（从服务器）
     */
    fetchUser: action(async function (this: typeof userStore) {
        try {
            const res = await userApi.getCurrentUser()
            if (res.data) {
                this.user = res.data
            }
            return res.data
        } catch (error) {
            console.error('获取用户信息失败:', error)
            throw error
        }
    }),

    /**
     * 更新用户信息
     */
    updateUser: action(async function (
        this: typeof userStore,
        data: components['schemas']['UpdateUserDTO']
    ) {
        try {
            const res = await userApi.updateCurrentUser(data)
            if (res.data) {
                this.user = res.data
            }
            return res.data
        } catch (error) {
            console.error('更新用户信息失败:', error)
            throw error
        }
    }),

    /**
     * 清除用户信息（退出登录）
     */
    clearUser: action(function (this: typeof userStore) {
        this.user = null
        wx.removeStorageSync('token')
    }),

    /**
     * 初始化用户状态（应用启动时调用）
     */
    init: action(async function (this: typeof userStore) {
        const token = wx.getStorageSync('token')
        if (token) {
            try {
                await this.fetchUser()
            } catch {
                // token 失效，清除登录状态
                this.clearUser()
            }
        }
    })
})

export default userStore
