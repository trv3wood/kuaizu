import type { components } from './schema'
import http from '../utils/http'

// 类型别名
type Schemas = components['schemas']

/**
 * API 封装模块
 * 基于 OpenAPI Schema 自动生成的类型定义
 */

// ==================== 认证模块 ====================
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

// ==================== 用户模块 ====================
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

// ==================== 项目模块 ====================
export const projectApi = {
    /**
     * 项目列表/搜索
     */
    listProjects(params?: {
        page?: number
        size?: number
        keyword?: string
        schoolId?: number
        status?: Schemas['ProjectStatus']
        direction?: Schemas['Direction']
    }) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['ProjectPageResponse'] }>(
            '/projects',
            params
        )
    },

    /**
     * 发布新项目
     */
    createProject(data: Schemas['CreateProjectDTO']) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['ProjectVO'] }>(
            '/projects',
            data
        )
    },

    /**
     * 获取项目详情
     */
    getProject(id: number) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['ProjectDetailVO'] }>(
            `/projects/${id}`
        )
    },

    /**
     * 修改项目信息
     */
    updateProject(id: number, data: Schemas['UpdateProjectDTO']) {
        return http.put<Schemas['BaseResponse'] & { data: Schemas['ProjectVO'] }>(
            `/projects/${id}`,
            data
        )
    },

    /**
     * 删除/下架项目
     */
    deleteProject(id: number) {
        return http.delete<Schemas['BaseResponse']>(`/projects/${id}`)
    }
}

// ==================== 项目申请模块 ====================
export const applicationApi = {
    /**
     * 查看我创建的项目
     */
    listMyProjects(params?: {
        page?: number
        size?: number
        status?: Schemas['ProjectStatus']
    }) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['ProjectPageResponse'] }>(
            '/projects/my',
            params
        )
    },
    /**
     * 查看某项目的申请列表
     */
    listProjectApplications(
        projectId: number,
        params?: {
            page?: number
            size?: number
            status?: Schemas['ApplicationStatus']
        }
    ) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['ApplicationPageResponse'] }>(
            `/projects/${projectId}/applications`,
            params
        )
    },

    /**
     * 申请加入项目
     */
    applyToProject(
        projectId: number,
        data: {
            applyReason?: string
            contact?: string
        }
    ) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['ProjectApplicationVO'] }>(
            `/projects/${projectId}/applications`,
            data
        )
    },

    /**
     * 审核申请
     */
    reviewApplication(
        id: number,
        data: {
            status: Schemas['ApplicationStatus']
            replyMsg?: string
        }
    ) {
        return http.patch<Schemas['BaseResponse']>(`/project-applications/${id}`, data)
    }
}

// ==================== 人才库模块 ====================
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
    }
}

// ==================== 橄榄枝模块 ====================
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

// ==================== 商品模块 ====================
export const productApi = {
    /**
     * 获取商品列表
     */
    listProducts() {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['ProductVO'][] }>(
            '/products'
        )
    },

    /**
     * 获取商品详情
     */
    getProductDetail(id: number) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['ProductVO'] }>(
            `/products/${id}`
        )
    }
}

// ==================== 订单与支付模块 ====================
export const orderApi = {
    /**
     * 创建订单
     */
    createOrder(body: Array<Schemas['CreateOrderDTO']>) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['OrderVO'] }>(
            '/orders',
            body
        )
    },

    /**
     * 查询订单状态
     */
    getOrder(id: number) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['OrderVO'] }>(
            `/orders/${id}`
        )
    },

    /**
     * 发起微信支付
     */
    initiatePayment(id: number) {
        return http.post<Schemas['BaseResponse'] & { data: Schemas['WechatPaymentParams'] }>(
            `/orders/${id}/pay`
        )
    },

    /**
     * 查询我的订单
     */
    listMyOrder(params?: {
        page?: number,
        size?: number,
        status?: number,
    }) {
        return http.get<Schemas['BaseResponse'] & { data: { list: Schemas['OrderVO'][], pageInfo: Schemas['PageInfo'] } }>(
            `/orders/my`,
            params
        )
    }
}

// ==================== 基础数据模块 ====================
export const dictionaryApi = {
    /**
     * 获取学校列表
     */
    listSchools(keyword?: string) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['SchoolVO'][] }>(
            '/dictionaries/schools',
            keyword ? { keyword } : undefined
        )
    },

    /**
     * 获取专业/大类列表
     */
    listMajors(params?: {
        classId?: number
        majorKeyword?: string
        classKeyword?: string
    }) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['MajorClassVO'][] }>(
            '/dictionaries/majors',
            params
        )
    }
}

// ==================== 通用模块 ====================
export const commonApi = {
    /**
     * 文件上传通用接口
     */
    uploadFile(file: string, type?: 'avatar' | 'student_cert' | 'project') {
        return http.post<Schemas['BaseResponse'] & { data: { url: string } }>(
            '/commons/uploads',
            { file, type }
        )
    }
}

// 导出所有 API
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
    common: commonApi
}
