/* ============ 鹅腿阿姨创业日记 ============ */

const $ = (id) => document.getElementById(id);
const GITHUB_REPO =
  "https://github.com/super8848-AI/Dairy-of-hardworking-Auntie";

const state = {
  honest: false, // 是否买了正品鹅腿
  costEach: 1.5,
  priceEach: 16,
  sold: 0,
  profit: 0,
  reputation: 0,
  footTrafficMult: 1,
  unlockShown: false,
  speechUnlockShown: false,
  selling: false,
  achievements: [],
};

const ACHIEVEMENTS = {
  speech: {
    id: "speech",
    title: "北大演讲",
    desc: "卖出 30 根鹅腿，受邀北大演讲",
    threshold: 30,
  },
};

/* ---------- 阿姨三轮车（注入三个场景） ---------- */
const CART_HTML = `
  <div class="cart-rig">
    <div class="canopy"></div>
    <div class="box"></div>
    <div class="frame"></div>
    <div class="auntie">
      <div class="a-hair"></div>
      <div class="a-face"></div>
      <div class="a-smile"></div>
      <div class="a-body"></div>
      <div class="a-apron"></div>
      <div class="a-arm"></div>
      <div class="a-leg"></div>
      <div class="a-leg back"></div>
    </div>
    <div class="wheel w1"></div>
    <div class="wheel w2"></div>
    <div class="wheel w3"></div>
  </div>`;

["title-cart", "sell-cart"].forEach((id) => ($(id).innerHTML = CART_HTML));

/* ---------- 面包车（进货驮冻腿回家） ---------- */
const VAN_HTML = `
  <div class="van-rig">
    <div class="van-body">
      <div class="van-cab">
        <div class="van-window"></div>
        <div class="auntie van-driver">
          <div class="a-hair"></div>
          <div class="a-face"></div>
          <div class="a-smile"></div>
          <div class="a-body"></div>
        </div>
      </div>
      <div class="van-cargo">
        <span>冻腿</span>
        <span class="van-cargo-tag">× 一车</span>
      </div>
    </div>
    <div class="van-wheel w1"></div>
    <div class="van-wheel w2"></div>
  </div>`;

