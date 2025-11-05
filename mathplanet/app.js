//app.js
var app = getApp();
App({
  //全局变量
  globalData: {
    nowEquation: '',
    nowAnswer: 0,
    nowInput: 0,
    nowgrade: 1, //所选的年级
    nowplay: 0,//1代表基础模式，2代表强化模式，3代表无尽模式 4代表单词填空模式
    nowmode: 0,//所选模式序号，为具体出题模式序号，从1-11
    userInfo: null
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
      fail: err => {
        console.log('登录失败:', err);
      }
    })
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      console.log('从本地存储加载用户信息:', userInfo);
    }
  }
})
    // 检查用户授权状态（移除废弃的wx.getUserInfo调用）
//     wx.getSetting({
//       success: res => {
//         if (res.authSetting['scope.userInfo']) {
//           // 用户已授权，从本地存储获取用户信息
//           const userInfo = wx.getStorageSync('userInfo');
//           if (userInfo) {
//             this.globalData.userInfo = userInfo;
//           }
//         }
//       }
//     })
//   }
// })