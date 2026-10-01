(function(){
  "use strict";
  var activeFilter="upcoming";
  function cards(){return Array.from(document.querySelectorAll("[data-webinar-event]"));}
  function classify(card){var d=new Date(card.getAttribute("data-event-date"));return d.getTime()<Date.now()?"past":"upcoming";}
  function getConfig(){return window.LOGISTIKOS_FORMS&&window.LOGISTIKOS_FORMS.webinar?window.LOGISTIKOS_FORMS.webinar:null;}
  function applyFilter(filter){
    activeFilter=filter;
    var visible=0;
    cards().forEach(function(card){
      var state=classify(card),show=state===filter;card.hidden=!show;if(show)visible++;
      var button=card.querySelector("[data-webinar-register]"),badge=card.querySelector(".webinar-status");
      if(button){button.disabled=state==="past";button.textContent=state==="past"?"Finalizado":"Inscribirme ↗";}
      if(badge)badge.textContent=state==="past"?"Finalizada":"Plazas limitadas";
    });
    document.querySelectorAll("[data-webinar-filter]").forEach(function(btn){var on=btn.dataset.webinarFilter===filter;btn.classList.toggle("is-active",on);btn.setAttribute("aria-selected",String(on));});
    var empty=document.querySelector("[data-webinar-empty]");if(empty)empty.hidden=visible!==0;
  }
  document.addEventListener("click",function(e){
    var tab=e.target.closest("[data-webinar-filter]");if(tab){applyFilter(tab.dataset.webinarFilter);return;}
    var register=e.target.closest("[data-webinar-register]");if(register){
      var card=register.closest("[data-webinar-event]"),modal=document.querySelector("[data-webinar-modal]");if(!card||!modal)return;
      var title=card.dataset.eventTitle||"Webinar Logístikos";
      var label=modal.querySelector("[data-webinar-modal-event]"),field=modal.querySelector("[data-webinar-title-field]");
      if(label)label.textContent=title;if(field)field.value=title;
      var status=modal.querySelector("[data-webinar-status]");if(status){status.textContent="";status.dataset.tone="";}
      if(typeof modal.showModal==="function")modal.showModal();else modal.setAttribute("open","");return;
    }
    var close=e.target.closest("[data-webinar-close]");if(close){var m=close.closest("dialog");if(m&&m.close)m.close();return;}
  });
  document.addEventListener("submit",async function(e){
    var form=e.target.closest("[data-webinar-form]");if(!form)return;e.preventDefault();
    var status=form.querySelector("[data-webinar-status]");
    var button=form.querySelector('button[type="submit"]');
    if(!form.checkValidity()){if(status){status.textContent="Revisa los campos obligatorios antes de enviar.";status.dataset.tone="error";}form.reportValidity();return;}
    var config=getConfig();
    if(!config||!config.endpoint){if(status){status.textContent="Formulario preparado. Falta activar el servicio de envío.";status.dataset.tone="error";}return;}
    var data=Object.fromEntries(new FormData(form).entries());
    if(button)button.disabled=true;
    if(status){status.textContent="Enviando inscripción…";status.dataset.tone="";}
    try{
      var response=await fetch(config.endpoint,{method:config.method||"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      var result=await response.json().catch(function(){return {};});
      if(!response.ok)throw new Error(result.error||("HTTP "+response.status));
      var webinar=data.webinar;
      form.reset();
      var hidden=form.querySelector("[data-webinar-title-field]");if(hidden)hidden.value=webinar||"";
      if(status){status.textContent="Inscripción enviada correctamente. Te contactaremos con la información de acceso.";status.dataset.tone="ok";}
    }catch(error){
      if(status){status.textContent="No hemos podido enviar la inscripción. Inténtalo de nuevo.";status.dataset.tone="error";}
    }finally{if(button)button.disabled=false;}
  });
  window.addEventListener("hashchange",function(){if(location.hash.indexOf("#/webinar")===0)setTimeout(function(){applyFilter(activeFilter);},0);});
  document.addEventListener("DOMContentLoaded",function(){if(location.hash.indexOf("#/webinar")===0)applyFilter(activeFilter);});
})();
