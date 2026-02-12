import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 基础数据模块
 */
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
