import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 商品模块
 */
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
