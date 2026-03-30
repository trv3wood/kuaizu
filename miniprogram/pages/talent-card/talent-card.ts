// pages/talent-card/talent-card.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { talentApi } from '../../api/index'
import type { components } from '../../api/schema'
import { TalentStatus } from '../../utils/enum'
import { resolveTalentCardStrategy } from '../../utils/detail-display-strategy'

type TalentProfileDetailVO = components['schemas']['TalentProfileDetailVO']

Page({
    options: {
        styleIsolation: 'apply-shared'
    },

    data: {
        statusBarHeight: 0,
        navBarHeight: 44,
        showBackButton: false,
        scene: 'default',
        viewStrategy: resolveTalentCardStrategy().strategy,
        pageTitle: '名片',
        pageSubtitle: '面对喜欢的校园项目或对外社交时，一张完善的名片会让您更具竞争力。',
        cardHintText: '点击名片编辑信息',
        primaryActionText: '投递名片管理',
        primaryActionClassName: 'ui-btn--primary',
        primaryActionDisabled: false,
        shelfActionLoading: false,
        statusTipText: '',
        statusTipClassName: '',
        talentStatusEnum: TalentStatus,
        profile: null as TalentProfileDetailVO | null,
        loading: true,
    },

    storeBindings: null as any,

    onLoad(options) {
        const menuButton = wx.getMenuButtonBoundingClientRect()
        const systemInfo = wx.getSystemInfoSync()
        const pages = getCurrentPages()
        const statusBarHeight = systemInfo.statusBarHeight || 0
        const navBarHeight = menuButton.height + (menuButton.top - statusBarHeight) * 2
        const { scene, strategy } = resolveTalentCardStrategy(options?.scene)

        this.setData({
            statusBarHeight,
            navBarHeight,
            showBackButton: pages.length > 1,
            scene,
            viewStrategy: strategy
        })

        this.storeBindings = createStoreBindings(this, {
            store: userStore,
            fields: ['user', 'displayName', 'avatarUrl', 'isVerified'],
            actions: []
        })

        this.syncSceneCopy()
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
            this.syncSceneCopy(res.data || null)
        } catch (error) {
            console.error('加载人才档案失败:', error)
            this.setData({ loading: false })
            this.syncSceneCopy(null)
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

    handleBack() {
        if (getCurrentPages().length > 1) {
            wx.navigateBack()
        }
    },

    async handlePrimaryAction() {
        const { viewStrategy, primaryActionDisabled, shelfActionLoading } = this.data
        if (primaryActionDisabled || shelfActionLoading) return

        if (viewStrategy.showShelfAction) {
            await this.handleShelfAction()
            return
        }

        if (viewStrategy.showManageApplicationsAction) {
            this.goToApplications()
        }
    },

    async handleShelfAction() {
        const { profile, shelfActionLoading } = this.data
        if (shelfActionLoading) return

        if (!profile) {
            this.handleEdit()
            return
        }

        const nextStatus = this.getNextShelfStatus(profile.status)
        if (nextStatus === null) return

        this.setData({ shelfActionLoading: true })

        try {
            await talentApi.upsertTalentProfile({
                skills: profile.skills || [],
                selfEvaluation: profile.selfEvaluation || '',
                projectExperience: profile.projectExperience || '',
                mbti: profile.mbti || '',
                status: nextStatus
            })

            wx.showToast({
                title: nextStatus === TalentStatus.OffShelf ? '名片已下架' : '已提交审核',
                icon: 'success'
            })

            await this.loadProfile()
        } catch (error) {
            console.error('更新名片状态失败:', error)
            wx.showToast({ title: '操作失败', icon: 'none' })
        } finally {
            this.setData({ shelfActionLoading: false })
        }
    },

    goToApplications() {
        wx.navigateTo({
            url: '/pages/my-applications/my-applications'
        })
    },

    syncSceneCopy(profile?: TalentProfileDetailVO | null) {
        const currentProfile = profile === undefined ? this.data.profile : profile
        const status = currentProfile?.status ?? TalentStatus.OffShelf
        const isShelfControlScene = this.data.scene === 'shelf-control'

        const statusCopy = this.getStatusCopy(status)
        const sceneCopy = isShelfControlScene
            ? this.getShelfControlCopy(status, !!currentProfile)
            : {
                pageTitle: '名片',
                pageSubtitle: '面对喜欢的校园项目或对外社交时，一张完善的名片会让您更具竞争力。',
                cardHintText: '点击名片编辑信息',
                primaryActionText: '投递名片管理',
                primaryActionClassName: 'ui-btn--primary',
                primaryActionDisabled: false
            }

        this.setData({
            ...sceneCopy,
            statusTipText: statusCopy.text,
            statusTipClassName: statusCopy.className
        })
    },

    getShelfControlCopy(status?: number, hasProfile = false) {
        if (!hasProfile) {
            return {
                pageTitle: '发布名片',
                pageSubtitle: '完善并保存名片后，可提交至人才库审核，让更多优秀项目看到您。',
                cardHintText: '点击名片编辑信息',
                primaryActionText: '创建名片',
                primaryActionClassName: 'ui-btn--primary',
                primaryActionDisabled: false
            }
        }

        if (status === TalentStatus.OnShelf) {
            return {
                pageTitle: '下架名片',
                pageSubtitle: '从人才库下架名片后，您依然可以投递名片，但无法让优秀项目主动看到您。',
                cardHintText: '点击名片更新信息',
                primaryActionText: '确认下架',
                primaryActionClassName: 'primary-action--light',
                primaryActionDisabled: false
            }
        }

        if (status === TalentStatus.UnderReview) {
            return {
                pageTitle: '发布名片',
                pageSubtitle: '您的名片正在审核中，通过后将展示至人才库。',
                cardHintText: '点击名片编辑信息',
                primaryActionText: '审核中',
                primaryActionClassName: 'ui-btn--primary',
                primaryActionDisabled: true
            }
        }

        return {
            pageTitle: '发布名片',
            pageSubtitle: '将名片发布至人才库，让更多优秀的项目随时看到您。',
            cardHintText: '点击名片编辑信息',
            primaryActionText: '发布名片',
            primaryActionClassName: 'ui-btn--primary',
            primaryActionDisabled: false
        }
    },

    getStatusCopy(status?: number) {
        if (status === TalentStatus.OnShelf) {
            return {
                text: '名片已发布人才库',
                className: 'published'
            }
        }

        if (status === TalentStatus.UnderReview) {
            return {
                text: '名片发布审核中',
                className: 'reviewing'
            }
        }

        return {
            text: '名片未发布人才库',
            className: ''
        }
    },

    getNextShelfStatus(status?: number) {
        if (status === TalentStatus.OnShelf) {
            return TalentStatus.OffShelf
        }

        if (status === TalentStatus.OffShelf) {
            return TalentStatus.UnderReview
        }

        return null
    }
})
