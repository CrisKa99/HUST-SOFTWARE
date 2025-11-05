Page({
    data: {
        correctCount: 0,
        wrongCount: 0,
        list: [],
        nextGroupExists: false
    },

    onLoad() {
        const res = wx.getStorageSync('wordfill_result') || {};
        this.setData({
            correctCount: res.correctCount || 0,
            wrongCount: res.wrongCount || 0,
            list: res.list || [],
            nextGroupExists: !!res.nextGroupExists
        });
    },

    goHome() {
        wx.reLaunch({ url: '/pages/index/index' });
    },

    // 重新做本组：回到本页面重新初始化（简单实现：跳回 wordfill 并清除 state）
    retryAll() {
        // 清理并回到练习第一页
        wx.navigateTo({ url: '/pages/wordfill/wordfill' });
    },

    // 从结果页继续：强制重置并随机抽取新的十个单词
    continueNext() {
        // 传 reset=1，wordfill.onLoad 会重新随机抽取并展示十题
        wx.redirectTo({ url: '/pages/wordfill/wordfill?reset=1' });
    },

    exit() {
        // 退出到首页
        wx.reLaunch({ url: '/pages/index/index' });
    },

    // 可选：重做本组（如果需要保持相同的十题）
    retryGroup() {
        const gi = wx.getStorageSync('wordfill_groupIndex') || 0;
        // 传 group 参数以使用当前组（不重置 pool）
        wx.redirectTo({ url: `/pages/wordfill/wordfill?group=${gi}` });
    }
});