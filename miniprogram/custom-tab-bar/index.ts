import ASSETS from '../assets/urls';
import { buildTalentCardUrl } from '../utils/detail-display-strategy'

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
                text: "导览",
                icons: [
                    ASSETS.TAB_BAR.HOME_INACTIVE,
                    ASSETS.TAB_BAR.HOME_ACTIVE,
                ],
            },
            {
                pagePath: "/pages/profile/profile",
                text: "我的",
                icons: [
                    ASSETS.TAB_BAR.PROFILE_INACTIVE,
                    ASSETS.TAB_BAR.PROFILE_ACTIVE
                ],
            }
        ],
        // 发布弹窗
        showPublishPopup: false,
        publishActions: [
            { name: '发布项目', icon: 'orders-o' },
            { name: '发布名片', icon: 'contact' }
        ]
    },

    methods: {
        switchTab(event: WechatMiniprogram.TouchEvent) {
            const indexStr = event.currentTarget.dataset.index;
            const index = parseInt(indexStr, 10);

            const item = this.data.list[index];
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
            } else if (name === '发布名片') {
                wx.navigateTo({ url: buildTalentCardUrl('shelf-control') })
            }
        }
    }
})
