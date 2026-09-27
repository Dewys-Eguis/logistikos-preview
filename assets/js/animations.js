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
    const counters = [...view.querySelectorAll('[data-count]')];
    const revealed = [...view.querySelectorAll('[data-reveal]')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({target,isIntersecting}) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible'); observer.unobserve(target);
        target.querySelectorAll('[data-count]').forEach(count => {
          if (reduced.matches || count.dataset.counted) return;
          count.dataset.counted='true';
          const end=Number(count.dataset.count), start=performance.now();
          const tick=time=>{
            const progress=reduced.matches?1:Math.min(1,(time-start)/1200);
            count.textContent=Math.round(end*(1-Math.pow(1-progress,3))).toLocaleString('es-ES');
            if(progress<1)request(tick);
          };
          request(tick);
        });
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
      header.classList.toggle('is-scrolled',scrollY>30);
      const available=document.documentElement.scrollHeight-innerHeight;
      header.style.setProperty('--page-progress',String(available>0?Math.min(1,scrollY/available):0));
      const rect=manifesto.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(innerHeight*.55-rect.top)/Math.max(1,rect.height-innerHeight*.45)));
      statements.forEach((line,i)=>line.classList.toggle('is-active',reduced.matches || progress>i/3));
      let nearest=0,distance=Infinity;
      steps.forEach((step,i)=>{const d=Math.abs(step.getBoundingClientRect().top-innerHeight*.4);if(d<distance){nearest=i;distance=d;}});
      steps.forEach((step,i)=>step.classList.toggle('is-current',i===nearest));
    }
    const scheduleScroll=()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);};
    on(window,'scroll',scheduleScroll,{passive:true});on(window,'resize',scheduleScroll,{passive:true});
    function applyMotionPreference() {
      view.classList.toggle('motion-ready',!reduced.matches);
      if(reduced.matches){revealed.forEach(el=>el.classList.add('is-visible'));counters.forEach(el=>{el.textContent=Number(el.dataset.count).toLocaleString('es-ES');});}
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
      control.abort();observer.disconnect();visibility.disconnect();
      frames.forEach(cancelAnimationFrame);cancelAnimationFrame(scrollFrame);
      view.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
    };
  },
};
