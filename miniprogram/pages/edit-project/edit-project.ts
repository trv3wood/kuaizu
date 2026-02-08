// pages/edit-project/edit-project.ts
import { projectApi } from '../../api/index'
import { schoolPickerBehavior } from '../../behaviors/schoolPicker'
import type { components } from '../../api/schema'

type Direction = components['schemas']['Direction']

Page({
    behaviors: [schoolPickerBehavior],

    data: {
        isEdit: false,
        projectId: undefined as number | undefined,

        // 表单数据
        form: {
            name: '',
            description: '',
            memberCount: 3,
            schoolId: undefined as number | undefined,
            direction: undefined as Direction | undefined
        },

        // 方向选项
        directions: [
            { value: 1, label: '落地', desc: '实际产品或服务' },
            { value: 2, label: '比赛', desc: '竞赛/挑战赛' },
            { value: 3, label: '学习', desc: '学习/研究项目' }
        ],

        submitting: false
    },

    onLoad(options: { id?: string }) {
        if (options.id) {
            const projectId = parseInt(options.id, 10)
            this.setData({
                isEdit: true,
                projectId
            })
            this.loadProject(projectId)
            wx.setNavigationBarTitle({ title: '编辑项目' })
        } else {
            wx.setNavigationBarTitle({ title: '发布项目' })
        }

        // 加载学校列表
        (this as any).loadSchools()
    },

    /**
     * 加载项目详情(编辑模式)
     */
    async loadProject(id: number) {
        wx.showLoading({ title: '加载中...' })

        try {
            const res = await projectApi.getProject(id)
            const project = res.data

            if (project) {
                this.setData({
                    'form.name': project.name || '',
                    'form.description': project.description || '',
                    'form.memberCount': project.memberCount || 3,
                    'form.schoolId': project.schoolId,
                    'form.direction': project.direction,
                    selectedSchoolId: project.schoolId,
                    selectedSchoolName: project.schoolName || ''
                })
            }
        } catch (error) {
            console.error('加载项目失败:', error)
            wx.showToast({ title: '加载失败', icon: 'none' })
        } finally {
            wx.hideLoading()
        }
    },

    /**
     * 输入项目名称
     */
    onNameInput(e: any) {
        this.setData({ 'form.name': e.detail })
    },

    /**
     * 输入项目描述
     */
    onDescriptionInput(e: any) {
        this.setData({ 'form.description': e.detail })
    },

    /**
     * 修改团队人数
     */
    onMemberCountChange(e: any) {
        this.setData({ 'form.memberCount': e.detail })
    },

    /**
     * 选择项目方向
     */
    onDirectionSelect(e: WechatMiniprogram.TouchEvent) {
        const { value } = e.currentTarget.dataset
        const currentDirection = this.data.form.direction

        // 点击已选中的则取消选择
        this.setData({
            'form.direction': currentDirection === value ? undefined : value
        })
    },

    /**
     * 学校选择回调(来自behavior)
     */
    onSchoolSelected(school: any) {
        this.setData({
            'form.schoolId': school.id,
            selectedSchoolId: school.id,
            selectedSchoolName: school.schoolName
        })
    },

    /**
     * 验证表单
     */
    validateForm(): boolean {
        const { name, description, memberCount } = this.data.form

        if (!name.trim()) {
            wx.showToast({ title: '请输入项目名称', icon: 'none' })
            return false
        }

        if (name.length > 200) {
            wx.showToast({ title: '项目名称不能超过200字', icon: 'none' })
            return false
        }

        if (!description.trim()) {
            wx.showToast({ title: '请输入项目描述', icon: 'none' })
            return false
        }

        if (!memberCount || memberCount < 1) {
            wx.showToast({ title: '团队人数至少为1人', icon: 'none' })
            return false
        }

        return true
    },

    /**
     * 提交表单
     */
    async handleSubmit() {
        if (!this.validateForm()) return
        if (this.data.submitting) return

        this.setData({ submitting: true })

        try {
            const { form, isEdit, projectId } = this.data

            if (isEdit && projectId) {
                // 更新项目
                await projectApi.updateProject(projectId, {
                    name: form.name,
                    description: form.description,
                    memberCount: form.memberCount,
                    direction: form.direction
                })

                wx.showToast({ title: '保存成功', icon: 'success' })
                // 返回上一页
                setTimeout(() => {
                    wx.navigateBack()
                }, 1500)
            } else {
                // 创建项目
                await projectApi.createProject({
                    name: form.name,
                    description: form.description,
                    memberCount: form.memberCount,
                    schoolId: form.schoolId,
                    direction: form.direction
                })

                wx.showToast({ title: '发布成功', icon: 'success' })
                wx.navigateTo({
                    url: '/pages/my-projects/my-projects'
                })
            }

        } catch (error) {
            console.error('提交失败:', error)
            wx.showToast({ title: '提交失败', icon: 'none' })
        } finally {
            this.setData({ submitting: false })
        }
    }
})
