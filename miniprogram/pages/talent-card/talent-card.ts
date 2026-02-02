// pages/talent-card/talent-card.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { talentApi } from '../../api/index'
import type { components } from '../../api/schema'

type TalentProfileVO = components['schemas']['TalentProfileVO']
type UpsertTalentProfileDTO = components['schemas']['UpsertTalentProfileDTO']

Page({
    data: {
        // 是否编辑模式
        isEditing: false,
        // 人才档案
        profile: null as TalentProfileVO | null,
        // 表单数据
        form: {
            skills: [] as string[],
            intro: '',
            selfEvaluation: '',
            projectExperience: '',
            mbti: '',
            isPublicContact: true,
            status: 1
        } as UpsertTalentProfileDTO,
        // 技能输入
        skillInput: '',
        // MBTI 选项
        mbtiOptions: [
            'INTJ', 'INTP', 'ENTJ', 'ENTP',
            'INFJ', 'INFP', 'ENFJ', 'ENFP',
            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
            'ISTP', 'ISFP', 'ESTP', 'ESFP'
        ],
        mbtiIndex: -1,
        // 状态
        loading: true,
        saving: false
    },

    storeBindings: null as any,

    onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store: userStore,
            fields: ['user', 'displayName', 'avatarUrl'],
            actions: []
        })

        this.loadProfile()
    },

    onUnload() {
        this.storeBindings?.destroyStoreBindings()
    },

    /**
     * 加载人才档案
     */
    async loadProfile() {
        this.setData({ loading: true })

        try {
            const res = await talentApi.listTalentProfiles({ page: 1, size: 1 })
            const profiles = res.data?.list || []

            if (profiles.length > 0) {
                const profile = profiles[0]
                if (profile) {
                    const mbtiIndex = this.data.mbtiOptions.indexOf(profile.mbti || '')

                    this.setData({
                        profile,
                        isEditing: false,
                        form: {
                            skills: profile.skills || [],
                            intro: profile.intro || '',
                            selfEvaluation: '',
                            projectExperience: '',
                            mbti: profile.mbti || '',
                            isPublicContact: profile.isPublicContact ?? true,
                            status: profile.status || 1
                        },
                        mbtiIndex,
                        loading: false
                    })

                    if (profile.id) {
                        this.loadProfileDetail(profile.id)
                    }
                }
            } else {
                this.setData({
                    profile: null,
                    isEditing: true,
                    loading: false
                })
            }
        } catch (error) {
            console.error('加载人才档案失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 加载人才详情
     */
    async loadProfileDetail(id: number) {
        try {
            const res = await talentApi.getTalentProfile(id)
            const detail = res.data
            if (detail) {
                this.setData({
                    'form.selfEvaluation': detail.selfEvaluation || '',
                    'form.projectExperience': detail.projectExperience || ''
                })
            }
        } catch (error) {
            console.error('加载人才详情失败:', error)
        }
    },

    handleEdit() {
        this.setData({ isEditing: true })
    },

    handleCancel() {
        if (this.data.profile) {
            const profile = this.data.profile
            const mbtiIndex = this.data.mbtiOptions.indexOf(profile.mbti || '')
            this.setData({
                isEditing: false,
                form: {
                    skills: profile.skills || [],
                    intro: profile.intro || '',
                    selfEvaluation: this.data.form.selfEvaluation,
                    projectExperience: this.data.form.projectExperience,
                    mbti: profile.mbti || '',
                    isPublicContact: profile.isPublicContact ?? true,
                    status: profile.status || 1
                },
                mbtiIndex,
                skillInput: ''
            })
        } else {
            wx.navigateBack()
        }
    },

    handleInput(e: WechatMiniprogram.Input) {
        const { field } = e.currentTarget.dataset
        this.setData({
            [`form.${field}`]: e.detail.value
        })
    },

    handleSkillInput(e: WechatMiniprogram.Input) {
        this.setData({ skillInput: e.detail.value })
    },

    handleAddSkill() {
        const { skillInput, form } = this.data
        const skill = skillInput.trim()

        if (!skill) {
            wx.showToast({ title: '请输入技能', icon: 'none' })
            return
        }

        const skills = form.skills || []
        let exists = false
        for (let i = 0; i < skills.length; i++) {
            if (skills[i] === skill) {
                exists = true
                break
            }
        }

        if (exists) {
            wx.showToast({ title: '技能已存在', icon: 'none' })
            return
        }

        if (skills.length >= 10) {
            wx.showToast({ title: '最多添加10个技能', icon: 'none' })
            return
        }

        this.setData({
            'form.skills': [...skills, skill],
            skillInput: ''
        })
    },

    handleRemoveSkill(e: WechatMiniprogram.TouchEvent) {
        const { index } = e.currentTarget.dataset
        const skills = [...(this.data.form.skills || [])]
        skills.splice(index, 1)
        this.setData({ 'form.skills': skills })
    },

    handleMbtiChange(e: WechatMiniprogram.PickerChange) {
        const index = Number(e.detail.value)
        this.setData({
            mbtiIndex: index,
            'form.mbti': this.data.mbtiOptions[index]
        })
    },

    handleContactSwitch(e: WechatMiniprogram.SwitchChange) {
        this.setData({ 'form.isPublicContact': e.detail.value })
    },

    async handleSave() {
        const { form } = this.data

        if (!form.intro?.trim()) {
            wx.showToast({ title: '请填写简介', icon: 'none' })
            return
        }

        if (!form.skills || form.skills.length === 0) {
            wx.showToast({ title: '请添加至少一个技能', icon: 'none' })
            return
        }

        this.setData({ saving: true })

        try {
            const res = await talentApi.upsertTalentProfile({
                skills: form.skills,
                intro: form.intro,
                selfEvaluation: form.selfEvaluation,
                projectExperience: form.projectExperience,
                mbti: form.mbti,
                isPublicContact: form.isPublicContact,
                status: 1
            })

            if (res.data) {
                this.setData({
                    profile: res.data,
                    isEditing: false,
                    saving: false
                })
                wx.showToast({ title: '保存成功', icon: 'success' })
            }
        } catch (error) {
            console.error('保存失败:', error)
            this.setData({ saving: false })
            wx.showToast({ title: '保存失败', icon: 'none' })
        }
    }
})
