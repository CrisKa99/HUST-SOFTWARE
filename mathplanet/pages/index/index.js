//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: '',
      nickName: ''
    },
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.chooseAvatar'),
    totalday: 0,//总天数
    sign: false,//是否可以签到
    month: 0,
    year: 0,
    day: 0,
    lastmonth: 0,
    lastday: 0,
    tempAvatarUrl: '',
    tempNickName: ''
  },

  onLoad: function () {
    this.data.tatalday = wx.getStorageSync('totalday') || 0;
    this.data.sign = wx.getStorageSync('sign') || false;
    this.data.lastmonth = wx.getStorageSync('month') || 0;
    this.data.lastday = wx.getStorageSync('day') || 0;
    // 检查本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    // console.log('从本地存储读取的用户信息:', userInfo);

    if (userInfo && userInfo.avatarUrl && userInfo.nickName) {
      this.setData({
        hasUserInfo: true,
        userInfo: userInfo
      });
      app.globalData.userInfo = userInfo;
    } else {
      this.setData({
        hasUserInfo: false,
        userInfo: {}
      });
    }
    app.globalData.nowgrade = wx.getStorageSync('grade') || 1;
    this.setData({
      totalday: this.data.tatalday,
      sign: this.data.sign,
      lastmonth: this.data.lastmonth,
      lastday: this.data.lastday,
      // hasUserInfo: this.data.hasUserInfo,
      // userInfo: this.data.userInfo
    });
    this.datetime();
  },

  // 添加新的头像选择回调
  onChooseAvatar: function (e) {
    console.log('头像选择回调数据:', e);

    if (e.detail && e.detail.avatarUrl) {
      // 获取头像成功，现在获取用户昵称
      this.setData({
        tempAvatarUrl: e.detail.avatarUrl
      });
      console.log('头像获取成功:', this.data.tempAvatarUrl);
      if (this.data.tempNickName) {
        this.completeUserInfo();
      } else {
        wx.showToast({
          title: '头像已选择，请输入昵称',
          icon: 'success',
          duration: 2000
        });
      }
    } else {
      console.log('头像选择失败:', e);
      wx.showToast({
        title: '头像获取失败',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 昵称输入处理
  onNicknameInput: function (e) {
    this.setData({
      tempNickName: e.detail.value
    });
  },

  // 设置昵称
  setNickname: function () {
    if (!this.data.tempNickName || this.data.tempNickName.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const nickName = this.data.tempNickName.trim();
    console.log('昵称设置成功:', nickName);

    this.setData({
      tempNickName: nickName
    });

    // 如果已经有头像，直接完成用户信息设置
    if (this.data.tempAvatarUrl) {
      this.completeUserInfo();
    } else {
      wx.showToast({
        title: '昵称已设置',
        icon: 'success',
        duration: 2000
      });
    }
  },

  // 完成用户信息设置
  completeUserInfo: function () {
    if (!this.data.tempAvatarUrl || !this.data.tempNickName) {
      console.log('用户信息不完整，无法完成设置');
      wx.showToast({
        title: '请先选择头像和设置昵称',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    const userInfo = {
      avatarUrl: this.data.tempAvatarUrl,
      nickName: this.data.tempNickName
    };

    console.log('完整的用户信息:', userInfo);

    app.globalData.userInfo = userInfo;
    this.setData({
      userInfo: userInfo,
      hasUserInfo: true,
      tempAvatarUrl: '',
      tempNickName: ''
    });

    // 保存用户信息到本地存储
    wx.setStorageSync('userInfo', userInfo);
    console.log('用户信息保存成功');

    wx.showToast({
      title: '欢迎使用算术星球',
      icon: 'success',
      duration: 2000
    });
  },


  handlesign: function (e) {
    this.setData({
      sign: true,
      totalday: Number(Number(this.data.totalday) + 1),
    })
    wx.showToast({
      title: '签到成功！',
      icon: "success"
    })
    wx.setStorageSync('totalday', this.data.totalday);
    wx.setStorageSync('sign', this.data.sign);
  },

  datetime: function () {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var months = date.getMonth() + 1;

    //获取现今年份
    this.data.year = year;

    //获取现今月份
    this.data.month = months;

    //获取今日日期
    this.data.day = date.getDate();

    wx.setStorageSync('month', this.data.month);
    wx.setStorageSync('day', this.data.day);
  },

  play1select: function () {
    app.globalData.nowplay = 1;
  },
  play2select: function () {
    app.globalData.nowplay = 2;
  },
  play3select: function () {
    app.globalData.nowplay = 3;
  },
  play4select: function () {
    app.globalData.nowplay = 4;
  }
})