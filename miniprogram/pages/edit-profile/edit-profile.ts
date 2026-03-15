// pages/edit-profile/edit-profile.ts
import { createStoreBindings } from 'mobx-miniprogram-bindings'
import { userStore } from '../../stores/index'
import { commonApi, userApi } from '../../api/index'
import { templateStore } from '../../stores/templateStore'
import { MsgBizKey } from '../../utils/constants'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import type { components } from '../../api/schema'
import { majorPickerBehavior } from '../../behaviors/majorPicker'

type SchoolVO = components['schemas']['SchoolVO']

Page({
    behaviors: [schoolPickerBehavior, majorPickerBehavior],
    data: {
        // 表单数据
        form: {
            nickname: '',
            avatarUrl: '',
            phone: '',
            email: '',
            schoolId: undefined as number | undefined,
            majorId: undefined as number | undefined,
            grade: undefined as number | undefined
        },
        // 显示用的文本
        majorName: '',
        // 年级选项
        gradeOptions: ['2020', '2021', '2022', '2023', '2024', '2025', '2026'],
        gradeIndex: -1,
        // 状态
        loading: false,
        uploading: false
    },

    storeBindings: null as any,

    onLoad() {
        // 绑定 Store
        this.storeBindings = [
            createStoreBindings(this, {
                store: userStore,
                fields: ['user'],
                actions: ['updateUser']
            }),
            createStoreBindings(this, {
                store: templateStore,
                fields: ['templates'],
                actions: ['getTemplateId']
            })
        ]

        // 初始化表单
        this.initForm()

        // 预加载订阅消息模板 ID
        templateStore.getTemplateId(MsgBizKey.CardReceived).catch(() => { })
    },

    onUnload() {
        if (Array.isArray(this.storeBindings)) {
            this.storeBindings.forEach(b => b.destroyStoreBindings())
        } else {
            this.storeBindings?.destroyStoreBindings()
        }
    },

    /**
     * 初始化表单数据
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
     * 学校选择回调
     */
    onSchoolSelected(school: SchoolVO) {
        this.setData({
            'form.schoolId': school.id
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

            // 上传头像
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
     * 输入框变化
     */
    handleInput(e: WechatMiniprogram.Input) {
        const { field } = e.currentTarget.dataset
        this.setData({
            [`form.${field}`]: e.detail
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
     * 专业选择回调
     */
    onMajorSelected(major: any) {
        this.setData({
            'form.majorId': major?.id,
            majorName: major?.majorName || ''
        })
    },

    /**
     * 提交保存
     */
    async handleSave() {
        const { form } = this.data

        // 简单验证
        if (!form.nickname?.trim()) {
            wx.showToast({ title: '请输入昵称', icon: 'none' })
            return
        }

        // 获取订阅模板 ID
        const bizKey = MsgBizKey.CardReceived
        const templateId = templateStore.templates[bizKey]
        let subResult: 'accept' | 'reject' | 'ban' | undefined;

        // 1. 调起订阅权限（必须在异步请求前）
        if (templateId) {
            try {
                const res = await wx.requestSubscribeMessage({
                    tmplIds: [templateId]
                })
                subResult = res[templateId] as 'accept' | 'reject' | 'ban'
            } catch (err) {
                console.log('[handleSave] 订阅逻辑跳过/失败:', err)
            }
        }

        this.setData({ loading: true })

        try {
            await userStore.updateUser({
                nickname: form.nickname,
                avatarUrl: form.avatarUrl,
                phone: form.phone,
                email: form.email,
                schoolId: form.schoolId,
                majorId: form.majorId,
                grade: form.grade
            })

            wx.showToast({ title: '保存成功', icon: 'success' })

            // 2. 同步订阅状态
            if (subResult) {
                userApi.syncUserSubscription({
                    templates: [{
                        biz_key: bizKey,
                        result: subResult
                    }]
                }).catch(err => console.error('同步订阅状态失败:', err))
            }

            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        } catch (error) {
            console.error('保存失败:', error)
            wx.showToast({ title: '保存失败', icon: 'none' })
        } finally {
            this.setData({ loading: false })
        }
    }
})
