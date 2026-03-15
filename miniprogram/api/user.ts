import type { components, operations } from './schema'
import http from '../utils/http'
import config from '../config'

type Schemas = components['schemas']
type Operations = operations

/**
 * 用户模块
 */
export const userApi = {
    /**
     * 获取当前用户信息
     */
    getCurrentUser() {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['UserVO'] }>('/users/me')
    },

    /**
     * 更新个人资料
     */
    updateCurrentUser(data: Schemas['UpdateUserDTO']) {
        return http.put<Schemas['BaseResponse'] & { data: Schemas['UserVO'] }>(
            '/users/me',
            data
        )
    },

    /**
     * 提交学生认证（上传学生证照片）
     */
    submitCertification(filePath: string) {
        return new Promise<Schemas['BaseResponse']>((resolve, reject) => {
            const token = wx.getStorageSync('token')
            const url = `${config.BASE_URL}/users/me/certification`
            console.log('[submitCertification] 开始上传', { url, filePath, hasToken: !!token })

            wx.uploadFile({
                url,
                filePath,
                name: 'studentCertImage',
                header: token ? { 'Authorization': `Bearer ${token}` } : {},
                success(res) {
                    console.log('[submitCertification] 上传成功', { statusCode: res.statusCode, data: res.data })
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(res.data))
                    } else {
                        const error = { statusCode: res.statusCode, data: JSON.parse(res.data) }
                        console.error('[submitCertification] 业务错误', error)
                        reject(error)
                    }
                },
                fail(err) {
                    console.error('[submitCertification] 上传失败', err)
                    reject(err)
                }
            })
        })
    },

    /**
     * 查看我收到的橄榄枝邀请
     */
    getMyReceivedOliveBranches(params?: {
        page?: number
        size?: number
        status?: Schemas['OliveBranchStatus']
    }) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['OliveBranchPageResponse'] }>(
            '/users/me/olive-branches',
            params
        )
    },

    /**
     * 同步用户订阅授权状态
     */
    syncUserSubscription(data: Schemas['SubscribeSyncRequest']) {
        return http.post<Schemas['BaseResponse']>('/user/subscribe', data)
    },

    /**
     * 获取订阅消息模板
     */
    getSubscriptionTemplateId(data: Operations['getMsgTemplates']['parameters']['query']) {
        const params = {
            ...data,
            bizKeys: Array.isArray(data.bizKeys) ? data.bizKeys.join(',') : data.bizKeys
        }
        return http.get<Schemas['BaseResponse'] & { data: Schemas['MsgTemplateVO'][] }>('/user/subscribe', params as any)
    }
}
