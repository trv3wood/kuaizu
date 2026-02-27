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
        switchTab(event: WechatMiniprogram.TouchEvent) {
            const indexStr = event.currentTarget.dataset.index;
            const index = parseInt(indexStr, 10);

            // Only handle nav indexing (0 -> home, 1 -> profile)
            const item = this.data.list[index];

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
                wx.navigateTo({ url: '/pages/edit-project/edit-project' })
            } else if (name === '我是人才') {
                wx.navigateTo({ url: '/pages/talent-card/talent-card' })
            }
        }
    }
})
