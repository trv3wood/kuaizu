// pages/project-detail/project-detail.ts
import { projectApi, applicationApi } from '../../api/index'
import type { components } from '../../api/schema'

type ProjectDetailVO = components['schemas']['ProjectDetailVO']

Page({
    data: {
        id: 0,
        project: null as ProjectDetailVO | null,
        loading: true,
        applying: false
    },

    onLoad(options) {
        const id = Number(options.id)
        if (id) {
            this.setData({ id })
            this.loadProject(id)
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' })
            setTimeout(() => wx.navigateBack(), 1500)
        }
    },

    /**
     * 加载项目详情
     */
    async loadProject(id: number) {
        this.setData({ loading: true })

        try {
            const res = await projectApi.getProject(id)
            this.setData({
                project: res.data || null,
                loading: false
            })
        } catch (error) {
            console.error('加载项目详情失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 申请加入项目
     */
    async handleApply() {
        const { project, applying } = this.data
        if (!project || applying) return

        // 确认弹窗
        const { confirm } = await wx.showModal({
            title: '申请加入',
            content: `确定要申请加入项目《${project.name}》吗？`,
            confirmText: '申请',
            confirmColor: '#667eea'
        })

        if (!confirm) return

        this.setData({ applying: true })

        try {
            await applicationApi.applyToProject(project.id!, {
                applyReason: '我对该项目很感兴趣，希望能加入团队！',
                contact: ''
            })

            wx.showToast({ title: '申请成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 1500)
        } catch (error: any) {
            console.error('申请失败:', error)
            const msg = error?.data?.message || '申请失败'
            wx.showToast({ title: msg, icon: 'none' })
        } finally {
            this.setData({ applying: false })
        }
    },

    /**
     * 获取方向文本
     */
    getDirectionText(direction?: number): string {
        const directionMap: Record<number, string> = {
            1: '创业类',
            2: '科研类',
            3: '实践类'
        }
        return direction !== undefined ? directionMap[direction] || '未知' : '未知'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status?: number): string {
        const statusMap: Record<number, string> = {
            0: '审核中',
            1: '进行中',
            2: '已驳回',
            3: '已关闭'
        }
        return status !== undefined ? statusMap[status] || '未知' : '未知'
    }
})
