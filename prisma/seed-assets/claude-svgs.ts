// Ilustraciones SVG propias para el curso de Claude (capturas anotadas de la
// interfaz + diagramas). Se guardan como imageAsset con mime image/svg+xml.
// Paleta de marca: AZUL #76B8E0, ORO #BE9B60, oscuro #1F1F1F, fondo #F8F7F4.

const FONT = "'Segoe UI', system-ui, Arial, sans-serif";

// Barra de ventana estilo app (con los tres puntos y el título).
function ventana(inner: string, alto = 640): string {
  return `
    <rect x="60" y="50" width="1080" height="${alto}" rx="20" fill="#ffffff" stroke="#e7e2d8" stroke-width="2"/>
    <path d="M60 70 a20 20 0 0 1 20 -20 h1040 a20 20 0 0 1 20 20 v34 h-1080 z" fill="#1F1F1F"/>
    <circle cx="92" cy="77" r="6" fill="#ff5f57"/>
    <circle cx="114" cy="77" r="6" fill="#febc2e"/>
    <circle cx="136" cy="77" r="6" fill="#28c840"/>
    <text x="176" y="83" fill="#ffffff" font-family="${FONT}" font-size="16" font-weight="600">Claude · claude.ai</text>
    ${inner}`;
}

// Globo de número (para señalar el paso).
function paso(x: number, y: number, n: number): string {
  return `
    <circle cx="${x}" cy="${y}" r="17" fill="#BE9B60"/>
    <text x="${x}" y="${y + 6}" text-anchor="middle" fill="#fff" font-family="${FONT}" font-size="19" font-weight="700">${n}</text>`;
}

// Etiqueta tipo "callout" con una flecha apuntando.
function nota(x: number, y: number, w: number, text: string): string {
  return `
    <rect x="${x}" y="${y}" width="${w}" height="56" rx="12" fill="#1F1F1F"/>
    <text x="${x + 20}" y="${y + 34}" fill="#ffffff" font-family="${FONT}" font-size="17">${text}</text>`;
}

// ===================================================================
// 1) Cómo adjuntar un archivo (PDF) en Claude
// ===================================================================
export const SVG_ADJUNTAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" font-family="${FONT}">
  <rect width="1200" height="760" fill="#F8F7F4"/>
  ${ventana(`
    <!-- respuesta previa (simulada) -->
    <text x="110" y="150" fill="#9a958c" font-family="${FONT}" font-size="17">Conversación con Claude</text>

    <!-- archivo adjuntado (chip) -->
    <rect x="150" y="470" width="360" height="58" rx="12" fill="#eef5fb" stroke="#76B8E0" stroke-width="2"/>
    <rect x="168" y="484" width="30" height="30" rx="5" fill="#e5342b"/>
    <text x="183" y="504" text-anchor="middle" fill="#fff" font-family="${FONT}" font-size="11" font-weight="700">PDF</text>
    <text x="212" y="497" fill="#1F1F1F" font-family="${FONT}" font-size="15" font-weight="600">COT-2026-0035.pdf</text>
    <text x="212" y="516" fill="#7d7a73" font-family="${FONT}" font-size="12">Cotización detallada · adjunta</text>

    <!-- caja de texto -->
    <rect x="150" y="548" width="900" height="96" rx="18" fill="#f4f2ee" stroke="#d9d4c9" stroke-width="2"/>
    <text x="232" y="602" fill="#9a958c" font-family="${FONT}" font-size="18">Escribe aquí lo que necesitas…</text>

    <!-- botón adjuntar resaltado -->
    <circle cx="192" cy="596" r="26" fill="none" stroke="#BE9B60" stroke-width="3" stroke-dasharray="5 5"/>
    <circle cx="192" cy="596" r="19" fill="#ffffff" stroke="#BE9B60" stroke-width="2.5"/>
    <!-- signo + (botón de adjuntar) -->
    <path d="M192 586 v20 M182 596 h20" fill="none" stroke="#BE9B60" stroke-width="2.8" stroke-linecap="round"/>

    <!-- botón enviar -->
    <circle cx="1008" cy="596" r="22" fill="#76B8E0"/>
    <path d="M1000 596 h16 M1010 590 l6 6 -6 6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>

    ${paso(214, 572, 1)}
    ${paso(330, 452, 2)}
    ${nota(250, 668, 560, "1. Haz clic en el botón +  para subir tu PDF")}
    <path d="M214 668 L200 616" stroke="#1F1F1F" stroke-width="2.5" fill="none" marker-end="url(#a)"/>
    <defs>
      <marker id="a" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
        <path d="M0 0 L6 3 L0 6 z" fill="#1F1F1F"/>
      </marker>
    </defs>
  `)}
  <text x="600" y="740" text-anchor="middle" fill="#7d7a73" font-family="${FONT}" font-size="14">Ilustración de la interfaz de Claude. Puede variar según actualizaciones.</text>
