(function(){
  "use strict";
  function getConfig(){return window.LOGISTIKOS_FORMS&&window.LOGISTIKOS_FORMS.diagnostico?window.LOGISTIKOS_FORMS.diagnostico:null;}
  document.addEventListener("submit",async function(event){
    var form=event.target.closest("[data-diagnostic-form]");
    if(!form)return;
    event.preventDefault();
    var status=form.querySelector("[data-diagnostic-status]");
    var button=form.querySelector('button[type="submit"]');
    if(!form.checkValidity()){
      if(status){status.textContent="Revisa los campos obligatorios antes de enviar.";status.dataset.tone="error";}
      form.reportValidity();
      return;
    }
    var config=getConfig();
    if(!config||!config.endpoint){
      if(status){status.textContent="Formulario preparado. Falta conectar el endpoint de envío para recibir las respuestas.";status.dataset.tone="error";}
      return;
    }
    var payload=Object.fromEntries(new FormData(form).entries());
    if(button)button.disabled=true;
    if(status){status.textContent="Enviando solicitud…";status.dataset.tone="";}
    try{
      var response=await fetch(config.endpoint,{method:config.method||"POST",headers:Object.assign({"Content-Type":"application/json"},config.headers||{}),body:JSON.stringify(payload)});
      if(!response.ok)throw new Error("HTTP "+response.status);
      form.hidden=true;
      var success=form.parentElement.querySelector("[data-diagnostic-success]");
      if(success)success.hidden=false;
    }catch(error){
      if(status){status.textContent="No hemos podido enviar la solicitud. Inténtalo de nuevo o contacta con Logístikos.";status.dataset.tone="error";}
    }finally{if(button)button.disabled=false;}
  });
})();
