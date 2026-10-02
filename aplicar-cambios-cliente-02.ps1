$uniPath = Require-File 'pages/universitarios.html'
$uniHtml = Read-Utf8 $uniPath
$uniHtml = $uniHtml.Replace(
  'También podemos diseñarlo a medida con el mismo diploma.',
  'También podemos diseñarlo a medida con diploma universitario.'
)
Write-Utf8 $uniPath $uniHtml

# 3) WEBINAR - fotos homogéneas para Mireia, Mamen y Javier.
$webinarPath = Require-File 'pages/webinar.html'
$webinarHtml = Read-Utf8 $webinarPath

$oldMamen = '<div class="webinar-speaker webinar-speaker--no-photo"><div><span>Ponente</span><strong>Mamen Fernández Díez de los Ríos</strong><small>CEO de Human Balance · Autora de «Liderar sin amargar»</small></div></div>'
$newMamen = '<div class="webinar-speaker"><img src="assets/images/mamen-fernandez-diez-de-los-rios.png" alt="Mamen Fernández Díez de los Ríos"><div><span>Ponente</span><strong>Mamen Fernández Díez de los Ríos</strong><small>CEO de Human Balance · Autora de «Liderar sin amargar»</small></div></div>'
$webinarHtml = $webinarHtml.Replace($oldMamen, $newMamen)

$oldJavier = '<div class="webinar-speaker webinar-speaker--no-photo"><div><span>Ponente</span><strong>Javier Fernández Díez de los Ríos</strong><small>Economista · Director de Logístikos · Especialista en logística y comercio internacional</small></div></div>'
$newJavier = '<div class="webinar-speaker"><img src="assets/images/javier-fernandez-diez-de-los-rios.jpeg" alt="Javier Fernández Díez de los Ríos"><div><span>Ponente</span><strong>Javier Fernández Díez de los Ríos</strong><small>Economista · Director de Logístikos · Especialista en logística y comercio internacional</small></div></div>'
$webinarHtml = $webinarHtml.Replace($oldJavier, $newJavier)

Write-Utf8 $webinarPath $webinarHtml

# 4) QUIENES SOMOS - agregar Sonia, Miguel y Mamen si aun no existen.
$aboutPath = Require-File 'pages/quienes-somos.html'
$aboutHtml = Read-Utf8 $aboutPath

