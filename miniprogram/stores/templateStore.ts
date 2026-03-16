import { observable, action } from 'mobx-miniprogram'
import { userApi } from '../api/index'
import { MsgBizKey } from '../utils/constants'


/**
 * 订阅消息模板 Store
 */
export const templateStore = observable({
    // ==================== 状态字段 ====================

    /** 
     * 模板 ID 映射表
     * key: 业务标识 (bizKey)
     * value: 微信订阅消息模板 ID (templateId)
     */
    templates: {} as Record<string, string>,

    // ==================== Getters ====================

    /**
     * 根据业务标识获取模板 ID (从缓存中同步获取)
     */
    getTemplateId(bizKey: string): string | undefined {
        return this.templates[bizKey]
    },


    // ==================== Actions ====================

    /**
     * 获取所有订阅消息模板 ID
     */
    fetchAll: action(async function (this: typeof templateStore) {
        try {
            const bizKeys = Object.keys(MsgBizKey).map(key => (MsgBizKey as any)[key])
            const res = await userApi.getSubscriptionTemplateId({ bizKeys })

            if (res.data && Array.isArray(res.data)) {
                const newTemplates = { ...this.templates }
                res.data.forEach(item => {
                    if (item.bizKey && item.templateId) {
                        newTemplates[item.bizKey] = item.templateId
                    }
                })
                this.templates = newTemplates
            }
        } catch (error) {
            console.error('[templateStore] 批量获取模板 ID 失败:', error)
        }
    }),

    /**
     * 批量获取并同步订阅消息模板 ID (按需获取)
     */
    fetch: action(async function (this: typeof templateStore, bizKeys: string[]) {
        try {
            const res = await userApi.getSubscriptionTemplateId({ bizKeys })
            if (res.data && Array.isArray(res.data)) {
                const newTemplates = { ...this.templates }
                res.data.forEach(item => {
                    if (item.bizKey && item.templateId) {
                        newTemplates[item.bizKey] = item.templateId
                    }
                })
                this.templates = newTemplates
            }
        } catch (error) {
            console.error('[templateStore] 获取模板 ID 失败:', error)
        }
    })

})

export default templateStore
