(function(){
  "use strict";
  // Formulario «Cuéntanos tu reto» (#/diagnostico).
  // Cada botón de la web enlaza con #/diagnostico?tema=<clave>. El tema se envía
  // en el campo «origen» para saber desde qué página llega cada solicitud y, en
  // algunos casos, adapta el texto de ayuda del formulario.
  var TOPICS={
    "cabecera":{origen:"Botón de la cabecera"},
    "menu-movil":{origen:"Menú móvil"},
    "contacto":{origen:"Bloque de contacto común"},
    "pie":{origen:"Pie de página"},
    "inicio":{origen:"Inicio · portada"},
    "inicio-cierre":{origen:"Inicio · bloque final"},
    "a-medida":{origen:"Formación a medida"},
    "programas":{origen:"Buscador de programas"},
    "quienes-somos":{origen:"Quiénes somos"},
    "supply-chain":{origen:"Área Supply Chain y Logística",label:"Supply Chain y Logística"},
    "compras":{origen:"Área Compras y Category Management",label:"Compras y Category Management"},
    "transporte":{origen:"Área Transporte y Distribución",label:"Transporte y Distribución"},
    "comercio-internacional":{origen:"Área Comercio Internacional",label:"Comercio Internacional"},
    "ia-datos":{origen:"Área IA, Datos y Digitalización",label:"IA, Datos y Digitalización"},
    "liderazgo":{origen:"Área Liderazgo y Gestión de Equipos",label:"Liderazgo y Gestión de Equipos"},
    "de-jefe-a-lider":{origen:"Programa «De jefe a líder»",label:"Programa «De jefe a líder»",
      placeholder:"Por ejemplo: queremos el programa para 12 mandos intermedios de almacén; nos preocupa que todo sube a dirección y que los jefes de turno no saben dar feedback."},
    "fundae":{origen:"FUNDAE · validar crédito",label:"Validar mi crédito FUNDAE",
      placeholder:"Por ejemplo: somos 120 personas, no sabemos cuánto crédito FUNDAE nos queda este año y queremos formar al equipo de almacén."},
    "universitarios":{origen:"Cursos universitarios (USAL)",label:"Curso universitario en mi empresa",
      placeholder:"Por ejemplo: queremos organizar un curso universitario de 25 h para unas 18 personas de compras y logística. ¿Qué temas encajan?"},
    "obligatorias":{origen:"Logístikos al día · formaciones obligatorias",label:"Revisión de formaciones obligatorias",
      placeholder:"Por ejemplo: tenemos carretilleros, conductores y personal de almacén; no tenemos claro qué reciclajes nos tocan este año."}
  };
  function currentTopic(){
    var h=location.hash||"",q=h.indexOf("?");
    if(h.indexOf("#/diagnostico")!==0||q<0)return null;
    var key=new URLSearchParams(h.slice(q+1)).get("tema");
    return key&&TOPICS[key]?{key:key,data:TOPICS[key]}:null;
  }
  function applyTopic(){
    var form=document.querySelector("[data-diagnostic-form]");
    if(!form)return;
    var t=currentTopic();
    var origin=form.querySelector("[data-diagnostic-origin]");
    if(origin)origin.value="Web Logístikos · Cuéntanos tu reto"+(t?" · "+t.data.origen:"");
    var chip=document.querySelector("[data-diagnostic-topic]");
    if(chip){
      if(t&&t.data.label){chip.textContent="Tema: "+t.data.label;chip.hidden=false;}
      else{chip.textContent="";chip.hidden=true;}
    }
    var problem=form.querySelector("[data-diagnostic-problem]");
    if(problem&&t&&t.data.placeholder)problem.placeholder=t.data.placeholder;
  }
  function later(){requestAnimationFrame(applyTopic);}
  window.addEventListener("hashchange",later);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",later);else later();

  function getConfig(){return window.LOGISTIKOS_FORMS&&window.LOGISTIKOS_FORMS.diagnostico?window.LOGISTIKOS_FORMS.diagnostico:null;}
  document.addEventListener("submit",async function(event){
    var form=event.target.closest("[data-diagnostic-form]");
    if(!form)return;
    event.preventDefault();
    applyTopic();
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
    if(status){status.textContent="Enviando tu reto…";status.dataset.tone="";}
    try{
      var response=await fetch(config.endpoint,{method:config.method||"POST",headers:Object.assign({"Content-Type":"application/json"},config.headers||{}),body:JSON.stringify(payload)});
      if(!response.ok)throw new Error("HTTP "+response.status);
      form.hidden=true;
      var success=form.parentElement.querySelector("[data-diagnostic-success]");
      if(success)success.hidden=false;
    }catch(error){
      if(status){status.textContent="No hemos podido enviar tu reto. Inténtalo de nuevo o escríbenos a formacion@logistikos.es.";status.dataset.tone="error";}
    }finally{if(button)button.disabled=false;}
  });
})();
