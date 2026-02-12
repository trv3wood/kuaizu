import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 橄榄枝模块
 */
export const oliveBranchApi = {
    /**
     * 发送橄榄枝(邀请)
     */
    sendOliveBranch(data: Schemas['SendOliveBranchDTO']) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['OliveBranchVO'] }>(
            '/olive-branches',
            data
        )
    },

    /**
     * 处理邀请(接受/拒绝)
     */
    handleOliveBranch(id: number, action: 'ACCEPT' | 'REJECT') {
        return http.patch<Schemas['BaseResponse']>(`/olive-branches/${id}`, { action })
    },

    /**
     * 查看我发出的橄榄枝邀请
     */
    getMySentOliveBranches(params?: {
        page?: number
        size?: number
        status?: Schemas['OliveBranchStatus']
    }) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['OliveBranchPageResponse'] }>(
            '/users/me/sent-olive-branches',
            params
        )
    }
}