</svg>`;

// ===================================================================
// 2) Activar la búsqueda web
// ===================================================================
export const SVG_WEB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" font-family="${FONT}">
  <rect width="1200" height="760" fill="#F8F7F4"/>
  ${ventana(`
    <text x="110" y="150" fill="#9a958c" font-family="${FONT}" font-size="17">Conversación con Claude</text>

    <!-- caja de texto -->
    <rect x="150" y="470" width="900" height="150" rx="18" fill="#f4f2ee" stroke="#d9d4c9" stroke-width="2"/>
    <text x="176" y="512" fill="#4a4740" font-family="${FONT}" font-size="17">“¿Cuál es el caudal recomendado para una bomba de calor de 105.000 BTU?”</text>

    <!-- toggle búsqueda web resaltado -->
    <rect x="168" y="556" width="196" height="46" rx="23" fill="#eef5fb" stroke="#76B8E0" stroke-width="3"/>
    <circle cx="192" cy="579" r="12" fill="none" stroke="#2f6d99" stroke-width="2"/>
    <path d="M180 579 h24 M192 567 a18 12 0 0 1 0 24 a18 12 0 0 1 0 -24" fill="none" stroke="#2f6d99" stroke-width="1.6"/>
    <text x="216" y="585" fill="#2f6d99" font-family="${FONT}" font-size="16" font-weight="600">Búsqueda web</text>
    <rect x="322" y="569" width="34" height="20" rx="10" fill="#76B8E0"/>
    <circle cx="346" cy="579" r="8" fill="#ffffff"/>

    <!-- botón enviar -->
    <circle cx="1008" cy="579" r="22" fill="#76B8E0"/>
    <path d="M1000 579 h16 M1010 573 l6 6 -6 6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>

    ${paso(384, 556, 1)}
    ${nota(250, 656, 640, "1. Activa “Búsqueda web” y Claude consultará sitios en internet")}
    <path d="M320 656 L300 604" stroke="#1F1F1F" stroke-width="2.5" fill="none" marker-end="url(#b)"/>
    <defs>
      <marker id="b" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
        <path d="M0 0 L6 3 L0 6 z" fill="#1F1F1F"/>
      </marker>
    </defs>
  `)}
  <text x="600" y="740" text-anchor="middle" fill="#7d7a73" font-family="${FONT}" font-size="14">Ilustración de la interfaz de Claude. Verifica siempre los datos técnicos con la ficha oficial.</text>
</svg>`;

