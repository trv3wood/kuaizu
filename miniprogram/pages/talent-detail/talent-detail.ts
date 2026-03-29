// pages/talent-detail/talent-detail.ts
import { talentApi, oliveBranchApi, orderApi, productApi, applicationApi } from '../../api/index'
import type { components } from '../../api/schema'
import { DEFAULT_MBTI_COLOR, MBTI_COLOR_MAP } from '../../utils/constants'
import { resolveTalentDetailStrategy } from '../../utils/detail-display-strategy'

type TalentProfileDetailVO = components['schemas']['TalentProfileDetailVO']
type ProjectVO = components['schemas']['ProjectVO']
type PublicContactItem = {
    type: 'phone' | 'email' | 'wechat'
    label: string
    value: string
    icon: string
}
type TalentProfileDetailCardVO = TalentProfileDetailVO & {
    mbtiColor: string
    schoolLabel: string
    majorLabel: string
    gradeLabel: string
    displaySkills: string[]
    publicContacts: PublicContactItem[]
}

// 橄榄枝商品ID固定为1
const OLIVE_BRANCH_PRODUCT_ID = 1

Page({
    data: {
        statusBarHeight: 0,
        navBarHeight: 44,
        id: 0,
        scene: 'default',
        viewStrategy: resolveTalentDetailStrategy().strategy,
        profile: null as TalentProfileDetailCardVO | null,
        loading: true,
        sending: false,

        // 项目选择相关
        myProjects: [] as ProjectVO[],
        showProjectPicker: false,
        loadingProjects: false,

        // 购买相关
        showPurchasePopup: false,
        quantity: 1,
        purchasing: false,
        unitPrice: 1.00 // 单价，可从后端获取
    },

    onLoad(options) {
        const menuButton = wx.getMenuButtonBoundingClientRect()
        const systemInfo = wx.getSystemInfoSync()
        const statusBarHeight = systemInfo.statusBarHeight || 0
        const navBarHeight = menuButton.height + (menuButton.top - statusBarHeight) * 2

        this.setData({
            statusBarHeight,
            navBarHeight
        })

        const { scene, strategy } = resolveTalentDetailStrategy(options.scene)
        const id = Number(options.id)
        const userId = options.userId ? Number(options.userId) : undefined

        this.setData({
            scene,
            viewStrategy: strategy
        })

        if (id || userId) {
            this.setData({ id })
            this.loadProfile(id, userId)
            this.loadMyProjects()
        } else {
            wx.showToast({ title: '参数错误', icon: 'none' })
            setTimeout(() => wx.navigateBack(), 1500)
        }
    },

    /**
     * 加载人才详情
     */
    async loadProfile(id: number, userId?: number) {
        this.setData({ loading: true })

        try {
            const res = await talentApi.getTalentProfile(id, userId)
            const profile = res.data ? this.formatProfile(res.data as TalentProfileDetailVO) : null
            this.setData({
                profile,
                loading: false
            })
        } catch (error) {
            console.error('加载人才详情失败:', error)
            this.setData({ loading: false })
            wx.showToast({ title: '加载失败', icon: 'none' })
        }
    },

    /**
     * 加载我的项目列表
     */
    async loadMyProjects() {
        this.setData({ loadingProjects: true })
        try {
            const res = await applicationApi.listMyProjects({ status: 1, size: 100 })
            this.setData({
                myProjects: res.data?.list || [],
                loadingProjects: false
            })
        } catch (error) {
            console.error('加载项目列表失败:', error)
            this.setData({ loadingProjects: false })
        }
    },

    /**
     * 发送橄榄枝 — 打开项目选择弹窗
     */
    handleSendOliveBranch() {
        const { profile, sending } = this.data
        if (!profile || sending) return
        this.setData({ showProjectPicker: true })
    },

    /**
     * 选择项目并发送
     */
    async handleSelectProject(e: any) {
        const index = e.currentTarget.dataset.index as number
        const project = this.data.myProjects[index]
        if (!project?.id) return

        const { profile } = this.data

        // 确认弹窗
        const { confirm } = await wx.showModal({
            title: '发送邀请',
            content: `确定以项目「${project.name}」向 ${profile!.nickname || '该用户'} 发送橄榄枝吗？`,
            confirmText: '发送',
            confirmColor: '#cbe6ff'
        })

        if (!confirm) return

        this.setData({ showProjectPicker: false, sending: true })

        try {
            await oliveBranchApi.sendOliveBranch({
                receiverId: profile!.userId!,
                relatedProjectId: project.id,
                type: 2, // 2-项目邀请
                message: '您好，我对您的技能很感兴趣，希望能进一步交流！'
            })

            wx.showToast({ title: '发送成功', icon: 'success' })
        } catch (error: any) {
            console.error('发送橄榄枝失败:', error)
            const msg = error?.data?.message || '发送失败'

            if (error?.data?.code === 4002) {
                const { confirm } = await wx.showModal({
                    title: '额度不足',
                    content: '您的橄榄枝额度不足，是否购买更多？',
                    confirmText: '去购买',
                    confirmColor: '#cbe6ff'
                })

                if (confirm) {
                    this.openPurchasePopup()
                }
            } else {
                wx.showToast({ title: msg, icon: 'none' })
            }
        } finally {
            this.setData({ sending: false })
        }
    },

    /**
     * 关闭项目选择弹窗
     */
    handleCloseProjectPicker() {
        this.setData({ showProjectPicker: false })
    },

    /**
     * 打开购买弹窗并加载商品价格
     */
    async openPurchasePopup() {
        this.setData({ showPurchasePopup: true, quantity: 1 })

        try {
            const res = await productApi.getProductDetail(OLIVE_BRANCH_PRODUCT_ID)
            if (res.data?.price) {
                this.setData({ unitPrice: res.data.price })
            }
        } catch (error) {
            console.error('获取商品价格失败:', error)
            // 使用默认价格
        }
    },

    /**
     * 关闭购买弹窗
     */
    handleClosePurchase() {
        this.setData({ showPurchasePopup: false })
    },

    /**
     * 数量变化
     */
    handleQuantityChange(e: any) {
        this.setData({ quantity: e.detail })
    },

    /**
     * 计算总价
     */
    getTotalPrice(): string {
        const { quantity, unitPrice } = this.data
        return (quantity * unitPrice).toFixed(2)
    },

    /**
     * 购买橄榄枝
     */
    async handlePurchase() {
        const { quantity, purchasing } = this.data
        if (purchasing) return

        this.setData({ purchasing: true })

        try {
            // 1. 创建订单
            wx.showLoading({ title: '创建订单...' })
            const orderRes = await orderApi.createOrder({
                productId: OLIVE_BRANCH_PRODUCT_ID,
                quantity
            })

            const order = orderRes.data
            if (!order?.id) {
                throw new Error('创建订单失败')
            }

            // 2. 发起支付
            wx.showLoading({ title: '发起支付...' })
            const payRes = await orderApi.initiatePayment(order.id)
            const payParams = payRes.data

            if (!payParams) {
                throw new Error('获取支付参数失败')
            }

            wx.hideLoading()

            // 3. 调用微信支付
            wx.requestPayment({
                timeStamp: payParams.timeStamp!,
                nonceStr: payParams.nonceStr!,
                package: payParams.package!,
                signType: payParams.signType as 'MD5' | 'HMAC-SHA256' | 'RSA',
                paySign: payParams.paySign!,
                success: () => {
                    wx.showToast({ title: '购买成功！', icon: 'success' })
                    this.setData({ showPurchasePopup: false })
                },
                fail: (err) => {
                    console.error('支付失败:', err)
                    if (err.errMsg.includes('cancel')) {
                        wx.showToast({ title: '已取消支付', icon: 'none' })
                    } else {
                        wx.showToast({ title: '支付失败', icon: 'none' })
                    }
                }
            })
        } catch (error) {
            console.error('购买失败:', error)
            wx.hideLoading()
            wx.showToast({ title: '操作失败', icon: 'none' })
        } finally {
            this.setData({ purchasing: false })
        }
    },

    handleBack() {
        wx.navigateBack()
    },

    handleContactTap(e: WechatMiniprogram.BaseEvent) {
        const { value, label } = e.currentTarget.dataset
        if (!value) return

        wx.setClipboardData({
            data: value,
            success: () => {
                wx.showToast({ title: `${label}已复制`, icon: 'none' })
            }
        })
    },

    formatProfile(profile: TalentProfileDetailVO): TalentProfileDetailCardVO {
        const mbti = (profile.mbti || '').toUpperCase()
        const gradeLabel = (profile as any).gradeText || (profile as any).gradeLabel || ''
        const publicContacts: PublicContactItem[] = [
            { type: 'phone', label: '电话', value: profile.phone || '', icon: 'phone-o' },
            { type: 'email', label: '邮箱', value: profile.email || '', icon: 'envelop-o' },
            { type: 'wechat', label: '微信', value: profile.wechat || '', icon: 'chat-o' }
        ].filter((item) => !!item.value)

        return {
            ...profile,
            mbtiColor: MBTI_COLOR_MAP[mbti] || DEFAULT_MBTI_COLOR,
            schoolLabel: profile.schoolName || '未知学校',
            majorLabel: profile.majorName || '未知专业',
            gradeLabel,
            displaySkills: (profile.skills || []).slice(0, 6),
            publicContacts
        }
    }
})
