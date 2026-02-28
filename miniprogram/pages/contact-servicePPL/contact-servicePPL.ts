// pages/contact-servicePPL/contact-servicePPL.ts

Page({
  data: {
    // 电话帮助弹窗
    showPhonePopup: false,
    // 投诉建议选择
    showComplaintSheet: false,
    complaintActions: [
      { name: '表单反馈' },
      { name: '人工投诉' }
    ],
    // 人工投诉弹窗
    showManualComplaintPopup: false,
    // 客服电话
    servicePhone: '13290908769'
  },

  /**
   * 电话帮助
   */
  handlePhoneHelp() {
    wx.setClipboardData({
      data: this.data.servicePhone,
      success: () => {
        this.setData({ showPhonePopup: true })
      }
    })
  },

  /**
   * 关闭电话帮助弹窗
   */
  closePhonePopup() {
    this.setData({ showPhonePopup: false })
  },

  /**
   * 投诉建议
   */
  handleComplaint() {
    this.setData({ showComplaintSheet: true })
  },

  /**
   * 关闭投诉建议选择
   */
  closeComplaintSheet() {
    this.setData({ showComplaintSheet: false })
  },

  /**
   * 选择投诉建议选项
   */
  onComplaintSelect(event: WechatMiniprogram.CustomEvent) {
    const { name } = event.detail
    this.setData({ showComplaintSheet: false })

    if (name === '表单反馈') {
      wx.navigateTo({ url: '/pages/form-feedback/form-feedback' })
    } else if (name === '人工投诉') {
      this.setData({ showManualComplaintPopup: true })
    }
  },

  /**
   * 关闭人工投诉弹窗
   */
  closeManualComplaintPopup() {
    this.setData({ showManualComplaintPopup: false })
  }
})