const request = require('weapp.request')

/**
 * 网络请求配置与封装
 */

// 配置基础请求路径
request.config({
    baseUrl: 'http://127.0.0.1:8080/api/v2' // TODO: 替换为实际的后端基础路径
})

// 请求拦截器：管理 Token 和公共请求头
request.interceptors.req.use((config: any) => {
    const token = wx.getStorageSync('token')
    if (token) {
        config.header = {
            ...(config.header || {}),
            'Authorization': `Bearer ${token}`
        }
    }
    return config
})

// 响应拦截器：处理状态码、错误反馈等
request.interceptors.res.use((response: any) => {
    const { statusCode, data } = response

    // 正常响应
    if (statusCode >= 200 && statusCode < 300) {
        return data
    }

    // Token 失效，处理 401
    if (statusCode === 401) {
        wx.removeStorageSync('token')
        // TODO: 根据需要决定是否强制跳转登录页
        // wx.navigateTo({ url: '/pages/login/login' })
        return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    // 业务错误处理
    const errorMsg = data.message || '网络请求失败'
    wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
    })

    return Promise.reject(data)
})

export default request
