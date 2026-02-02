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
                text: "首页"
            },
            {
                pagePath: "/pages/talent/talent",
                text: "人才"
            },
            {
                pagePath: "/pages/service/service",
                text: "服务"
            },
            {
                pagePath: "/pages/profile/profile",
                text: "我的"
            }
        ]
    },

    methods: {
        onChange(event: WechatMiniprogram.CustomEvent) {
            const index = event.detail as unknown as number
            const item = this.data.list[index]

            this.setData({ active: index })

            if (item) {
                wx.switchTab({
                    url: item.pagePath
                })
            }
        }
    }
})
