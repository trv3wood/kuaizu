import { observable, action } from 'mobx-miniprogram'
import { userApi } from '../api/index'

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
     * 根据业务标识获取模板 ID
     */
    async getTemplateId(bizKey: string): Promise<string | undefined> {
        if (Object.keys(this.templates).length === 0) {
            await this.fetch([bizKey])
        }
        return this.templates[bizKey]
    },

    // ==================== Actions ====================

    /**
     * 批量获取并同步订阅消息模板 ID
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
