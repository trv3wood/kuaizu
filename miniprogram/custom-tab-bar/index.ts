// custom-tab-bar/index.ts
Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        active: 0,
        list: [
            {
                pagePath: "/pages/home/home",
                text: "导览"
            },
            {
                pagePath: "/pages/profile/profile",
                text: "我的"
            }
        ],
        // 发布弹窗
        showPublishPopup: false,
        publishActions: [
            { name: '发布项目', icon: 'orders-o' },
            { name: '我是人才', icon: 'contact' }
        ]
    },

    methods: {
        onChange(event: WechatMiniprogram.CustomEvent) {
            const index = event.detail as unknown as number
            // index 0 = 导览, index 1 = center button (handled separately), index 2 = 我的
            // But since center button is not a real tab, we map: 0 -> home, 1 -> profile
            const realIndex = index > 0 ? index - 1 : index
            const item = this.data.list[realIndex === 0 ? 0 : 1]

            // If clicking center (index 1 in visual), show popup
            if (index === 1) {
                this.onCenterClick()
                return
            }

            // Update active state and navigate
            this.setData({ active: index })

            if (item) {
                wx.switchTab({
                    url: item.pagePath
                })
            }
        },

        /**
         * 中间发布按钮点击
         */
        onCenterClick() {
            this.setData({ showPublishPopup: true })
        },

        /**
         * 关闭发布弹窗
         */
        onClosePublishPopup() {
            this.setData({ showPublishPopup: false })
        },

        /**
         * 发布选项点击
         */
        onPublishSelect(event: WechatMiniprogram.CustomEvent) {
            const { name } = event.detail
            this.setData({ showPublishPopup: false })

            if (name === '发布项目') {
                wx.navigateTo({ url: '/pages/create-project/create-project' })
            } else if (name === '我是人才') {
                wx.navigateTo({ url: '/pages/talent-card/talent-card' })
            }
        }
    }
})
