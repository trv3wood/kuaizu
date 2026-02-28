// pages/form-feedback/form-feedback.ts

Page({
  data: {
    feedback: '',
    email: ''
  },

  /**
   * 输入反馈内容
   */
  onFeedbackInput(e: WechatMiniprogram.Input) {
    this.setData({
      feedback: e.detail.value
    })
  },

  /**
   * 输入邮箱
   */
  onEmailInput(e: WechatMiniprogram.Input) {
    this.setData({
      email: e.detail.value
    })
  },

  /**
   * 提交反馈
   */
  handleSubmit() {
    const { feedback, email } = this.data

    // 验证反馈内容
    if (!feedback || feedback.trim().length === 0) {
      wx.showToast({
        title: '请输入评价或建议',
        icon: 'none'
      })
      return
    }

    // 验证邮箱格式（如果填写了）
    if (email && email.trim().length > 0) {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailReg.test(email.trim())) {
        wx.showToast({
          title: '邮箱格式不正确',
          icon: 'none'
        })
        return
      }
    }

    // 显示加载
    wx.showLoading({ title: '提交中...' })

    // TODO: 这里应该调用后端 API 提交反馈
    // 暂时模拟提交成功
    console.log('反馈内容:', feedback)
    console.log('邮箱:', email)

    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000
      })

      // 清空表单
      this.setData({
        feedback: '',
        email: ''
      })

      setTimeout(() => {
        wx.navigateBack()
      }, 2000)
    }, 1000)
  }
})
