(() => {
  "use strict";
  const dataset = window.AI_HISTORY;
  if (!dataset || !Array.isArray(dataset.moments)) return;
  const events = [...dataset.moments].sort((a,b) => a.year-b.year);
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const NS = "http://www.w3.org/2000/svg";
  const selected = {
    pin: Math.max(0,events.findIndex(m => m.year===2012)),
    filter:"all",
    preview:null,
    timer:null
  };
  // Coordinates are deliberately editorial, not a proportional time axis.
  // The later decades get extra space to make milestones easier to explore.
  const layout = {
    1943:[99,160,"idea"],1950:[177,142,"idea"],1956:[233,155,"idea"],1957:[269,161,"idea"],
    1966:[319,168,"idea"],1974:[357,284,"compute"],1986:[434,178,"idea"],
    1997:[520,276,"compute"],2009:[617,340,"data"],2012:[668,270,"compute"],
    2016:[734,188,"idea"],2017:[781,194,"idea"],2020:[830,306,"data"],
    2022:[884,228,"idea"],2024:[942,293,"data"],2025:[1001,266,"compute"],2026:[1087,266,"all"]
  };
  const eventNodes = new Map();
  const mobileNodes = new Map();
  const lines = $("#milestone-nodes");
  const map = $("#history-map");
  const padding = (n) => String(n).padStart(2,"0");
  const XML = (text) => String(text??"").replace(/[&<>"']/g,(v)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[v]));
  const yearToIndex = (year) => events.reduce((best,m,i) =>
    Math.abs(m.year-year)<Math.abs(events[best].year-year) ? i:best,0);
  const laneColor = (lane) => lane==="idea"?"#b69eff":lane==="compute"?"#8bd0ff":lane==="data"?"#f0bc89":"#e3d7ff";
  const majorYears = new Set([1943,1956,1986,1997,2009,2012,2017,2022,2026]);

  // Ticks sit at the same, deliberately non-linear positions as milestones.
  const tickYears = [1943,1956,1974,1986,1997,2009,2012,2017,2022,2026];
  const tickLayer = $("#year-ticks");
  tickLayer.innerHTML = tickYears.map(year => {
    const x=layout[year][0];
    return '<line class="axis-guide" x1="'+x+'" x2="'+x+'" y1="470" y2="480"/>'+
      '<text class="axis-tick'+([1943,2012,2026].includes(year)?" emphasis":"")+
      '" x="'+x+'" y="497" text-anchor="middle">'+year+'</text>';
  }).join("");

  // Create accessible SVG hit targets; events use primary attributes, not
  // an opaque image map. Hover previews, click pins, keyboard activates.
  events.forEach((moment,index)=>{
    const [x,y,lane]=layout[moment.year] || [1080,265,"all"];
    const color=laneColor(lane);
    const group=document.createElementNS(NS,"g");
    group.setAttribute("class","milestone");
    group.setAttribute("data-year",String(moment.year));
    group.setAttribute("data-lane",lane);
    group.setAttribute("role","button");
    group.setAttribute("tabindex","0");
    group.setAttribute("aria-label",moment.year+": "+moment.title+". Select to view details.");
    group.setAttribute("aria-pressed","false");
    const title=document.createElementNS(NS,"title");
    title.textContent=moment.year+" — "+moment.title;
    group.appendChild(title);
    const el=(type,attrs)=>{
      const node=document.createElementNS(NS,type);
      Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));
      group.appendChild(node);
      return node;
    };
    // Large, transparent hit area improves pointer and touch usability.
    el("circle",{cx:x,cy:y,r:23,class:"node-target"});
    el("circle",{cx:x,cy:y,r:16,class:"node-halo",stroke:color});
    el("circle",{cx:x,cy:y,r:8,class:"node-disc",stroke:color});
    el("circle",{cx:x,cy:y,r:3.5,class:"node-core",fill:color});
    if(majorYears.has(moment.year) && moment.year!==2026){
      const text=el("text",{x,y:y+(y>300?34:-26),"text-anchor":"middle",class:"node-year"});
      text.textContent=moment.year;
    }
    if(moment.year===2026){
      const text=el("text",{x:1087,y:308,"text-anchor":"middle",class:"node-year"});
      text.textContent="NOW";
    }
    group.addEventListener("pointerenter",()=>{
      if(matchMedia("(hover:hover)").matches){
        pauseJourney();
        selected.preview=index;
        render(index,true);
      }
    });
    group.addEventListener("pointerleave",()=>{
      if(selected.preview===index){selected.preview=null;render(selected.pin,false);}
    });
    group.addEventListener("focus",()=>{selected.preview=index;render(index,true);});
    group.addEventListener("blur",()=>{if(selected.preview===index){selected.preview=null;render(selected.pin,false);}});
    group.addEventListener("click",()=>choose(index));
    group.addEventListener("keydown",(e)=>{
      if(e.key==="Enter" || e.key===" "){e.preventDefault();choose(index);}
      if(e.key==="ArrowRight" || e.key==="ArrowLeft"){
        e.preventDefault();
        changeBy(e.key==="ArrowRight"?1:-1);
        const active=eventNodes.get(selected.pin);
        if(active)active.focus();
      }
    });
    lines.appendChild(group);
    eventNodes.set(index,group);
  });


  /* Portrait-first map: nodes and branch curves flow top-to-bottom on phones.
   * Layout is editorial, not a quantitative time axis. Every milestone
   * remains accessible via click/tap and keyboard activation.
   */
  function buildMobilePortraitMap(){
    const mobileMap=$("#mobile-history-map");
    const easing=(t)=>t*t*(3-2*t);
    const xFor=(lane,t)=>{
      const f=easing(Math.min(1,Math.max(0,t)));
      if(lane==="idea")return 78+102*f;
      if(lane==="data")return 282-102*f;
      if(lane==="compute")return 181-4*Math.sin(Math.PI*t);
      return 180;
    };
    const yTop=72,yBottom=770;
    let markup='<defs>'+
      '<linearGradient id="mobile-idea-gradient" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#765fe8"/><stop offset="1" stop-color="#dec0ff"/></linearGradient>'+
      '<linearGradient id="mobile-compute-gradient" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#4677ac"/><stop offset="1" stop-color="#b1eaff"/></linearGradient>'+
      '<linearGradient id="mobile-data-gradient" x1="0" y1="0" x2="-.1" y2="1"><stop stop-color="#9b6c52"/><stop offset="1" stop-color="#ffd59b"/></linearGradient>'+
      '<radialGradient id="mobile-halo-gradient"><stop stop-color="#b4a3ff" stop-opacity=".3"/><stop offset="1" stop-color="#b4a3ff" stop-opacity="0"/></radialGradient>'+
      '</defs>';
    markup+='<g aria-hidden="true">';
    for(const mark of [{y:115,text:"THE FIRST IDEAS"},{y:303,text:"LEARNING TO LEARN"},{y:509,text:"A NEW SCALE"},{y:685,text:"IN EVERYDAY LIFE"}]){
      markup+='<path class="mobile-era-guide" d="M13 '+mark.y+'H347"/><text class="mobile-era-label" x="15" y="'+(mark.y-9)+'">'+mark.text+'</text>';
    }
    for(const lane of ["idea","compute","data"]){
      const d=[];
      for(let k=0;k<=45;k++){
        const t=k/45,y=yTop+(yBottom-yTop)*t;
        d.push((k===0?"M":"L")+xFor(lane,t).toFixed(2)+" "+y.toFixed(2));
      }
      markup+='<path class="mobile-lane-line '+lane+'" d="'+d.join(" ")+'"/>';
    }
    markup+='<circle cx="180" cy="770" r="57" class="mobile-current-halo"/>'+
      '<circle cx="180" cy="770" r="24" fill="none" stroke="#cdbaff" stroke-opacity=".25"/>'+
      '<text x="180" y="819" text-anchor="middle" class="mobile-era-now">NOW / 2026</text></g>';
    mobileMap.innerHTML=markup;
    events.forEach((moment,index)=>{
      const lane=layout[moment.year][2];
      const y=86+index*42.75;
      const t=Math.min(1,Math.max(0,(y-yTop)/(yBottom-yTop)));
      const x=xFor(lane,t);
      const color=laneColor(lane);
      const group=document.createElementNS(NS,"g");
      group.setAttribute("class","mobile-map-dot");
      group.setAttribute("role","button");
      group.setAttribute("tabindex","0");
      group.setAttribute("data-lane",lane);
      group.setAttribute("data-year",String(moment.year));
      group.setAttribute("aria-label",moment.year+": "+moment.title+". Open the story.");
      group.setAttribute("aria-pressed","false");
      const add=(name,attrs)=>{
        const node=document.createElementNS(NS,name);
        for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
        group.appendChild(node);
        return node;
      };
      const title=add("title",{});
      title.textContent=moment.year+" — "+moment.title;
      add("circle",{cx:x,cy:y,r:21,class:"mobile-hit"});
      add("circle",{cx:x,cy:y,r:16.5,stroke:color,class:"mobile-ring"});
      add("circle",{cx:x,cy:y,r:9,stroke:color,class:"mobile-disc"});
      add("circle",{cx:x,cy:y,r:3.8,fill:color,class:"mobile-inner"});
      const yearLabel=add("text",{x:x,y:y-18,"text-anchor":"middle",class:"mobile-year-text"});
      yearLabel.textContent=String(moment.year);
      group.addEventListener("click",()=>choose(index));
      group.addEventListener("keydown",(e)=>{
        if(e.key==="Enter"||e.key===" "){e.preventDefault();choose(index);}
        if(e.key==="ArrowDown"||e.key==="ArrowUp"){
          e.preventDefault();
          const next=Math.min(events.length-1,Math.max(0,index+(e.key==="ArrowDown"?1:-1)));
          choose(next);
        }
      });
      mobileMap.appendChild(group);
      mobileNodes.set(index,group);
    });
  }
  buildMobilePortraitMap();

  const mobileBreakpoint=window.matchMedia("(max-width: 850px)");
  const mobilePane=$("#story-pane"),mobileScrim=$("#mobile-scrim"),closeMobileButton=$("#mobile-detail-close");
  let previouslyFocused=null;
  const isMobile=()=>mobileBreakpoint.matches;
  function syncMobilePane(){
    if(isMobile()){
      if(!document.body.classList.contains("mobile-detail-open")){
        mobilePane.inert=true;
        mobilePane.removeAttribute("role");
        mobilePane.removeAttribute("aria-modal");
      }
    }else{
      mobilePane.inert=false;
      mobilePane.removeAttribute("role");
      mobilePane.removeAttribute("aria-modal");
      document.body.classList.remove("mobile-detail-open");
      mobileScrim.hidden=true;
    }
  }
  function openMobileDetail(){
    if(!isMobile())return;
    previouslyFocused=document.activeElement;
    mobilePane.inert=false;
    mobilePane.setAttribute("role","dialog");
    mobilePane.setAttribute("aria-modal","true");
    mobileScrim.hidden=false;
    document.body.classList.add("mobile-detail-open");
    closeMobileButton.focus();
  }
  function closeMobileDetail(restore=true){
    if(!document.body.classList.contains("mobile-detail-open"))return;
    document.body.classList.remove("mobile-detail-open");
    mobileScrim.hidden=true;
    mobilePane.inert=isMobile();
    mobilePane.removeAttribute("role");
    mobilePane.removeAttribute("aria-modal");
    if(restore && previouslyFocused && previouslyFocused.isConnected)previouslyFocused.focus();
    previouslyFocused=null;
  }
  closeMobileButton.addEventListener("click",()=>closeMobileDetail());
  mobileScrim.addEventListener("click",()=>closeMobileDetail());
  const paneKeys=(event)=>{
    if(!document.body.classList.contains("mobile-detail-open"))return;
    if(event.key==="Escape"){event.preventDefault();closeMobileDetail();return;}
    if(event.key!=="Tab")return;
    const tabbables=[...mobilePane.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')].filter(el=>!el.hidden);
    if(!tabbables.length)return;
    const first=tabbables[0],last=tabbables[tabbables.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  };
  document.addEventListener("keydown",paneKeys);
  if(mobileBreakpoint.addEventListener)mobileBreakpoint.addEventListener("change",syncMobilePane);
  syncMobilePane();

  function art(moment,lane){
    const year=moment.year;
    const common='<circle cx="140" cy="91" r="72" class="draw-ghost"/>'+
      '<circle cx="140" cy="91" r="56" class="draw-ghost" stroke-dasharray="3 9"/>';
    let shape="";
    if(year<1960){
      shape='<path class="draw-stroke" d="M70 112 L105 73 L139 111 L171 56 L211 100"/>'+
      '<path class="draw-accent" d="M70 112 L125 137 L171 56 L211 100"/>'+
      [[70,112],[105,73],[139,111],[171,56],[211,100],[125,137]].map(([x,y])=>'<circle class="draw-dot" cx="'+x+'" cy="'+y+'" r="5"/>').join("");
    }else if(year<1980){
      shape='<rect x="67" y="43" width="148" height="101" rx="10" class="draw-stroke"/>'+
      '<path class="draw-ghost" d="M69 64 H214"/><path class="draw-accent" d="M82 83 H132 M82 103 H188 M82 120 H153"/>'+
      '<circle cx="82" cy="55" r="2.5" class="draw-dot"/><circle cx="91" cy="55" r="2.5" class="draw-dot"/>';
    }else if(year<2000){
      shape='<g class="draw-stroke"><path d="M68 92L115 51L158 92L207 51M68 92L115 131L158 92L207 131M115 51L115 131M158 92L207 131"/></g>'+
      [[68,92],[115,51],[115,131],[158,92],[207,51],[207,131]].map(([x,y])=>'<circle class="draw-dot" cx="'+x+'" cy="'+y+'" r="6"/>').join("");
    }else if(year<2012){
      shape='<g class="draw-stroke"><rect x="78" y="48" width="51" height="51" rx="6"/><rect x="151" y="48" width="51" height="51" rx="6"/><rect x="78" y="111" width="51" height="32" rx="6"/><rect x="151" y="111" width="51" height="32" rx="6"/></g>'+
      '<path class="draw-accent" d="M89 86L104 69L117 86M159 87L173 70L190 87"/>';
    }else if(year<2020){
      shape='<rect x="85" y="46" width="112" height="101" rx="13" class="draw-stroke"/>'+
      '<path class="draw-accent" d="M101 71H183M101 91H165M101 111H176"/>'+
      [[85,46],[197,46],[85,147],[197,147]].map(([x,y])=>'<circle class="draw-dot" cx="'+x+'" cy="'+y+'" r="6"/>').join("")+
      '<path class="draw-ghost" d="M62 96H84M198 96H223M140 19V46M140 147V168"/>';
    }else{
      shape='<rect x="66" y="57" width="105" height="68" rx="18" class="draw-stroke"/>'+
      '<path class="draw-stroke" d="M93 126L89 144L112 126"/>'+
      '<rect x="133" y="35" width="91" height="63" rx="17" class="draw-accent"/>'+
      '<path class="draw-accent" d="M200 99L205 116L189 98"/>'+
      '<path class="draw-ghost" d="M86 81H146M86 94H131M151 61H206M151 75H191"/>';
    }
    const color=lane==="compute"?"#8bd0ff":lane==="data"?"#edc08c":"#cdb5ff";
    return '<svg viewBox="0 0 280 184" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+common+
      '<circle cx="140" cy="91" r="78" fill="none" stroke="'+color+'" stroke-opacity=".12"/>'+
      shape+
      '<text x="140" y="174" text-anchor="middle" fill="'+color+'" font-size="10" font-weight="800" letter-spacing="2.2">MILESTONE / '+year+'</text></svg>';
  }

  function render(index,isPreview){
    const moment=events[index];
    if(!moment)return;
    const lane=layout[moment.year][2];
    const color=laneColor(lane);
    $("#detail-year").textContent=moment.year;
    $("#detail-title").textContent=moment.title;
    $("#detail-summary").textContent=moment.short;
    $("#detail-explanation").textContent=moment.detail;
    $("#detail-tag").textContent=moment.category;
    $("#detail-id").textContent=padding(index+1)+" / "+padding(events.length);
    $("#timeline-index").textContent=padding(index+1);
    $("#timeline-total").textContent=padding(events.length);
    $("#detail-source").href=moment.url;
    $("#detail-source").setAttribute("aria-label","Read source about "+moment.title+" at "+moment.source);
    $("#visual-box").dataset.kind=lane;
    $("#milestone-illustration").innerHTML=art(moment,lane);
    $("#story-pane").style.setProperty("--active-color",color);
    if(!isPreview){
      $("#time-range").value=String(moment.year);
      $("#time-range").style.setProperty("--progress",((moment.year-1943)/(2026-1943)*100).toFixed(1)+"%");
    }
    eventNodes.forEach((node,i)=>{
      const active=i===index;
      node.classList.toggle("is-active",active);
      node.setAttribute("aria-pressed",String(i===selected.pin));
    });
    mobileNodes.forEach((node,i)=>{
      node.classList.toggle("is-active",i===index);
      node.setAttribute("aria-pressed",String(i===selected.pin));
    });
    $("#previous-event").disabled=findNeighbor(selected.pin,-1)===-1;
    $("#next-event").disabled=findNeighbor(selected.pin,+1)===-1;
  }

  function matches(index){
    const moment=events[index];
    const lane=layout[moment.year][2];
    return selected.filter==="all" || lane===selected.filter || lane==="all";
  }
  function findNeighbor(index,direction){
    for(let i=index+direction;i>=0&&i<events.length;i+=direction)if(matches(i))return i;
    return -1;
  }
  function choose(index){
    if(index<0 || index>=events.length)return;
    pauseJourney();
    selected.pin=index;
    selected.preview=null;
    render(index,false);
    openMobileDetail();
  }
  function changeBy(direction){
    const neighbor=findNeighbor(selected.pin,direction);
    if(neighbor!==-1)choose(neighbor);
  }
  $("#previous-event").addEventListener("click",()=>changeBy(-1));
  $("#next-event").addEventListener("click",()=>changeBy(+1));
  $("#time-range").addEventListener("input",(e)=>{
    const index=yearToIndex(Number(e.target.value));
    selected.pin=index;selected.preview=null;
    pauseJourney();render(index,false);
  });
  $("#time-range").addEventListener("change",()=>openMobileDetail());
  $$(".track-toggle").forEach(button=>{
    button.addEventListener("click",()=>{
      selected.filter=button.dataset.track;
      $$(".track-toggle").forEach(b=>{
        const active=b===button;
        b.classList.toggle("is-active",active);
        b.setAttribute("aria-pressed",String(active));
      });
      map.dataset.filter=selected.filter;
      $("#mobile-history-map").dataset.filter=selected.filter;
      if(!matches(selected.pin)){
        const next=events.findIndex((_,i)=>matches(i));
        if(next>=0)choose(next);
      }else render(selected.pin,false);
    });
  });

  function pauseJourney(){
    if(selected.timer!==null)window.clearInterval(selected.timer);
    selected.timer=null;
    $("#play-journey").setAttribute("aria-pressed","false");
    $("#play-symbol").textContent="▶";
    $("#play-label").textContent="Play journey";
  }
  function playJourney(){
    if(selected.timer!==null){pauseJourney();return;}
    if(findNeighbor(selected.pin,1)===-1){
      const start=events.findIndex((_,i)=>matches(i));
      if(start>=0){selected.pin=start;render(start,false);}
    }
    $("#play-journey").setAttribute("aria-pressed","true");
    $("#play-symbol").textContent="Ⅱ";
    $("#play-label").textContent="Pause";
    selected.timer=window.setInterval(()=>{
      const next=findNeighbor(selected.pin,1);
      if(next===-1){pauseJourney();return;}
      selected.pin=next;
      selected.preview=null;
      render(next,false);
      // Portrait timeline highlights advance without hijacking touch scrolling.
    },1600);
  }
  $("#play-journey").addEventListener("click",playJourney);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)pauseJourney();});
  document.addEventListener("keydown",(e)=>{
    const tag=document.activeElement?.tagName?.toLowerCase();
    if(["input","textarea","select"].includes(tag))return;
    if($("#source-dialog").open || document.body.classList.contains("mobile-detail-open"))return;
    if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
      e.preventDefault();
      changeBy(e.key==="ArrowRight"?1:-1);
    }
  });

  const dialog=$("#source-dialog");
  $("#dialog-sources").innerHTML=(dataset.foundationalSources||[]).map(source=>
    '<a href="'+XML(source.url)+'" target="_blank" rel="noopener noreferrer">'+
    '<small>'+XML(source.type)+'</small>'+XML(source.label)+' ↗</a>'
  ).join("");
  $("#open-sources").addEventListener("click",()=>dialog.showModal());
  $("#close-sources").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",(e)=>{if(e.target===dialog)dialog.close();});
  // Start with the visually distinctive 2012 convergence moment.
  render(selected.pin,false);
})();