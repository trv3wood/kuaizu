import api from "./api/index"

// app.ts
App<IAppOption>({
  globalData: {},
  async onLaunch() {
    console.log(await api.user.getCurrentUser())
  },
})