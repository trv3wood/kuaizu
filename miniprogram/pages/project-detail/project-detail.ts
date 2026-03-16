// pages/project-detail/project-detail.ts
import { projectApi, applicationApi, userApi } from '../../api/index'
import { getProjectDirectionText, getProjectStatusText } from '../../utils/util'
import { templateStore } from '../../stores/templateStore'
import { MsgBizKey } from '../../utils/constants'
import type { components } from '../../api/schema'
import { createStoreBindings } from 'mobx-miniprogram-bindings'

type ProjectDetailVO = components['schemas']['ProjectDetailVO']

Page({
    data: {
        id: 0,
        project: null as ProjectDetailVO | null,
        loading: true,
        applying: false,
        isPublicContact: false,
        activeNames: [] as string[]
    },
    storeBindings: null as any,

    onLoad(options) {
        const id = Number(options.id)
        this.setData({ isPublicContact: options.contact === 'true' })
        if (id) {
            this.setData({ id })
            this.loadProject(id)
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' })
            setTimeout(() => wx.navigateBack(), 1500)
        }
        this.storeBindings = createStoreBindings(this, {
            store: templateStore,
            fields: [],
            actions: ['getTemplateId']
        })

        // 预加载订阅消息模板 ID，防止 handleApply 时的网络延迟导致 TAP 手势上下文丢失
        templateStore.getTemplateId(MsgBizKey.CardDeliveryResult).catch(() => { })
    },

    onUnload() {
        this.storeBindings?.destroyStoreBindings()
    },

    /**
     * 加载项目详情
     */
    async loadProject(id: number) {
        this.setData({ loading: true })

        try {
            const res = await projectApi.getProject(id)
            const project = res.data
            if (project) {
                // 预格式化显示文本
                ; (project as any).statusText = getProjectStatusText(project.status)
                    ; (project as any).directionText = getProjectDirectionText(project.direction)
            }
            this.setData({
                project: project || null,
                loading: false
            })
        } catch (error) {
            console.error('加载项目详情失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    async handleApply() {
        const { project, applying } = this.data
        if (!project || applying) return

        // 获取预加载好的模板 ID
        const bizKey = MsgBizKey.CardDeliveryResult
        const templateId = templateStore.templates[bizKey]
        let subResult: 'accept' | 'reject' | 'ban' | undefined;

        // 1. 尝试调起订阅消息弹窗（必须在有任何异步网络请求前、showModal之前调用，否则会丢失 TAP 手势）
        if (templateId) {
            try {
                const res = await wx.requestSubscribeMessage({
                    tmplIds: [templateId]
                })
                subResult = res[templateId] as 'accept' | 'reject' | 'ban'
            } catch (err) {
                console.log('[handleApply] 订阅取消或失败:', err)
            }
        }

        // 2. 确认弹窗
        const { confirm } = await wx.showModal({
            title: '申请加入',
            content: `确定要申请加入项目《${project.name}》吗？`,
            confirmText: '申请',
            confirmColor: '#667eea'
        })

        if (!confirm) return

        this.setData({ applying: true })

        try {
            // 3. 申请接口
            await applicationApi.applyToProject(project.id!, {
                applyReason: '我对该项目很感兴趣，希望能加入团队！',
                contact: ''
            })

            wx.showToast({ title: '申请成功', icon: 'success' })

            // 4. 将授权状态同步到后端
            if (subResult) {
                userApi.syncUserSubscription({
                    templates: [{
                        biz_key: bizKey,
                        result: subResult
                    }]
                }).catch(err => console.error('同步订阅状态失败:', err))
            }

            setTimeout(() => wx.navigateBack(), 1500)
        } catch (error: any) {
            console.error('申请失败:', error)
            const msg = error?.data?.message || '申请失败'
            wx.showToast({ title: msg, icon: 'none' })
        } finally {
            this.setData({ applying: false })
        }
    },


    onCollapseChange(event: any) {
        this.setData({
            activeNames: event.detail
        })
    },


})
