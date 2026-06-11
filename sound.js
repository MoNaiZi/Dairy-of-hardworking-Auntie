/* ============ 音频模块 ============ */
const Sound = (() => {
  let unlocked = false;
  let bgmRunning = false;

  // 引用 HTML 中的 <audio> 元素（iOS 硬性要求用 DOM 元素而非 new Audio()）
  const bgm = document.getElementById("audio-bgm");
  const coin = document.getElementById("audio-coin");
  const chatter = document.getElementById("audio-chatter");

  bgm.volume = 0; // 初始静音，unlock 后由 playBGM 恢复

  /* ---------- 厨房加工（Web Audio） ---------- */
  let machineCtx = null;

  /* ---------- 音频解锁：用户首次交互时调用 ---------- */
  function unlock() {
    if (unlocked) return;
    unlocked = true;

    // iOS 要求音频播放在用户手势中直接触发
    // bgm 已经在 HTML 中声明 loop，直接静音播放
    bgm.play().catch(() => {});

    // 解锁其他音频元素
    coin.muted = true;
    coin
      .play()
      .then(() => {
        coin.pause();
        coin.currentTime = 0;
        coin.muted = false;
      })
      .catch(() => {});
    chatter.muted = true;
    chatter
      .play()
      .then(() => {
        chatter.pause();
        chatter.currentTime = 0;
        chatter.muted = false;
      })
      .catch(() => {});

    // 在用户手势中创建 AudioContext
    try {
      machineCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      /* 静默失败 */
    }
  }

  /* ---------- 背景音乐 ---------- */
  function playBGM() {
    if (!unlocked || bgmRunning) return;
    bgmRunning = true;
    bgm.volume = 0.4;
  }

  function stopBGM() {
    bgmRunning = false;
    bgm.volume = 0;
    bgm.pause();
    bgm.currentTime = 0;
  }

  /* ---------- 金币音效 ---------- */
  function coinSound() {
    if (!unlocked) return;
    coin.currentTime = 0;
    coin.play().catch(() => {});
  }

  /* ---------- 学生叽里咕噜 ---------- */
  function studentChatter() {
    if (!unlocked) return;
    chatter.currentTime = 0;
    chatter.play().catch(() => {});
  }

  /* ---------- 厨房加工声音（Web Audio 合成） ---------- */
  function machineSound() {
    if (!machineCtx) return;
    try {
      const c = machineCtx;
      if (c.state === "suspended") c.resume().catch(() => {});
      const now = c.currentTime;
      const duration = 2.5;
      const bufferSize = c.sampleRate * duration;
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / c.sampleRate;
        const rumble = Math.sin(
          2 * Math.PI * 60 * t + 0.5 * Math.sin(2 * Math.PI * 4 * t),
        );
        const noise = (Math.random() * 2 - 1) * 0.3;
        data[i] = (rumble * 0.6 + noise) * 0.25;
      }
      const source = c.createBufferSource();
      source.buffer = buffer;
      const lpFilter = c.createBiquadFilter();
      lpFilter.type = "lowpass";
      lpFilter.frequency.value = 200;
      const gainNode = c.createGain();
      gainNode.gain.value = 0.35;
      source.connect(lpFilter);
      lpFilter.connect(gainNode);
      gainNode.connect(c.destination);
      source.start(now);
    } catch (e) {
      /* 静默失败 */
    }
  }

  return { unlock, playBGM, stopBGM, coinSound, studentChatter, machineSound };
})();
