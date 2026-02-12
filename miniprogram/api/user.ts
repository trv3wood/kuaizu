import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

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
     * 提交学生认证
     */
    submitCertification(authImgUrl: string) {
        return http.post<Schemas['BaseResponse']>('/users/me/certification', {
            authImgUrl
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
    }
}
