"use strict";
// Open the target's native disclosures before the shared anchor handler scrolls.
// Delegation survives route rendering without observers or duplicated listeners.
document.addEventListener('click', function (event) {
  const link=event.target.closest('.ap-page a[href^="#"]');
  if(!link || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const href=link.getAttribute('href');
  if(href.startsWith('#/')) return;
  const root=link.closest('.ap-page'), target=root.querySelector('[id="'+href.slice(1)+'"]');
  if(!target) return;
  for(let node=target;node && node!==root;node=node.parentElement){
    if(node.tagName==='DETAILS') node.open=true;
  }
});
