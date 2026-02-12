import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 邮件推广模块
 */
export const emailPromotionApi = {
    /**
     * 邮件退订
     */
    emailUnsubscribe(token: string) {
        return http.get<string>('/email/unsubscribe', { token })
    },

    /**
     * 触发邮件推广
     */
    triggerEmailPromotion(data: Schemas['TriggerEmailPromotionDTO']) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['TriggerEmailPromotionResponse'] }>(
            '/email/promotion/trigger',
            data
        )
    },

    /**
     * 我的推广记录列表
     */
    listMyEmailPromotions() {
        return http.get<Schemas['BaseResponse'] & { data: { list: Schemas['EmailPromotionVO'][], total: number } }>(
            '/email/promotions/my'
        )
    }
}
