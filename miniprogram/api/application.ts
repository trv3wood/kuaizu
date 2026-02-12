import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 项目申请模块
 */
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
    },

    /**
     * 获取我的申请
     */
    listMyApplications(params?: {
        page?: number
        size?: number
        status?: Schemas['ApplicationStatus']
    }) {
        return http.get<Schemas['BaseResponse'] & { data: Schemas['ApplicationPageResponse'] }>(
            '/project-applications/my',
            params
        )
    }
}
