import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 认证模块
 */
export const authApi = {
    /**
     * 微信一键登录/注册
     * 返回类型可能是 LoginResponse (200) 或 RegisterTokenResponse (202)
     */
    loginWithWechat(code: string) {
        return http.post<Schemas['BaseResponse'] & { data?: Schemas['LoginResponse'] | Schemas['RegisterTokenResponse'] }>(
            '/auth/login/wechat',
            { code }
        )
    },

    /**
     * 手机号注册/绑定
     */
    registerWithPhone(registerToken: string, phoneCode: string) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['LoginResponse'] }>(
            '/auth/register/phone',
            { registerToken, phoneCode }
        )
    }
}
