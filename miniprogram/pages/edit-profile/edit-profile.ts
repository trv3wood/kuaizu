// pages/edit-profile/edit-profile.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { commonApi, talentApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import { majorPickerBehavior } from '../../behaviors/majorPicker'
import type { components } from '../../api/schema'

type SchoolVO = components['schemas']['SchoolVO']

Page({
    behaviors: [schoolPickerBehavior, majorPickerBehavior],
    data: {
        // 用户资料表单
        form: {
            nickname: '',
            avatarUrl: '',
            phone: '',
            email: '',
            wechat: '',
            schoolId: undefined as number | undefined,
            majorId: undefined as number | undefined,
            grade: undefined as number | undefined
        },
        // 人才档案表单
        talentForm: {
            skills: [] as string[],
            selfEvaluation: '',
            projectExperience: '',
            mbti: '',
        },
        // MBTI 数组 (E/I, S/N, T/F, J/P)
        mbtiArray: ['E', 'S', 'T', 'J'],
        // 显示用的文本
        selectedSchoolName: '',
        majorName: '',
        // 年级选项
        gradeOptions: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
        gradeIndex: -1,
        // 状态
        loading: false,
        uploading: false,
        isVerified: false,
        hasTalentProfile: false
    },

    storeBindings: null as any,

    onLoad() {
        this.storeBindings = [
            createStoreBindings(this, {
                store: userStore,
                fields: ['user', 'isVerified'],
                actions: ['updateUser']
            })
        ]

        this.initForm()
        this.loadTalentProfile()
    },

    onUnload() {
        if (Array.isArray(this.storeBindings)) {
            this.storeBindings.forEach((b: any) => b.destroyStoreBindings())
        } else {
            this.storeBindings?.destroyStoreBindings()
        }
    },

    /**
     * 初始化用户资料表单
     */
    initForm() {
        const user = userStore.user
        if (!user) return

        const gradeIndex = user.grade ? this.data.gradeOptions.indexOf(String(user.grade)) : -1

        this.setData({
            form: {
                nickname: user.nickname || '',
                avatarUrl: user.avatarUrl || '',
                phone: user.phone || '',
                email: user.email || '',
                wechat: (user as any).wechat || '',
                schoolId: user.school?.id,
                majorId: user.major?.id,
                grade: user.grade
            },
            selectedSchoolId: user.school?.id,
            selectedSchoolName: user.school?.schoolName || '',
            majorName: user.major?.majorName || '',
            gradeIndex
        })
    },

    /**
     * 加载人才档案数据
     */
    async loadTalentProfile() {
        try {
            const res = await talentApi.getMyTalentProfile()
            const profile = res.data
            if (profile) {
                const mbti = profile.mbti || 'ESTJ'
                this.setData({
                    hasTalentProfile: true,
                    talentForm: {
                        skills: profile.skills || [],
                        selfEvaluation: profile.selfEvaluation || '',
                        projectExperience: profile.projectExperience || '',
                        mbti: mbti,
                    },
                    mbtiArray: mbti.split('')
                })
            }
        } catch (error) {
            console.error('加载人才档案失败:', error)
        }
    },

    /**
     * 学校选择回调
     */
    onSchoolSelected(school: SchoolVO) {
        this.setData({ 'form.schoolId': school.id })
    },

    /**
     * 专业选择回调
     */
    onMajorSelected(major: any) {
        this.setData({
            'form.majorId': major?.id,
            majorName: major?.majorName || ''
        })
    },

    /**
     * 选择头像
     */
    async handleChooseAvatar() {
        try {
            const { tempFiles } = await wx.chooseMedia({
                count: 1,
                mediaType: ['image'],
                sourceType: ['album', 'camera'],
                sizeType: ['compressed']
            })

            const tempFile = tempFiles[0]?.tempFilePath
            if (!tempFile) return

            this.setData({ uploading: true })

            const res = await commonApi.uploadFile(tempFile, 'avatar')
            if (res.data?.url) {
                this.setData({
                    'form.avatarUrl': res.data.url,
                    uploading: false
                })
                wx.showToast({ title: '头像已更新', icon: 'success' })
            }
        } catch (error) {
            console.error('上传头像失败:', error)
            this.setData({ uploading: false })
            wx.showToast({ title: '上传失败', icon: 'none' })
        }
    },

    /**
     * 原生 input 绑定
     */
    handleNativeInput(e: any) {
        const { field } = e.currentTarget.dataset
        this.setData({ [`form.${field}`]: e.detail.value })
    },

    /**
     * 人才档案 textarea 绑定
     */
    handleTalentInput(e: any) {
        const { field } = e.currentTarget.dataset
        this.setData({ [`talentForm.${field}`]: e.detail.value })
    },

    /**
     * MBTI 维度切换
     */
    toggleMbti(e: any) {
        const { idx, val } = e.currentTarget.dataset
        const mbtiArray = [...this.data.mbtiArray]
        mbtiArray[idx] = val
        this.setData({
            mbtiArray,
            'talentForm.mbti': mbtiArray.join('')
        })
    },

    /**
     * 显示学校选择器
     */
    handleShowSchoolPicker() {
        (this as any).showSchoolPicker()
    },

    /**
     * 关闭学校选择器
     */
    handleCloseSchoolPicker() {
        (this as any).closeSchoolPicker()
    },

    /**
     * 选择年级
     */
    handleGradeChange(e: WechatMiniprogram.PickerChange) {
        const index = Number(e.detail.value)
        const grade = Number(this.data.gradeOptions[index])
        this.setData({
            gradeIndex: index,
            'form.grade': grade
        })
    },

    /**
     * 添加标签
     */
    handleAddSkill() {
        wx.showModal({
            title: '添加标签',
            editable: true,
            placeholderText: '请输入鲜明标签，如 极具创意',
            success: (res) => {
                if (res.confirm && res.content?.trim()) {
                    const newSkill = res.content.trim()
                    const skills = this.data.talentForm.skills || []
                    if (skills.includes(newSkill)) {
                        wx.showToast({ title: '标签已存在', icon: 'none' })
                        return
                    }
                    this.setData({ 'talentForm.skills': [...skills, newSkill] })
                }
            }
        })
    },

    /**
     * 删除标签
     */
    handleRemoveSkill(e: any) {
        const { index } = e.currentTarget.dataset
        const skills = [...(this.data.talentForm.skills || [])]
        skills.splice(index, 1)
        this.setData({ 'talentForm.skills': skills })
    },

    /**
     * 跳转认证页
     */
    goToCert() {
        wx.navigateTo({ url: '/pages/certification/certification' })
    },

    /**
     * 取消
     */
    handleCancel() {
        wx.navigateBack()
    },

    /**
     * 保存 (同时更新用户资料 + 人才档案)
     */
    async handleSave() {
        const { form, talentForm } = this.data

        if (!form.nickname?.trim()) {
            wx.showToast({ title: '请输入昵称', icon: 'none' })
            return
        }

        this.setData({ loading: true })

        try {
            // 1. 更新用户资料
            await userStore.updateUser({
                nickname: form.nickname,
                avatarUrl: form.avatarUrl,
                phone: form.phone,
                email: form.email,
                schoolId: form.schoolId,
                majorId: form.majorId,
                grade: form.grade
            })

            // 2. 更新人才档案 (如果有内容)
            const hasContent = (talentForm.skills && talentForm.skills.length > 0) ||
                              talentForm.selfEvaluation?.trim() ||
                              talentForm.projectExperience?.trim() ||
                              this.data.hasTalentProfile

            if (hasContent) {
                await talentApi.upsertTalentProfile({
                    skills: talentForm.skills || [],
                    selfEvaluation: talentForm.selfEvaluation || '',
                    projectExperience: talentForm.projectExperience || '',
                    mbti: talentForm.mbti || this.data.mbtiArray.join(''),
                    status: 1
                })
            }

            wx.showToast({ title: '保存成功', icon: 'success' })
            wx.navigateBack()
        } catch (error) {
            console.error('保存失败:', error)
            wx.showToast({ title: '保存失败', icon: 'none' })
        } finally {
            this.setData({ loading: false })
        }
    }
})