if ($aboutHtml -notmatch '>Sonia Montagud<') {
$anchor = @'
            <div><dt>Beneficio para la empresa</dt><dd>Procesos más rápidos y con menos errores, ahorro de horas medible y una implantación de la IA con criterio, no a base de pruebas.</dd></div>
          </dl>
        </article>
      </div>
'@

  if (-not $aboutHtml.Contains($anchor)) {
    throw 'No se encontro el final de la tarjeta de Mireia en pages/quienes-somos.html.'
  }

$extra = @'
            <div><dt>Beneficio para la empresa</dt><dd>Procesos más rápidos y con menos errores, ahorro de horas medible y una implantación de la IA con criterio, no a base de pruebas.</dd></div>
          </dl>
        </article>
        <article class="trainer-card" data-about-reveal>
          <div class="trainer-top">
            <figure class="trainer-photo-wrap">
              <img class="trainer-photo trainer-photo--sonia" src="assets/images/sonia-montagud.png" alt="Sonia Montagud" loading="lazy" decoding="async">
              <span class="trainer-number" aria-hidden="true">06</span>
            </figure>
            <div class="trainer-body trainer-intro">
              <p class="trainer-kicker">ESTRATEGIA DE NEGOCIO · TECNOLOGÍA · LIDERAZGO</p>
              <h3>Sonia Montagud</h3>
              <p class="trainer-role">Founder - Virtual Mentor</p>
            </div>
          </div>
          <dl class="trainer-facts">
            <div><dt>Especialidad</dt><dd>Estrategia de negocio, tecnología y liderazgo para empresas que quieren funcionar mejor.</dd></div>
            <div><dt>Perfil</dt><dd>Ingeniera Informática, Máster en Ingeniería del Software, Máster en Administración de Startups, Doctoranda en IA aplicada a negocio y titulada universitaria en Coaching Dialógico.</dd></div>
            <div><dt>En una frase</dt><dd>Aporto experiencia, conocimiento contrastado y una visión actual de negocio, tecnología y personas para transformar problemas complejos en decisiones claras y nuevas formas de actuar que os acerquen a vuestros objetivos.</dd></div>
            <div><dt>Beneficio para el trabajador</dt><dd>Más claridad para decidir, priorizar y actuar con autonomía. Mejores herramientas para resolver problemas.</dd></div>
            <div><dt>Beneficio para la empresa</dt><dd>Decisiones más ágiles, mejor coordinación y menos tiempo perdido en problemas recurrentes. Aumento de la productividad.</dd></div>
          </dl>
        </article>
        <article class="trainer-card" data-about-reveal>
          <div class="trainer-top">
            <figure class="trainer-photo-wrap">
              <img class="trainer-photo trainer-photo--miguel" src="assets/images/miguel-egea-gomez.png" alt="Miguel Egea Gómez" loading="lazy" decoding="async">
              <span class="trainer-number" aria-hidden="true">07</span>
            </figure>
            <div class="trainer-body trainer-intro">
              <p class="trainer-kicker">DATOS · INTELIGENCIA ARTIFICIAL · BUSINESS INTELLIGENCE</p>
              <h3>Miguel Egea Gómez</h3>
              <p class="trainer-role">Data &amp; AI Technical Lead en Altia · Once veces Microsoft MVP</p>
            </div>
          </div>
          <dl class="trainer-facts">
            <div><dt>Especialidad</dt><dd>Datos, inteligencia artificial y Business Intelligence aplicados a la empresa: cuadros de mando con Power BI, bases de datos SQL Server y análisis de datos para la toma de decisiones. Más de 25 años en el sector, reconocido por Microsoft como uno de los profesionales de referencia en datos y ponente habitual en conferencias del ecosistema Microsoft.</dd></div>
            <div><dt>Problema y solución</dt><dd>Muchas empresas tienen sus datos repartidos entre el ERP, el SGA y decenas de Excel, y deciden por intuición porque nadie los cruza. En la formación conectamos esos datos, construimos los indicadores que importan y aprendemos a usar la IA para analizarlos y anticiparse.</dd></div>
            <div><dt>Beneficio para el trabajador</dt><dd>Deja de perder horas preparando informes y sabe convertir los datos de su operación en conclusiones útiles.</dd></div>
            <div><dt>Beneficio para la empresa</dt><dd>Indicadores fiables y actualizados, decisiones más rápidas basadas en datos y un uso real de la IA sin depender de terceros.</dd></div>
          </dl>
        </article>
        <article class="trainer-card" data-about-reveal>
          <div class="trainer-top">
            <figure class="trainer-photo-wrap">
              <img class="trainer-photo trainer-photo--mamen" src="assets/images/mamen-fernandez-diez-de-los-rios.png" alt="Mamen Fernández Díez de los Ríos" loading="lazy" decoding="async">
              <span class="trainer-number" aria-hidden="true">08</span>
            </figure>
            <div class="trainer-body trainer-intro">
              <p class="trainer-kicker">LIDERAZGO · DIRECCIÓN COMPASIVA · GESTIÓN DEL ESTRÉS</p>
              <h3>Mamen Fernández Díez de los Ríos</h3>
              <p class="trainer-role">CEO de Human Balance · Autora de «Liderar sin amargar: Manual de Dirección compasiva»</p>
            </div>
          </div>
          <dl class="trainer-facts">
            <div><dt>Especialidad</dt><dd>Liderazgo de equipos, dirección compasiva y gestión del estrés con mindfulness, aplicados a mandos intermedios y equipos de operaciones que trabajan bajo presión.</dd></div>
            <div><dt>Problema y solución</dt><dd>En logística, muchos mandos llegan al puesto por su conocimiento técnico, no por su manera de dirigir personas, y la presión diaria acaba en tensión, conflictos y rotación. En la formación aprendemos a liderar con exigencia y sin desgastar al equipo, a gestionar el estrés propio y a manejar las conversaciones difíciles.</dd></div>
            <div><dt>Beneficio para el trabajador</dt><dd>Gestiona mejor la presión y su propio estrés, y aprende a dirigir a su equipo con más calma y menos conflictos.</dd></div>
            <div><dt>Beneficio para la empresa</dt><dd>Mejor clima en los equipos, menos rotación y absentismo, y mandos que obtienen resultados sin quemar a las personas.</dd></div>
          </dl>
        </article>
      </div>
'@

  $aboutHtml = $aboutHtml.Replace($anchor, $extra)
}

$aboutHtml = $aboutHtml.Replace('países donde hemos formado equipos', 'países donde estamos formando equipos')
Write-Utf8 $aboutPath $aboutHtml

# 5) CSS - 3 columnas escritorio, 2 tablet, 1 movil; ultima fila de 2 centrada.
$cssPath = Require-File 'assets/css/nosotros.css'
$cssHtml = Read-Utf8 $cssPath

$cssHtml = [regex]::Replace(
  $cssHtml,
  '\.about-trainers-grid>\.trainer-card:nth-child\(4\)\{grid-column:2/span 2\}\s*\.about-trainers-grid>\.trainer-card:nth-child\(5\)\{grid-column:4/span 2\}',
  '.about-trainers-grid>.trainer-card:nth-child(7){grid-column:2/span 2}' + [Environment]::NewLine + '.about-trainers-grid>.trainer-card:nth-child(8){grid-column:4/span 2}'
)

$cssHtml = $cssHtml.Replace(
  '.about-trainers-grid>.trainer-card,.about-trainers-grid>.trainer-card:nth-child(4),.about-trainers-grid>.trainer-card:nth-child(5){grid-column:auto}',
  '.about-trainers-grid>.trainer-card,.about-trainers-grid>.trainer-card:nth-child(7),.about-trainers-grid>.trainer-card:nth-child(8){grid-column:auto}'
)

if ($cssHtml -notmatch 'trainer-photo--sonia') {
  $cssHtml += "`r`n.trainer-photo--sonia{object-position:center 18%}`r`n.trainer-photo--miguel{object-position:center center}`r`n.trainer-photo--mamen{object-position:center 18%}`r`n"
}

