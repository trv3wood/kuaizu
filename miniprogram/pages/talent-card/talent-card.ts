// pages/talent-card/talent-card.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { talentApi } from '../../api/index'
import type { components } from '../../api/schema'

type TalentProfileDetailVO = components['schemas']['TalentProfileDetailVO']

Page({
    data: {
        profile: null as TalentProfileDetailVO | null,
        loading: true,
    },

    storeBindings: null as any,

    onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store: userStore,
            fields: ['user', 'displayName', 'avatarUrl', 'isVerified'],
            actions: []
        })
    },

    onShow() {
        // 每次显示时重新加载，以便从 edit-profile 返回后刷新数据
        this.loadProfile()
    },

    onUnload() {
        this.storeBindings?.destroyStoreBindings()
    },

    async loadProfile() {
        this.setData({ loading: true })
        try {
            const res = await talentApi.getMyTalentProfile()
            this.setData({
                profile: res.data || null,
                loading: false
            })
        } catch (error) {
            console.error('加载人才档案失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 编辑名片 → 跳转到 edit-profile
     */
    handleEdit() {
        wx.navigateTo({
            url: '/pages/edit-profile/edit-profile'
        })
    },

    goToApplications() {
        wx.navigateTo({
            url: '/pages/my-applications/my-applications'
        })
    }
})
