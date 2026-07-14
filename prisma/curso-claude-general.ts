import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  SVG_INTERFAZ,
  SVG_RECETA,
  SVG_CICLO,
  SVG_PROYECTO,
  SVG_ADJUNTAR,
  SVG_WEB,
  SVG_CHECKLIST,
  SVG_PRIVACIDAD,
  SVG_CONECTORES,
} from "./seed-assets/claude-svgs";

// Crea (o REEMPLAZA) el curso GENERAL "Claude para el Día a Día" como BORRADOR.
// Es para TODOS los empleados (categoría INDUCCION → visible para todos), con
// ejemplos genéricos (no de ventas). Reutiliza las ilustraciones del otro curso.

const connectionString = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});
const prisma = new PrismaClient({ adapter });

const CURSO_TITLE = "Claude para el Día a Día";

async function svgImg(svg: string, name: string): Promise<string> {
  const data = Buffer.from(svg, "utf8");
  const a = await prisma.imageAsset.create({
    data: { name, mime: "image/svg+xml", size: data.length, data },
  });
  return `/api/imagenes/${a.id}`;
}

type Block = Record<string, unknown>;
const h = (text: string): Block => ({ type: "heading", text });
const p = (text: string): Block => ({ type: "paragraph", text });
const list = (items: string[]): Block => ({ type: "list", items });
const info = (text: string): Block => ({ type: "callout", style: "info", text });
const tip = (text: string): Block => ({ type: "callout", style: "tip", text });
const warn = (text: string): Block => ({ type: "callout", style: "warning", text });
const image = (url: string, caption: string): Block => ({ type: "image", url, caption });
const table = (headers: string[], rows: string[][]): Block => ({ type: "table", headers, rows });
const prompt = (text: string, label?: string): Block =>
  label ? { type: "prompt", text, label } : { type: "prompt", text };

type Leccion = { title: string; durationMin: number; blocks: Block[] };
type Pregunta = {
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: string[];
  correctAnswer: number;
  explanation: string;
};
type Examen = { title: string; description: string; timeLimitMin: number; questions: Pregunta[] };
type Modulo = { title: string; lecciones: Leccion[]; examen: Examen };

