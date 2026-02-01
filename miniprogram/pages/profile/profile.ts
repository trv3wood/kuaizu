// pages/profile/profile.ts
Page({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {

    },
    methods: {

    },
    onShow() {
        if (typeof this.getTabBar === 'function' && this.getTabBar()) {
            this.getTabBar().setData({
                active: 3
            })
        }
    }
})
