"use strict";
// Shared motion behavior, ready for the next Home.
function motionBehavior() {
  return matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}
function scrollToSection(element) {
  element.scrollIntoView({ behavior: motionBehavior(), block: "start" });
}
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: motionBehavior() });
}

// Native, route-scoped motion. Every observer/listener/frame is disposed on exit.
const HomeMotion = {
  mount(root) {
    const view = root.querySelector('.home-view');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const control = new AbortController();
    const on = (target, event, callback, options = {}) => target.addEventListener(event, callback, { ...options, signal:control.signal });
    const frames = new Set();
    const request = (callback) => { const id=requestAnimationFrame((time)=>{frames.delete(id);callback(time);}); frames.add(id); return id; };
    const stopCounters = MetricCounters.mount(view);
    const revealed = [...view.querySelectorAll('[data-reveal]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({target,isIntersecting}) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible'); observer.unobserve(target);

      });
    },{threshold:0.08,rootMargin:'0px 0px -24px 0px'});
    revealed.forEach(el=>observer.observe(el));

    const hero = view.querySelector('.home-hero');
    const heroVisual = view.querySelector('[data-hero-visual]');
    const heroFrame = heroVisual?.querySelector('[data-hero-stage]');
    let heroVisible = true;
    let pointerX = 0, pointerY = 0;
    const visibility = new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; });
    visibility.observe(hero);
    function updateHeroTilt(){
      if(!heroFrame || !heroVisible || reduced.matches || !fine.matches) return;
      const rotateY = -12 + pointerX * 8.5;
      const rotateX = 4.5 - pointerY * 5.5;
      const rotateZ = -1 + pointerX * .9;
      const shiftX = pointerX * 12;
      const shiftY = pointerY * 8;
      heroFrame.style.transform = `translate3d(${shiftX}px,${shiftY}px,0) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`;
    }
    on(hero,'pointermove',event=>{
      if(!heroFrame || !fine.matches || reduced.matches)return;
      const bounds=hero.getBoundingClientRect();
      pointerX=(event.clientX-bounds.left)/bounds.width-.5;
      pointerY=(event.clientY-bounds.top)/bounds.height-.5;
      request(updateHeroTilt);
    },{passive:true});
    on(hero,'pointerleave',()=>{
      pointerX=0;pointerY=0;
      if(heroFrame) heroFrame.style.transform='rotateY(-12deg) rotateX(4.5deg) rotateZ(-1deg) translateZ(0)';
    });
    function applyHeroMotionPreference(){
      if(!heroFrame) return;
      if(reduced.matches) heroFrame.style.transform='none';
      else heroFrame.style.transform='rotateY(-12deg) rotateX(4.5deg) rotateZ(-1deg) translateZ(0)';
    }
    on(reduced,'change',applyHeroMotionPreference);
    applyHeroMotionPreference();

    const header=view.querySelector('.home-header');
    const manifesto=view.querySelector('.home-manifesto');
    const statements=[...view.querySelectorAll('[data-story-line]')];
    const steps=[...view.querySelectorAll('[data-method-step]')];
    let scrollFrame=0;
    function updateScroll() {
      scrollFrame=0;
      if(header) header.classList.toggle('is-scrolled',scrollY>30);
      const available=document.documentElement.scrollHeight-innerHeight;
      if(header) header.style.setProperty('--page-progress',String(available>0?Math.min(1,scrollY/available):0));
      const rect=manifesto?.getBoundingClientRect();
      const progress=rect ? Math.max(0,Math.min(1,(innerHeight*.55-rect.top)/Math.max(1,rect.height-innerHeight*.45))) : 0;
      statements.forEach((line,i)=>line.classList.toggle('is-active',reduced.matches || progress>i/3));
      let nearest=0,distance=Infinity;
      steps.forEach((step,i)=>{const d=Math.abs(step.getBoundingClientRect().top-innerHeight*.4);if(d<distance){nearest=i;distance=d;}});
      steps.forEach((step,i)=>step.classList.toggle('is-current',i===nearest));
    }
    const scheduleScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);};
    on(window,'scroll',scheduleScroll,{passive:true});on(window,'resize',scheduleScroll,{passive:true});
    function applyMotionPreference() {
      view.classList.toggle('motion-ready',!reduced.matches);
      if(reduced.matches){revealed.forEach(el=>el.classList.add('is-visible'));}
      applyHeroMotionPreference();updateScroll();
    }
    on(reduced,'change',applyMotionPreference);applyMotionPreference();
    view.querySelectorAll('[data-magnetic]').forEach(button=>{
      let animation;
      on(button,'pointermove',event=>{
        if(!fine.matches||reduced.matches)return;
        const r=button.getBoundingClientRect();
        animation?.cancel();animation=button.animate({transform:`translate(${(event.clientX-r.left-r.width/2)*.035}px,${(event.clientY-r.top-r.height/2)*.06}px)`},{duration:200,fill:'forwards',easing:'ease-out'});
      });
      on(button,'pointerleave',()=>{animation?.cancel();});
    });
    return ()=>{
      stopCounters();control.abort();observer.disconnect();visibility.disconnect();
      frames.forEach(cancelAnimationFrame);cancelAnimationFrame(scrollFrame);
      view.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    };
  },
};

const MetricCounters = (() => {
  const seen = new Set();
  const format = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  function mount(root) {
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const frames=new Map();
    const nodes=[...root.querySelectorAll('[data-count],[data-about-count]')].filter(n=>[130,573,20000,60].includes(Number(n.dataset.count||n.dataset.aboutCount)));
    const total=n=>Number(n.dataset.count||n.dataset.aboutCount);
    const key=n=>(root.classList.contains('about-view')?'about':'home')+':'+total(n);
    const finish=n=>{cancelAnimationFrame(frames.get(n));frames.delete(n);n.textContent=format(total(n));seen.add(key(n));};
    const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>entries.forEach(({target:n,isIntersecting})=>{
      if(!isIntersecting)return;
      observer.unobserve(n);
      if(seen.has(key(n))||preference.matches){finish(n);return;}
      seen.add(key(n));let start;
      function tick(time){
        start ??= time;
        const p=Math.min(1,(time-start)/1400);
        n.textContent=format(Math.round(total(n)*(1-Math.pow(1-p,3))));
        if(p<1)frames.set(n,requestAnimationFrame(tick));else finish(n);
      }
      frames.set(n,requestAnimationFrame(tick));
    }),{threshold:0.25}) : null;
    nodes.forEach(n=>{
      // Reserve the final width before replacing digits; screen readers retain the final value.
      n.style.display='inline-block';n.style.fontVariantNumeric='tabular-nums';n.style.minWidth=format(total(n)).length+'ch';
      n.setAttribute('aria-label',format(total(n)));n.setAttribute('role','text');
      if(preference.matches||seen.has(key(n))||!observer)finish(n);
      else {n.textContent='0';observer.observe(n);}
    });
    const change=()=>{if(preference.matches){observer?.disconnect();nodes.forEach(finish);}};
    preference.addEventListener('change',change);
    return ()=>{observer?.disconnect();frames.forEach(cancelAnimationFrame);preference.removeEventListener('change',change);};
  }
  return {mount};
})();
