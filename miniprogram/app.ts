// app.ts
import { userStore } from './stores/index'

App<IAppOption>({
  globalData: {},
  async onLaunch() {
    // 初始化用户状态
    await userStore.init()
    if (!userStore.isLoggedIn) {
      wx.navigateTo({ url: "/pages/login/login"})
    }
  },
})