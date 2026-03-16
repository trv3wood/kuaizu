import { templateStore } from '../stores/templateStore'
import { userApi } from '../api/index'

/**
 * 统一订阅消息请求工具
 * @param bizKeys 业务标识 (支持单个字符串或数组)
 * @returns 订阅结果映射表 (如果是单个字符串则返回该字符串对应的结果)
 */
export async function requestSubscription(bizKeys: string): Promise<'accept' | 'reject' | 'ban' | undefined>;
export async function requestSubscription(bizKeys: string[]): Promise<Record<string, 'accept' | 'reject' | 'ban' | undefined>>;
export async function requestSubscription(bizKeys: string | string[]): Promise<any> {
    const isArray = Array.isArray(bizKeys)
    const keys = isArray ? bizKeys : [bizKeys]
    
    // 获取模板 ID 映射
    const bizKeyToTmplId: Record<string, string> = {}
    const tmplIds: string[] = []

    keys.forEach(key => {
        const id = templateStore.getTemplateId(key)
        if (id) {
            bizKeyToTmplId[key] = id
            if (tmplIds.indexOf(id) === -1) {
                tmplIds.push(id)
            }

        } else {
            console.warn(`[subscription] 找不到业务 ${key} 对应的模板 ID`)
        }
    })

    if (tmplIds.length === 0) {
        return isArray ? {} : undefined
    }

    try {
        // 微信限制单次最多 3 个模板
        const res = await wx.requestSubscribeMessage({
            tmplIds: tmplIds.slice(0, 3)
        })
        
        const results: Record<string, 'accept' | 'reject' | 'ban' | undefined> = {}
        const syncTemplates: { biz_key: string; result: 'accept' | 'reject' | 'ban' }[] = []

        keys.forEach(key => {
            const id = bizKeyToTmplId[key]
            if (id && res[id]) {
                const result = res[id] as 'accept' | 'reject' | 'ban'
                results[key] = result
                syncTemplates.push({
                    biz_key: key,
                    result: result
                })
            }
        })

        // 自动批量同步到后端
        if (syncTemplates.length > 0) {
            userApi.syncUserSubscription({
                templates: syncTemplates
            }).catch(err => console.error('[subscription] 批量同步订阅状态失败:', err))
        }

        return isArray ? results : results[bizKeys as string]
    } catch (err) {
        console.error('[subscription] 订阅请求失败:', err)
        return isArray ? {} : undefined
    }
}

