(() => {
  "use strict";
  const history = window.AI_HISTORY;
  if (!history || !Array.isArray(history.chapters) || !Array.isArray(history.moments)) {
    console.error("AI history data is unavailable.");
    return;
  }

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const chapters = history.chapters;
  const moments = [...history.moments].sort((a, b) => a.year - b.year);

  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));

  const networkArt = (variant = "classic") => {
    const dots = [
      [91,139],[168,70],[168,206],[254,105],[254,178],[345,60],[345,145],[345,224],[435,139],[505,140]
    ];
    const links = [[0,1],[0,2],[1,3],[1,4],[2,3],[2,4],[3,5],[3,6],[3,7],[4,5],[4,6],[4,7],[5,8],[6,8],[7,8],[8,9]];
    return '<svg class="scene-svg" viewBox="0 0 590 280" aria-hidden="true">' +
      links.map(([from, to]) => '<line x1="' + dots[from][0] + '" y1="' + dots[from][1] + '" x2="' + dots[to][0] + '" y2="' + dots[to][1] + '"/>').join("") +
      dots.map(([x,y], i) => '<circle cx="' + x + '" cy="' + y + '" r="' + (i === 8 ? 13 : i === 9 ? 9 : 7) + '" class="' + (variant === "learning" && i > 4 ? "scene-accent" : "") + '"/>').join("") + '</svg>';
  };

  function visualMarkup(kind) {
    const grid = '<div class="scene-grid" aria-hidden="true"></div>';
    if (kind === "neural") return grid +
      '<div class="scene-orbit" aria-hidden="true"></div><span class="scene-orbit-center">01 → ∞</span>';
    if (kind === "terminal") return grid +
      '<div class="scene-terminal" aria-label="An illustrative early rules-based conversation, not a historical transcript"><div class="terminal-bar"><i></i><i></i><i></i><span>EARLY LANGUAGE SYSTEM / DEMO</span></div><div class="terminal-body"><p><strong>HUMAN:</strong> I have been thinking.</p><p><em>PROGRAM:</em> Tell me more about that.</p><p><strong>HUMAN:</strong> Do you understand?</p><p><em>PROGRAM:</em> Why do you ask? <span class="cursor"></span></p></div></div>';
    if (kind === "network") return grid + networkArt("learning");
    if (kind === "data") return grid +
      '<div class="scene-stack" aria-hidden="true"><span class="data-tile">◉</span><span class="data-tile">⌁</span><span class="data-tile">◇</span><span class="data-tile">✦</span><span class="data-tile">▦</span><span class="data-tile">⊞</span></div>';
    if (kind === "convergence") return grid +
      '<div class="scene-merge" aria-hidden="true"><span class="merge-petal">IDEAS</span><span class="merge-petal">COMPUTE</span><span class="merge-petal">DATA</span></div><div class="merge-caption">→ BREAKTHROUGH ←</div>';
    return grid +
      '<div class="scene-chat" aria-label="An illustrative modern AI chat interface, not a live AI service"><div class="chat-bubble">How did all of this begin?</div><div class="chat-bubble">With decades of researchers, ideas, data, and computing.</div><div class="chat-bubble">And the next chapter? That is still being written. ✧</div></div>';
  }

  function chapterMarkup(chapter, i) {
    const next = chapters[i + 1];
    const nextLink = next
      ? '<a class="chapter-next" href="#chapter-' + safe(next.id) + '">NEXT / ' + safe(next.label) + ' ↗</a>'
      : '<a class="chapter-next" href="#time-lens">EXPLORE THE YEARS ↗</a>';
    return '<article class="story-chapter" id="chapter-' + safe(chapter.id) + '" data-chapter-index="' + i + '" aria-labelledby="heading-' + safe(chapter.id) + '">' +
      '<div class="chapter-head">' +
        '<div class="chapter-meta"><strong>CHAPTER ' + safe(chapter.number) + ' / 06</strong><span>' + safe(chapter.years) + '</span></div>' +
        '<p class="chapter-kicker">' + safe(chapter.label) + '</p>' +
        '<h3 id="heading-' + safe(chapter.id) + '">' + chapter.title + '</h3>' +
        '<p class="chapter-summary">' + safe(chapter.summary) + '</p>' +
      '</div>' +
      '<div class="chapter-visual visual-' + safe(chapter.visual) + '">' +
        '<div class="scene-art">' + visualMarkup(chapter.visual) + '</div>' +
        '<div class="chapter-visual-footer"><span>THE LONG ROAD TO NOW</span><strong>' + safe(chapter.years) + '</strong></div>' +
      '</div>' +
      '<div class="chapter-bottom">' +
        '<div class="chapter-analogy"><span>THINK OF IT THIS WAY</span><p>' + safe(chapter.analogy) + '</p></div>' +
        '<span class="chapter-highlight">' + safe(chapter.highlight) + '</span>' +
      '</div>' +
      '<div class="chapter-foot"><p>' + safe(chapter.endnote) + '</p>' + nextLink + '</div>' +
    '</article>';
  }

  const stack = $("#chapter-stack");
  stack.innerHTML = chapters.map(chapterMarkup).join("");
  const rails = ["The spark","Early promise","Learning again","The ingredients","The tipping point","Everyday AI"];
  $("#rail-links").innerHTML = chapters.map((chapter, i) =>
    '<a class="rail-link' + (i === 0 ? ' active' : '') + '" href="#chapter-' + safe(chapter.id) + '"' +
    (i === 0 ? ' aria-current="step"' : '') + '><span>' + safe(chapter.number) + '</span>' + safe(rails[i]) + '</a>'
  ).join("");

  $("#source-grid").innerHTML = history.foundationalSources.map(source =>
    '<a class="source-item" href="' + safe(source.url) + '" target="_blank" rel="noopener noreferrer">' +
      '<small>' + safe(source.type) + '</small><strong>' + safe(source.label) + '</strong><span>Read source ↗</span>' +
    '</a>'
  ).join("");

  let currentChapter = -1;
  const chapterNodes = $$(".story-chapter");
  const railLinks = $$(".rail-link");

  function activateChapter(index) {
    if (index === currentChapter || index < 0 || index >= chapters.length) return;
    currentChapter = index;
    const chapter = chapters[index];
    $("#rail-active-year").textContent = String(chapter.from);
    $("#rail-active-title").textContent = rails[index];
    $("#rail-progress").style.width = (index / (chapters.length - 1) * 100).toFixed(1) + "%";
    railLinks.forEach((link, i) => {
      link.classList.toggle("active", i === index);
      if (i === index) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
  }
  activateChapter(0);

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => {
        const idx = Number(entry.target.dataset.chapterIndex);
        if (Number.isInteger(idx)) activateChapter(idx);
      });
    }, { rootMargin:"-16% 0px -60% 0px", threshold:0 });
    chapterNodes.forEach(node => observer.observe(node));

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin:"0px 0px -4% 0px", threshold:.08 });
    chapterNodes.forEach(node => {
      node.classList.add("reveal-ready");
      revealObserver.observe(node);
    });
  }

  // The Time Lens selects the nearest documented milestone, without fabricating
  // historical events for each intervening year on the scrubber.
  const range = $("#year-scrubber");
  const quickYears = [1943, 1956, 1986, 2009, 2012, 2017, 2022, 2026];
  $("#lens-milestones").innerHTML = quickYears.map(year =>
    '<button type="button" class="lens-milestone" data-year="' + year + '" aria-label="Jump to ' + year + '">' + year + '</button>'
  ).join("");

  let momentIndex = moments.findIndex(m => m.year === 2012);
  if (momentIndex < 0) momentIndex = 0;

  function nearestIndex(year) {
    let closest = 0;
    for (let i = 1; i < moments.length; i++) {
      if (Math.abs(moments[i].year - year) < Math.abs(moments[closest].year - year)) closest = i;
    }
    return closest;
  }

  function updateLens(index, updateSlider = true) {
    if (!Number.isInteger(index) || index < 0 || index >= moments.length) return;
    momentIndex = index;
    const m = moments[index];
    const rangeValue = updateSlider ? m.year : Number(range.value);
    if (updateSlider) range.value = String(m.year);
    range.style.setProperty("--scrub-progress", ((rangeValue - 1943) / (2026 - 1943) * 100).toFixed(2) + "%");
    $("#lens-year").textContent = m.year;
    $("#lens-category").textContent = m.category;
    $("#lens-title").textContent = m.title;
    $("#lens-short").textContent = m.short;
    $("#lens-detail").textContent = m.detail;
    $("#lens-ingredients").innerHTML = m.ingredients.map((label, i) =>
      '<div class="lens-ingredient"><span>' + ["IDEAS","COMPUTE","DATA"][i] + '</span><strong>' + safe(label) + '</strong></div>'
    ).join("");
    const why = $("#why-answer");
    why.textContent = m.why;
    why.hidden = true;
    $("#why-toggle").setAttribute("aria-expanded","false");
    $(".why-caret").textContent = "+";
    const sourceLink = $("#lens-source");
    sourceLink.href = m.url;
    sourceLink.innerHTML = "Read the source: " + safe(m.source) + ' <span aria-hidden="true">↗</span>';
    $("#lens-prev").disabled = index === 0;
    $("#lens-next").disabled = index === moments.length - 1;
    $$(".lens-milestone").forEach(btn => {
      const active = Number(btn.dataset.year) === m.year;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }
  updateLens(momentIndex);
  range.addEventListener("input", () => updateLens(nearestIndex(Number(range.value)), false));
  range.addEventListener("change", () => updateLens(nearestIndex(Number(range.value)), true));
  $("#lens-prev").addEventListener("click", () => updateLens(momentIndex - 1));
  $("#lens-next").addEventListener("click", () => updateLens(momentIndex + 1));
  $$(".lens-milestone").forEach(btn => btn.addEventListener("click", () =>
    updateLens(moments.findIndex(m => m.year === Number(btn.dataset.year)))
  ));
  $("#why-toggle").addEventListener("click", () => {
    const answer = $("#why-answer");
    answer.hidden = !answer.hidden;
    const open = !answer.hidden;
    $("#why-toggle").setAttribute("aria-expanded",String(open));
    $(".why-caret").textContent = open ? "−" : "+";
  });

  // Mobile menu: keyboard escape and destination selection close the menu.
  const menu = $("#mobile-nav");
  const menuToggle = $("#menu-toggle");
  function setMenu(open) {
    menu.hidden = !open;
    menuToggle.setAttribute("aria-expanded",String(open));
    menuToggle.setAttribute("aria-label",open ? "Close navigation" : "Open navigation");
    document.body.classList.toggle("menu-open",open);
  }
  menuToggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a",menu).forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown",event => {
    if (event.key === "Escape" && !menu.hidden) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  document.addEventListener("click",event => {
    if (!menu.hidden && !menu.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
  });
  const menuBreakpoint = window.matchMedia("(min-width:901px)");
  const menuChange = () => {if (menuBreakpoint.matches) setMenu(false);};
  if (menuBreakpoint.addEventListener) menuBreakpoint.addEventListener("change",menuChange);

  // Continuous read progress. Canvas runs at a modest frame rate, is decorative,
  // and is disabled when reduced motion is requested.
  let scrollTicking = false;
  function updateReadProgress() {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const progress = height > 0 ? Math.min(1, Math.max(0,window.scrollY / height)) : 0;
    $("#page-progress").style.transform = "scaleX(" + progress.toFixed(4) + ")";
    if (window.innerWidth <= 900) {
      const near = chapterNodes
        .map((el,i) => ({i,distance:Math.abs(el.getBoundingClientRect().top - 170)}))
        .sort((a,b) => a.distance - b.distance)[0];
      const first = chapterNodes[0].getBoundingClientRect();
      const last = chapterNodes[chapterNodes.length - 1].getBoundingClientRect();
      if (near && first.top < window.innerHeight && last.bottom > 0) activateChapter(near.i);
    }
    scrollTicking = false;
  }
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(updateReadProgress);
    }
  }, {passive:true});
  updateReadProgress();

  // Original decorative animated star network, no external requests or tracking.
  const canvas = $("#starfield");
  const context = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (canvas && context && !reducedMotion.matches) {
    let width = 0, height = 0, stars = [], animationId = 0, frame = 0;
    const pointer = {x:-9999,y:-9999};
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1,2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.max(1,Math.round(width * dpr));
      canvas.height = Math.max(1,Math.round(height * dpr));
      canvas.style.width = width + "px";canvas.style.height = height + "px";
      context.setTransform(dpr,0,0,dpr,0,0);
      const number = Math.max(18,Math.min(65,Math.round(width * height / 15000)));
      stars = Array.from({length:number}, (_,i) => ({
        x:Math.random()*width,y:Math.random()*height,
        vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,
        r:(i % 7 === 0 ? 1.7 : .9),alpha:.18+Math.random()*.5
      }));
    }
    function draw() {
      animationId = window.requestAnimationFrame(draw);
      if (document.hidden || ++frame % 2 !== 0) return;
      context.clearRect(0,0,width,height);
      stars.forEach(p => {
        const dx = pointer.x-p.x,dy=pointer.y-p.y,dist=Math.hypot(dx,dy);
        if (dist<135 && dist>0) {p.vx -= dx/dist*.006;p.vy -= dy/dist*.006;}
        p.vx=Math.max(-.35,Math.min(.35,p.vx));
        p.vy=Math.max(-.35,Math.min(.35,p.vy));
        p.x+=p.vx;p.y+=p.vy;
        if (p.x<-4)p.x=width+4;if(p.x>width+4)p.x=-4;
        if (p.y<-4)p.y=height+4;if(p.y>height+4)p.y=-4;
        context.beginPath();context.arc(p.x,p.y,p.r,0,Math.PI*2);
        context.fillStyle="rgba(176,167,255,"+p.alpha+")";context.fill();
      });
      const max=115;
      for(let i=0;i<stars.length;i++) for(let j=i+1;j<stars.length;j++){
        const a=stars[i],b=stars[j],dx=a.x-b.x,dy=a.y-b.y,d=dx*dx+dy*dy;
        if(d<max*max){
          context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);
          context.strokeStyle="rgba(142,150,240,"+((1-Math.sqrt(d)/max)*.12).toFixed(3)+")";
          context.lineWidth=.65;context.stroke();
        }
      }
    }
    resize();draw();
    window.addEventListener("resize",resize,{passive:true});
    window.addEventListener("pointermove",e => {pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
    window.addEventListener("pointerleave",() => {pointer.x=-9999;pointer.y=-9999;});
    if (reducedMotion.addEventListener) reducedMotion.addEventListener("change",e => {
      if(e.matches){cancelAnimationFrame(animationId);context.clearRect(0,0,width,height);canvas.style.display="none";}
    });
  }
})();