import { REQUEST, transformRequestResponseOkData, transformRequestSendDefault } from 'miniprogram-request'
import config from '../config'

/**
 * 网络请求配置与封装
 * 基于 miniprogram-request 库
 */

// 配置基础请求路径
REQUEST.Defaults.baseURL = config.BASE_URL 

// 自动提取返回值为 2xx 时的 response.data
REQUEST.Defaults.transformResponse = transformRequestResponseOkData

// 辅助函数：递归移除对象中的空值 (null/undefined)
const removeEmpty = (obj: any) => {
  if (!(obj instanceof Object)) return obj
  Object.keys(obj).forEach(key => {
    if (obj[key] === null || obj[key] === undefined) {
      delete obj[key]
    } else if (obj[key] instanceof Object) {
      removeEmpty(obj[key])
    }
  })
  return obj
}

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
    // 自动过滤 null 和 undefined 属性，防止 JSON.stringify 将 null 序列化传给后端
    // 同时也解决了小程序 data 必须用 null 而 API 定义期望 undefined 的不一致问题
    if (options.data && typeof options.data === 'object' && !(options.data instanceof ArrayBuffer)) {
      options.data = removeEmpty({ ...(options.data as object) })
    }
    // 调用默认的 transformSend 以正确构建 URL (包括 baseURL)
    return transformRequestSendDefault(options)
}

// 日志记录：打印请求参数
REQUEST.Listeners.onSend.push((options) => {
    console.log(`[HTTP/REQ] ${options.method || 'GET'} ${options.url}`, {
        data: options.data,
        headers: options.headers,
        params: options.params
    })
})

// 日志记录：打印请求结果
REQUEST.Listeners.onResponse.push((response, options) => {
    console.log(`[HTTP/RES] ${options.method || 'GET'} ${options.url}`, {
        status: response.statusCode,
        data: response.data
    })
})

// 响应处理：处理 401 等业务错误
REQUEST.Listeners.onRejected.push((reason, options) => {
    console.error(`[HTTP/ERR] ${options.method || 'GET'} ${options.url}`, reason)

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

export default REQUEST