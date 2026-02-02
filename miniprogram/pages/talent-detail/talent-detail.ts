// pages/talent-detail/talent-detail.ts
import { talentApi, oliveBranchApi } from '../../api/index'
import type { components } from '../../api/schema'

type TalentProfileDetailVO = components['schemas']['TalentProfileDetailVO']

Page({
    data: {
        id: 0,
        profile: null as TalentProfileDetailVO | null,
        loading: true,
        sending: false
    },

    onLoad(options) {
        const id = Number(options.id)
        if (id) {
            this.setData({ id })
            this.loadProfile(id)
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' })
            setTimeout(() => wx.navigateBack(), 1500)
        }
    },

    /**
     * 加载人才详情
     */
    async loadProfile(id: number) {
        this.setData({ loading: true })

        try {
            const res = await talentApi.getTalentProfile(id)
            this.setData({
                profile: res.data || null,
                loading: false
            })
        } catch (error) {
            console.error('加载人才详情失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 发送橄榄枝
     */
    async handleSendOliveBranch() {
        const { profile, sending } = this.data
        if (!profile || sending) return

        // 确认弹窗
        const { confirm } = await wx.showModal({
            title: '发送邀请',
            content: `确定向 ${profile.nickname || '该用户'} 发送橄榄枝吗？`,
            confirmText: '发送',
            confirmColor: '#667eea'
        })

        if (!confirm) return

        this.setData({ sending: true })

        try {
            await oliveBranchApi.sendOliveBranch({
                receiverId: profile.userId!,
                type: 1, // 1-人才互联
                hasSmsNotify: false,
                message: '您好，我对您的技能很感兴趣，希望能进一步交流！'
            })

            wx.showToast({ title: '发送成功', icon: 'success' })
        } catch (error: any) {
            console.error('发送橄榄枝失败:', error)
            const msg = error?.data?.message || '发送失败'
            wx.showToast({ title: msg, icon: 'none' })
        } finally {
            this.setData({ sending: false })
        }
    },

    /**
     * 复制联系方式
     */
    handleCopyContact() {
        const contact = this.data.profile?.contact
        if (contact) {
            wx.setClipboardData({
                data: contact,
                success() {
                    wx.showToast({ title: '已复制', icon: 'success' })
                }
            })
        }
    }
})
