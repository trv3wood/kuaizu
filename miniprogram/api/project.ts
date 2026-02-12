import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 项目模块
 */
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
