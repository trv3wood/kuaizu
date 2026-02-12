import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 人才库模块
 */
export const talentApi = {
    /**
     * 搜索人才库
     */
    listTalentProfiles(params?: {
        page?: number
        size?: number
        majorId?: number
        keyword?: string
        schoolId?: number
    }) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['TalentProfilePageResponse'] }>(
            '/talent-profiles',
            params
        )
    },

    /**
     * 发布/修改我的人才卡片
     */
    upsertTalentProfile(data: Schemas['UpsertTalentProfileDTO']) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['TalentProfileVO'] }>(
            '/talent-profiles',
            data
        )
    },

    /**
     * 查看人才详情
     */
    getTalentProfile(id: number) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['TalentProfileDetailVO'] }>(
            `/talent-profiles/${id}`
        )
    },

    /**
     * 查看个人人才卡片
     */
    getMyTalentProfile() {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['TalentProfileDetailVO'] }>(
            '/talent-profiles/my'
        )
    }
}
