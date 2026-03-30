import ASSETS from '../../assets/urls'
import { AuthStatus } from '../../utils/enum'

Component({
  properties: {
    isVerified: {
      type: null,
      value: null
    },
    authStatus: {
      type: null,
      value: null
    },
    size: {
      type: String,
      value: 'default'
    },
    clickable: {
      type: Boolean,
      value: false
    }
  },

  data: {
    assets: ASSETS,
    resolvedVerified: false
  },

  observers: {
    'isVerified, authStatus'(isVerified: unknown, authStatus: unknown) {
      const resolvedVerified = typeof isVerified === 'boolean'
        ? isVerified
        : Number(authStatus) === AuthStatus.Verified

      this.setData({ resolvedVerified })
    }
  },

  methods: {
    handleTap() {
      if (!this.properties.clickable || this.data.resolvedVerified) return
      this.triggerEvent('tap')
    }
  }
})
