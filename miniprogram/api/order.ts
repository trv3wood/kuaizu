import type { components } from './schema'
import http from '../utils/http'

type Schemas = components['schemas']

/**
 * 订单与支付模块
 */
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
