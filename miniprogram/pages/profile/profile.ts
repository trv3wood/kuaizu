// pages/profile/profile.ts
Component({
    options: {
        styleIsolation: 'apply-shared'
    },
    data: {

    },
    methods: {

    },
    pageLifetimes: {
        show() {
            if (typeof this.getTabBar === 'function' && this.getTabBar()) {
                this.getTabBar().setData({
                    active: 3
                })
            }
        }
    }
})