// ===================================================================
// 3) Diagrama de flujo: de la cotización al presupuesto y a la revisión
// ===================================================================
function docIcon(x: number, y: number, color: string, label: string): string {
  return `
    <rect x="${x}" y="${y}" width="150" height="180" rx="12" fill="#ffffff" stroke="${color}" stroke-width="2.5"/>
    <rect x="${x}" y="${y}" width="150" height="42" rx="12" fill="${color}"/>
    <rect x="${x}" y="${y + 24}" width="150" height="18" fill="${color}"/>
    <text x="${x + 75}" y="${y + 28}" text-anchor="middle" fill="#fff" font-family="${FONT}" font-size="15" font-weight="700">${label}</text>
    <line x1="${x + 22}" y1="${y + 74}" x2="${x + 128}" y2="${y + 74}" stroke="#d9d4c9" stroke-width="4" stroke-linecap="round"/>
    <line x1="${x + 22}" y1="${y + 98}" x2="${x + 128}" y2="${y + 98}" stroke="#d9d4c9" stroke-width="4" stroke-linecap="round"/>
    <line x1="${x + 22}" y1="${y + 122}" x2="${x + 100}" y2="${y + 122}" stroke="#d9d4c9" stroke-width="4" stroke-linecap="round"/>
    <line x1="${x + 22}" y1="${y + 146}" x2="${x + 128}" y2="${y + 146}" stroke="#d9d4c9" stroke-width="4" stroke-linecap="round"/>`;
}
function flecha(x1: number, x2: number, y: number): string {
  return `<path d="M${x1} ${y} H${x2}" stroke="#BE9B60" stroke-width="3.5" fill="none" marker-end="url(#fa)"/>`;
}
function claudeCaja(x: number, y: number): string {
  return `
    <rect x="${x}" y="${y}" width="150" height="180" rx="16" fill="#1F1F1F"/>
    <circle cx="${x + 75}" cy="${y + 70}" r="34" fill="none" stroke="#BE9B60" stroke-width="3"/>
    <path d="M${x + 60} ${y + 70} a15 15 0 1 1 8 13" fill="none" stroke="#BE9B60" stroke-width="3" stroke-linecap="round"/>
    <text x="${x + 75}" y="${y + 138}" text-anchor="middle" fill="#fff" font-family="${FONT}" font-size="17" font-weight="700">Claude</text>
    <text x="${x + 75}" y="${y + 160}" text-anchor="middle" fill="#BE9B60" font-family="${FONT}" font-size="12">tu asistente</text>`;
}

export const SVG_FLUJO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 460" font-family="${FONT}">
  <defs>
    <marker id="fa" markerWidth="12" markerHeight="12" refX="7" refY="4" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="#BE9B60"/>
    </marker>
  </defs>
  <rect width="1200" height="460" fill="#F8F7F4"/>
  <text x="600" y="56" text-anchor="middle" fill="#1F1F1F" font-family="${FONT}" font-size="26" font-weight="700">De la cotización al presupuesto final</text>

  ${docIcon(90, 120, "#76B8E0", "Cotización")}
  <text x="165" y="330" text-anchor="middle" fill="#4a4740" font-family="${FONT}" font-size="15">La subes en PDF</text>

  ${flecha(255, 355, 210)}

  ${claudeCaja(360, 120)}
  <text x="435" y="330" text-anchor="middle" fill="#4a4740" font-family="${FONT}" font-size="15">Le das el prompt</text>

  ${flecha(525, 625, 210)}

  ${docIcon(630, 120, "#BE9B60", "Presupuesto")}
  <text x="705" y="330" text-anchor="middle" fill="#4a4740" font-family="${FONT}" font-size="15">Ordenado y claro</text>

  ${flecha(795, 895, 210)}

  ${docIcon(900, 120, "#1F1F1F", "Revisión")}
  <text x="975" y="330" text-anchor="middle" fill="#4a4740" font-family="${FONT}" font-size="15">vs. contrato</text>

  <text x="600" y="410" text-anchor="middle" fill="#7d7a73" font-family="${FONT}" font-size="15">Tú revisas y apruebas cada paso: Claude ordena y calcula, tú confirmas cifras y condiciones.</text>