/* ---------- 场景切换 ---------- */
function showScene(id) {
  document
    .querySelectorAll(".scene")
    .forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

/* ---------- 弹窗 ---------- */
function showModal(title, body, actions) {
  $("modal-title").textContent = title;
  $("modal-body").innerHTML = body;
  const box = $("modal-actions");
  box.innerHTML = "";
  actions.forEach(({ label, ghost, onClick }) => {
    const b = document.createElement("button");
    b.className = "btn" + (ghost ? " btn-ghost" : "");
    b.textContent = label;
    b.onclick = () => {
      $("modal").classList.add("hidden");
      onClick && onClick();
    };
    box.appendChild(b);
  });
  $("modal").classList.remove("hidden");
}

/* ---------- 计分板 ---------- */
function updateBoard() {
  $("profit").textContent = state.profit.toFixed(1);
  $("sold-count").textContent = state.sold;
  $("cost-each").textContent = state.costEach;
  $("reputation").textContent = state.reputation.toLocaleString();
  $("foot-traffic").textContent = Math.round(state.footTrafficMult * 100) + "%";
  renderAchievements();
  const m = document.querySelector(".board-money");
  m.classList.remove("bump");
  void m.offsetWidth;
  m.classList.add("bump");
}

function renderAchievements() {
  const box = $("achievement-list");
  if (!state.achievements.length) {
    box.innerHTML = "";
    return;
  }
  box.innerHTML = state.achievements
    .map(
      (a) => `<span class="ach-badge" title="${a.desc}">🏅 ${a.title}</span>`,
    )
    .join("");
}

function unlockAchievement(key) {
  const ach = ACHIEVEMENTS[key];
  if (!ach || state.achievements.some((a) => a.id === ach.id)) return;
  state.achievements.push(ach);
  renderAchievements();
}

function trafficDelay(ms) {
  return Math.max(180, Math.round(ms / state.footTrafficMult));
}

/* ================= 0. 背景音乐自动启动 ================= */
(function initBGM() {
  function tryPlay() {
    Sound.unlock(); // H5 音频解锁
    Sound.playBGM();
    document.removeEventListener("click", tryPlay);
    document.removeEventListener("touchstart", tryPlay);
  }
  document.addEventListener("click", tryPlay);
  document.addEventListener("touchend", tryPlay); // iOS 只认 touchend/click 为有效手势
})();

/* ================= 1. 标题 ================= */
$("btn-start").onclick = () => {
  showScene("scene-market");
};

/* ================= 2. 菜市场 ================= */
function setMarketDialog(speaker, text) {
  $("market-dialog").querySelector(".dialog-speaker").textContent = speaker;
  $("market-dialog").querySelector(".dialog-text").textContent = text;
}

$("pick-duck").onclick = () => {
  showModal(
    "进货确认",
    "冷冻鸭腿 <b>¥1.5/根</b>。<br>滚揉一下、卤一卤，膨胀之后……谁分得清是鸭是鹅？",
    [
      {
        label: "就它了，进货！",
        onClick: () => {
          state.honest = false;
          state.costEach = 1.5;
          setMarketDialog("鹅腿阿姨", "鸭腿才1.5一根，卖16……这账，越算越香。");
          setTimeout(() => startRide("home"), 1400);
        },
      },
      { label: "再想想", ghost: true },
    ],
  );
};

$("pick-goose").onclick = () => {
  showModal(
    "灵魂拷问",
    "你确定购买<b>正品鹅腿</b>吗？<br>这会让鸭腿太子买不起朝阳区别野！",
    [
      {
        label: "我要做良心阿姨",
        onClick: () => {
          state.honest = true;
          state.costEach = 15;
          setMarketDialog(
            "鹅腿阿姨",
            "正品鹅腿15一根，卖16……图啥呢？图个心安吧。",
          );
          setTimeout(() => startRide("home"), 1400);
        },
      },
      {
        label: "算了，还是鸭腿吧",
        ghost: true,
        onClick: () => {
          setMarketDialog("鹅腿阿姨", "嗯，朝阳区别野要紧。还是看看鸭腿吧……");
        },
      },
    ],
  );
};

/* ================= 3. 骑车动画 ================= */
function startRide(dest) {
  showScene("scene-ride");
  const cart = $("ride-cart");
  const isHome = dest === "home";
  cart.innerHTML = isHome ? VAN_HTML : CART_HTML;
  const rig = cart.querySelector(isHome ? ".van-rig" : ".cart-rig");
  $("ride-label").textContent = isHome
    ? "🚐 开着面包车，把一车冻腿驮回昌平区小别野……"
    : "🚲 夜幕降临，蹬着三轮车赶往北京大学西南门……";
  cart.classList.remove("go");
  void cart.offsetWidth;
  rig.classList.add(isHome ? "driving" : "pedaling");
  cart.classList.add("go");
  setTimeout(() => {
    rig.classList.remove(isHome ? "driving" : "pedaling");
    if (isHome) enterKitchen();
    else enterSell();
  }, 4600);
}

/* ================= 4. 厨房加工 ================= */
const PROCESS_STEPS = [
  {
    title: "解冻 + 真空滚揉",
    desc: "冻腿扔进真空滚揉机，咕噜咕噜转上俩小时——肉质松了，盐水「咕咚咕咚」全吸进去。一根腿，先胖一圈。",
    duration: 3000,
    apply: (leg) => {
      $("machine").classList.add("running");
      Sound.machineSound();
    },
    finish: (leg) => {
      $("machine").classList.remove("running");
      leg.style.transform = "scale(1.15)";
    },
  },
  {
    title: "老卤卤制",
    desc: "下锅卤制，记得加葱——葱香一飘，卤前吸盐水、卤后吸汤汁，里里外外喝得饱饱的。颜色一上，香味一出，气质立马不一样了。",
    duration: 3000,
    apply: () => {
      $("pot").classList.remove("hidden");
      $("machine").classList.add("hidden");
    },
    finish: (leg) => {
      leg.classList.add("cooked");
      leg.style.transform = "scale(1.3)";
    },
  },
  {
    title: "出锅定型",
    desc: "成品比生鸭腿足足膨胀 20%~50%，肥大油亮，往灯下一摆——「这么大，肯定是鹅腿！」北大高材生也看不出区别。",
    duration: 2600,
    apply: () => {},
    finish: (leg) => {
      leg.classList.add("swollen");
      if (!state.honest) leg.classList.add("greenish");
    },
  },
];

let stepIndex = 0;

function enterKitchen() {
  showScene("scene-kitchen");
  stepIndex = 0;
  if (state.honest) {
    // 良心模式：正品鹅腿不用造假，但阿姨还是要卤
    PROCESS_STEPS[2].desc =
      "正品鹅腿本来就大，卤熟就行。阿姨看着锅，心里有点空：一根就赚1块，卖100根才100块……大学生还以为鹅腿多金贵呢。";
  }
  loadStep();
}

function loadStep() {
  const step = PROCESS_STEPS[stepIndex];
  $("process-step").textContent =
    `第 ${stepIndex + 1} 步 / 共 ${PROCESS_STEPS.length} 步`;
  $("process-title").textContent = step.title;
  $("process-desc").textContent = step.desc;
  $("progress-fill").style.width = "0%";
  $("btn-process").disabled = false;
  $("btn-process").textContent = stepIndex === 0 ? "开始加工" : "下一步";
}

$("btn-process").onclick = () => {
  const step = PROCESS_STEPS[stepIndex];
  const btn = $("btn-process");
  const leg = $("bench-leg");
  btn.disabled = true;
  btn.textContent = "加工中…";
  step.apply(leg);

  const start = performance.now();
  (function tick(now) {
    const p = Math.min(1, (now - start) / step.duration);
    $("progress-fill").style.width = (p * 100).toFixed(1) + "%";
    if (p < 1) return requestAnimationFrame(tick);
    step.finish(leg);
    stepIndex++;
    if (stepIndex < PROCESS_STEPS.length) {
      setTimeout(loadStep, 700);
    } else {
      btn.textContent = "出摊！";
      btn.disabled = false;
      btn.onclick = () => {
        btn.onclick = null;
        $("btn-process").onclick = null;
        startRide("pku");
      };
    }
  })(performance.now());
};

/* ================= 5. 北大门口售卖 ================= */

const STUDENTS = [
  {
    name: "卷王",
    hair: "short",
    color: "#3f6fb5",
    ask: "阿姨！赶紧的！吃完还要回去卷，今晚不刷到凌晨三点不算完。",
  },
  {
    name: "小红书博主",
    hair: "long",
    color: "#c75b8a",
    ask: "阿姨~ 给我挑根大的！我要拍照发小红书，标题就写「北大鹅腿yyds」！",
  },
  {
    name: "考研气氛组",
    hair: "short",
    color: "#4a8c5f",
    ask: "阿姨，一根鹅腿！吃完就回去看书——我是说，真的会看的那种。",
  },
  {
    name: "学生会干部",
    hair: "long",
    color: "#8a6fc7",
    ask: "阿姨！以后学生会招新就蹲你摊子旁边，人流量比百团大战还高！",
  },
  {
    name: "留学生",
    hair: "short",
    color: "#c2762e",
    ask: "Auntie！Goose leg！I don't care if it's duck！好吃就行！",
  },
  {
    name: "摸鱼实习生",
    hair: "short",
    color: "#d4883e",
    ask: "阿姨救我，实习一天啥也没干，饿得头昏眼花……来根鹅腿续命！",
  },
  {
    name: "论文焦虑症",
    hair: "long",
    color: "#5e7e9b",
    ask: "阿姨有鹅腿吗？导师说论文再不改就延毕，我想吃点好的……",
  },
];

const AUNTIE_REPLIES = [
  "好嘞！刚出锅的「鹅腿」，北大高材生都分不清是鸭是鹅！",
  "拿去！吃完好好卷，长大了给阿姨儿子打工！",
  "一根16，你爸妈一个月给你三千生活费够花吗？",
  "同学，未来年薪百万，现在省什么省？再來一根！",
  "又肥又大，比你们的学历含金量高多了！",
];

const THOUGHTS = [
  "一天卖1000根，一根赚14.5，就是14500……",
  "一年干208天，一共300万——比北大毕业生起薪高多了！",
  "300万……儿子小学没毕业也能开路虎，哈哈哈哈。",
  "这帮孩子天天卷，卷到最后还不是来给我送钱？",
  "985、211……最后还不如一个卖鸭腿的阿姨。",
];

let customerTimer = null;
let greenAsked = false;
let thoughtIndex = 0;

function enterSell() {
  showScene("scene-sell");
  $("scoreboard").classList.remove("hidden");
  updateBoard();
  state.selling = true;
  setTimeout(nextCustomer, trafficDelay(1200));
}

function makeStudent(s) {
  const spot = $("student-spot");
  spot.innerHTML = `
    <div class="student" style="--s-color:${s.color}">
      <div class="s-hair ${s.hair === "long" ? "long" : ""}"></div>
      <div class="s-face"></div>
      <div class="s-bag"></div>
      <div class="s-body"></div>
      <div class="s-legs"></div>
    </div>`;
  return spot.firstElementChild;
}

function say(bubbleId, name, text) {
  const b = $(bubbleId);
  b.innerHTML = `<span class="b-name">${name}</span>${text}`;
  b.classList.remove("hidden");
}
function hideBubbles() {
  ["bubble-student", "bubble-auntie", "bubble-think"].forEach((id) =>
    $(id).classList.add("hidden"),
  );
}

function nextCustomer() {
  if (!state.selling) return;
  hideBubbles();

  // 卖出30根 → 解锁北大演讲成就
  if (state.sold >= ACHIEVEMENTS.speech.threshold && !state.speechUnlockShown) {
    state.speechUnlockShown = true;
    showSpeechEvent();
    return;
  }

  // 卖出10根 → 解锁国贸副本
  if (state.sold >= 10 && !state.unlockShown) {
    state.unlockShown = true;
    showUnlock();
    return;
  }

  const s = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
  makeStudent(s);

  // 第3位顾客触发「绿色鹅腿」剧情（仅鸭腿模式）
  if (!state.honest && !greenAsked && state.sold === 2) {
    greenAsked = true;
    playGreenScene();
    return;
  }

  setTimeout(() => {
    say("bubble-student", s.name, s.ask);
    Sound.studentChatter();
    $("btn-sell").classList.remove("hidden");
    $("btn-sell").disabled = false;
  }, trafficDelay(900));
}

function playGreenScene() {
  setTimeout(() => {
    say(
      "bubble-student",
      "小红书博主",
      "阿姨……这鹅腿怎么是<b>绿色</b>的呀？发出去会不会掉粉？",
    );
    Sound.studentChatter();
    setTimeout(() => {
      say(
        "bubble-auntie",
        "鹅腿阿姨",
        "蔬菜汁腌的！纯天然无添加，北大化学系都验不出来！",
      );
      setTimeout(() => {
        say(
          "bubble-student",
          "小红书博主",
          "哇那更健康了！我标题改成「北大限定·抹茶鹅腿」！",
        );
        Sound.studentChatter();
        $("btn-sell").classList.remove("hidden");
        $("btn-sell").disabled = false;
      }, trafficDelay(1800));
    }, trafficDelay(1600));
  }, trafficDelay(900));
}

$("btn-sell").onclick = () => {
  if ($("btn-sell").disabled) return;
  $("btn-sell").disabled = true;
  $("btn-sell").classList.add("hidden");

  const gain = state.priceEach - state.costEach;
  state.sold++;
  state.profit = +(state.profit + gain).toFixed(1);
  updateBoard();
  floatMoney(gain);

  hideBubbles();
  say(
    "bubble-auntie",
    "鹅腿阿姨",
    AUNTIE_REPLIES[Math.floor(Math.random() * AUNTIE_REPLIES.length)],
  );

  const stu = $("student-spot").querySelector(".student");
  if (stu) setTimeout(() => stu.classList.add("leave"), 700);

  // 每卖2根，阿姨来一段内心戏
  if (state.sold % 2 === 0) {
    setTimeout(() => {
      hideBubbles();
      const t = state.honest
        ? "良心是无价的……但这帮小孩根本不懂，他们只在乎好不好吃。"
        : THOUGHTS[thoughtIndex % THOUGHTS.length];
      thoughtIndex++;
      say("bubble-think", "阿姨的内心戏", t);
      setTimeout(nextCustomer, trafficDelay(2400));
    }, trafficDelay(1500));
  } else {
    setTimeout(nextCustomer, trafficDelay(1900));
  }
};

function floatMoney(gain) {
  if (gain > 0) Sound.coinSound();
  const el = document.createElement("div");
  el.className = "float-money";
  el.textContent = gain > 0 ? `+¥${gain.toFixed(1)}` : "+¥0.0（图个心安）";
  if (gain <= 0) el.style.color = "#bdb4d6";
  el.style.left = 30 + Math.random() * 30 + "%";
  el.style.bottom = "42%";
  $("float-layer").appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function showSpeechEvent() {
  state.reputation += 10000;
  state.footTrafficMult = 11;
  unlockAchievement("speech");
  updateBoard();

  const summary = state.honest
    ? `你卖出了 <b>30 根正品鹅腿</b>，北大同学联名邀请阿姨进校演讲。<br>「良心摊主」的故事传遍未名湖畔——虽然路虎还是没着落，但起码睡得着觉。`
    : `你卖出了 <b>30 根「鹅腿」</b>，这帮傻孩子排队请阿姨分享创业心得。<br>阿姨站在讲台上，台下掌声雷动：「你们读四年书，不如我卖三个月鸭腿！」`;

  showModal(
    "🏆 成就解锁：北大演讲",
    summary +
      `<br><br><b style="color:#9e2b2b">声望值 +10,000</b>（当前 <b>${state.reputation.toLocaleString()}</b>）<br>` +
      `<b style="color:#2e7d44">人流量 +1000%</b>（当前 <b>${Math.round(state.footTrafficMult * 100)}%</b>）<br><br>` +
      `<span style="font-size:13px;color:#6b5b3e">同学们蜂拥而至，北大西南门快被挤爆了……看来学历真的不如流量。</span>`,
    [
      {
        label: "继续摆摊，趁热打铁",
        onClick: () => setTimeout(nextCustomer, trafficDelay(800)),
      },
      {
        label: "重新开始",
        ghost: true,
        onClick: () => location.reload(),
      },
    ],
  );
}

function showUnlock() {
  const summary = state.honest
    ? `你卖出了 10 根<b>正品鹅腿</b>，收益 <b>¥${state.profit.toFixed(1)}</b>。<br>阿姨叹了口气：每根赚1块，不如去送外卖。`
    : `你卖出了 10 根「鹅腿」，净赚 <b>¥${state.profit.toFixed(1)}</b>。<br>这帮大学生真好骗，鸭腿当鹅腿卖，一个个吃得比谁都香。`;
  showModal("🎉 解锁新副本：国贸", summary, [
    {
      label: "继续在北大卖",
      onClick: () => setTimeout(nextCustomer, trafficDelay(800)),
    },
    {
      label: "重新开始",
      ghost: true,
      onClick: () => location.reload(),
    },
  ]);
}
