// pages/talent-card/talent-card.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { talentApi } from '../../api/index'
import type { components } from '../../api/schema'

type TalentProfileDetailVO = components['schemas']['TalentProfileDetailVO']
type UpsertTalentProfileDTO = components['schemas']['UpsertTalentProfileDTO']

Page({
    data: {
        // 是否编辑模式
        isEditing: false,
        // 人才档案
        profile: null as TalentProfileDetailVO | null,
        // MBTI 数组 (E/I, S/N, T/F, J/P)
        mbtiArray: ['E', 'S', 'T', 'J'],
        // 表单数据
        form: {
            skills: [] as string[],
            selfEvaluation: '',
            projectExperience: '',
            mbti: '',
            status: 1
        } as UpsertTalentProfileDTO,
        // 技能输入
        skillInput: '',
        // MBTI 原始选项 (保留以防其他逻辑需要)
        mbtiOptions: [
            'INTJ', 'INTP', 'ENTJ', 'ENTP',
            'INFJ', 'INFP', 'ENFJ', 'ENFP',
            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
            'ISTP', 'ISFP', 'ESTP', 'ESFP'
        ],
        // 状态
        loading: true,
        saving: false
    },

    storeBindings: null as any,

    onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store: userStore,
            fields: ['user', 'displayName', 'avatarUrl', 'isVerified'],
            actions: ['updateUser']
        })

        this.loadProfile()
    },

    onUnload() {
        this.storeBindings?.destroyStoreBindings()
    },

    /**
     * 加载个人人才档案
     */
    async loadProfile() {
        this.setData({ loading: true })

        try {
            const res = await talentApi.getMyTalentProfile()
            const profile = res.data

            if (profile) {
                // 解析 MBTI 字符串为数组
                const mbti = profile.mbti || 'ESTJ'
                const mbtiArray = mbti.split('')

                this.setData({
                    profile,
                    isEditing: false,
                    form: {
                        skills: profile.skills || [],
                        selfEvaluation: profile.selfEvaluation || '',
                        projectExperience: profile.projectExperience || '',
                        mbti: mbti,
                        status: profile.status || 1
                    },
                    mbtiArray,
                    loading: false
                })

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

    handleEdit() {
        // 从 profile 初始化 edit 状态
        const mbti = this.data.profile?.mbti || 'ESTJ'
        this.setData({
            isEditing: true,
            'form.skills': this.data.profile?.skills || [],
            'form.selfEvaluation': this.data.profile?.selfEvaluation || '',
            'form.projectExperience': this.data.profile?.projectExperience || '',
            'form.mbti': mbti,
            mbtiArray: mbti.split('')
        })
    },

    async handleUnpublish() {
        const res = await wx.showModal({
            title: '提示',
            content: '确定要下架名片吗？',
        })
        
        if (res.confirm) {
            try {
                await talentApi.deleteMyTalentProfile()
                wx.showToast({ title: '下架成功', icon: 'success' })
                this.loadProfile()
            } catch (error) {
                console.error('下架失败:', error)
                wx.showToast({ title: '下架失败', icon: 'none' })
            }
        }
    },

    handleCancel() {
        if (this.data.profile) {
            this.setData({ isEditing: false })
        } else {
            wx.navigateBack()
        }
    },

    /**
     * MBTI 维度切换
     */
    toggleMbti(e: any) {
        const { idx, val } = e.currentTarget.dataset
        const mbtiArray = [...this.data.mbtiArray]
        mbtiArray[idx] = val
        const mbti = mbtiArray.join('')
        this.setData({
            mbtiArray,
            'form.mbti': mbti
        })
    },

    /**
     * 更换头像
     */
    handleChangeAvatar() {
        wx.chooseMedia({
            count: 1,
            mediaType: ['image'],
            success: (res) => {
                const tempFilePath = res.tempFiles[0].tempFilePath
                // TODO: 真正的上传逻辑
                // 这里暂时更新 store 给用户反馈
                (this as any).updateUser({ avatarUrl: tempFilePath })
                wx.showToast({ title: '已更新头像', icon: 'none' })
            }
        })
    },

    /**
     * 入学年份更改
     */
    handleGradeChange(e: any) {
        const grade = e.detail.value
        this.setData({
            'user.grade': grade
        })
    },

    handleEmailInput(e: any) {
        this.setData({ 'user.email': e.detail.value })
    },

    handleWechatInput(e: any) {
        this.setData({ 'user.wechat': e.detail.value })
    },

    handleTextareaInput(e: any) {
        const { field } = e.currentTarget.dataset
        this.setData({ [`form.${field}`]: e.detail.value })
    },

    handleSkillInput(e: any) {
        this.setData({ skillInput: e.detail.value })
    },

    handleAddSkill() {
        const { skillInput, form } = this.data
        const skill = skillInput.trim()

        if (!skill) {
            // 如果是空的，可能是在点击“添加”按钮想输入
            // 我们可以在这里弹窗输入，或者让用户先在输入框填
            wx.showModal({
                title: '添加标签',
                editable: true,
                placeholderText: '请输入鲜明标签，如 极具创意',
                success: (res) => {
                    if (res.confirm && res.content.trim()) {
                        const newSkill = res.content.trim()
                        this.setData({ 'form.skills': [...(form.skills || []), newSkill] })
                    }
                }
            })
            return
        }

        const skills = form.skills || []
        if (skills.includes(skill)) {
            wx.showToast({ title: '标签已存在', icon: 'none' })
            return
        }

        this.setData({
            'form.skills': [...skills, skill],
            skillInput: ''
        })
    },

    handleRemoveSkill(e: any) {
        const { index } = e.currentTarget.dataset
        const skills = [...(this.data.form.skills || [])]
        skills.splice(index, 1)
        this.setData({ 'form.skills': skills })
    },

    goToCert() {
        wx.navigateTo({ url: '/pages/certification/certification' })
    },

    handleSchoolPicker() {
        wx.navigateTo({ url: '/pages/select-school/select-school' })
    },

    handleMajorPicker() {
        wx.navigateTo({ url: '/pages/select-major/select-major' })
    },

    async handleSave() {
        const { form } = this.data
        if (!form.skills || form.skills.length === 0) {
            wx.showToast({ title: '请添加至少一个标签', icon: 'none' })
            return
        }

        this.setData({ saving: true })

        try {
            const res = await talentApi.upsertTalentProfile({
                ...form,
                status: 1
            })

            wx.showToast({ title: '保存成功', icon: 'success' })
            this.setData({ 
                isEditing: false, 
                profile: res.data,
            })
            // 同时更新用户 stores (如果修改了 email/grade)
            // (this as any).updateUser(this.data.user)

        } catch (error) {
            console.error('保存失败:', error)
            wx.showToast({ title: '保存失败', icon: 'none' })
        } finally {
            this.setData({ saving: false })
        }
    },

    goToApplications() {
        wx.navigateTo({
            url: '/pages/my-applications/my-applications'
        })
    }
})