</svg>`;

// ===================================================================
// 6) Tour de la pantalla de Claude
// ===================================================================
export const SVG_INTERFAZ = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" font-family="${FONT}">
  <rect width="1200" height="800" fill="#F8F7F4"/>
  ${ventana(`
    <!-- barra lateral -->
    <rect x="60" y="104" width="240" height="586" fill="#f4f2ee"/>
    <rect x="82" y="130" width="196" height="40" rx="10" fill="#76B8E0"/>
    <text x="104" y="155" fill="#ffffff" font-family="${FONT}" font-size="15" font-weight="600">+  Chat nuevo</text>
    <text x="84" y="206" fill="#7d7a73" font-family="${FONT}" font-size="12" letter-spacing="1.5">RECIENTES</text>
    <rect x="82" y="220" width="196" height="30" rx="7" fill="#ece7dd"/>
    <text x="98" y="240" fill="#4a4740" font-family="${FONT}" font-size="13">Correo de seguimiento…</text>
    <rect x="82" y="256" width="196" height="30" rx="7" fill="#ffffff"/>
    <text x="98" y="276" fill="#7d7a73" font-family="${FONT}" font-size="13">Presupuesto casa…</text>
    <rect x="82" y="292" width="196" height="30" rx="7" fill="#ffffff"/>
    <text x="98" y="312" fill="#7d7a73" font-family="${FONT}" font-size="13">Explicar sauna…</text>

    <!-- área de conversación -->
    <rect x="360" y="150" width="470" height="60" rx="14" fill="#eef5fb"/>
    <text x="384" y="186" fill="#2f6d99" font-family="${FONT}" font-size="15">Tú: “Escríbeme un correo de seguimiento…”</text>
    <rect x="360" y="226" width="700" height="86" rx="14" fill="#ffffff" stroke="#e7e2d8" stroke-width="2"/>
    <text x="384" y="260" fill="#4a4740" font-family="${FONT}" font-size="15">Claude: “Claro, aquí tienes un borrador cálido y</text>
    <text x="384" y="284" fill="#4a4740" font-family="${FONT}" font-size="15">breve que puedes enviar…”</text>

    <!-- caja de texto -->
    <rect x="360" y="560" width="700" height="90" rx="18" fill="#f4f2ee" stroke="#d9d4c9" stroke-width="2"/>
    <text x="432" y="612" fill="#9a958c" font-family="${FONT}" font-size="17">Escribe aquí lo que necesitas…</text>
    <circle cx="395" cy="606" r="18" fill="#ffffff" stroke="#BE9B60" stroke-width="2.4"/>
    <path d="M395 597 v18 M386 606 h18" stroke="#BE9B60" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="1022" cy="606" r="20" fill="#76B8E0"/>
    <path d="M1014 606 h15 M1024 600 l6 6 -6 6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>

    ${paso(285, 150, 1)}
    ${paso(285, 235, 2)}
    ${paso(620, 668, 3)}
    ${paso(395, 668, 4)}
    ${paso(1022, 668, 5)}
  `, 700)}
  <text x="90" y="742" fill="#1F1F1F" font-family="${FONT}" font-size="15"><tspan font-weight="700">1</tspan>  Chat nuevo (empieza un tema)     <tspan font-weight="700">2</tspan>  Tus conversaciones recientes     <tspan font-weight="700">3</tspan>  Aquí escribes</text>
  <text x="90" y="770" fill="#1F1F1F" font-family="${FONT}" font-size="15"><tspan font-weight="700">4</tspan>  Botón + para adjuntar archivos     <tspan font-weight="700">5</tspan>  Botón para enviar tu mensaje</text>
</svg>`;

// ===================================================================
// 7) El método RAFA: Rol + Acción + Formato + Audiencia
// ===================================================================
function receta(y: number, color: string, titulo: string, desc: string): string {
  return `
    <rect x="120" y="${y}" width="960" height="80" rx="14" fill="#ffffff" stroke="${color}" stroke-width="2.5"/>
    <rect x="120" y="${y}" width="14" height="80" rx="7" fill="${color}"/>
    <text x="160" y="${y + 34}" fill="${color}" font-family="${FONT}" font-size="20" font-weight="700">${titulo}</text>
    <text x="160" y="${y + 60}" fill="#4a4740" font-family="${FONT}" font-size="16">${desc}</text>`;
}
export const SVG_RECETA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" font-family="${FONT}">
  <rect width="1200" height="700" fill="#F8F7F4"/>
  <text x="600" y="52" text-anchor="middle" fill="#1F1F1F" font-family="${FONT}" font-size="26" font-weight="700">El método RAFA para pedir bien</text>
  ${receta(80, "#76B8E0", "R — Rol", "Dile qué papel tome: “Actúa como asesor de Ambiente Azul…”.")}
  ${receta(172, "#BE9B60", "A — Acción", "Di exactamente qué quieres: un correo, un resumen, 3 ideas.")}
  ${receta(264, "#1F1F1F", "F — Formato", "Di cómo lo quieres: corto, en viñetas, tono formal, máx. 5 líneas.")}
  ${receta(356, "#3aa564", "A — Audiencia", "Para quién es: un cliente, un arquitecto, tu jefe.")}
  <rect x="120" y="470" width="960" height="180" rx="14" fill="#1F1F1F"/>
  <text x="150" y="506" fill="#9a958c" font-family="${FONT}" font-size="14" letter-spacing="1">EJEMPLO COMPLETO CON RAFA</text>
  <text x="150" y="540" font-family="${FONT}" font-size="16"><tspan fill="#76B8E0">Actúa como asesor de Ambiente Azul.</tspan> <tspan fill="#d8b877">Escríbeme un correo de seguimiento</tspan></text>
  <text x="150" y="568" font-family="${FONT}" font-size="16"><tspan fill="#ffffff">corto, cálido y de máximo 5 líneas,</tspan> <tspan fill="#7fd3a6">para un cliente que cotizó un spa</tspan></text>
  <text x="150" y="596" font-family="${FONT}" font-size="16"><tspan fill="#7fd3a6">hace 2 semanas y no ha respondido.</tspan></text>
  <text x="150" y="632" font-family="${FONT}" font-size="13" fill="#9a958c">Azul = Rol · Dorado = Acción · Blanco = Formato · Verde = Audiencia</text>
