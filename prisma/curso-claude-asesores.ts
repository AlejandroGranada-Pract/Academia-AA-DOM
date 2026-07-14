import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  SVG_ADJUNTAR,
  SVG_WEB,
  SVG_FLUJO,
  SVG_DOM,
  SVG_PROYECTO,
  SVG_INTERFAZ,
  SVG_RECETA,
  SVG_CICLO,
  SVG_CHECKLIST,
  SVG_PRIVACIDAD,
  SVG_CONECTORES,
} from "./seed-assets/claude-svgs";

const connectionString = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});
const prisma = new PrismaClient({ adapter });

// Crea (o REEMPLAZA) el curso ampliado "Claude para Asesores Comerciales" como
// BORRADOR. Al re-ejecutar, borra la versión anterior y la vuelve a crear.

const CURSO_TITLE = "Claude para Asesores Comerciales";
const ASSETS = join(process.cwd(), "prisma", "seed-assets", "piscinas-cot");

async function img(file: string, name: string): Promise<string> {
  const data = readFileSync(join(ASSETS, file));
  const a = await prisma.imageAsset.create({
    data: { name, mime: "image/jpeg", size: data.length, data },
  });
  return `/api/imagenes/${a.id}`;
}

// Guarda un SVG (ilustración/captura anotada) como asset y devuelve su URL.
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
const video = (url: string): Block => ({ type: "video", url });
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
  // Fotos reutilizadas para el módulo de Ambiente Azul.
  const imgPiscina = await img("cot-infinity.jpg", "Piscina (contexto AA)");
  const imgSpa = await img("cot-wellness.jpg", "Spa / hidromasaje (contexto AA)");
  const imgClima = await img("cot-bombacalor.jpg", "Climatización (contexto AA)");
  const imgHotel = await img("cot-hotel.jpg", "Piscina de hotel (contexto AA)");

  // Ilustraciones propias (SVG): capturas anotadas y diagramas del curso.
  const imgAdjuntar = await svgImg(SVG_ADJUNTAR, "Cómo adjuntar un archivo en Claude");
  const imgWeb = await svgImg(SVG_WEB, "Cómo activar la búsqueda web en Claude");
  const imgFlujo = await svgImg(SVG_FLUJO, "Flujo: de la cotización al presupuesto");
  const imgDom = await svgImg(SVG_DOM, "Materiales DOM: mosaico, porcelanato y piedra");
  const imgProyecto = await svgImg(SVG_PROYECTO, "Cómo crear un proyecto en Claude");
  const imgInterfaz = await svgImg(SVG_INTERFAZ, "Tour de la pantalla de Claude");
  const imgReceta = await svgImg(SVG_RECETA, "El método RAFA: rol, acción, formato y audiencia");
  const imgCiclo = await svgImg(SVG_CICLO, "Ciclo: pide, revisa, ajusta");
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
          durationMin: 8,
          blocks: [
            h("¿Qué es Claude?"),
            p("Claude es un asistente de inteligencia artificial creado por la empresa Anthropic. En palabras simples: es como tener un compañero que escribe, resume, organiza ideas y responde preguntas, disponible a toda hora. Le escribes lo que necesitas en lenguaje normal —como en un chat de WhatsApp— y te responde en segundos."),
            h("¿Qué NO es?"),
            list([
              "No es un buscador como Google: no “busca páginas”, sino que redacta y razona con lo que tú le das.",
              "No reemplaza tu criterio: tú decides, revisas y apruebas.",
              "No conoce a tus clientes, precios ni fichas… a menos que tú se los cuentes.",
            ]),
            tip("Piensa en Claude como un practicante muy rápido y bien redactado: le explicas la tarea, la hace en segundos, y tú la revisas y ajustas."),
            h("¿Por qué te sirve como asesor de AA | DOM?"),
            p("Un asesor comercial pasa buena parte del día escribiendo: correos, cotizaciones, respuestas, propuestas, mensajes de WhatsApp. Claude te ayuda a hacer todo eso más rápido y mejor redactado —tanto para clientes de Ambiente Azul (piscinas, spas, bienestar) como de DOM Design (enchapes, porcelanatos, mosaicos)— para que dediques tu tiempo a vender y atender."),
          ],
        },
        {
          title: "Primeros pasos",
          durationMin: 7,
          blocks: [
            h("Cómo entrar"),
            list([
              "Abre tu navegador y entra a claude.ai.",
              "Inicia sesión con la cuenta que te indique la empresa.",
              "Verás una caja de texto abajo: ahí escribes lo que necesitas.",
            ]),
            image(imgInterfaz, "Así se ve la pantalla de Claude. Los números te muestran para qué sirve cada parte."),
            h("Tu primer mensaje"),
            p("Escríbele como si le hablaras a un colega. Por ejemplo: “Ayúdame a redactar un correo corto y amable para recordarle a un cliente que su cotización sigue disponible.”"),
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
                ["Redactar correos", "“Escríbeme un correo de seguimiento para un cliente que no ha respondido.”"],
                ["Responder mensajes", "“Ayúdame a responder amablemente a un cliente que dice que está caro.”"],
                ["Explicar productos", "“Explícale a un cliente, sin tecnicismos, qué es una piscina desbordante.”"],
                ["Resumir documentos", "“Resume esta ficha técnica en 5 puntos clave.”"],
                ["Preparar propuestas", "“Arma una propuesta breve con estos datos…”"],
                ["Dar ideas", "“Dame 3 ideas de mensaje para redes sobre saunas.”"],
                ["Mejorar textos", "“Corrige la ortografía y mejora la redacción de este texto.”"],
              ],
            ),
            info("En los siguientes módulos verás cómo pedir cada una de estas cosas —y cómo aplicarlas a Ambiente Azul y a DOM Design— para que salgan bien desde la primera."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Conoce a Claude",
        description: "Comprueba lo básico: qué es Claude y cómo se usa.",
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
            question: "Claude conoce automáticamente los precios y las fichas de la empresa.",
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
      title: "Cómo pedirle bien las cosas",
      lecciones: [
        {
          title: "La receta: RAFA (Rol · Acción · Formato · Audiencia)",
          durationMin: 9,
          blocks: [
            h("El método RAFA"),
            p("La calidad de lo que Claude te entrega depende de cómo se lo pidas. Un método fácil de recordar es RAFA, cuatro partes:"),
            list([
              "R — Rol: dile qué papel tomar (ej. “Actúa como asesor de Ambiente Azul…”).",
              "A — Acción: di exactamente qué quieres (un correo, un resumen, 3 ideas).",
              "F — Formato: cómo lo quieres (corto, en viñetas, tono formal, máximo 5 líneas).",
              "A — Audiencia: para quién es (un cliente, un arquitecto, tu jefe).",
            ]),
            image(imgReceta, "RAFA: Rol + Acción + Formato + Audiencia, con un ejemplo real."),
            prompt("Actúa como asesor comercial de Ambiente Azul. Escríbeme un correo de seguimiento, corto y cálido, de máximo 5 líneas, para un cliente que cotizó un jacuzzi hace dos semanas y no ha respondido; invítalo a agendar una llamada.", "Prompt con RAFA"),
            tip("Truco: el Rol puedes dejarlo fijo en las Instrucciones de tu Proyecto. Así, en cada prompt te concentras en la Acción, el Formato y la Audiencia."),
          ],
        },
        {
          title: "Pedir mal vs pedir bien",
          durationMin: 7,
          blocks: [
            h("Compara"),
            table(
              ["Pedido flojo", "Pedido bueno"],
              [
                ["“Hazme un correo”", "“Escríbeme un correo corto y cálido para recordarle a un cliente que su cotización de sauna sigue vigente e invitarlo al showroom.”"],
                ["“Explica esto”", "“Explica en 3 frases sencillas, sin tecnicismos, qué ventaja tiene un cold plunge para un cliente que nunca ha oído el término.”"],
                ["“Dame ideas”", "“Dame 5 ideas de asunto de correo para reactivar clientes que cotizaron enchapes y no compraron.”"],
              ],
            ),
            p("La diferencia es simple: el pedido bueno dice para quién, para qué y cómo. Eso es todo."),
          ],
        },
        {
          title: "Dale ejemplos y plantillas",
          durationMin: 7,
          blocks: [
            h("Enséñale con un ejemplo"),
            p("Si quieres que siga un estilo, muéstraselo. Pégale un correo tuyo que te haya gustado y dile: “usa este mismo tono y estructura para escribir uno nuevo sobre…”."),
            prompt("Actúa como asesor de DOM Design. Este es un correo que suelo enviar: [pega aquí tu correo]. Escríbeme uno con el mismo tono y estructura, para un cliente que pidió cotización de porcelanato para su terraza."),
            tip("También puedes pedirle que te arme una plantilla reutilizable: “Hazme una plantilla de correo de seguimiento donde yo solo cambie el nombre y el producto.”"),
          ],
        },
        {
          title: "Ajustar el tono y afinar",
          durationMin: 6,
          blocks: [
            h("Dale el tono que necesitas"),
            p("Puedes pedirle el estilo exacto: “tono profesional pero cercano”, “más formal para un hotel”, “aspiracional, hablando de bienestar”."),
            list(["“Hazlo más corto.”", "“Más formal.”", "“Cámbiale el saludo.”", "“Ponlo más vendedor.”", "“Quítale los tecnicismos.”"]),
            warn("Recuerda la voz de cada marca: para Ambiente Azul conecta agua, bienestar y emoción; para DOM destaca cómo cada detalle define el resultado. Puedes pedírselo a Claude tal cual."),
          ],
        },
        {
          title: "Trabajar con documentos",
          durationMin: 6,
          blocks: [
            h("Pégale textos largos"),
            p("Claude no solo responde preguntas: puedes pegarle un correo largo, una ficha técnica o una conversación de WhatsApp y pedirle que la resuma, la ordene o la responda."),
            list([
              "“Resume este correo largo del cliente en 3 puntos y dime qué me está pidiendo.”",
              "“Ordena estas notas de la visita en una lista clara.”",
              "“A partir de esta conversación, redáctame la respuesta.”",
            ]),
            info("Cuanto más claro sea el documento que le pegas, mejor será el resultado."),
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
            options: ["“Hazme un correo”", "“Escribe algo”", "“Correo por favor”", "“Escríbeme un correo corto y cálido para recordarle a un cliente que su cotización sigue vigente e invitarlo al showroom”"],
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
            question: "Puedes pegarle un correo largo del cliente para que lo resuma.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 0,
            explanation: "Sí: resume, ordena y hasta redacta la respuesta.",
          },
          {
            question: "Si necesitas el tono de la marca, ¿qué haces?",
            type: "MULTIPLE_CHOICE",
            options: ["Se lo pides explícitamente (ej. “tono cercano y aspiracional”)", "No se puede", "Solo sale formal", "Hay que programarlo"],
            correctAnswer: 0,
            explanation: "Puedes indicarle el tono y el estilo que quieras.",
          },
        ],
      },
    },

    // ======================= MÓDULO 3 =======================
    {
      title: "Claude en tus tareas de venta",
      lecciones: [
        {
          title: "Redactar y responder correos",
          durationMin: 9,
          blocks: [
            h("Correos de seguimiento"),
            p("Es de lo más útil: recordar cotizaciones, retomar clientes fríos, agradecer una visita."),
            prompt("Actúa como asesor de Ambiente Azul. Escríbeme un correo de seguimiento cálido y corto, que invite a resolver dudas por WhatsApp, para un cliente que visitó el showroom y cotizó un sauna pero no ha respondido en 10 días."),
            h("Responder con tacto"),
            p("Cuando un cliente pone una objeción o un mensaje difícil, pídele a Claude un borrador amable y profesional."),
            prompt("Actúa como asesor de Ambiente Azul. Escríbeme una respuesta breve y sin presionar, que mantenga vivo el interés y ofrezca ayuda, para un cliente que respondió que “lo va a pensar”."),
            tip("Siempre léelo antes de enviar: pon el nombre real del cliente y confirma que los datos estén correctos."),
          ],
        },
        {
          title: "Explicar productos en palabras del cliente",
          durationMin: 8,
          blocks: [
            h("De lo técnico a lo simple"),
            p("Muchos clientes no entienden los términos técnicos. Pídele a Claude que los traduzca a un lenguaje claro y con un beneficio concreto."),
            prompt("Actúa como asesor de Ambiente Azul. Explica en lenguaje simple y con un beneficio claro, para un cliente sin conocimientos técnicos, qué es un sistema de cloración salina y por qué le conviene frente al cloro tradicional."),
            warn("Si hay datos técnicos (medidas, capacidades, especificaciones), verifícalos con la ficha oficial de la marca antes de dárselos al cliente. Claude redacta muy bien, pero no inventes especificaciones."),
          ],
        },
        {
          title: "Resumir documentos y fichas",
          durationMin: 6,
          blocks: [
            h("Resúmenes en segundos"),
            p("Pega un texto largo —una ficha técnica, un correo extenso, una norma— y pídele un resumen a tu medida."),
            prompt("Actúa como asesor de Ambiente Azul. Resume esta ficha técnica en 5 puntos, resaltando beneficios y sin tecnicismos, para explicárselos a un cliente."),
            tip("Puedes pedir “en 5 viñetas”, “en una sola frase”, o “los 3 beneficios para el cliente”."),
          ],
        },
        {
          title: "Preparar propuestas y responder objeciones",
          durationMin: 9,
          blocks: [
            h("Propuestas más rápidas"),
            p("Dale los datos (producto, necesidad del cliente, puntos a destacar) y pídele una propuesta breve y ordenada que luego tú completas."),
            prompt("Actúa como asesor de AA | DOM. Arma una propuesta breve y ordenada, que destaque durabilidad, acabado y asesoría, para un cliente que quiere renovar su zona húmeda. Deja espacios para que yo ponga los precios."),
            h("Objeciones frecuentes"),
            table(
              ["Objeción del cliente", "Qué pedirle a Claude"],
              [
                ["“Está muy caro”", "“Dame 3 formas amables de responder resaltando el valor y la durabilidad, sin bajar el precio.”"],
                ["“Lo voy a pensar”", "“Escríbeme un seguimiento que no presione pero mantenga vivo el interés.”"],
                ["“Vi más barato en otro lado”", "“Ayúdame a responder resaltando el servicio, la garantía y el respaldo de la marca.”"],
              ],
            ),
            warn("No prometas precios, plazos ni garantías que no estén confirmados. Usa Claude para redactar; los números y compromisos los confirmas y los pones tú."),
          ],
        },
        {
          title: "Más usos para tu día a día",
          durationMin: 9,
          blocks: [
            h("Otros usos que te van a servir"),
            p("Además de correos y propuestas, hay tres tareas que Claude te resuelve rapidísimo. Copia los prompts y adáptalos a tu caso."),
            h("1. Correos en inglés (clientes de Miami)"),
            p("Ambiente Azul tiene showroom en Miami, así que a veces vas a escribirle a un cliente en inglés. No necesitas dominar el idioma: escribe en español y pídele a Claude que lo pase a inglés, bien redactado."),
            prompt(
              `Actúa como asesor de Ambiente Azul. Traduce este correo al inglés, en tono profesional y cálido y que suene natural (no traducción literal), para un cliente en Miami interesado en un spa:

[pega aquí tu correo en español]`,
              "Prompt — Correo en inglés",
            ),
            h("2. Convierte las notas de una visita en seguimiento"),
            p("Después de una visita o una llamada quedas con notas sueltas. Pégaselas a Claude y te las ordena, y hasta te redacta el correo de seguimiento."),
            prompt(
              `Actúa como mi asistente comercial. Estas son mis notas sueltas de una visita a un cliente:

[pega aquí tus notas]

Organízalas para mí en: (1) resumen de lo que quiere el cliente, (2) próximos pasos (lista corta), y (3) un correo de seguimiento breve y cálido para el cliente.`,
              "Prompt — Notas de visita → seguimiento",
            ),
            h("3. Compara dos productos para el cliente"),
            p("Cuando el cliente duda entre dos opciones, una comparación clara lo ayuda a decidir. Pídele a Claude una tabla sencilla."),
            prompt(
              `Actúa como asesor de AA | DOM. Compárame estos dos productos en una tabla sencilla (para qué sirve, ventajas de cada uno y para quién es mejor cada opción), pensada para un cliente que no es técnico:

Producto A: [nombre / datos]
Producto B: [nombre / datos]

No inventes datos; si falta información, márcala como "[por confirmar]".`,
              "Prompt — Comparar dos productos",
            ),
            tip("Guarda estos prompts en tu proyecto (en las Instrucciones o en una nota) para tenerlos siempre a mano."),
            warn("Antes de enviar cualquier dato técnico o comparación al cliente, verifícalo con la ficha oficial de la marca."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Claude en las ventas",
        description: "Aplica Claude a las tareas reales del asesor.",
        timeLimitMin: 12,
        questions: [
          {
            question: "Un cliente dice “está muy caro”. ¿Qué le pides a Claude?",
            type: "MULTIPLE_CHOICE",
            options: ["Que baje el precio automáticamente", "3 formas amables de responder resaltando el valor, sin bajar el precio", "Que ignore al cliente", "Un descuento"],
            correctAnswer: 1,
            explanation: "Claude te ayuda a responder con tacto; el precio lo manejas tú.",
          },
          {
            question: "Para explicar un producto técnico a un cliente, le pides a Claude que…",
            type: "MULTIPLE_CHOICE",
            options: ["Use más tecnicismos", "Lo explique simple y con un beneficio claro", "Copie la ficha tal cual", "No responda"],
            correctAnswer: 1,
            explanation: "El objetivo es que el cliente entienda y vea el beneficio.",
          },
          {
            question: "Antes de darle a un cliente un dato técnico (una medida, una capacidad), debes…",
            type: "MULTIPLE_CHOICE",
            options: ["Confiar en lo que diga Claude", "Verificarlo con la ficha oficial de la marca", "Inventarlo", "Preguntarle al cliente"],
            correctAnswer: 1,
            explanation: "Los datos duros se confirman con la fuente oficial.",
          },
          {
            question: "Claude sirve para resumir una ficha larga en pocos puntos.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 0,
            explanation: "Le pegas el texto y le pides el resumen a tu medida.",
          },
          {
            question: "¿Quién confirma los números y compromisos de un correo o propuesta?",
            type: "MULTIPLE_CHOICE",
            options: ["Claude", "El cliente", "Tú, el asesor", "Nadie"],
            correctAnswer: 2,
            explanation: "Claude redacta; tú confirmas precios, plazos y compromisos.",
          },
        ],
      },
    },

    // ======================= MÓDULO 4 =======================
    {
      title: "Claude para Ambiente Azul",
      lecciones: [
        {
          title: "El mundo de Ambiente Azul",
          durationMin: 8,
          blocks: [
            h("Agua, bienestar y emoción"),
            p("Ambiente Azul representa marcas de bienestar acuático y ofrece un portafolio amplio para el cliente premium: piscinas, spas, cold plunge, saunas, turcos, enchapes y servicio técnico, con showrooms en Medellín, Bogotá y Miami."),
            image(imgPiscina, "El agua es el corazón del portafolio de Ambiente Azul."),
            warn("Los nombres de colecciones, modelos y especificaciones deben verificarse con la información oficial. Claude te ayuda a redactar y explicar, pero no inventa referencias ni datos técnicos. [Completar con el portafolio oficial]"),
            info("Idea: pídele a Claude “explícame en lenguaje de cliente la diferencia entre una piscina residencial y una para hotel”, y ajusta con los datos reales de la empresa."),
          ],
        },
        {
          title: "Explicar spas, saunas y bienestar",
          durationMin: 8,
          blocks: [
            h("Traduce el bienestar a beneficios"),
            p("El cliente de Ambiente Azul compra una experiencia, no una ficha técnica. Pídele a Claude que hable de sensaciones y beneficios."),
            image(imgSpa, "El spa se vende por la experiencia: relajación y bienestar."),
            prompt("Actúa como asesor de Ambiente Azul. Explica en tono cálido y aspiracional, sin tecnicismos, para un cliente, qué es un cold plunge y qué beneficios tiene para su bienestar."),
            prompt("Actúa como community manager de Ambiente Azul. Escríbeme 3 frases para redes sociales sobre el ritual sauna–cold plunge, en tono aspiracional, dirigidas a clientes interesados en bienestar."),
            tip("Para spas Hot Spring, si mencionas una colección (Highlife, Limelight, Hotspot, Freeflow), confirma que sea la correcta antes de enviarlo al cliente."),
          ],
        },
        {
          title: "Climatización, desinfección y servicio técnico",
          durationMin: 7,
          blocks: [
            h("Temas técnicos, explicados fácil"),
            p("Preguntas típicas: “¿sal o cloro?”, “¿cómo caliento el agua?”, “¿cada cuánto el mantenimiento?”. Claude te ayuda a responder claro."),
            image(imgClima, "La climatización y el tratamiento del agua generan muchas preguntas del cliente."),
            prompt("Actúa como asesor de Ambiente Azul. Dame una respuesta corta, equilibrada y en lenguaje simple, para un cliente que pregunta si le conviene cloración salina o cloro tradicional."),
            warn("Para recomendaciones de equipos, capacidades o periodicidad de mantenimiento, apóyate en la ficha oficial y en el área técnica. No prometas resultados ni plazos sin confirmarlos."),
          ],
        },
        {
          title: "Clientes de club y hotel",
          durationMin: 7,
          blocks: [
            h("Proyectos comerciales"),
            p("Con clubs y hoteles el tono es más formal y el enfoque más técnico-comercial. Claude te ayuda a redactar propuestas y correos serios y profesionales."),
            image(imgHotel, "Los proyectos de hotel y club piden un tono formal y profesional."),
            prompt("Actúa como asesor de Ambiente Azul. Redacta un correo formal para el administrador de un hotel, presentando nuestra asesoría integral en piscina y zona húmeda y resaltando respaldo y servicio postventa."),
            tip("Pídele a Claude que use un tono formal y evite promesas: tú añades luego las condiciones oficiales."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Claude para Ambiente Azul",
        description: "Aplica Claude a los productos y clientes de Ambiente Azul.",
        timeLimitMin: 10,
        questions: [
          {
            question: "El cliente de Ambiente Azul compra sobre todo…",
            type: "MULTIPLE_CHOICE",
            options: ["Una ficha técnica llena de datos", "Una experiencia de bienestar", "El equipo más barato", "Solo el precio"],
            correctAnswer: 1,
            explanation: "Se vende bienestar y experiencia; los datos apoyan, no lideran.",
          },
          {
            question: "Si mencionas una colección de spa Hot Spring en un correo, debes…",
            type: "MULTIPLE_CHOICE",
            options: ["Inventar el nombre si no lo recuerdas", "Confirmar que la colección sea la correcta (Highlife, Limelight, Hotspot, Freeflow)", "Dejarlo en inglés siempre", "No mencionarla"],
            correctAnswer: 1,
            explanation: "Usa los nombres oficiales y verifica que correspondan.",
          },
          {
            question: "Para recomendar equipos, capacidades o mantenimiento, te apoyas en…",
            type: "MULTIPLE_CHOICE",
            options: ["Lo que suene bien", "La ficha oficial y el área técnica", "La competencia", "Tu memoria"],
            correctAnswer: 1,
            explanation: "Los datos técnicos se verifican con la fuente oficial.",
          },
          {
            question: "Con un cliente de hotel conviene un tono más formal.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 0,
            explanation: "Los proyectos comerciales piden formalidad y profesionalismo.",
          },
        ],
      },
    },

    // ======================= MÓDULO 5 =======================
    {
      title: "Claude para DOM Design",
      lecciones: [
        {
          title: "El mundo de DOM Design",
          durationMin: 8,
          blocks: [
            h("Los detalles importan"),
            p("DOM Design ofrece materiales para piscinas, terrazas y zonas húmedas: enchapes, porcelanatos, mosaicos y piedra natural. Trabaja con cliente final y con un canal de especificadores (arquitectos, diseñadores, constructores) a través de la Zona PRO."),
            image(imgDom, "Cada material —mosaico, porcelanato, piedra— define la textura y el acabado del espacio."),
            warn("Marcas, colecciones, formatos y especificaciones deben verificarse con la información oficial de cada representada. Claude redacta y explica, pero no inventa referencias. [Completar con el portafolio oficial]"),
            info("El mensaje central de DOM: cada detalle —borde, textura, acabado— define el resultado final. Pídele a Claude que resalte ese enfoque."),
          ],
        },
        {
          title: "Explicar materiales en simple",
          durationMin: 8,
          blocks: [
            h("Del catálogo al lenguaje del cliente"),
            p("Los clientes preguntan por diferencias entre materiales, acabados, dónde usar cada uno. Pídele a Claude explicaciones claras y orientadas al uso."),
            prompt("Actúa como asesor de DOM Design. Explica en lenguaje simple, para un cliente, la diferencia entre porcelanato y cerámica y en qué caso conviene cada uno."),
            info("Recuerda verificar cualquier dato técnico con la ficha oficial antes de enviarlo."),
            prompt("Actúa como asesor de DOM Design. Dame 3 recomendaciones de acabado, en lenguaje de cliente, para una terraza exterior expuesta al agua."),
            warn("Antes de afirmar resistencias, medidas o usos, confírmalo con la ficha del material. No inventes propiedades."),
          ],
        },
        {
          title: "Zona PRO: arquitectos y especificadores",
          durationMin: 8,
          blocks: [
            h("Hablar con el canal técnico"),
            p("Con arquitectos, diseñadores y constructores el tono es técnico y preciso. Claude te ayuda a redactar comunicaciones profesionales y a preparar información para especificación."),
            prompt("Actúa como asesor de DOM Design. Redacta un correo profesional para un arquitecto, presentándole la Zona PRO y los beneficios de especificar con nosotros (asesoría, disponibilidad y acompañamiento)."),
            prompt("Actúa como asesor técnico de DOM Design. Ordena estas características del material en una ficha breve y clara, para incluir en una especificación dirigida a un arquitecto: [pega aquí los datos oficiales]."),
            tip("Para este público, pídele a Claude un tono técnico y preciso, y evita lenguaje de venta agresivo."),
          ],
        },
        {
          title: "Propuestas de materiales",
          durationMin: 7,
          blocks: [
            h("Propuestas que enamoran por el detalle"),
            p("Dale el proyecto del cliente (espacio, estilo, necesidad) y pídele una propuesta que destaque cómo los materiales logran el resultado deseado."),
            prompt("Actúa como asesor de DOM Design. Arma una propuesta breve que destaque textura, antideslizante y estética, para un cliente que quiere una terraza tipo spa en casa. Deja espacios para que yo ponga referencias y precios."),
            warn("Las referencias, formatos y precios los pones tú desde la información oficial. Claude te da la estructura y la redacción."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Claude para DOM Design",
        description: "Aplica Claude a los materiales y clientes de DOM Design.",
        timeLimitMin: 10,
        questions: [
          {
            question: "El mensaje central de DOM Design es…",
            type: "MULTIPLE_CHOICE",
            options: ["El precio más bajo", "Cada detalle define el resultado final", "La cantidad de producto", "La rapidez"],
            correctAnswer: 1,
            explanation: "DOM se posiciona en los detalles y el acabado.",
          },
          {
            question: "La Zona PRO está dirigida a…",
            type: "MULTIPLE_CHOICE",
            options: ["Solo cliente final", "Arquitectos, diseñadores y constructores (especificadores)", "Proveedores", "Empleados"],
            correctAnswer: 1,
            explanation: "Es el canal de especificadores del sector.",
          },
          {
            question: "Con un arquitecto conviene un tono…",
            type: "MULTIPLE_CHOICE",
            options: ["De venta agresiva", "Técnico y preciso", "Informal", "Aspiracional y emocional"],
            correctAnswer: 1,
            explanation: "El canal técnico pide precisión y profesionalismo.",
          },
          {
            question: "Puedes afirmar resistencias y medidas de un material según lo que diga Claude, sin verificar.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 1,
            explanation: "Falso: siempre se confirma con la ficha oficial del material.",
          },
        ],
      },
    },

    // ======================= MÓDULO 6 =======================
    {
      title: "Atención, seguimiento y postventa",
      lecciones: [
        {
          title: "Mensajes de WhatsApp",
          durationMin: 6,
          blocks: [
            h("Cortos, cálidos y claros"),
            p("Gran parte de la venta pasa por WhatsApp. Pídele a Claude mensajes breves, amables y directos."),
            prompt("Actúa como asesor de AA | DOM. Escríbeme un WhatsApp corto y cálido para un cliente, recordándole su cita en el showroom mañana a las 10 a. m."),
            tip("Pide siempre “corto para WhatsApp”: los mensajes largos se ignoran."),
          ],
        },
        {
          title: "Seguimiento y reactivar clientes",
          durationMin: 7,
          blocks: [
            h("Que ningún cliente se enfríe"),
            p("Claude te ayuda a mantener el contacto sin sonar repetitivo."),
            prompt("Actúa como asesor de AA | DOM. Dame 3 mensajes de seguimiento distintos (cada uno con un ángulo: novedad, beneficio, disponibilidad), para un cliente que cotizó hace un mes y no responde."),
            tip("Guarda tus mejores mensajes como plantillas y pídele variaciones cuando las necesites."),
          ],
        },
        {
          title: "Postventa y servicio",
          durationMin: 6,
          blocks: [
            h("La venta no termina en la entrega"),
            p("Un buen postventa fideliza y trae recomendaciones. Claude te ayuda con mensajes de agradecimiento, recordatorios de mantenimiento y encuestas."),
            prompt("Actúa como asesor de Ambiente Azul. Escríbeme un mensaje de postventa, cálido y breve, para un cliente que acaba de recibir su spa: agradece, ofrece acompañamiento y recuérdale el mantenimiento."),
            warn("Para instrucciones de mantenimiento o garantías, usa la información oficial; Claude redacta el mensaje, no define las condiciones."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Atención y seguimiento",
        description: "Usa Claude para atención, seguimiento y postventa.",
        timeLimitMin: 8,
        questions: [
          {
            question: "Para WhatsApp, los mensajes deben ser…",
            type: "MULTIPLE_CHOICE",
            options: ["Largos y detallados", "Cortos, cálidos y claros", "Solo emojis", "Formales y extensos"],
            correctAnswer: 1,
            explanation: "En WhatsApp lo corto y cálido funciona mejor.",
          },
          {
            question: "Para no sonar repetitivo al reactivar un cliente, le pides a Claude…",
            type: "MULTIPLE_CHOICE",
            options: ["El mismo mensaje siempre", "Varias versiones con ángulos distintos", "Que no escriba nada", "Un mensaje larguísimo"],
            correctAnswer: 1,
            explanation: "Pedir variaciones mantiene el contacto fresco.",
          },
          {
            question: "El postventa ayuda a fidelizar y traer recomendaciones.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 0,
            explanation: "Un buen postventa es parte clave de la venta.",
          },
        ],
      },
    },

    // ======================= MÓDULO 7 (NUEVO) =======================
    {
      title: "Trabaja con tus archivos: cotizaciones, presupuestos y contratos",
      lecciones: [
        {
          title: "Crea tu Proyecto en Claude (tu espacio de trabajo)",
          durationMin: 10,
          blocks: [
            h("¿Qué es un “Proyecto” y por qué uno por tema?"),
            p("Un Proyecto es un espacio dentro de Claude donde guardas todo lo de UN mismo tema en un solo lugar: unas instrucciones fijas (cómo quieres que Claude te responda), los archivos de ese tema y todas sus conversaciones. La idea NO es tener un solo proyecto para todo, sino crear UN proyecto por cada tema de tu trabajo. Así cada uno queda enfocado y Claude responde mejor."),
            info("Piénsalo como carpetas: en vez de una sola carpeta con todo revuelto, tienes una carpeta por tema. Ejemplos para un asesor: “Cotizaciones”, “Seguimiento de clientes”, “Correos y propuestas”."),
            image(imgProyecto, "Un proyecto por tema: cada uno con sus propias Instrucciones y Archivos."),
            h("Paso a paso para crear un proyecto"),
            list([
              "Paso 1. Entra a claude.ai.",
              "Paso 2. En la barra de la izquierda, busca la sección “Proyectos”.",
              "Paso 3. Haz clic en “Proyecto nuevo” (o el botón +).",
              "Paso 4. Ponle el nombre del TEMA, por ejemplo: “Cotizaciones” o “Seguimiento de clientes”.",
              "Paso 5. Haz clic en “Crear”. Repite el proceso para cada tema que manejes.",
            ]),
            info("Si no ves la sección “Proyectos” en tu cuenta, avísale a la empresa: puede que tu plan aún no la tenga activada."),
            h("Configura cada proyecto: las Instrucciones"),
            p("Dentro de cada proyecto hay un espacio de “Instrucciones”. Ahí le explicas a Claude, para ese tema, cómo quieres que te ayude. Este es un ejemplo para el proyecto “Cotizaciones” (ajústalo a ti):"),
            prompt(
              `Actúa como asesor comercial de Ambiente Azul y DOM Design, apoyándome con COTIZACIONES.

Cuando te pida algo:
- Responde en español (Colombia), con un tono profesional pero cálido.
- Ordena la información con claridad (por sistemas o capítulos) y resalta los beneficios para el cliente.
- No inventes precios, garantías ni especificaciones: si faltan datos, déjalos marcados como "[por confirmar]".`,
              "Instrucciones del proyecto “Cotizaciones”",
            ),
            h("Agrega los Archivos del tema"),
            p("En cada proyecto sube los archivos propios de ese tema (plantillas, listas de productos, formatos). Quedan disponibles en todas las conversaciones de ese proyecto, sin volver a subirlos."),
            tip("Regla simple: ¿tema nuevo? → proyecto nuevo. Abre el proyecto del tema y crea ahí una conversación por cada caso (por ejemplo, una por cliente)."),
          ],
        },
        {
          title: "Sube tus archivos a Claude",
          durationMin: 9,
          blocks: [
            h("¿Qué significa “adjuntar un archivo”?"),
            p("“Adjuntar” es simplemente subir un documento de tu computador a la conversación, para que Claude lo pueda leer. Es lo mismo que cuando adjuntas un archivo en un correo. Puedes subir: PDF, Excel, Word, PowerPoint o una foto (por ejemplo, la foto de una ficha técnica). Una vez subido, Claude puede resumirlo, ordenarlo, transformarlo o compararlo con otro."),
            info("No necesitas instalar nada. Todo se hace desde la página claude.ai en tu navegador (Chrome, Edge, etc.)."),
            h("Paso a paso (la primera vez)"),
            image(imgAdjuntar, "Fíjate en el botón + a la izquierda de la caja de texto: ahí se adjuntan los archivos."),
            list([
              "Paso 1. Abre tu navegador y entra a la página: claude.ai",
              "Paso 2. Si te pide iniciar sesión, entra con la cuenta que te dio la empresa.",
              "Paso 3. Abajo verás una caja de texto (donde se escribe). Justo a su izquierda hay un botón con el signo +. Haz clic ahí.",
              "Paso 4. Se abrirá una ventana de tu computador. Busca el archivo, haz clic en él y luego en “Abrir”.",
              "Paso 5. Espera 2–3 segundos: cuando el archivo esté listo, verás su nombre encima de la caja de texto (como una etiqueta).",
              "Paso 6. Ahora escribe lo que quieres que haga con ese archivo y presiona Enter.",
            ]),
            tip("Truco: también puedes arrastrar el archivo con el mouse desde tu carpeta y soltarlo encima de la caja de texto. Hace lo mismo que el botón +."),
            tip("Antes de subirlo, revisa que el archivo tenga un nombre claro (por ejemplo “COT-2026-0035.pdf”). Si subes varios, así es fácil decirle a Claude a cuál te refieres."),
            warn("Ojo con la privacidad: antes de subir un documento con datos personales de clientes, precios internos o condiciones comerciales, revisa el módulo “Úsalo con cabeza”. Para practicar, usa un archivo de prueba o borra los datos sensibles."),
          ],
        },
        {
          title: "De la cotización al presupuesto final",
          durationMin: 14,
          blocks: [
            h("¿Qué vamos a hacer?"),
            p("Tienes una cotización detallada (la que sale del cotizador, con todos los ítems, cantidades y precios). Lo que el cliente necesita ver es un presupuesto final: ordenado, agrupado por sistemas, con subtotales, descuentos, valor final y forma de pago. En vez de armarlo a mano, le pasas la cotización a Claude y él lo ordena en segundos. Tú solo revisas."),
            image(imgFlujo, "El asesor conduce el proceso; Claude ordena y calcula, tú revisas y apruebas."),
            info("Antes de empezar: ten el archivo de la cotización guardado en tu computador (en PDF o Excel) para poder subirlo."),
            h("Paso a paso"),
            list([
              "Paso 1. Entra a claude.ai, abre el proyecto del tema (ej. “Cotizaciones”) y crea una conversación nueva dentro de él.",
              "Paso 2. Haz clic en el botón + y sube el archivo de la cotización (espera a que aparezca su nombre).",
              "Paso 3. Copia el prompt de abajo con el botón “Copiar”.",
              "Paso 4. Pégalo en la caja de texto (clic derecho → Pegar, o Ctrl+V) y presiona Enter.",
              "Paso 5. Espera unos segundos: Claude te mostrará el presupuesto.",
            ]),
            h("Opción A — Presupuesto en HTML (se ve elegante y se imprime)"),
            p("El HTML es una página que se abre en el navegador y se ve muy profesional. Copia y pega este prompt (ya trae todo lo que Claude necesita):"),
            prompt(
              `Actúa como asesor comercial de Ambiente Azul. Adjunto la cotización detallada del proyecto.

Conviértela en un PRESUPUESTO FINAL en un solo archivo HTML, listo para abrir e imprimir, pensado para presentárselo al cliente. Requisitos:
- Encabezado con: nombre del proyecto, cliente, asesor, ciudad y fecha (déjalos en blanco si no están).
- Agrupa los ítems por sistema (motobomba, filtración, desinfección, calefacción, iluminación, etc.), con su subtotal por grupo.
- Una tabla por grupo con: ítem, cantidad, valor unitario y valor total.
- Al final: subtotal, IVA (19%), descuentos si los hay y VALOR FINAL.
- Una sección corta de "Forma de pago" y "Condiciones" con lo que venga en la cotización.
- Diseño limpio y profesional, colores sobrios, que quepa en 1 o 2 páginas al imprimir. No inventes ítems ni precios: usa solo lo que está en el archivo.`,
              "Prompt — Presupuesto en HTML (cópialo)",
            ),
            h("Cómo convertir ese HTML en PDF para enviarlo"),
            list([
              "Paso 1. Claude te mostrará una vista previa o un botón para abrir el HTML. Ábrelo (se abre en una pestaña del navegador).",
              "Paso 2. Presiona las teclas Ctrl y P al mismo tiempo (esto abre “Imprimir”).",
              "Paso 3. En “Destino” o “Impresora”, elige “Guardar como PDF”.",
              "Paso 4. Haz clic en “Guardar” y elige dónde guardarlo. ¡Listo, ya tienes el PDF para enviar!",
            ]),
            tip("Si algo no te gusta, escríbeselo en la misma conversación: “hazlo más compacto”, “quita la columna de valor unitario”, “ponle el logo arriba”. Lo rehace al instante."),
            h("Opción B — Que Claude te entregue el PDF directamente"),
            p("Si prefieres no hacer el paso de imprimir, pídele el PDF así:"),
            prompt(
              `Actúa como asesor comercial de Ambiente Azul. Con la misma cotización adjunta, genera un PRESUPUESTO FINAL en PDF para el cliente, detallado pero ordenado:
- Portada breve con proyecto, cliente y fecha.
- Ítems agrupados por sistema con subtotales.
- Totales claros: subtotal, IVA y valor final.
- Incluye forma de pago y condiciones comerciales.
Mantén un diseño profesional y fácil de leer. Usa únicamente la información del archivo; si falta un dato, déjalo indicado como "[por confirmar]".`,
              "Prompt — Presupuesto en PDF (cópialo)",
            ),
            warn("Revisa SIEMPRE antes de enviarlo al cliente: que los totales cuadren, que el IVA esté bien y que no haya aparecido ningún ítem o precio que no estaba en la cotización. Los números son tu responsabilidad; Claude solo los ordena."),
          ],
        },
        {
          title: "Revisa el contrato contra el presupuesto",
          durationMin: 12,
          blocks: [
            h("¿Para qué sirve esto?"),
            p("Cuando ya existe un contrato y un presupuesto final del mismo proyecto, conviene compararlos antes de firmar o facturar. Es fácil que se cuele una diferencia: un valor que no coincide, una cantidad distinta, un alcance que cambió o una forma de pago diferente. En vez de leer los dos documentos línea por línea, Claude los lee por ti y te dice en qué se diferencian."),
            h("Paso a paso"),
            list([
              "Paso 1. Entra a claude.ai, abre el proyecto del tema (ej. “Cotizaciones”) y crea una conversación nueva dentro de él.",
              "Paso 2. Haz clic en el botón + y sube el PRESUPUESTO FINAL.",
              "Paso 3. Haz clic OTRA VEZ en el botón + y sube también el CONTRATO. (Sí, puedes subir dos archivos en el mismo mensaje.)",
              "Paso 4. Copia y pega el prompt de abajo, y presiona Enter.",
              "Paso 5. Lee con calma la tabla y la lista de diferencias que te entrega.",
            ]),
            h("Qué le pedimos que revise"),
            list([
              "Valor total y valor final del negocio.",
              "IVA y descuentos.",
              "Cantidades y equipos (que el contrato liste lo mismo que el presupuesto).",
              "Alcance (qué incluye y qué no: suministro, instalación, etc.).",
              "Forma de pago y anticipos (porcentajes y montos).",
              "Plazos de entrega.",
            ]),
            prompt(
              `Actúa como mi asistente de revisión. Adjunto dos documentos del mismo proyecto: (1) el PRESUPUESTO FINAL y (2) el CONTRATO.

Compáralos y ayúdame a encontrar diferencias o posibles errores (esto es para mí, uso interno). Entrégame:
1. Una tabla con columnas: Concepto | Valor en el presupuesto | Valor en el contrato | ¿Coincide? (Sí/No).
   Incluye al menos: valor total, IVA, descuentos, anticipo/forma de pago, alcance y plazos.
2. Una lista de "Diferencias a revisar" explicando cada punto que no coincida.
3. Una lista de "Cosas que están en un documento y no en el otro".
No saques conclusiones legales; solo señala las diferencias para que yo las verifique.`,
              "Prompt — Comparar contrato vs. presupuesto",
            ),
            p("El resultado se ve parecido a esto (ejemplo):"),
            table(
              ["Concepto", "Presupuesto", "Contrato", "¿Coincide?"],
              [
                ["Valor final", "$276.501.260", "$276.501.260", "Sí"],
                ["Anticipo", "60%", "60%", "Sí"],
                ["Plazo de entrega", "70 días", "90 días", "No — revisar"],
                ["Alcance sauna", "Incluye vidrios", "No incluye vidrios", "No — revisar"],
              ],
            ),
            warn("Claude te ayuda a detectar diferencias, no a decidir. Cualquier tema legal o contractual confírmalo con la persona responsable y, si aplica, con el abogado. Las cifras finales se validan con la fuente oficial."),
          ],
        },
        {
          title: "Dudas técnicas de equipos (con búsqueda web)",
          durationMin: 9,
          blocks: [
            h("¿Qué es la “búsqueda web”?"),
            p("Normalmente Claude responde con lo que ya sabe. Pero si activas la “búsqueda web”, además va a buscar en internet (páginas, fichas técnicas) antes de responderte. Sirve para dudas técnicas de un equipo: el caudal de una bomba, el consumo de un calentador, la compatibilidad de un filtro."),
            image(imgWeb, "El interruptor de “Búsqueda web” está justo debajo de la caja de texto. Actívalo antes de enviar."),
            h("Paso a paso"),
            list([
              "Paso 1. En claude.ai, escribe tu pregunta técnica en la caja de texto.",
              "Paso 2. Debajo de la caja, busca la opción “Búsqueda web” (a veces aparece como un mundo/globo o como “Buscar en la web”). Haz clic para activarla: el interruptor queda encendido/azul.",
              "Paso 3. Presiona Enter y espera: Claude buscará y te responderá diciendo de dónde sacó la información.",
              "Paso 4. Pídele el enlace de la fuente para poder verificarlo tú mismo.",
            ]),
            info("¿No ves la opción? A veces está dentro del mismo botón + o de un pequeño menú de ajustes junto a la caja. El nombre puede cambiar con las actualizaciones, pero siempre habla de “web” o “buscar”."),
            prompt(
              `Actúa como asesor de Ambiente Azul y activa la búsqueda web para responder esto:

Un cliente quiere saber el caudal (GPM) recomendado y el consumo aproximado de una bomba de calor de 105.000 BTU para una piscina de unos 75 m³.
- Dame una respuesta corta y en lenguaje sencillo para el cliente.
- Incluye los enlaces de las fuentes que usaste.
- Si hay rangos o depende del modelo, dímelo con claridad.`,
              "Prompt — Pregunta técnica con búsqueda web",
            ),
            warn("La búsqueda web ayuda a orientarte, pero puede traer datos de otras marcas o mercados. Antes de darle un dato técnico al cliente, confírmalo con la ficha oficial de la marca que representamos. Nunca prometas una especificación sin verificarla."),
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
            prompt("Actúa como mi asistente comercial. Busca en mi Google Drive la cotización “COT-2026-0035” y hazme un resumen de una página, en tono claro, para enviárselo al cliente.", "Prompt con un conector (Drive)"),
            warn("Conecta solo cuentas de la empresa o autorizadas, y concede únicamente los permisos necesarios. No compartas accesos que no debas y desconecta lo que dejes de usar. Ante la duda, consulta con la empresa."),
          ],
        },
        {
          title: "Explícale al cliente cómo usar su producto",
          durationMin: 10,
          blocks: [
            h("Del manual técnico a una guía sencilla"),
            p("Los manuales de los equipos suelen ser técnicos y largos. El cliente solo quiere saber “cómo lo prendo”, “cómo lo cuido”, “qué no debo hacer”. Claude convierte ese manual en una guía simple, en pasos, con lenguaje de persona normal."),
            h("Paso a paso"),
            list([
              "Paso 1. Consigue el manual del equipo en PDF (o copia el texto que tengas).",
              "Paso 2. En claude.ai, súbelo con el botón + (o pega el texto en la caja).",
              "Paso 3. Copia y pega el prompt de abajo y presiona Enter.",
              "Paso 4. Copia la guía que te dé y envíasela al cliente (por correo o WhatsApp).",
            ]),
            prompt(
              `Actúa como asesor de Ambiente Azul. Adjunto el manual del equipo (o pego el texto abajo).

Conviértelo en una guía sencilla para el cliente (que no es técnico), así:
- Título amable y una frase de introducción.
- Pasos numerados para el uso diario, en lenguaje simple y sin tecnicismos.
- Una sección corta de "Cuidados" y otra de "Qué NO hacer".
- Al final, un mensaje corto y cálido para enviar por WhatsApp presentando la guía.
Marca con "[Captura: …]" los lugares donde convendría poner una foto o pantallazo del equipo para que se entienda mejor.`,
              "Prompt — Guía de uso para el cliente",
            ),
            tip("Pídele versiones: “hazlo más corto”, “en tono más cercano”, “como lista para imprimir y pegar junto al equipo”."),
            info("Cuando Claude te marque “[Captura: …]”, ahí es donde tú tomas una foto del equipo (o un pantallazo) y le dibujas una flecha o un círculo señalando el botón. Una imagen con una flecha vale más que un párrafo."),
            h("¡Listo!"),
            p("Con estas cuatro habilidades —crear presupuestos, cruzar contra el contrato, resolver dudas técnicas y explicarle al cliente— Claude deja de ser solo “para escribir correos” y se vuelve una herramienta de trabajo completa para tu día a día como asesor."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Trabaja con tus archivos",
        description: "Cotizaciones, presupuestos, contratos y dudas técnicas.",
        timeLimitMin: 12,
        questions: [
          {
            question: "¿Para qué sirve crear un “Proyecto” en Claude?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Para tener en un solo lugar tus instrucciones, archivos y conversaciones",
              "Para pagar menos",
              "Para que otros vean tus chats",
              "No sirve para nada",
            ],
            correctAnswer: 0,
            explanation: "Un proyecto reúne instrucciones, archivos y conversaciones; trabajas siempre dentro de él.",
          },
          {
            question: "Para que Claude trabaje sobre tu cotización, primero debes…",
            type: "MULTIPLE_CHOICE",
            options: [
              "Escribirla toda a mano en el chat",
              "Adjuntar el archivo con el botón +",
              "Enviársela por correo",
              "No se puede, Claude no lee archivos",
            ],
            correctAnswer: 1,
            explanation: "Claude lee PDF, Excel, Word e imágenes: los adjuntas con el botón +.",
          },
          {
            question: "Al convertir una cotización en presupuesto, ¿qué NO debe hacer Claude?",
            type: "MULTIPLE_CHOICE",
            options: [
              "Agrupar por sistemas",
              "Calcular subtotales",
              "Inventar ítems o precios que no estaban",
              "Dar un formato limpio",
            ],
            correctAnswer: 2,
            explanation: "Solo debe ordenar la información del archivo; los datos no se inventan.",
          },
          {
            question: "Al comparar contrato y presupuesto, Claude…",
            type: "MULTIPLE_CHOICE",
            options: [
              "Decide legalmente cuál vale",
              "Señala las diferencias para que tú las verifiques",
              "Firma el contrato",
              "Cambia el contrato automáticamente",
            ],
            correctAnswer: 1,
            explanation: "Detecta diferencias; la decisión y lo legal son tuyos (y del abogado si aplica).",
          },
          {
            question: "Para una duda técnica de un equipo conviene…",
            type: "MULTIPLE_CHOICE",
            options: [
              "Activar la búsqueda web y pedir la fuente",
              "Adivinar el dato",
              "Prometer la especificación sin verificar",
              "Preguntarle al cliente",
            ],
            correctAnswer: 0,
            explanation: "La búsqueda web orienta; luego confirmas con la ficha oficial de la marca.",
          },
          {
            question: "Un dato técnico encontrado con búsqueda web se puede dar al cliente sin verificar.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 1,
            explanation: "Falso: siempre se confirma con la ficha oficial de la marca representada.",
          },
          {
            question: "Para explicarle a un cliente cómo usar su equipo, le pides a Claude…",
            type: "MULTIPLE_CHOICE",
            options: [
              "Que copie el manual técnico tal cual",
              "Una guía en pasos, en lenguaje simple, y dónde poner capturas",
              "Que no explique nada",
              "Un texto en inglés",
            ],
            correctAnswer: 1,
            explanation: "El objetivo es una guía clara y sencilla, con pasos y apoyo visual.",
          },
        ],
      },
    },

    // ======================= MÓDULO 8 =======================
    {
      title: "Úsalo con cabeza",
      lecciones: [
        {
          title: "Revisa siempre: Claude puede equivocarse",
          durationMin: 6,
          blocks: [
            h("Claude no es infalible"),
            p("A veces Claude da respuestas que suenan muy seguras pero tienen errores o datos inventados (a esto se le llama “alucinar”). Por eso, tú eres el filtro: lee, corrige nombres y datos, y envía solo cuando estés seguro."),
            tip("Regla de oro: Claude redacta, tú revisas y apruebas."),
            image(imgChecklist, "Antes de enviar cualquier cosa al cliente, pásale esta lista rápida."),
          ],
        },
        {
          title: "Cuida la información",
          durationMin: 6,
          blocks: [
            h("Qué NO pegar en Claude"),
            image(imgPrivacidad, "Una guía rápida de qué puedes pegar sin problema y qué no."),
            warn("No pegues información sensible o confidencial: datos personales de clientes, condiciones comerciales internas, precios especiales, cifras internas o contratos."),
            p("Para la mayoría de tareas no hace falta pegar datos privados. Si necesitas personalizar, trabaja con datos genéricos y al final tú pones lo real."),
            list([
              "Evita: cédulas, teléfonos y correos privados de clientes.",
              "Evita: precios internos, márgenes y descuentos confidenciales.",
              "Evita: contratos y documentos legales.",
            ]),
          ],
        },
        {
          title: "Precios, garantías, datos técnicos y claims",
          durationMin: 7,
          blocks: [
            h("Los datos duros los pones tú"),
            p("Claude no conoce los precios, garantías, especificaciones ni los claims oficiales de Ambiente Azul o DOM Design. Úsalo para redactar y organizar; los datos exactos confírmalos con la fuente oficial."),
            list([
              "Precios y descuentos → con la lista oficial.",
              "Garantías y plazos → con la información oficial de la empresa.",
              "Datos técnicos → con la ficha de la marca.",
              "Claims de las marcas representadas → verificados con cada matriz.",
              "Temas legales o tributarios → con el área correspondiente.",
            ]),
            info("Claude es excelente para redactar, resumir y dar ideas; los números, compromisos y afirmaciones de marca son tuyos."),
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
            options: ["Un texto general para mejorar la redacción", "Datos sensibles de clientes, precios internos o contratos", "Una pregunta", "Una idea"],
            correctAnswer: 1,
            explanation: "La información confidencial no se comparte.",
          },
          {
            question: "Claude conoce los precios y garantías oficiales de AA | DOM.",
            type: "TRUE_FALSE",
            options: ["Verdadero", "Falso"],
            correctAnswer: 1,
            explanation: "Falso: esos datos los confirmas con la fuente oficial.",
          },
          {
            question: "La regla de oro es…",
            type: "MULTIPLE_CHOICE",
            options: ["Claude decide y tú envías sin leer", "Claude redacta, tú revisas y apruebas", "No usar Claude nunca", "Copiar y pegar sin mirar"],
            correctAnswer: 1,
            explanation: "Tú siempre tienes la última palabra.",
          },
          {
            question: "Los claims de las marcas representadas se pueden usar…",
            type: "MULTIPLE_CHOICE",
            options: ["Como los redacte Claude", "Solo verificados con cada matriz/fuente oficial", "Sin revisar", "Si suenan bien"],
            correctAnswer: 1,
            explanation: "Las afirmaciones de marca se verifican con la fuente oficial.",
          },
        ],
      },
    },

    // ======================= MÓDULO 9 =======================
    {
      title: "Práctica guiada",
      lecciones: [
        {
          title: "Ejercicio 1: seguimiento (Ambiente Azul)",
          durationMin: 8,
          blocks: [
            h("Manos a la obra"),
            p("Escribe un correo de seguimiento para un cliente de piscina o spa usando RAFA. Pasos:"),
            list([
              "Piensa el contexto: ¿quién es el cliente y qué cotizó?",
              "Escribe el pedido con RAFA: Rol, Acción, Formato y Audiencia.",
              "Lee la respuesta y ajústala (tono, largo, saludo).",
              "Personaliza con el nombre real y los datos correctos.",
              "Revisa y envía.",
            ]),
            prompt("Actúa como asesor de Ambiente Azul. Escríbeme un correo cálido y corto (máx. 5 líneas) para un cliente que cotizó un spa hace 3 semanas y no responde, invitándolo a agendar una llamada esta semana.", "Prompt para practicar (RAFA)"),
          ],
        },
        {
          title: "Ejercicio 2: arquitecto (DOM Design)",
          durationMin: 7,
          blocks: [
            h("Comunicación con el canal técnico"),
            p("Redacta un correo profesional para un arquitecto presentando un material para un proyecto."),
            prompt("Actúa como asesor de DOM Design. Redacta un correo profesional y breve para un arquitecto, presentándole la Zona PRO y ofreciéndole asesoría para especificar materiales en un proyecto de zona húmeda.", "Prompt para practicar (RAFA)"),
            tip("Pídele tono técnico y preciso; luego agrega las referencias oficiales."),
          ],
        },
        {
          title: "Ejercicio 3: explicar y resumir",
          durationMin: 7,
          blocks: [
            h("Traduce y resume"),
            p("Toma un producto o una ficha que te cueste explicar y pídele una versión simple para el cliente."),
            prompt("Actúa como asesor de AA | DOM. Explica en 3 frases sencillas, sin tecnicismos, un beneficio clave de [producto], para un cliente que no conoce el tema.", "Prompt para practicar (RAFA)"),
            warn("Verifica cualquier dato técnico del resultado con la ficha oficial antes de enviárselo al cliente."),
            h("¡Felicitaciones!"),
            p("Ya tienes lo necesario para usar Claude en tu día a día como asesor de AA | DOM: pedir bien, aplicarlo a cada empresa y cada tipo de cliente, y hacerlo con criterio. Úsalo como tu aliado para vender mejor y ahorrar tiempo."),
          ],
        },
      ],
      examen: {
        title: "Evaluación final",
        description: "Cierra el curso repasando todo lo aprendido.",
        timeLimitMin: 12,
        questions: [
          {
            question: "El orden para usar Claude en un correo es…",
            type: "MULTIPLE_CHOICE",
            options: ["Enviar y luego pensar", "Contexto → pedir → revisar → personalizar → enviar", "Copiar de otro correo", "No revisar"],
            correctAnswer: 1,
            explanation: "Primero le das contexto y la tarea, luego revisas y personalizas.",
          },
          {
            question: "Con un cliente de Ambiente Azul el tono ideal suele ser…",
            type: "MULTIPLE_CHOICE",
            options: ["Frío y técnico", "Cálido y aspiracional (bienestar)", "Agresivo", "Indiferente"],
            correctAnswer: 1,
            explanation: "Ambiente Azul conecta con agua, bienestar y emoción.",
          },
          {
            question: "Con un arquitecto de la Zona PRO (DOM) el tono ideal es…",
            type: "MULTIPLE_CHOICE",
            options: ["Técnico y preciso", "Emocional", "De venta agresiva", "Informal"],
            correctAnswer: 0,
            explanation: "El canal de especificadores pide precisión.",
          },
          {
            question: "Antes de enviar una propuesta con precios hecha con ayuda de Claude, ¿qué haces?",
            type: "MULTIPLE_CHOICE",
            options: ["Confiar en los precios que puso", "Verificar precios y condiciones con la fuente oficial", "Nada", "Preguntarle al cliente"],
            correctAnswer: 1,
            explanation: "Los precios y condiciones siempre se confirman.",
          },
          {
            question: "Claude reemplaza tu criterio como asesor.",
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

  // Reemplaza la versión anterior del curso (si existía).
  const previo = await prisma.course.findFirst({
    where: { title: CURSO_TITLE },
    select: { id: true },
  });
  if (previo) {
    await prisma.course.delete({ where: { id: previo.id } });
    console.log("♻️  Curso anterior eliminado; se recrea ampliado.");
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
        "Aprende a usar Claude, el asistente de inteligencia artificial, para vender mejor y ahorrar tiempo en Ambiente Azul y DOM Design: redactar correos, explicar productos, preparar propuestas, atender y hacer seguimiento. Sin tecnicismos, con casos reales de ambas empresas.",
      category: "FORMACION_CONTINUA",
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
    `✅ Curso "${CURSO_TITLE}" (ampliado) creado como BORRADOR — ${modulos.length} módulos, ${lecciones} lecciones, ${totalMin} min.`,
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