async function construirModulos(): Promise<Modulo[]> {
  const imgInterfaz = await svgImg(SVG_INTERFAZ, "Tour de la pantalla de Claude");
  const imgCiclo = await svgImg(SVG_CICLO, "Ciclo: pide, revisa, ajusta");
  const imgReceta = await svgImg(SVG_RECETA, "El método RAFA: rol, acción, formato y audiencia");
  const imgProyecto = await svgImg(SVG_PROYECTO, "Cómo crear un proyecto en Claude");
  const imgAdjuntar = await svgImg(SVG_ADJUNTAR, "Cómo adjuntar un archivo en Claude");
  const imgWeb = await svgImg(SVG_WEB, "Cómo activar la búsqueda web en Claude");
  const imgChecklist = await svgImg(SVG_CHECKLIST, "Checklist antes de enviar");
  const imgPrivacidad = await svgImg(SVG_PRIVACIDAD, "Qué sí y qué no pegar en Claude");
  const imgConectores = await svgImg(SVG_CONECTORES, "Conectores: herramientas externas en Claude");

  return [
    // ======================= MÓDULO 1 =======================
    {
      title: "Conoce a Claude",
      lecciones: [
        {
          title: "¿Qué es Claude?",
          durationMin: 7,
          blocks: [
            h("¿Qué es Claude?"),
            p("Claude es un asistente de inteligencia artificial creado por la empresa Anthropic. En simple: es como tener un compañero que escribe, resume, organiza ideas y responde preguntas, disponible a toda hora. Le escribes lo que necesitas en lenguaje normal —como en un chat de WhatsApp— y te responde en segundos."),
            h("¿Qué NO es?"),
            list([
              "No es un buscador como Google: no “busca páginas”, sino que redacta y razona con lo que tú le das.",
              "No reemplaza tu criterio: tú decides, revisas y apruebas.",
              "No conoce la información interna de la empresa… a menos que tú se la cuentes.",
            ]),
            tip("Piensa en Claude como un practicante muy rápido y bien redactado: le explicas la tarea, la hace en segundos, y tú la revisas y ajustas."),
            h("¿Para qué te sirve, sin importar tu cargo?"),
            p("Casi todos escribimos y organizamos información en el trabajo: correos, mensajes, resúmenes, listas, actas, instrucciones. Claude te ayuda a hacerlo más rápido y mejor, seas de administración, técnico, bodega, compras, comercial o cualquier área."),
          ],
        },
        {
          title: "Primeros pasos",
          durationMin: 8,
          blocks: [
            h("Cómo entrar"),
            list([
              "Abre tu navegador y entra a claude.ai.",
              "Inicia sesión con la cuenta que te indique la empresa.",
              "Verás una caja de texto abajo: ahí escribes lo que necesitas.",
            ]),
            image(imgInterfaz, "Así se ve la pantalla de Claude. Los números te muestran para qué sirve cada parte."),
            h("Tu primer mensaje"),
            p("Escríbele como si le hablaras a un colega. Por ejemplo: “Ayúdame a redactar un correo corto para avisarle a mi equipo que la reunión se movió a las 3 p. m.”"),
            p("Claude responde en segundos. Si algo no quedó como querías, se lo dices: “hazlo más corto”, “más formal”, “agrégale una despedida”."),
            tip("No tienes que escribir “perfecto”. Escribe natural; si la respuesta no te convence, la ajustas con otra frase."),
            image(imgCiclo, "Trabajar con Claude es un ciclo: le pides, revisas lo que te da, y le pides ajustes hasta que quede."),
            h("Conversaciones"),
            p("Cada tema puede ir en su propia conversación, y Claude recuerda lo que hablaron dentro de ella. Para un tema nuevo, abre una conversación nueva."),
          ],
        },
        {
          title: "Qué puede hacer por ti",
          durationMin: 6,
          blocks: [
            h("Tareas donde Claude te ahorra tiempo"),
            table(
              ["Tarea", "Ejemplo de lo que le pides"],
              [
                ["Redactar correos", "“Escríbeme un correo para pedir los documentos que faltan de un proveedor.”"],
                ["Resumir textos largos", "“Resume este documento en 5 puntos clave.”"],
                ["Organizar ideas", "“Ordena estas notas sueltas de la reunión en una lista clara.”"],
                ["Explicar algo difícil", "“Explícame en palabras simples qué es una factura electrónica.”"],
                ["Redactar mensajes", "“Ayúdame a responder amablemente a este mensaje.”"],
                ["Dar ideas", "“Dame 5 ideas para el nombre de una campaña interna.”"],
                ["Corregir y mejorar", "“Corrige la ortografía y mejora la redacción de este texto.”"],
                ["Traducir", "“Traduce este correo al inglés en tono profesional.”"],
              ],
            ),
            info("En los siguientes módulos verás cómo pedir cada una de estas cosas para que salgan bien desde la primera."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Conoce a Claude",
        description: "Lo básico: qué es Claude y cómo se usa.",
        timeLimitMin: 10,
        questions: [
          {
            question: "¿Qué es Claude?",
            type: "MULTIPLE_CHOICE",
            options: ["Un buscador como Google", "Un asistente de inteligencia artificial que escribe, resume y responde", "Una red social", "Un programa de contabilidad"],
            correctAnswer: 1,
            explanation: "Claude es un asistente de IA: le escribes en lenguaje normal y te ayuda a redactar, resumir y responder.",
          },
          {
            question: "Claude conoce automáticamente la información interna de la empresa.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 1,
            explanation: "Falso: solo sabe lo que tú le cuentes en la conversación.",
          },
          {
            question: "¿Cuál es la forma correcta de escribirle?",
            type: "MULTIPLE_CHOICE",
            options: ["Con comandos de programación", "En lenguaje normal, como a un colega", "Solo en inglés", "Con códigos especiales"],
            correctAnswer: 1,
            explanation: "Le hablas en lenguaje natural, como en un chat.",
          },
          {
            question: "Si la respuesta no te gusta, lo mejor es…",
            type: "MULTIPLE_CHOICE",
            options: ["Empezar de cero siempre", "Decirle qué cambiar en la misma conversación", "Cerrar sesión", "Dejarlo así"],
            correctAnswer: 1,
            explanation: "Afinar es rápido: le dices qué ajustar y lo rehace.",
          },
        ],
      },
    },

    // ======================= MÓDULO 2 =======================
    {
      title: "Tu espacio de trabajo: crea tu Proyecto",
      lecciones: [
        {
          title: "Crea tu Proyecto en Claude (uno por tema)",
          durationMin: 9,
          blocks: [
            h("Lo primero: arma tu espacio"),
            p("Antes de aprender a pedir cosas, conviene tener tu espacio listo. Un Proyecto es un lugar dentro de Claude donde guardas todo lo de UN mismo tema: unas instrucciones fijas (cómo quieres que Claude te responda), los archivos de ese tema y todas sus conversaciones. La idea NO es tener un solo proyecto para todo, sino crear UN proyecto por cada tema de tu trabajo."),
            info("Piénsalo como carpetas: en vez de una sola carpeta con todo revuelto, tienes una carpeta por tema. Ejemplos: “Correos”, “Actas de reunión”, “Informes”."),
            image(imgProyecto, "Un proyecto por tema: cada uno con sus propias Instrucciones y Archivos."),
            h("Paso a paso para crear un proyecto"),
            list([
              "Paso 1. Entra a claude.ai.",
              "Paso 2. En la barra de la izquierda, busca la sección “Proyectos”.",
              "Paso 3. Haz clic en “Proyecto nuevo” (o el botón +).",
              "Paso 4. Ponle el nombre del TEMA, por ejemplo: “Correos” o “Actas de reunión”.",
              "Paso 5. Haz clic en “Crear”. Repite el proceso para cada tema que manejes.",
            ]),
            info("Si no ves la sección “Proyectos” en tu cuenta, avísale a la empresa: puede que tu plan aún no la tenga activada."),
            h("Configura cada proyecto: las Instrucciones"),
            p("Dentro de cada proyecto hay un espacio de “Instrucciones”. Ahí le explicas a Claude, para ese tema, cómo quieres que te ayude. Este es un ejemplo para un proyecto de “Correos” (ajústalo a ti):"),
            prompt(
              `Actúa como mi asistente para redactar CORREOS de trabajo. Trabajo en [tu área] de Ambiente Azul / DOM Design.

Cuando te pida algo:
- Responde en español (Colombia), claro y sin tecnicismos, en tono profesional pero cercano.
- Haz los correos breves y con un asunto sugerido.
- Si te falta un dato, déjalo marcado como "[por confirmar]" en vez de inventarlo.`,
              "Instrucciones del proyecto “Correos”",
            ),
            tip("Regla simple: ¿tema nuevo? → proyecto nuevo. Abre el proyecto del tema y crea ahí una conversación por cada caso."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Tu Proyecto",
        description: "Crea y organiza tus proyectos por tema.",
        timeLimitMin: 8,
        questions: [
          {
            question: "¿Cuál es la mejor forma de organizar tus proyectos?",
            type: "MULTIPLE_CHOICE",
            options: ["Un solo proyecto para todo", "Un proyecto por cada tema (Correos, Actas, Informes…)", "No usar proyectos", "Un proyecto por día"],
            correctAnswer: 1,
            explanation: "Un proyecto por tema mantiene cada cosa enfocada y ordenada.",
          },
          {
            question: "¿Para qué sirven las “Instrucciones” de un proyecto?",
            type: "MULTIPLE_CHOICE",
            options: ["Se escriben una vez y le dicen a Claude cómo ayudarte en ese tema", "Hay que repetirlas en cada mensaje", "No sirven para nada", "Son para otros usuarios"],
            correctAnswer: 0,
            explanation: "Las escribes una sola vez y aplican a todas las conversaciones de ese proyecto.",
          },
          {
            question: "Un Proyecto guarda tus instrucciones, tus archivos y tus conversaciones de ese tema.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 0,
            explanation: "Sí: todo lo del tema queda junto en su proyecto.",
          },
        ],
      },
    },

    // ======================= MÓDULO 3 =======================
    {
      title: "Cómo pedirle bien las cosas",
      lecciones: [
        {
          title: "La receta: RAFA (Rol · Acción · Formato · Audiencia)",
          durationMin: 9,
          blocks: [
            h("El método RAFA"),
            p("La calidad de lo que Claude te entrega depende de cómo se lo pidas. Un método fácil de recordar es RAFA, cuatro partes:"),
            list([
              "R — Rol: dile qué papel tomar (ej. “Actúa como mi asistente de oficina…”).",
              "A — Acción: di exactamente qué quieres (un correo, un resumen, 3 ideas).",
              "F — Formato: cómo lo quieres (corto, en viñetas, tono formal, máximo 5 líneas).",
              "A — Audiencia: para quién es (tu equipo, tu jefe, un proveedor).",
            ]),
            image(imgReceta, "RAFA: Rol + Acción + Formato + Audiencia, con un ejemplo real."),
            prompt("Actúa como mi asistente de oficina. Escríbeme un correo corto y cordial (máx. 5 líneas) para avisarle a mi equipo que la reunión se movió del martes al jueves a las 3 p. m.", "Prompt con RAFA"),
            tip("Truco: el Rol puedes dejarlo fijo en las Instrucciones de tu Proyecto. Así, en cada prompt te concentras en la Acción, el Formato y la Audiencia."),
          ],
        },
        {
          title: "Pedir mal vs pedir bien",
          durationMin: 6,
          blocks: [
            h("Compara"),
            table(
              ["Pedido flojo", "Pedido bueno"],
              [
                ["“Hazme un correo”", "“Escríbeme un correo corto y cordial para recordarle a un compañero que me envíe el informe de gastos hoy.”"],
                ["“Explica esto”", "“Explícame en 3 frases sencillas, sin tecnicismos, qué es una orden de compra.”"],
                ["“Dame ideas”", "“Dame 5 ideas de asunto para un correo que invita a la jornada de bienestar.”"],
              ],
            ),
            p("La diferencia es simple: el pedido bueno dice para quién, para qué y cómo. Eso es todo."),
          ],
        },
        {
          title: "Dale ejemplos y ajusta el tono",
          durationMin: 7,
          blocks: [
            h("Enséñale con un ejemplo"),
            p("Si quieres que siga un estilo, muéstraselo. Pégale un correo tuyo que te haya gustado y dile: “usa este mismo tono y estructura para escribir uno nuevo sobre…”."),
            prompt("Actúa como mi asistente de oficina. Este es un correo que suelo enviar: [pega aquí tu correo]. Escríbeme uno con el mismo tono y estructura, para avisarle a mi equipo que el sistema estará en mantenimiento el sábado."),
            h("Dale el tono que necesitas"),
            p("Puedes pedirle el estilo exacto y afinarlo con frases cortas:"),
            list(["“Hazlo más corto.”", "“Más formal.”", "“Más cercano.”", "“Cámbiale el saludo.”", "“Quítale los tecnicismos.”"]),
            tip("También puedes pedirle una plantilla reutilizable: “Hazme una plantilla de correo donde yo solo cambie el nombre y la fecha.”"),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Cómo pedirle bien",
        description: "Practica la receta para obtener buenas respuestas.",
        timeLimitMin: 10,
        questions: [
          {
            question: "¿Qué significa RAFA, el método para pedir bien?",
            type: "MULTIPLE_CHOICE",
            options: ["Rol, Acción, Formato y Audiencia", "Solo la palabra “hazlo”", "Códigos y comandos", "Rápido, Ágil, Fácil y Ahora"],
            correctAnswer: 0,
            explanation: "RAFA = Rol (qué papel tome) + Acción (qué quieres) + Formato (cómo) + Audiencia (para quién).",
          },
          {
            question: "¿Cuál es el mejor pedido?",
            type: "MULTIPLE_CHOICE",
            options: ["“Hazme un correo”", "“Escribe algo”", "“Correo por favor”", "“Escríbeme un correo corto y cordial para recordarle a un compañero que me envíe el informe hoy”"],
            correctAnswer: 3,
            explanation: "Dice para quién, para qué y cómo: por eso sale mejor.",
          },
          {
            question: "Para que Claude imite tu estilo, lo mejor es…",
            type: "MULTIPLE_CHOICE",
            options: ["Pegarle un ejemplo tuyo y pedirle que use ese tono", "No decir nada", "Escribir en mayúsculas", "Usar otro programa"],
            correctAnswer: 0,
            explanation: "Mostrarle un ejemplo es la forma más rápida de que copie tu estilo.",
          },
          {
            question: "Puedes ajustar el resultado con frases como “hazlo más corto” o “más formal”.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 0,
            explanation: "Sí: afinar es parte normal de trabajar con Claude.",
          },
        ],
      },
    },

    // ======================= MÓDULO 4 =======================
    {
      title: "Archivos y herramientas de Claude",
      lecciones: [
        {
          title: "Sube tus archivos a Claude",
          durationMin: 8,
          blocks: [
            h("Claude también lee tus documentos"),
            p("Además de responder preguntas, Claude puede leer los archivos que le adjuntes: PDF, Excel, Word o una foto. A partir de ahí los resume, los ordena o los explica."),
            image(imgAdjuntar, "Para adjuntar: haz clic en el botón + junto a la caja de texto y elige tu archivo."),
            h("Paso a paso"),
            list([
              "Paso 1. En claude.ai, abre el proyecto del tema y crea una conversación nueva dentro de él.",
              "Paso 2. Haz clic en el botón + que está junto a la caja de texto.",
              "Paso 3. Elige el archivo desde tu computador y espera a que aparezca su nombre.",
              "Paso 4. Escribe qué quieres que haga con él y envía.",
            ]),
            prompt("Actúa como mi asistente. Resume este documento en 5 puntos claros, para mí, y dime si hay alguna fecha o tarea importante que deba tener en cuenta."),
            prompt("Actúa como mi asistente. Ordena estas notas de la reunión, para compartirlas con el equipo, en: (1) decisiones, (2) tareas con responsable y (3) pendientes."),
            tip("También puedes arrastrar el archivo con el mouse y soltarlo sobre la caja de texto."),
            warn("Antes de subir un documento con datos personales o información interna, revisa el módulo “Úsalo con cabeza”."),
          ],
        },
        {
          title: "Busca información actualizada (búsqueda web)",
          durationMin: 7,
          blocks: [
            h("¿Qué es la “búsqueda web”?"),
            p("Normalmente Claude responde con lo que ya sabe. Pero si activas la “búsqueda web”, además consulta internet antes de responder. Útil cuando necesitas algo actual o un dato que hay que verificar."),
            image(imgWeb, "El interruptor de “Búsqueda web” está debajo de la caja de texto. Actívalo antes de enviar."),
            list([
              "Paso 1. Escribe tu pregunta en la caja de texto.",
              "Paso 2. Activa la opción “Búsqueda web” (a veces aparece como un mundo o “Buscar en la web”).",
              "Paso 3. Envía y espera: Claude buscará y te responderá citando de dónde sacó la información.",
              "Paso 4. Pídele el enlace de la fuente para verificar.",
            ]),
            prompt("Actúa como mi asistente y activa la búsqueda web. Dime, en lenguaje sencillo y en una lista, qué días son festivos en Colombia el próximo mes, e incluye el enlace de la fuente."),
            warn("La búsqueda web ayuda a orientarte, pero siempre revisa la fuente antes de dar un dato por cierto."),
          ],
        },
        {
          title: "Conecta Claude con tus herramientas",
          durationMin: 8,
          blocks: [
            h("¿Qué son los conectores?"),
            p("Los conectores dejan que Claude use directamente tus herramientas —como Gmail, Google Drive o Google Calendar— sin que copies y pegues. Por ejemplo: buscar un correo, sacar un archivo de tu Drive o revisar tu agenda."),
            image(imgConectores, "En Configuración → Conectores activas cada herramienta con “Conectar”."),
            h("Cómo conectarlos, paso a paso"),
            list([
              "Paso 1. En claude.ai, entra a Configuración → Conectores.",
              "Paso 2. Junto a la herramienta que quieras (Gmail, Google Drive, Calendar…), pulsa “Conectar”.",
              "Paso 3. Inicia sesión con tu cuenta y autoriza el acceso.",
              "Paso 4. Listo: en tus conversaciones ya puedes pedirle que use esa herramienta.",
            ]),
            h("Cómo administrarlos"),
            list([
              "Puedes desconectar una herramienta cuando quieras desde el mismo menú de Conectores.",
              "Revisa de vez en cuando qué está conectado y deja solo lo que uses.",
              "Cada conexión pide permisos: concede solo los necesarios.",
            ]),
            prompt("Actúa como mi asistente. Revisa mi Google Calendar y dime qué reuniones tengo mañana, en una lista corta con la hora y el tema de cada una.", "Prompt con un conector (Calendar)"),
            warn("Conecta solo cuentas de la empresa o autorizadas, y concede únicamente los permisos necesarios. No compartas accesos que no debas y desconecta lo que dejes de usar. Ante la duda, consulta con la empresa."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Archivos y herramientas",
        description: "Archivos, búsqueda web y conectores.",
        timeLimitMin: 10,
        questions: [
          {
            question: "Para que Claude trabaje sobre un documento tuyo, primero debes…",
            type: "MULTIPLE_CHOICE",
            options: ["Escribirlo todo a mano", "Adjuntarlo con el botón +", "Enviárselo por correo", "No se puede, Claude no lee archivos"],
            correctAnswer: 1,
            explanation: "Claude lee PDF, Excel, Word e imágenes: los adjuntas con el botón +.",
          },
          {
            question: "La búsqueda web sirve para…",
            type: "MULTIPLE_CHOICE",
            options: ["Que Claude consulte internet y cite la fuente", "Cambiar el idioma", "Borrar la conversación", "Subir archivos"],
            correctAnswer: 0,
            explanation: "Actívala cuando necesites información actual o verificable.",
          },
          {
            question: "Un dato encontrado en la web se puede dar por cierto sin revisar la fuente.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 1,
            explanation: "Falso: siempre conviene revisar la fuente.",
          },
          {
            question: "Los “conectores” de Claude sirven para…",
            type: "MULTIPLE_CHOICE",
            options: ["Conectar Claude con tus herramientas (Gmail, Drive, Calendar) para que las use", "Cambiar el color de la app", "Pagar la suscripción", "Borrar tus datos"],
            correctAnswer: 0,
            explanation: "Los conectores permiten que Claude use tus herramientas; concede solo los permisos necesarios.",
          },
        ],
      },
    },

    // ======================= MÓDULO 5 =======================
    {
      title: "Más usos para tu día a día",
      lecciones: [
        {
          title: "Traducir correos y textos",
          durationMin: 6,
          blocks: [
            h("Escribe en español, envía en otro idioma"),
            p("¿Te toca escribirle a alguien en inglés (por ejemplo, un contacto en Miami)? Escribe en español y pídele a Claude que lo traduzca bien, con tono natural."),
            prompt("Actúa como traductor profesional. Traduce este correo al inglés, en tono profesional y cordial y que suene natural (no literal), para enviárselo a un proveedor: [pega aquí tu correo en español]", "Prompt — Traducir un correo"),
            tip("Sirve en los dos sentidos: también puedes pegar un texto en inglés y pedirle “tradúcemelo al español y explícame lo importante”."),
          ],
        },
        {
          title: "Ordena una reunión en un acta",
          durationMin: 6,
          blocks: [
            h("De notas sueltas a un acta clara"),
            p("Después de una reunión quedas con apuntes desordenados. Claude los organiza en un acta lista para compartir."),
            prompt("Actúa como mi asistente. Con estas notas de una reunión, arma un acta clara para el equipo, con: (1) resumen, (2) decisiones, (3) tareas con responsable y fecha, y (4) pendientes: [pega aquí tus notas]", "Prompt — Acta de reunión"),
            tip("Guárdala en tu proyecto “Actas de reunión” para tener todas juntas."),
          ],
        },
        {
          title: "Corrige y mejora un texto",
          durationMin: 5,
          blocks: [
            h("Un segundo par de ojos"),
            p("Antes de enviar algo importante, pídele a Claude que lo revise: ortografía, claridad y tono."),
            prompt("Actúa como corrector de estilo. Revisa este texto y devuélvemelo con mejor ortografía, redacción y un tono profesional pero cercano, sin cambiar el significado, para publicarlo en un comunicado interno: [pega aquí tu texto]", "Prompt — Corregir y mejorar"),
            info("Puedes pedirle también: “explícame qué cambiaste y por qué”, para aprender de los ajustes."),
          ],
        },
        {
          title: "Compara opciones en una tabla",
          durationMin: 6,
          blocks: [
            h("Decide más fácil"),
            p("Cuando tienes que elegir entre opciones (proveedores, planes, productos), pídele una tabla comparativa sencilla."),
            prompt("Actúa como mi asistente. Compárame estas opciones en una tabla sencilla (ventajas, desventajas y para qué caso conviene cada una), para ayudarme a decidir: [pega o describe las opciones]. No inventes datos; si falta información, márcala como \"[por confirmar]\".", "Prompt — Tabla comparativa"),
            warn("Verifica los datos que Claude ponga en la tabla antes de usarlos para decidir."),
          ],
        },
        {
          title: "Aprende o explica un tema difícil",
          durationMin: 6,
          blocks: [
            h("Que te lo expliquen fácil"),
            p("¿Hay un término, una norma o un proceso que no entiendes? Pídele que te lo explique en simple, con un ejemplo."),
            prompt("Actúa como un profesor que explica fácil. Explícame en pocas frases, sin tecnicismos y con un ejemplo cotidiano, qué es [tema] y por qué me sirve en mi trabajo.", "Prompt — Explícamelo fácil"),
            tip("Si quieres profundizar, sigue preguntando: “dame un ejemplo”, “¿y en qué se diferencia de…?”, “resúmemelo en una frase”."),
          ],
        },
        {
          title: "Ensaya una conversación difícil",
          durationMin: 6,
          blocks: [
            h("Practica antes de la llamada"),
            p("¿Una llamada o reunión que te pone nervioso? Ensáyala con Claude: que haga de la otra persona y te dé tips."),
            prompt("Actúa como un cliente molesto porque su pedido se retrasó. Simula la conversación conmigo (tú respondes como el cliente) para que yo practique cómo responder con calma y profesionalismo. Al final, dame 3 consejos para mejorar.", "Prompt — Role-play de práctica"),
            info("Cambia el personaje según lo que necesites: un proveedor, tu jefe, un compañero. Es solo práctica; nadie más lo ve."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Más usos",
        description: "Traducir, actas, corregir, comparar, aprender y ensayar.",
        timeLimitMin: 10,
        questions: [
          {
            question: "Para escribirle a alguien en otro idioma, lo más fácil es…",
            type: "MULTIPLE_CHOICE",
            options: ["Escribir en español y pedirle a Claude que lo traduzca natural", "No escribirle", "Usar solo palabras que sepas", "Escribir en mayúsculas"],
            correctAnswer: 0,
            explanation: "Escribes en español y Claude lo pasa a otro idioma con tono natural.",
          },
          {
            question: "Con tus notas sueltas de una reunión, Claude puede…",
            type: "MULTIPLE_CHOICE",
            options: ["Armar un acta con decisiones, tareas y pendientes", "Borrarlas", "Enviarlas por ti", "Nada"],
            correctAnswer: 0,
            explanation: "Las organiza en un acta lista para compartir.",
          },
          {
            question: "Antes de usar una tabla comparativa que hizo Claude, ¿qué haces?",
            type: "MULTIPLE_CHOICE",
            options: ["Confiar sin revisar", "Verificar los datos", "Nada", "Borrarla"],
            correctAnswer: 1,
            explanation: "Claude ordena la información; tú verificas los datos antes de decidir.",
          },
          {
            question: "Puedes usar a Claude para ensayar una conversación difícil (role-play).",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 0,
            explanation: "Sí: hace de la otra persona y te da consejos para mejorar.",
          },
        ],
      },
    },

    // ======================= MÓDULO 6 =======================
    {
      title: "Úsalo con cabeza",
      lecciones: [
        {
          title: "Revisa siempre: Claude puede equivocarse",
          durationMin: 6,
          blocks: [
            h("Claude no es infalible"),
            p("A veces Claude da respuestas que suenan muy seguras pero tienen errores o datos inventados (a esto se le llama “alucinar”). Por eso, tú eres el filtro: lee, corrige nombres y datos, y usa la respuesta solo cuando estés seguro."),
            tip("Regla de oro: Claude redacta, tú revisas y apruebas."),
            image(imgChecklist, "Antes de enviar o usar algo importante, pásale esta lista rápida."),
          ],
        },
        {
          title: "Cuando Claude se equivoca: cómo arreglarlo",
          durationMin: 8,
          blocks: [
            h("Se equivocó… ¿y ahora qué?"),
            p("Claude no siempre acierta a la primera, y está bien. Casi todo se arregla en la MISMA conversación, diciéndole qué pasó. No borres y empieces de cero: corrígelo con una frase."),
            table(
              ["Qué pasó", "Qué le dices para arreglarlo"],
              [
                ["Se inventó un dato (alucinó)", "“¿De dónde sacaste ese dato? Si no estás seguro, dímelo.” Activa la búsqueda web o dale tú el dato correcto."],
                ["No entendió lo que querías", "“No era eso. Lo que necesito es…”, y reformula con más contexto (usa RAFA)."],
                ["Quedó muy largo / corto / formal", "“Hazlo más corto”, “más cercano”, “en viñetas”."],
                ["Le faltó algo / quedó incompleto", "“Te faltó [X]. Agrégalo.”"],
                ["Respuesta genérica o floja", "Dale más contexto y un ejemplo: “Usa este texto como modelo: …”."],
                ["Se cortó a mitad", "Escribe: “continúa”."],
                ["Se enredó / se fue por las ramas", "“Empecemos de nuevo, solo esto: …”, o abre una conversación nueva."],
              ],
            ),
            prompt("Eso no es lo que necesito. Reescríbelo teniendo en cuenta que [aclara el contexto]. Hazlo [formato, ej. corto y en viñetas] para [audiencia, ej. mi equipo].", "Prompt — corregir el rumbo"),
            prompt("Revisa tu respuesta anterior: ¿hay algún dato del que no estés 100% seguro? Márcalo como \"[por confirmar]\" y dime en qué te basaste.", "Prompt — pídele que se autorrevise"),
            tip("Entre más claro le digas QUÉ estuvo mal y QUÉ quieres, mejor lo corrige. Es normal ir afinando en 2 o 3 mensajes."),
            warn("Si aun así no logras el resultado, o el tema es delicado (datos importantes, cifras, legal), no fuerces la respuesta: verifícalo con la fuente oficial o con quien corresponda."),
          ],
        },
        {
          title: "Cuida la información",
          durationMin: 6,
          blocks: [
            h("Qué NO pegar en Claude"),
            image(imgPrivacidad, "Una guía rápida de qué puedes pegar sin problema y qué no."),
            warn("No pegues información sensible o confidencial: datos personales de clientes o compañeros, contraseñas, cifras internas, contratos o condiciones comerciales."),
            p("Para la mayoría de tareas no hace falta pegar datos privados. Si necesitas personalizar, trabaja con datos genéricos y al final tú pones lo real."),
            list([
              "Evita: cédulas, teléfonos y correos privados.",
              "Evita: contraseñas y accesos.",
              "Evita: cifras internas, contratos y documentos legales.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Úsalo con cabeza",
        description: "Buenas prácticas y cuidados al usar Claude.",
        timeLimitMin: 10,
        questions: [
          {
            question: "En inteligencia artificial, “alucinar” significa…",
            type: "MULTIPLE_CHOICE",
            options: ["Que Claude se apaga", "Que a veces da datos que suenan seguros pero son incorrectos o inventados", "Que ve imágenes", "Que funciona lento"],
            correctAnswer: 1,
            explanation: "Por eso siempre revisas antes de usar la respuesta.",
          },
          {
            question: "¿Qué NO debes pegar en Claude?",
            type: "MULTIPLE_CHOICE",
            options: ["Un texto general para mejorar la redacción", "Datos sensibles: contraseñas, cédulas, cifras internas o contratos", "Una pregunta", "Una idea"],
            correctAnswer: 1,
            explanation: "La información confidencial no se comparte.",
          },
          {
            question: "La regla de oro es…",
            type: "MULTIPLE_CHOICE",
            options: ["Claude decide y tú envías sin leer", "Claude redacta, tú revisas y apruebas", "No usar Claude nunca", "Copiar y pegar sin mirar"],
            correctAnswer: 1,
            explanation: "Tú siempre tienes la última palabra.",
          },
          {
            question: "Si dudas si algo es sensible, lo mejor es…",
            type: "MULTIPLE_CHOICE",
            options: ["Pegarlo de todas formas", "No pegarlo y trabajar con datos genéricos", "Pegarlo en mayúsculas", "Preguntarle a un compañero primero"],
            correctAnswer: 1,
            explanation: "Ante la duda, no lo pegues; usa datos genéricos.",
          },
          {
            question: "Si Claude responde algo que no era lo que querías, lo mejor es…",
            type: "MULTIPLE_CHOICE",
            options: ["Borrar y empezar de cero siempre", "Decirle en la misma conversación qué estuvo mal y qué quieres", "Usarlo igual", "Dejar de usarlo"],
            correctAnswer: 1,
            explanation: "Casi todo se arregla corrigiéndolo en la misma conversación; afinar 2–3 veces es normal.",
          },
        ],
      },
    },

    // ======================= MÓDULO 7 =======================
    {
      title: "Práctica guiada",
      lecciones: [
        {
          title: "Ejercicio 1: un correo",
          durationMin: 6,
          blocks: [
            h("Manos a la obra"),
            p("Escribe un correo real de tu trabajo usando RAFA (Rol, Acción, Formato, Audiencia). Pasos:"),
            list([
              "Piensa el contexto: ¿de qué se trata y para quién?",
              "Escribe el pedido con RAFA: Rol, Acción, Formato y Audiencia.",
              "Lee la respuesta y ajústala (tono, largo, saludo).",
              "Revisa y úsala.",
            ]),
            prompt("Actúa como mi asistente de oficina. Escríbeme un correo corto y cordial, con un asunto sugerido, para avisarle a mi área que a partir del lunes cambia el horario de almuerzo.", "Prompt para practicar (RAFA)"),
          ],
        },
        {
          title: "Ejercicio 2: resumir y ordenar",
          durationMin: 6,
          blocks: [
            h("Traduce y resume"),
            p("Toma un documento o unas notas que tengas y pídele a Claude que las resuma u ordene."),
            prompt("Actúa como mi asistente. Resume este texto en 5 puntos y dime si hay alguna tarea o fecha importante: [pega el texto].", "Prompt para practicar (RAFA)"),
            warn("Verifica cualquier dato importante antes de usarlo."),
          ],
        },
        {
          title: "Ejercicio 3: explicar algo difícil",
          durationMin: 6,
          blocks: [
            h("Que te lo expliquen fácil"),
            p("¿Hay algún término o proceso que te cueste? Pídele a Claude que te lo explique en simple."),
            prompt("Actúa como un experto que explica fácil. Explícame en 3 frases sencillas, sin tecnicismos, qué es [tema] y por qué es importante en mi trabajo.", "Prompt para practicar (RAFA)"),
            h("¡Felicitaciones!"),
            p("Ya tienes lo necesario para usar Claude en tu día a día: pedir bien, trabajar ordenado con tu proyecto y tus archivos, y hacerlo con criterio. Úsalo como tu aliado para ahorrar tiempo y trabajar mejor."),
          ],
        },
      ],
      examen: {
        title: "Evaluación final",
        description: "Cierra el curso repasando lo aprendido.",
        timeLimitMin: 10,
        questions: [
          {
            question: "El orden para usar Claude en una tarea es…",
            type: "MULTIPLE_CHOICE",
            options: ["Usar y luego pensar", "Contexto → pedir → revisar → usar", "Copiar de otro lado", "No revisar"],
            correctAnswer: 1,
            explanation: "Primero le das contexto y la tarea, luego revisas y usas.",
          },
          {
            question: "Trabajar dentro de tu Proyecto sirve para…",
            type: "MULTIPLE_CHOICE",
            options: ["Tener todo ordenado en un solo lugar", "Que sea más lento", "Nada", "Que otros vean tus chats"],
            correctAnswer: 0,
            explanation: "El proyecto reúne instrucciones, archivos y conversaciones.",
          },
          {
            question: "Antes de usar una respuesta importante de Claude, ¿qué haces?",
            type: "MULTIPLE_CHOICE",
            options: ["Confiar sin leer", "Revisarla y verificar los datos", "Nada", "Borrarla"],
            correctAnswer: 1,
            explanation: "Tú revisas y apruebas siempre.",
          },
          {
            question: "Claude reemplaza tu criterio.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 1,
            explanation: "Falso: es una herramienta; tú decides y apruebas.",
          },
        ],
      },
    },
  ];
}

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("No hay un SUPER_ADMIN para asignar como autor.");

  const previo = await prisma.course.findFirst({
    where: { title: CURSO_TITLE },
    select: { id: true },
  });
  if (previo) {
    await prisma.course.delete({ where: { id: previo.id } });
    console.log("♻️  Curso anterior eliminado; se recrea.");
  }

  const modulos = await construirModulos();
  const totalMin = modulos.reduce(
    (s, m) => s + m.lecciones.reduce((x, l) => x + l.durationMin, 0),
    0,
  );

  await prisma.course.create({
    data: {
      title: CURSO_TITLE,
      description:
        "Aprende a usar Claude, el asistente de inteligencia artificial, para tu día a día en Ambiente Azul y DOM Design: redactar correos, resumir documentos, organizar ideas, trabajar con archivos y hacerlo con criterio. Para todas las áreas, sin tecnicismos.",
      category: "INDUCCION",
      company: "AMBAS",
      status: "DRAFT",
      estimatedHours: Math.max(1, Math.round(totalMin / 60)),
      passingScore: 70,
      requiredAreas: [],
      createdBy: admin.id,
      modules: {
        create: modulos.map((m, mi) => ({
          title: m.title,
          order: mi + 1,
          lessons: {
            create: m.lecciones.map((l, li) => ({
              title: l.title,
              type: "MIXED",
              order: li + 1,
              durationMin: l.durationMin,
              content: { blocks: l.blocks } as object,
            })),
          },
          exams: {
            create: [
              {
                title: m.examen.title,
                description: m.examen.description,
                passingScore: 70,
                maxAttempts: 3,
                timeLimitMin: m.examen.timeLimitMin,
                order: m.lecciones.length + 1,
                questions: {
                  create: m.examen.questions.map((q, qi) => ({
                    question: q.question,
                    type: q.type,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    points: 1,
                    explanation: q.explanation,
                    order: qi + 1,
                  })),
                },
              },
            ],
          },
        })),
      },
    },
  });

  const lecciones = modulos.reduce((s, m) => s + m.lecciones.length, 0);
  console.log(
    `✅ Curso "${CURSO_TITLE}" creado como BORRADOR — ${modulos.length} módulos, ${lecciones} lecciones, ${totalMin} min.`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