</svg>`;

// ===================================================================
// 8) Ciclo: Pide → Revisa → Ajusta
// ===================================================================
function cicloPaso(cx: number, color: string, n: string, titulo: string, desc: string): string {
  return `
    <circle cx="${cx}" cy="170" r="66" fill="#ffffff" stroke="${color}" stroke-width="4"/>
    <text x="${cx}" y="150" text-anchor="middle" fill="${color}" font-family="${FONT}" font-size="34" font-weight="800">${n}</text>
    <text x="${cx}" y="188" text-anchor="middle" fill="#1F1F1F" font-family="${FONT}" font-size="18" font-weight="700">${titulo}</text>
    <text x="${cx}" y="270" text-anchor="middle" fill="#4a4740" font-family="${FONT}" font-size="15">${desc}</text>`;
}
export const SVG_CICLO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 340" font-family="${FONT}">
  <defs>
    <marker id="ca" markerWidth="12" markerHeight="12" refX="7" refY="4" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="#BE9B60"/>
    </marker>
  </defs>
  <rect width="1200" height="340" fill="#F8F7F4"/>
  <text x="600" y="48" text-anchor="middle" fill="#1F1F1F" font-family="${FONT}" font-size="24" font-weight="700">Úsalo así, una y otra vez</text>
  ${cicloPaso(260, "#76B8E0", "1", "Pídelo", "Escríbele lo que necesitas.")}
  ${cicloPaso(600, "#BE9B60", "2", "Revísalo", "Lee lo que te dio.")}
  ${cicloPaso(940, "#1F1F1F", "3", "Ajústalo", "“Más corto”, “más formal”…")}
  <path d="M338 170 H524" stroke="#BE9B60" stroke-width="3.5" marker-end="url(#ca)"/>
  <path d="M678 170 H864" stroke="#BE9B60" stroke-width="3.5" marker-end="url(#ca)"/>
  <path d="M940 240 q-340 90 -680 0" fill="none" stroke="#BE9B60" stroke-width="3" stroke-dasharray="6 6" marker-end="url(#ca)"/>
  <text x="600" y="320" text-anchor="middle" fill="#7d7a73" font-family="${FONT}" font-size="14">Si no quedó perfecto, pídele el ajuste y repite. Toma segundos.</text>
</svg>`;

// ===================================================================
// 9) Checklist: antes de enviar
// ===================================================================
function check(y: number, text: string): string {
  return `
    <circle cx="180" cy="${y}" r="15" fill="#e9f5ec" stroke="#3aa564" stroke-width="2.5"/>
    <path d="M172 ${y} l6 6 l11 -12" fill="none" stroke="#3aa564" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="212" y="${y + 7}" fill="#2b2b2b" font-family="${FONT}" font-size="19">${text}</text>`;
}
export const SVG_CHECKLIST = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 560" font-family="${FONT}">
  <rect width="1200" height="560" fill="#F8F7F4"/>
  <rect x="120" y="60" width="960" height="440" rx="20" fill="#ffffff" stroke="#e7e2d8" stroke-width="2"/>
  <rect x="120" y="60" width="960" height="70" rx="20" fill="#BE9B60"/>
  <rect x="120" y="105" width="960" height="25" fill="#BE9B60"/>
  <text x="160" y="105" fill="#ffffff" font-family="${FONT}" font-size="24" font-weight="700">✓  Antes de enviar, revisa</text>
  ${check(190, "El nombre del cliente y los datos están correctos.")}
  ${check(250, "Los precios, plazos y garantías los verificaste tú.")}
  ${check(310, "No quedó ningún dato inventado ni “[por confirmar]”.")}
  ${check(370, "El tono va con la marca (AA: bienestar · DOM: detalle).")}
  ${check(430, "Lo leíste completo: dice lo que quieres decir.")}
