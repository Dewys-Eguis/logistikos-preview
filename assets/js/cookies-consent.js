(function(){
  "use strict";
  var COOKIE_NAME="logistikos_cookie_consent";
  var MAX_AGE=31536000;
  function readCookie(){
    var item=document.cookie.split("; ").find(function(row){return row.indexOf(COOKIE_NAME+"=")===0;});
    if(!item)return null;
    try{return JSON.parse(decodeURIComponent(item.split("=").slice(1).join("=")));}catch(e){return null;}
  }
  function writeCookie(value){
    var secure=location.protocol==="https:"?"; Secure":"";
    document.cookie=COOKIE_NAME+"="+encodeURIComponent(JSON.stringify(value))+"; Max-Age="+MAX_AGE+"; Path=/; SameSite=Lax"+secure;
    window.LOGISTIKOS_CONSENT=value;
    document.dispatchEvent(new CustomEvent("logistikos:consent",{detail:value}));
    activateTaggedScripts(value);
  }
  function activateTaggedScripts(consent){
    document.querySelectorAll('script[type="text/plain"][data-consent-category]').forEach(function(blocked){
      var category=blocked.getAttribute("data-consent-category");
      if(!consent||!consent[category]||blocked.dataset.activated==="true")return;
      var script=document.createElement("script");
      Array.from(blocked.attributes).forEach(function(attr){if(attr.name!=="type"&&attr.name!=="data-consent-category")script.setAttribute(attr.name,attr.value);});
      script.text=blocked.textContent;
      blocked.dataset.activated="true";
      blocked.after(script);
    });
  }
  function makeUI(){
    if(document.querySelector("[data-cookie-banner]"))return;
    var banner=document.createElement("section");
    banner.className="cookie-banner";banner.dataset.cookieBanner="";banner.setAttribute("aria-label","Preferencias de cookies");
    banner.innerHTML='<div><p class="cookie-banner-kicker">PRIVACIDAD · COOKIES</p><h2>Tú decides qué cookies aceptas.</h2><p>Utilizamos una cookie técnica para recordar tu elección. Las cookies de analítica o publicidad, si se incorporan, solo podrán activarse con tu consentimiento. <a href="#/politica-cookies">Política de cookies</a></p></div><div class="cookie-banner-actions"><button class="cookie-action cookie-action--accept" type="button" data-cookie-accept>Aceptar</button><button class="cookie-action" type="button" data-cookie-reject>Rechazar</button><button class="cookie-action" type="button" data-cookie-configure>Configurar</button></div>';
    document.body.appendChild(banner);
    var dialog=document.createElement("dialog");dialog.className="cookie-dialog";dialog.dataset.cookieDialog="";
    dialog.innerHTML='<div class="cookie-dialog-inner"><div class="cookie-dialog-head"><div><p class="cookie-banner-kicker">CENTRO DE PREFERENCIAS</p><h2>Configurar cookies</h2></div><button class="cookie-dialog-close" type="button" data-cookie-close aria-label="Cerrar">×</button></div><div class="cookie-option"><div><h3>Necesarias</h3><p>Imprescindibles para recordar tus preferencias y mantener funciones básicas.</p></div><small>Siempre activas</small></div><label class="cookie-option"><div><h3>Analítica</h3><p>Permitiría medir visitas y uso de la web. Actualmente no hay herramientas analíticas activas.</p></div><input type="checkbox" data-cookie-analytics></label><label class="cookie-option"><div><h3>Publicidad</h3><p>Permitiría medir campañas o mostrar publicidad. Actualmente no hay píxeles publicitarios activos.</p></div><input type="checkbox" data-cookie-marketing></label><div class="cookie-dialog-actions"><button class="cookie-action" type="button" data-cookie-reject-all>Rechazar opcionales</button><button class="cookie-action cookie-action--accept" type="button" data-cookie-save>Guardar preferencias</button></div></div>';
    document.body.appendChild(dialog);
    return {banner:banner,dialog:dialog};
  }
  function setDialogValues(dialog,consent){
    var analytics=dialog.querySelector("[data-cookie-analytics]");var marketing=dialog.querySelector("[data-cookie-marketing]");
    if(analytics)analytics.checked=!!(consent&&consent.analytics);if(marketing)marketing.checked=!!(consent&&consent.marketing);
  }
  function init(){
    var ui=makeUI();var banner=document.querySelector("[data-cookie-banner]");var dialog=document.querySelector("[data-cookie-dialog]");var consent=readCookie();
    window.LOGISTIKOS_CONSENT=consent||{necessary:true,analytics:false,marketing:false};
    activateTaggedScripts(window.LOGISTIKOS_CONSENT);
    banner.hidden=!!consent;
    document.addEventListener("click",function(event){
      if(event.target.closest("[data-cookie-accept]")){writeCookie({necessary:true,analytics:true,marketing:true});banner.hidden=true;return;}
      if(event.target.closest("[data-cookie-reject], [data-cookie-reject-all]")){writeCookie({necessary:true,analytics:false,marketing:false});banner.hidden=true;if(dialog.open)dialog.close();return;}
      if(event.target.closest("[data-cookie-configure], [data-cookie-settings]")){event.preventDefault();setDialogValues(dialog,readCookie()||window.LOGISTIKOS_CONSENT);if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");return;}
      if(event.target.closest("[data-cookie-close]")){if(dialog.close)dialog.close();return;}
      if(event.target.closest("[data-cookie-save]")){writeCookie({necessary:true,analytics:!!dialog.querySelector("[data-cookie-analytics]").checked,marketing:!!dialog.querySelector("[data-cookie-marketing]").checked});banner.hidden=true;if(dialog.close)dialog.close();return;}
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
