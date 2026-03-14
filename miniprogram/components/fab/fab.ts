// miniprogram/components/fab/fab.ts
Component({
    properties: {
        icon: {
            type: String,
            value: 'plus'
        },
        size: {
            type: String,
            value: '24px'
        },
        color: {
            type: String,
            value: '#fff'
        }
    },

    methods: {
        handleTap() {
            this.triggerEvent('click')
        }
    }
})