</svg>`;

// ===================================================================
// 10) Privacidad: qué SÍ y qué NO pegar
// ===================================================================
export const SVG_PRIVACIDAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 560" font-family="${FONT}">
  <rect width="1200" height="560" fill="#F8F7F4"/>
  <text x="600" y="56" text-anchor="middle" fill="#1F1F1F" font-family="${FONT}" font-size="26" font-weight="700">Cuida la información</text>

  <!-- SÍ -->
  <rect x="90" y="100" width="480" height="400" rx="18" fill="#ffffff" stroke="#3aa564" stroke-width="2.5"/>
  <rect x="90" y="100" width="480" height="64" rx="18" fill="#3aa564"/>
  <rect x="90" y="140" width="480" height="24" fill="#3aa564"/>
  <text x="330" y="142" text-anchor="middle" fill="#ffffff" font-family="${FONT}" font-size="22" font-weight="700">✓  Puedes pegar</text>
  <text x="120" y="212" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Textos generales para mejorar redacción</text>
  <text x="120" y="256" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Fichas técnicas públicas</text>
  <text x="120" y="300" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Preguntas e ideas</text>
  <text x="120" y="344" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Borradores sin datos privados</text>
  <text x="120" y="388" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Documentos con los datos ya borrados</text>

  <!-- NO -->
  <rect x="630" y="100" width="480" height="400" rx="18" fill="#ffffff" stroke="#d9534f" stroke-width="2.5"/>
  <rect x="630" y="100" width="480" height="64" rx="18" fill="#d9534f"/>
  <rect x="630" y="140" width="480" height="24" fill="#d9534f"/>
  <text x="870" y="142" text-anchor="middle" fill="#ffffff" font-family="${FONT}" font-size="22" font-weight="700">✕  No pegues</text>
  <text x="660" y="212" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Cédulas, teléfonos, correos privados</text>
  <text x="660" y="256" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Precios internos, márgenes, descuentos</text>
  <text x="660" y="300" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Contratos y documentos legales</text>
  <text x="660" y="344" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Cifras internas de la empresa</text>
  <text x="660" y="388" fill="#2b2b2b" font-family="${FONT}" font-size="18">• Condiciones comerciales confidenciales</text>

  <text x="600" y="540" text-anchor="middle" fill="#7d7a73" font-family="${FONT}" font-size="15">Ante la duda, no lo pegues. Trabaja con datos genéricos y al final tú pones lo real.</text>
</svg>`;

