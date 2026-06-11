/* ============ 音频模块 ============ */
const Sound = (() => {
  let bgm = null;
  let bgmRunning = false;

  // 预加载音频元素
  const coinAudio = new Audio("coin.mp3");
  coinAudio.preload = "auto";

  const chatterAudio = new Audio("chatter.mp3");
  chatterAudio.preload = "auto";

  /* ---------- 背景音乐 ---------- */
  function playBGM() {
    if (bgmRunning) return;
    bgmRunning = true;
    if (!bgm) {
      bgm = new Audio("bgm.mp3");
      bgm.loop = true;
      bgm.volume = 0.4;
    }
    bgm.currentTime = 0;
    bgm.play().catch(() => {});
  }

  function stopBGM() {
    bgmRunning = false;
    if (bgm) {
      bgm.pause();
      bgm.currentTime = 0;
    }
  }

  /* ---------- 金币音效 ---------- */
  function coinSound() {
    coinAudio.currentTime = 0;
    coinAudio.play().catch(() => {});
  }

  /* ---------- 学生叽里咕噜 ---------- */
  function studentChatter() {
    chatterAudio.currentTime = 0;
    chatterAudio.play().catch(() => {});
  }

  /* ---------- 厨房加工声音（Web Audio 合成） ---------- */
  let machineCtx = null;
  function machineSound() {
    try {
      if (!machineCtx) {
        machineCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (machineCtx.state === "suspended") machineCtx.resume();
      const c = machineCtx;
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

  return { playBGM, stopBGM, coinSound, studentChatter, machineSound };
})();
