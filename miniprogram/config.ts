// config.ts
const accountInfo = wx.getAccountInfoSync();
// 获取当前环境：develop, trial, release
const env = accountInfo.miniProgram.envVersion; 

let base_url = '';

// 你的后端地址配置
const envConfig = {
  // 开发环境 (配合 Cloudflare/cpolar 内网穿透地址)
  develop: 'https://dev.darker233.top/api/v2', 
  // 体验环境 (通常是测试服)
  trial: 'https://dev.darker233.top/api/v2',
  // 正式环境
  release: 'https://kuaizu.xyz' 
};

// 自动赋值
base_url = envConfig[env] || envConfig.release; // 兜底用正式版

export default {
  BASE_URL: base_url,
  ENV: env
}