// ===================================================================
// 5) Crear un Proyecto en Claude (espacio de trabajo)
// ===================================================================
export const SVG_PROYECTO = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760" font-family="${FONT}">
  <rect width="1200" height="760" fill="#F8F7F4"/>
  ${ventana(`
    <!-- barra lateral -->
    <rect x="60" y="104" width="250" height="586" fill="#f4f2ee"/>
    <rect x="82" y="132" width="206" height="40" rx="10" fill="#76B8E0"/>
    <text x="104" y="157" fill="#ffffff" font-family="${FONT}" font-size="15" font-weight="600">+  Chat nuevo</text>
    <text x="84" y="212" fill="#7d7a73" font-family="${FONT}" font-size="12" letter-spacing="1.5">PROYECTOS</text>
    <!-- botón proyecto nuevo resaltado -->
    <rect x="80" y="228" width="210" height="42" rx="10" fill="#ffffff" stroke="#BE9B60" stroke-width="3"/>
    <text x="102" y="255" fill="#1F1F1F" font-family="${FONT}" font-size="15" font-weight="600">+  Proyecto nuevo</text>
    <rect x="82" y="284" width="206" height="32" rx="8" fill="#ece7dd"/>
    <text x="104" y="305" fill="#4a4740" font-family="${FONT}" font-size="14" font-weight="600">Cotizaciones</text>
    <rect x="82" y="320" width="206" height="32" rx="8" fill="#ffffff"/>
    <text x="104" y="341" fill="#7d7a73" font-family="${FONT}" font-size="14">Seguimiento de clientes</text>
    <rect x="82" y="356" width="206" height="32" rx="8" fill="#ffffff"/>
    <text x="104" y="377" fill="#7d7a73" font-family="${FONT}" font-size="14">Correos y propuestas</text>

    <!-- panel del proyecto -->
    <text x="346" y="150" fill="#1F1F1F" font-family="${FONT}" font-size="24" font-weight="700">Proyecto: Cotizaciones</text>
    <text x="346" y="180" fill="#7d7a73" font-family="${FONT}" font-size="15">Un proyecto por tema: aquí vive TODO lo de las cotizaciones.</text>

    <rect x="346" y="210" width="360" height="180" rx="14" fill="#ffffff" stroke="#e7e2d8" stroke-width="2"/>
    <text x="368" y="246" fill="#BE9B60" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="1">INSTRUCCIONES</text>
    <text x="368" y="276" fill="#4a4740" font-family="${FONT}" font-size="14">Cómo quieres que Claude te</text>
    <text x="368" y="298" fill="#4a4740" font-family="${FONT}" font-size="14">responda siempre (tono, empresa,</text>
    <text x="368" y="320" fill="#4a4740" font-family="${FONT}" font-size="14">estilo). Se escribe una sola vez.</text>

    <rect x="726" y="210" width="360" height="180" rx="14" fill="#ffffff" stroke="#e7e2d8" stroke-width="2"/>
    <text x="748" y="246" fill="#76B8E0" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="1">ARCHIVOS</text>
    <text x="748" y="276" fill="#4a4740" font-family="${FONT}" font-size="14">Documentos que usas siempre</text>
    <text x="748" y="298" fill="#4a4740" font-family="${FONT}" font-size="14">(plantillas, listas). Quedan a la</text>
    <text x="748" y="320" fill="#4a4740" font-family="${FONT}" font-size="14">mano en todas las conversaciones.</text>

    ${paso(300, 249, 1)}
    ${nota(346, 440, 760, "1. Crea un proyecto por cada tema (Cotizaciones, Seguimiento…)")}
    <path d="M470 440 L300 292" stroke="#1F1F1F" stroke-width="2.5" fill="none" marker-end="url(#p)"/>
    <defs>
      <marker id="p" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
        <path d="M0 0 L6 3 L0 6 z" fill="#1F1F1F"/>
      </marker>
    </defs>
  `)}
  <text x="600" y="740" text-anchor="middle" fill="#7d7a73" font-family="${FONT}" font-size="14">Ilustración de la interfaz de Claude. Crea un proyecto por cada tema y trabaja dentro de él.</text>
