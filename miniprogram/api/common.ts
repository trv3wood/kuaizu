import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 通用模块
 */
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
