import { REQUEST, transformRequestResponseOkData, transformRequestSendDefault } from 'miniprogram-request'

/**
 * 网络请求配置与封装
 * 基于 miniprogram-request 库
 */

// 配置基础请求路径
REQUEST.Defaults.baseURL = 'http://127.0.0.1:8080/api/v2' // TODO: 替换为实际的后端基础路径

// 自动提取返回值为 2xx 时的 response.data
REQUEST.Defaults.transformResponse = transformRequestResponseOkData

// 请求发送前添加 Token
REQUEST.Defaults.transformSend = (options) => {
    const token = wx.getStorageSync('token')
    if (token) {
        options = {
            ...options,
            headers: {
                ...(options.headers || {}),
                'Authorization': `Bearer ${token}`
            }
        }
    }
    // 调用默认的 transformSend 以正确构建 URL (包括 baseURL)
    return transformRequestSendDefault(options)
}

// 响应处理：处理 401 等业务错误
REQUEST.Listeners.onRejected.push((reason, _options) => {
    // 检查是否为请求响应错误
    if (reason && typeof reason === 'object' && 'statusCode' in reason) {
        const res = reason as { statusCode: number; data?: any }

        // Token 失效，处理 401
        if (res.statusCode === 401) {
            wx.removeStorageSync('token')
            // 跳转登录页
            wx.navigateTo({ url: '/pages/login/login' })
            return Promise.reject(new Error('登录已过期，请重新登录'))
        }

        // 业务错误处理
        const errorMsg = res.data?.message || '网络请求失败'
        wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 2000
        })
    }

    return Promise.reject(reason)
})

/**
 * 封装 http 对象以支持泛型调用
 * miniprogram-request 已内置 PATCH 支持 (通过 X-HTTP-Method-Override)
 */
const http = {
    get: <T = any>(url: string, data?: any) => REQUEST.get<T>(url, data),
    post: <T = any>(url: string, data?: any) => REQUEST.post<T>(url, data),
    put: <T = any>(url: string, data?: any) => REQUEST.put<T>(url, data),
    delete: <T = any>(url: string, data?: any) => REQUEST.delete<T>(url, data),
    patch: <T = any>(url: string, data?: any) => REQUEST.patch<T>(url, data),
    request: <T = any>(options: any) => REQUEST.request<T>(options)
}

export default http
