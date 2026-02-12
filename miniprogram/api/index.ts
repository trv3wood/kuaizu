import { authApi } from './auth'
import { userApi } from './user'
import { projectApi } from './project'
import { applicationApi } from './application'
import { talentApi } from './talent'
import { oliveBranchApi } from './olive-branch'
import { productApi } from './product'
import { orderApi } from './order'
import { dictionaryApi } from './dictionary'
import { commonApi } from './common'
import { emailPromotionApi } from './email-promotion'

// 重新导出各个模块的 API
export * from './auth'
export * from './user'
export * from './project'
export * from './application'
export * from './talent'
export * from './olive-branch'
export * from './product'
export * from './order'
export * from './dictionary'
export * from './common'
export * from './email-promotion'

// 导出组合对象（保持向下兼容）
export default {
    auth: authApi,
    user: userApi,
    project: projectApi,
    application: applicationApi,
    talent: talentApi,
    oliveBranch: oliveBranchApi,
    product: productApi,
    order: orderApi,
    dictionary: dictionaryApi,
    common: commonApi,
    emailPromotion: emailPromotionApi
}
