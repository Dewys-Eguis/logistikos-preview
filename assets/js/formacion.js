"use strict";
window.FormacionPage = (function () {
  function mount(root) {
    if (!root || !root.querySelector(".formation-view")) return function () {};
    const view = root.querySelector(".formation-view");
    const stopSearch = mountSearch(view);
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return stopSearch;
    view.classList.add("motion-ready");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    view.querySelectorAll("[data-formation-reveal]").forEach((node) => observer.observe(node));
    return function cleanup() { observer.disconnect(); stopSearch(); };
  }
  function mountSearch(view) {
    const areas = [
      ['supply-chain','Supply Chain y Logística',true], ['compras','Compras y Category Management',true],
      ['transporte','Transporte y Distribución',true], ['comercio-internacional','Comercio Internacional',true],
      ['liderazgo','Liderazgo y Gestión de Equipos',true], ['ia-datos','IA, Datos y Digitalización',true]
    ];
    const clean = text => text.replace(/\s+/g,' ').trim();
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const catalog = [];
    const add = (title,area,department='') => {
      title=clean(title);
      if (!catalog.some(p=>p.title===title && p.area[0]===area[0])) catalog.push({title,area,department});
    };
    // Read existing sources directly: no parallel, manually maintained catalog.
    const values = getCourseValues.call({props:{},state:{dept:'alm',hr:'A1'},setState(){}});
    values.data.forEach(dept=>dept.courses.forEach(course=>add(course.title,areas.find(a=>dept.route==='#/area/'+a[0]),dept.name)));
    areas.forEach(area=>{
      const template=document.getElementById('tpl-area-'+area[0]);
      template?.content.querySelectorAll('.sc-program h3,.cp-program h3,.cp-program-title,.tr-program-title,.legacy-379 .legacy-380,.ap-program-title').forEach(node=>add(node.textContent,area));
    });
    const query=view.querySelector('#program-query'), filter=view.querySelector('#program-area');
    const results=view.querySelector('#program-results'), status=view.querySelector('#program-status');
    areas.forEach(area=>{const option=document.createElement('option');option.value=area[0];option.textContent=area[1];filter.append(option);});
    function update() {
      const words=normalize(query.value).trim().split(/\s+/).filter(Boolean);
      const matches=catalog.filter(p=>(!filter.value||p.area[0]===filter.value)&&words.every(w=>normalize(p.title+' '+p.area[1]+' '+p.department).includes(w)));
      const fragment=document.createDocumentFragment();
      matches.forEach(p=>{
        const card=document.createElement('article');card.className='formation-search-result';
        const title=document.createElement('h3');title.textContent=p.title;
        const area=document.createElement('p');area.textContent=p.area[1];
        const action=document.createElement(p.area[2]?'a':'span');
        action.textContent=p.area[2]?'Ver área →':'Próximamente';
        if(p.area[2]) {action.href='#/area/'+p.area[0];action.setAttribute('aria-label','Ver área: '+p.title);}
        else action.className='formation-search-pending';
        card.append(title,area,action);fragment.append(card);
      });
      results.replaceChildren(fragment);
      status.textContent=matches.length ? matches.length+' programas encontrados' : 'No se encontraron programas. Prueba otro tema o área.';
    }
    const controller=new AbortController();
    query.addEventListener('input',update,{signal:controller.signal});
    filter.addEventListener('change',update,{signal:controller.signal});
    view.querySelector('#program-clear').addEventListener('click',()=>{query.value='';filter.value='';update();query.focus();},{signal:controller.signal});
    update();
    return ()=>controller.abort();
  }
  return { mount };
})();
