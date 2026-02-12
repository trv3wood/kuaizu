import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 认证模块
 */
export const authApi = {
    /**
     * 微信一键登录/注册
     */
    loginWithWechat(code: string) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['LoginResponse'] }>(
            '/auth/login/wechat',
            { code }
        )
    }
}
