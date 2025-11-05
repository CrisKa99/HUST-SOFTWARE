const ALL_WORDS = require('../../data/wordbank.js');

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

Page({
  data: {
    items: [],
    current: 0,
    focusKey: '' // 格式 "index_ci"
  },

  onLoad(options) {
    // 每次进入若带 reset=1 或从首页进入，都重新随机抽题（保证每次都是随机10题）
    const forceReset = options && options.reset === '1';
    // 生成一个随机打乱的 pool（不依赖已存 storage 的顺序，保证每次随机）
    const pool = shuffle(ALL_WORDS).map(w => ({ en: (w.en || '').toLowerCase(), cn: w.cn || '' }));
    // 保存 pool 与 groupIndex（从0开始）
    this._pool = pool;
    this._groupIndex = 0;
    wx.setStorageSync('wordfill_pool', this._pool);
    wx.setStorageSync('wordfill_groupIndex', this._groupIndex);

    // 如果显式指定 group（例如 retryGroup 使用），使用该组索引
    if (typeof options !== 'undefined' && typeof options.group !== 'undefined') {
      const gi = parseInt(options.group, 10) || 0;
      this._groupIndex = gi;
      wx.setStorageSync('wordfill_groupIndex', gi);
    }

    // 加载当前组（每组 10 个）
    this._loadGroup(this._groupIndex);
    this._programmaticChange = false;
  },

  _loadGroup(groupIndex) {
    const start = groupIndex * 10;
    const slice = (this._pool || []).slice(start, start + 10);
    const items = slice.map(it => {
      const ans = (it.en || '').toLowerCase();
      const arr = ans.split('');
      let blankIndex = -1;
      if (arr.length > 1) blankIndex = Math.floor(Math.random() * arr.length);
      const chars = arr.map((ch, idx) => ({ char: ch, isBlank: idx === blankIndex, value: '' }));
      return { chinese: it.cn || '', answer: ans, chars, state: 'pending', revealed: false, blankIndex };
    });
    this.setData({ items, current: 0 }, () => {
      this._setFocusFor(0);
      wx.setStorageSync('wordfill_groupIndex', groupIndex);
    });
  },

  _setFocusFor(index) {
    const it = this.data.items[index];
    if (!it) { this.setData({ focusKey: '' }); return; }
    const ci = (typeof it.blankIndex === 'number') ? it.blankIndex : (it.chars.findIndex(c => c.isBlank) || 0);
    const key = `${index}_${ci}`;
    this.setData({ focusKey: '' }, () => setTimeout(() => this.setData({ focusKey: key }), 80));
  },

  onCharInput(e) {
    const itemIndex = +e.currentTarget.dataset.index;
    const ci = +e.currentTarget.dataset.ci;
    let val = (e.detail && e.detail.value || '').slice(-1).toLowerCase();
    const items = this.data.items.slice();
    if (!items[itemIndex] || !items[itemIndex].chars[ci]) return;
    items[itemIndex].chars[ci].value = val;
    this.setData({ items });
  },

  submitSingle(e) {
    const index = +e.currentTarget.dataset.index;
    const items = this.data.items.slice();
    const it = items[index];
    if (!it) return;
    const rebuilt = it.chars.map(ch => ch.isBlank ? (ch.value || '') : ch.char).join('');
    const correct = rebuilt.toLowerCase() === (it.answer || '').toLowerCase();
    it.state = correct && !it.revealed ? 'correct' : (it.revealed ? 'wrong' : (correct ? 'correct' : 'wrong'));
    this.setData({ items }, () => wx.showToast({ title: correct ? '回答正确' : '再思考一下哦', icon: 'none', duration: 800 }));
  },

  goNext() {
    const cur = this.data.current || 0;
    const next = cur + 1;
    const total = (this.data.items || []).length;
    if (next >= total) {
      const items = this.data.items || [];
      let correctCount = 0, wrongCount = 0;
      const list = items.map(it => {
        const user = it.chars.map(ch => ch.isBlank ? (ch.value || '') : ch.char).join('');
        const isCorrect = (!it.revealed) && (user.toLowerCase() === (it.answer || '').toLowerCase());
        if (isCorrect) correctCount++; else wrongCount++;
        const userAnswer = it.revealed ? '' : user;
        return { chinese: it.chinese, answer: it.answer, userAnswer, correct: isCorrect, revealed: !!it.revealed };
      });
      const poolLen = (this._pool || []).length;
      const nextGroupExists = ((this._groupIndex + 1) * 10) < poolLen;
      wx.setStorageSync('wordfill_result', { correctCount, wrongCount, list, nextGroupExists });
      wx.navigateTo({ url: '/pages/wordfill/result' });
      return;
    }
    this._programmaticChange = true;
    this.setData({ current: next }, () => {
      this._programmaticChange = false;
      this._setFocusFor(next);
    });
  },

  retry(e) {
    const index = +e.currentTarget.dataset.index;
    const items = this.data.items.slice();
    const it = items[index];
    if (!it) return;
    it.chars.forEach(ch => { if (ch.isBlank) ch.value = ''; });
    it.state = 'pending';
    it.revealed = false;
    this.setData({ items }, () => wx.showToast({ title: '已清空，继续思考', icon: 'none', duration: 800 }));
  },

  reveal(e) {
    const index = +e.currentTarget.dataset.index;
    const items = this.data.items.slice();
    const it = items[index];
    if (!it) return;
    it.chars.forEach(ch => { if (ch.isBlank) ch.value = ch.char; });
    it.state = 'correct';
    it.revealed = true;
    this.setData({ items }, () => wx.showToast({ title: '已显示答案（该题计为错题）', icon: 'none', duration: 900 }));
  },

  onSwiperChange(e) {
    const attempted = e.detail.current;
    const prev = this.data.current || 0;
    if (this._programmaticChange) {
      this._programmaticChange = false;
      this.setData({ current: attempted }, () => this._setFocusFor(attempted));
      return;
    }
    this.setData({ current: prev }, () => wx.showToast({ title: '请点击下一个切换', icon: 'none', duration: 900 }));
  },

  onInputFocus() {}
});