</svg>`;

// ===================================================================
// 4) Materiales DOM (piezas/acabados) — para el módulo de DOM Design
// ===================================================================
export const SVG_DOM = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" font-family="${FONT}">
  <defs>
    <pattern id="mosaico" width="34" height="34" patternUnits="userSpaceOnUse">
      <rect width="34" height="34" fill="#4a86a8"/>
      <rect width="15" height="15" x="1" y="1" rx="2" fill="#5f9dbf"/>
      <rect width="15" height="15" x="18" y="1" rx="2" fill="#3d7594"/>
      <rect width="15" height="15" x="1" y="18" rx="2" fill="#3d7594"/>
      <rect width="15" height="15" x="18" y="18" rx="2" fill="#68a9cb"/>
    </pattern>
    <linearGradient id="porcel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#efe6d2"/>
      <stop offset="0.5" stop-color="#e3d7bd"/>
      <stop offset="1" stop-color="#efe6d2"/>
    </linearGradient>
    <linearGradient id="piedra" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8d8477"/>
      <stop offset="1" stop-color="#6f665a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="500" fill="#1F1F1F"/>
  <text x="600" y="64" text-anchor="middle" fill="#EFE6D2" font-family="${FONT}" font-size="26" font-weight="700">Los detalles definen el resultado</text>
  <text x="600" y="98" text-anchor="middle" fill="#BE9B60" font-family="${FONT}" font-size="16" letter-spacing="3">DOM · MATERIALES PARA ZONAS HÚMEDAS</text>

  <!-- mosaico -->
  <rect x="120" y="150" width="270" height="230" rx="14" fill="url(#mosaico)"/>
  <rect x="120" y="340" width="270" height="40" rx="0" fill="#1F1F1F" opacity="0.55"/>
  <text x="255" y="367" text-anchor="middle" fill="#EFE6D2" font-family="${FONT}" font-size="18" font-weight="600">Mosaico</text>

  <!-- porcelanato -->
  <rect x="465" y="150" width="270" height="230" rx="14" fill="url(#porcel)"/>
  <path d="M465 220 H735 M465 300 H735 M600 150 V380" stroke="#cdbf9e" stroke-width="2" opacity="0.7"/>
  <rect x="465" y="340" width="270" height="40" fill="#1F1F1F" opacity="0.55"/>
  <text x="600" y="367" text-anchor="middle" fill="#EFE6D2" font-family="${FONT}" font-size="18" font-weight="600">Porcelanato</text>

  <!-- piedra -->
  <rect x="810" y="150" width="270" height="230" rx="14" fill="url(#piedra)"/>
  <path d="M810 200 q60 -18 130 0 t140 6 M810 260 q70 16 140 -2 t130 4 M810 320 q60 -14 140 2 t130 -4" stroke="#5a5248" stroke-width="3" fill="none" opacity="0.6"/>
  <rect x="810" y="340" width="270" height="40" fill="#1F1F1F" opacity="0.55"/>
  <text x="945" y="367" text-anchor="middle" fill="#EFE6D2" font-family="${FONT}" font-size="18" font-weight="600">Piedra natural</text>

  <text x="600" y="440" text-anchor="middle" fill="#9a958c" font-family="${FONT}" font-size="15">Textura, borde y acabado: cada elección cambia cómo se ve y se siente el espacio.</text>
</svg>`;

// ===================================================================
// 11) Conectores: herramientas externas (Gmail, Drive, Calendar…)
// ===================================================================
function conector(y: number, color: string, nombre: string, estado: "conectado" | "conectar"): string {
  const on = estado === "conectado";
  return `
    <rect x="150" y="${y}" width="900" height="64" rx="12" fill="#ffffff" stroke="#e7e2d8" stroke-width="2"/>
    <rect x="172" y="${y + 16}" width="32" height="32" rx="7" fill="${color}"/>
    <text x="224" y="${y + 40}" fill="#1F1F1F" font-family="${FONT}" font-size="17" font-weight="600">${nombre}</text>
    <rect x="900" y="${y + 15}" width="128" height="34" rx="17" fill="${on ? "#e9f5ec" : "#eef5fb"}" stroke="${on ? "#3aa564" : "#76B8E0"}" stroke-width="2"/>
    <text x="964" y="${y + 37}" text-anchor="middle" fill="${on ? "#2b8a55" : "#2f6d99"}" font-family="${FONT}" font-size="14" font-weight="600">${on ? "✓ Conectado" : "Conectar"}</text>`;
}
export const SVG_CONECTORES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" font-family="${FONT}">
  <rect width="1200" height="720" fill="#F8F7F4"/>
  ${ventana(`
    <text x="150" y="150" fill="#1F1F1F" font-family="${FONT}" font-size="24" font-weight="700">Configuración · Conectores</text>
    <text x="150" y="180" fill="#7d7a73" font-family="${FONT}" font-size="15">Conecta Claude con tus herramientas para que las use por ti.</text>
    ${conector(210, "#2f6d99", "Google Drive", "conectar")}
    ${conector(288, "#d9534f", "Gmail", "conectado")}
    ${conector(366, "#3a86c8", "Google Calendar", "conectar")}
    ${conector(444, "#4a154b", "Slack", "conectar")}
    ${paso(1028, 305, 1)}
    ${nota(150, 560, 720, "1. Pulsa “Conectar”, inicia sesión y autoriza el acceso")}
    <path d="M300 560 L940 340" stroke="#1F1F1F" stroke-width="2.5" fill="none" marker-end="url(#cx)"/>
    <defs>
      <marker id="cx" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
        <path d="M0 0 L6 3 L0 6 z" fill="#1F1F1F"/>
      </marker>
    </defs>
  `)}
  <text x="600" y="742" text-anchor="middle" fill="#7d7a73" font-family="${FONT}" font-size="14">Ilustración de la interfaz de Claude. Los conectores disponibles dependen de tu plan.</text>
</svg>`;
