(function () {
  const KEY = "desk-notes-round2-v1";
  const main = document.getElementById("main");
  const navList = document.getElementById("nav-list");
  const progressLine = document.getElementById("progress-line");

  const state = load();
  let view = state.view || { name: "home" };
  let frame = 0;
  let timer = null;
  let picked = null;
  let revealed = false;
  let paperIndex = 0;
  let paperPicks = [];

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw || typeof raw !== "object") return { done: {}, view: { name: "home" } };
      raw.done = raw.done || {};
      return raw;
    } catch (err) {
      return { done: {}, view: { name: "home" } };
    }
  }

  function save() {
    state.view = view;
    localStorage.setItem(KEY, JSON.stringify({ done: state.done, view }));
    renderNav();
  }

  function lessonById(id) {
    return window.LESSONS.find((lesson) => lesson.id === id);
  }

  function groups() {
    const order = [];
    const map = new Map();
    window.LESSONS.forEach((lesson) => {
      if (!map.has(lesson.section)) {
        map.set(lesson.section, []);
        order.push(lesson.section);
      }
      map.get(lesson.section).push(lesson);
    });
    return order.map((name) => ({ name, lessons: map.get(name) }));
  }

  function renderNav() {
    const doneCount = window.LESSONS.filter((lesson) => state.done[lesson.id]).length;
    progressLine.innerHTML = "<strong>" + doneCount + "</strong> of 20 lessons finished";
    navList.replaceChildren();
    const list = document.createElement("div");
    list.className = "nav-list";
    groups().forEach((group) => {
      const label = document.createElement("div");
      label.className = "nav-group";
      const h = document.createElement("h2");
      h.textContent = group.name;
      label.appendChild(h);
      list.appendChild(label);
      group.lessons.forEach((lesson) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "nav-item";
        if (view.name === "lesson" && view.id === lesson.id) btn.classList.add("active");
        if (state.done[lesson.id]) btn.classList.add("done");
        const num = document.createElement("small");
        num.textContent = String(lesson.id).padStart(2, "0");
        const title = document.createElement("span");
        title.textContent = lesson.nav;
        btn.append(num, title);
        btn.addEventListener("click", () => openLesson(lesson.id));
        list.appendChild(btn);
      });
    });
    navList.appendChild(list);
  }

  function rich(text) {
    const frag = document.createDocumentFragment();
    const parts = String(text).split(/(`[^`]+`)/g);
    parts.forEach((part) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        const code = document.createElement("code");
        code.textContent = part.slice(1, -1);
        frag.appendChild(code);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    return frag;
  }

  function stopPlay() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function openHome() {
    stopPlay();
    view = { name: "home" };
    save();
    renderHome();
  }

  function openLesson(id) {
    stopPlay();
    view = { name: "lesson", id };
    frame = 0;
    picked = null;
    revealed = false;
    save();
    renderLesson();
  }

  function openPaper() {
    stopPlay();
    view = { name: "paper" };
    paperIndex = 0;
    paperPicks = window.LESSONS.map(() => null);
    save();
    renderPaper();
  }

  function renderHome() {
    main.replaceChildren();
    const hero = document.createElement("section");
    hero.className = "hero";
    hero.innerHTML = "<p class='kicker'>A classroom for one quiz</p>";
    const h = document.createElement("h1");
    h.textContent = "See the idea before you see the options.";
    const lede = document.createElement("p");
    lede.className = "lede";
    lede.textContent = "These twenty lessons come from one paper: Round 2, Advanced Data Structures. Each photograph is one question. Nothing here assumes you have met the idea before. We start with a picture, walk the mechanism, and only then look at A, B, C, and D.";
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = "On the phone, option A was selected every time, and for this paper A is actually right every time. Learn the reason. The next paper will move the letter.";
    const actions = document.createElement("div");
    actions.className = "hero-actions";
    const start = document.createElement("button");
    start.className = "btn";
    start.type = "button";
    start.textContent = "Start with lesson 1";
    start.addEventListener("click", () => openLesson(1));
    const paper = document.createElement("button");
    paper.className = "btn ghost";
    paper.type = "button";
    paper.textContent = "Sit the paper";
    paper.addEventListener("click", openPaper);
    actions.append(start, paper);
    hero.append(h, lede, note, actions);
    main.appendChild(hero);

    groups().forEach((group) => {
      const label = document.createElement("p");
      label.className = "section-label";
      label.textContent = group.name;
      const toc = document.createElement("div");
      toc.className = "toc";
      group.lessons.forEach((lesson) => {
        const btn = document.createElement("button");
        btn.type = "button";
        const q = document.createElement("span");
        q.className = "q";
        q.textContent = "Q" + lesson.id + (state.done[lesson.id] ? "  ·  finished" : "");
        const strong = document.createElement("strong");
        strong.textContent = lesson.nav;
        const em = document.createElement("em");
        em.textContent = lesson.question;
        btn.append(q, strong, em);
        btn.addEventListener("click", () => openLesson(lesson.id));
        toc.appendChild(btn);
      });
      main.append(label, toc);
    });
    window.scrollTo(0, 0);
  }

  function renderLesson() {
    const lesson = lessonById(view.id);
    main.replaceChildren();
    const head = document.createElement("header");
    head.className = "lesson-head";
    const kicker = document.createElement("p");
    kicker.className = "kicker";
    kicker.textContent = "Lesson " + lesson.id + " of 20  ·  " + lesson.section;
    const h = document.createElement("h1");
    h.textContent = lesson.title;
    const promise = document.createElement("p");
    promise.className = "promise";
    promise.textContent = lesson.promise;
    head.append(kicker, h, promise);

    const stage = document.createElement("section");
    stage.className = "stage";
    const top = document.createElement("div");
    top.className = "stage-top";
    const h2 = document.createElement("h2");
    h2.id = "frame-title";
    const count = document.createElement("span");
    count.className = "step-count";
    count.id = "frame-count";
    top.append(h2, count);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.classList.add("board");
    svg.setAttribute("role", "img");
    const caption = document.createElement("p");
    caption.className = "caption";
    caption.id = "frame-caption";
    const controls = document.createElement("div");
    controls.className = "controls";
    const prev = button("Back", () => step(-1));
    const next = button("Next", () => step(1));
    const play = button("Play", () => togglePlay(play), "ghost");
    play.id = "play-btn";
    const dots = document.createElement("div");
    dots.className = "dots";
    dots.id = "dots";
    lesson.frames.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.addEventListener("click", () => {
        stopPlay();
        frame = index;
        paintFrame(lesson, svg);
      });
      dots.appendChild(dot);
    });
    controls.append(prev, next, play, dots);
    stage.append(top, svg, caption, controls);

    if (lesson.interactive === "bits") {
      const bits = document.createElement("div");
      bits.className = "bits";
      const label = document.createElement("label");
      label.textContent = "Try any positive integer";
      const input = document.createElement("input");
      input.type = "number";
      input.min = "1";
      input.max = "255";
      input.value = "12";
      input.id = "bit-input";
      label.appendChild(input);
      const out = document.createElement("span");
      out.id = "bit-out";
      out.className = "muted";
      bits.append(label, out);
      input.addEventListener("input", () => {
        const n = clampInt(input.value);
        input.value = String(n);
        showBits(n);
      });
      stage.appendChild(bits);
    }

    const chapter = document.createElement("article");
    chapter.className = "chapter";
    lesson.notes.forEach((note) => {
      const h3 = document.createElement("h3");
      h3.textContent = note.h;
      chapter.appendChild(h3);
      note.p.forEach((paragraph) => {
        const p = document.createElement("p");
        p.appendChild(rich(paragraph));
        chapter.appendChild(p);
      });
      if (note.code) {
        const pre = document.createElement("pre");
        pre.className = "formula";
        pre.textContent = note.code;
        chapter.appendChild(pre);
      }
    });

    const quiz = document.createElement("section");
    quiz.className = "quiz";
    quiz.id = "quiz";
    const qh = document.createElement("h3");
    qh.textContent = "Now answer it";
    const qp = document.createElement("p");
    qp.appendChild(rich("Q" + lesson.id + ". " + lesson.question));
    quiz.append(qh, qp);
    lesson.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.dataset.index = String(index);
      const b = document.createElement("b");
      b.textContent = option.k;
      const span = document.createElement("span");
      span.textContent = option.t;
      btn.append(b, span);
      btn.addEventListener("click", () => {
        if (revealed) return;
        picked = index;
        quiz.querySelectorAll(".option").forEach((el) => el.classList.remove("picked"));
        btn.classList.add("picked");
      });
      quiz.appendChild(btn);
    });
    const actions = document.createElement("div");
    actions.className = "quiz-actions";
    const check = button("Check this answer", () => reveal(lesson, false));
    const show = button("Show me the answer", () => reveal(lesson, true), "ghost");
    actions.append(check, show);
    const verdict = document.createElement("div");
    verdict.id = "verdict";
    quiz.append(actions, verdict);

    const pager = document.createElement("div");
    pager.className = "pager";
    const prevLesson = button(lesson.id > 1 ? "Lesson " + (lesson.id - 1) : "Home", () => {
      if (lesson.id > 1) openLesson(lesson.id - 1);
      else openHome();
    }, "ghost");
    const nextLesson = button(lesson.id < 20 ? "Lesson " + (lesson.id + 1) : "Sit the paper", () => {
      if (lesson.id < 20) openLesson(lesson.id + 1);
      else openPaper();
    });
    pager.append(prevLesson, nextLesson);

    main.append(head, stage, chapter, quiz, pager);
    paintFrame(lesson, svg);
    if (lesson.interactive === "bits") showBits(12);
    window.scrollTo(0, 0);
  }

  function paintFrame(lesson, svg) {
    const current = lesson.frames[frame];
    document.getElementById("frame-title").textContent = current.h;
    document.getElementById("frame-count").textContent = (frame + 1) + " / " + lesson.frames.length;
    document.getElementById("frame-caption").textContent = current.say;
    svg.setAttribute("aria-label", current.h + ". " + current.say);
    const dots = document.getElementById("dots");
    if (dots) {
      [...dots.children].forEach((dot, index) => dot.classList.toggle("on", index === frame));
    }
    try {
      const drawing = window.Draw(svg);
      lesson.paint(drawing, frame);
    } catch (err) {
      const drawing = window.Draw(svg);
      drawing.text(40, 80, "This frame could not be drawn.", { size: 18 });
      console.error(err);
    }
    svg.classList.remove("in");
    void svg.getBoundingClientRect();
    svg.classList.add("in");
  }

  function step(delta) {
    const lesson = lessonById(view.id);
    stopPlay();
    const play = document.getElementById("play-btn");
    if (play) play.textContent = "Play";
    frame = Math.max(0, Math.min(lesson.frames.length - 1, frame + delta));
    const svg = main.querySelector("svg.board");
    paintFrame(lesson, svg);
  }

  function togglePlay(play) {
    if (timer) {
      stopPlay();
      play.textContent = "Play";
      return;
    }
    play.textContent = "Pause";
    timer = setInterval(() => {
      const lesson = lessonById(view.id);
      if (frame >= lesson.frames.length - 1) {
        stopPlay();
        play.textContent = "Play";
        return;
      }
      frame += 1;
      paintFrame(lesson, main.querySelector("svg.board"));
    }, 3200);
  }

  function reveal(lesson, force) {
    if (revealed) return;
    if (picked == null && !force) {
      const verdict = document.getElementById("verdict");
      verdict.className = "verdict";
      verdict.textContent = "Pick an option first. If you would rather be walked through it, use Show me the answer.";
      return;
    }
    revealed = true;
    if (force && picked == null) picked = lesson.correct;
    const correct = picked === lesson.correct;
    if (correct) state.done[lesson.id] = true;
    save();
    const verdict = document.getElementById("verdict");
    verdict.className = "verdict " + (correct ? "good" : "bad");
    verdict.textContent = correct
      ? "Yes. " + lesson.options[lesson.correct].k + " is the one. The notes under the picture are why, and the lines below say what each trap is mixing up."
      : "The picture says " + lesson.options[lesson.correct].k + ". Read the note on the option you chose, then the note on the right one. You can reopen the lesson anytime.";
    main.querySelectorAll(".option").forEach((el) => {
      const index = Number(el.dataset.index);
      el.classList.remove("picked");
      if (index === lesson.correct) el.classList.add("right");
      else if (index === picked) el.classList.add("wrong");
      const why = document.createElement("p");
      why.className = "why";
      why.appendChild(rich(lesson.options[index].why));
      el.appendChild(why);
    });
  }

  function showBits(n) {
    const out = document.getElementById("bit-out");
    if (!out) return;
    const cleared = n & (n - 1);
    out.textContent = n + " in binary is " + n.toString(2) + ".  " + n + " - 1 is " + (n - 1) + " (" + (n - 1).toString(2) + ").  AND is " + cleared + " (" + cleared.toString(2) + ").";
  }

  function renderPaper() {
    main.replaceChildren();
    if (paperIndex >= window.LESSONS.length) {
      renderScore();
      return;
    }
    const lesson = window.LESSONS[paperIndex];
    const head = document.createElement("header");
    head.className = "lesson-head";
    head.innerHTML = "<p class='kicker'>The paper  ·  question " + (paperIndex + 1) + " of 20</p>";
    const h = document.createElement("h1");
    h.textContent = lesson.question;
    head.appendChild(h);
    const quiz = document.createElement("section");
    quiz.className = "quiz paper-q";
    lesson.options.forEach((option, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      const b = document.createElement("b");
      b.textContent = option.k;
      const span = document.createElement("span");
      span.textContent = option.t;
      btn.append(b, span);
      btn.addEventListener("click", () => {
        paperPicks[paperIndex] = index;
        paperIndex += 1;
        renderPaper();
      });
      quiz.appendChild(btn);
    });
    const back = button("Leave the paper", openHome, "ghost");
    back.style.marginTop = "16px";
    main.append(head, quiz, back);
    window.scrollTo(0, 0);
  }

  function renderScore() {
    const missed = window.LESSONS.filter((lesson, index) => paperPicks[index] !== lesson.correct);
    const correct = 20 - missed.length;
    const head = document.createElement("header");
    head.className = "lesson-head";
    head.innerHTML = "<p class='kicker'>The paper</p>";
    const h = document.createElement("h1");
    h.textContent = correct === 20 ? "Every mechanism held." : "Here is what to restudy.";
    const score = document.createElement("p");
    score.className = "score";
    score.textContent = correct + " / 20";
    head.append(h, score);
    main.appendChild(head);
    if (!missed.length) {
      const p = document.createElement("p");
      p.textContent = "You can trust the reasons, not the letter A. Say each rule out loud once without looking.";
      main.appendChild(p);
    } else {
      missed.forEach((lesson) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "miss";
        btn.textContent = "Lesson " + lesson.id + "  ·  " + lesson.nav;
        btn.addEventListener("click", () => openLesson(lesson.id));
        main.appendChild(btn);
      });
    }
    const again = button("Home", openHome, "ghost");
    again.style.marginTop = "18px";
    main.appendChild(again);
  }

  function button(text, onClick, kind) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn" + (kind ? " " + kind : "");
    btn.textContent = text;
    btn.addEventListener("click", onClick);
    return btn;
  }

  function clampInt(value) {
    const n = Math.round(Number(value));
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(255, n));
  }

  document.getElementById("home-btn").addEventListener("click", openHome);
  document.getElementById("paper-btn").addEventListener("click", openPaper);
  document.addEventListener("keydown", (event) => {
    if (view.name !== "lesson") return;
    if (event.target && (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")) return;
    if (event.key === "ArrowRight") step(1);
    if (event.key === "ArrowLeft") step(-1);
  });

  renderNav();
  if (view.name === "lesson" && lessonById(view.id)) renderLesson();
  else if (view.name === "paper") openHome();
  else renderHome();
})();
