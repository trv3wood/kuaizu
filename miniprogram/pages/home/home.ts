// pages/home/home.ts
Page({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {},

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ active: 0 })
    }
  },

  /**
   * 导航到项目列表
   */
  navigateToProjects() {
    wx.navigateTo({ url: '/pages/projects/projects' })
  },

  /**
   * 导航到人才列表
   */
  navigateToTalent() {
    wx.navigateTo({ url: '/pages/talent/talent' })
  }
})
