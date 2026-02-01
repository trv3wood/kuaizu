// components/custom-tabbar/custom-tabbar.ts
Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {
        active: 0,
        list: [
            {
                icon: 'wap-home-o',
                text: '首页',
                url: '/pages/home/home'
            },
            {
                icon: 'friends-o',
                text: '人才',
                url: '/pages/talent/talent'
            },
            {
                icon: 'add-o',
                text: '发布',
                url: '/pages/publish/publish',
                isCenter: true
            },
            {
                icon: 'user-o',
                text: '我的',
                url: '/pages/profile/profile'
            }
        ]
    },

    lifetimes: {
        attached() {
            this.updateActiveTab()
        }
    },

    pageLifetimes: {
        show() {
            this.updateActiveTab()
        }
    },

    methods: {
        updateActiveTab() {
            const pages = getCurrentPages()
            if (pages.length > 0) {
                const currentPage = pages[pages.length - 1]
                const route = '/' + currentPage.route
                const list = this.data.list
                for (let i = 0; i < list.length; i++) {
                    if (list[i].url === route) {
                        this.setData({ active: i })
                        break
                    }
                }
            }
        },

        onChange(event: WechatMiniprogram.CustomEvent) {
            const index = event.detail as unknown as number
            const item = this.data.list[index]
            wx.switchTab({
                url: item.url
            })
        },

        onCenterClick() {
            wx.switchTab({
                url: '/pages/publish/publish'
            })
        }
    }
})
