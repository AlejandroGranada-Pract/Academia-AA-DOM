import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});
const prisma = new PrismaClient({ adapter });

// Crea el curso "Claude para Asesores Comerciales" como BORRADOR. Idempotente:
// si el curso ya existe (por título), no hace nada.

const CURSO_TITLE = "Claude para Asesores Comerciales";

type Block = Record<string, unknown>;
const h = (text: string): Block => ({ type: "heading", text });
const p = (text: string): Block => ({ type: "paragraph", text });
const list = (items: string[]): Block => ({ type: "list", items });
const info = (text: string): Block => ({ type: "callout", style: "info", text });
const tip = (text: string): Block => ({ type: "callout", style: "tip", text });
const warn = (text: string): Block => ({ type: "callout", style: "warning", text });
const table = (headers: string[], rows: string[][]): Block => ({
  type: "table",
  headers,
  rows,
});

type Leccion = { title: string; durationMin: number; blocks: Block[] };
type Pregunta = {
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: string[];
  correctAnswer: number;
  explanation: string;
};
type Examen = {
  title: string;
  description: string;
  timeLimitMin: number;
  questions: Pregunta[];
};
type Modulo = { title: string; lecciones: Leccion[]; examen: Examen };

const modulos: Modulo[] = [
  // ============================ MÓDULO 1 ============================
  {
    title: "Conoce a Claude",
    lecciones: [
      {
        title: "¿Qué es Claude?",
        durationMin: 8,
        blocks: [
          h("¿Qué es Claude?"),
          p(
            "Claude es un asistente de inteligencia artificial creado por la empresa Anthropic. En palabras simples: es como tener un compañero que escribe, resume, organiza ideas y responde preguntas, disponible a toda hora. Le escribes lo que necesitas en lenguaje normal —como en un chat de WhatsApp— y te responde en segundos.",
          ),
          h("¿Qué NO es?"),
          list([
            "No es un buscador como Google: no “busca páginas”, sino que redacta y razona con lo que tú le das.",
            "No reemplaza tu criterio: tú decides, revisas y apruebas.",
            "No conoce a tus clientes ni tus precios… a menos que tú se los cuentes.",
          ]),
          tip(
            "Piensa en Claude como un practicante muy rápido y bien redactado: le explicas la tarea, la hace en segundos, y tú la revisas y ajustas.",
          ),
          h("¿Por qué te sirve como asesor?"),
          p(
            "Un asesor comercial pasa buena parte del día escribiendo: correos, cotizaciones, respuestas, propuestas. Claude te ayuda a hacer todo eso más rápido y mejor redactado, para que dediques tu tiempo a lo que de verdad importa: vender y atender al cliente.",
          ),
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
          h("Tu primer mensaje"),
          p(
            "Escríbele como si le hablaras a un colega. Por ejemplo: “Ayúdame a redactar un correo corto y amable para recordarle a un cliente que su cotización de piscina sigue disponible.”",
          ),
          p(
            "Claude responde en segundos. Si algo no quedó como querías, se lo dices: “hazlo más corto”, “más formal”, “agrégale una despedida”.",
          ),
          tip(
            "No tienes que escribir “perfecto”. Escribe natural; si la respuesta no te convence, la ajustas con otra frase.",
          ),
          h("Conversaciones"),
          p(
            "Cada tema puede ir en su propia conversación, y Claude recuerda lo que hablaron dentro de ella. Para un tema nuevo, abre una conversación nueva.",
          ),
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
              ["Explicar productos", "“Explícale a un cliente, sin términos técnicos, qué es una piscina desbordante.”"],
              ["Resumir documentos", "“Resume esta ficha técnica en 5 puntos clave.”"],
              ["Preparar propuestas", "“Arma una propuesta breve con estos datos…”"],
              ["Dar ideas", "“Dame 3 ideas de mensaje para redes sobre saunas.”"],
              ["Mejorar textos", "“Corrige la ortografía y mejora la redacción de este texto.”"],
            ],
          ),
          info(
            "En los siguientes módulos verás cómo pedir cada una de estas cosas para que salgan bien desde la primera.",
          ),
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
          options: [
            "Un buscador como Google",
            "Un asistente de inteligencia artificial que escribe, resume y responde",
            "Una red social",
            "Un programa de contabilidad",
          ],
          correctAnswer: 1,
          explanation: "Claude es un asistente de IA: le escribes en lenguaje normal y te ayuda a redactar, resumir y responder.",
        },
        {
          question: "Claude conoce automáticamente los precios y los clientes de la empresa.",
          type: "TRUE_FALSE",
          options: ["Verdadero", "Falso"],
          correctAnswer: 1,
          explanation: "Falso: solo sabe lo que tú le cuentes en la conversación.",
        },
        {
          question: "¿Cuál es la forma correcta de escribirle?",
          type: "MULTIPLE_CHOICE",
          options: [
            "Con comandos de programación",
            "En lenguaje normal, como a un colega",
            "Solo en inglés",
            "Con códigos especiales",
          ],
          correctAnswer: 1,
          explanation: "Le hablas en lenguaje natural, como en un chat.",
        },
        {
          question: "Si la respuesta no te gusta, lo mejor es…",
          type: "MULTIPLE_CHOICE",
          options: [
            "Empezar de cero siempre",
            "Decirle qué cambiar en la misma conversación",
            "Cerrar sesión",
            "Dejarlo así",
          ],
          correctAnswer: 1,
          explanation: "Afinar es rápido: le dices qué ajustar y lo rehace.",
        },
        {
          question: "¿Qué NO deberías hacer sin revisar primero?",
          type: "MULTIPLE_CHOICE",
          options: [
            "Pedirle un borrador de correo",
            "Enviar precios y datos que él generó sin verificarlos",
            "Pedirle ideas",
            "Pedirle un resumen",
          ],
          correctAnswer: 1,
          explanation: "Tú siempre revisas y verificas los datos antes de enviarlos.",
        },
      ],
    },
  },

  // ============================ MÓDULO 2 ============================
  {
    title: "Cómo pedirle bien las cosas",
    lecciones: [
      {
        title: "La receta: contexto + tarea + formato",
        durationMin: 8,
        blocks: [
          h("El secreto de una buena respuesta"),
          p(
            "La calidad de lo que Claude te entrega depende de cómo se lo pidas. La receta sencilla tiene 3 partes:",
          ),
          list([
            "Contexto: cuéntale la situación (quién es el cliente, qué producto, qué pasó).",
            "Tarea: dile exactamente qué quieres (un correo, un resumen, 3 ideas).",
            "Formato: cómo lo quieres (corto, en viñetas, tono formal, máximo 5 líneas).",
          ]),
          info(
            "Ejemplo: “Un cliente cotizó un jacuzzi hace dos semanas y no ha respondido (contexto). Escríbeme un correo de seguimiento amable (tarea), corto, de máximo 5 líneas y con una invitación a agendar una llamada (formato).”",
          ),
          tip(
            "No necesitas las 3 partes siempre, pero entre más contexto le des, mejor te responde.",
          ),
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
          p(
            "La diferencia es simple: el pedido bueno dice para quién, para qué y cómo. Eso es todo.",
          ),
        ],
      },
      {
        title: "Ajustar el tono y afinar",
        durationMin: 7,
        blocks: [
          h("Dale el tono que necesitas"),
          p(
            "Puedes pedirle el estilo exacto: “tono profesional pero cercano”, “más formal para un hotel”, “aspiracional, hablando de bienestar”.",
          ),
          list([
            "“Hazlo más corto.”",
            "“Más formal.”",
            "“Cámbiale el saludo.”",
            "“Ponlo más vendedor.”",
            "“Quítale los tecnicismos.”",
          ]),
          tip(
            "Si la primera respuesta no te convence, no empieces de cero: dile qué cambiar. Afinar es normal y toma segundos.",
          ),
          warn(
            "Recuerda la voz de la marca: para Ambiente Azul conecta agua, bienestar y emoción; para DOM destaca cómo cada detalle define el resultado. Puedes pedírselo a Claude tal cual.",
          ),
        ],
      },
    ],
    examen: {
      title: "Evaluación — Cómo pedirle bien",
      description: "Practica la receta para obtener buenas respuestas.",
      timeLimitMin: 10,
      questions: [
        {
          question: "La receta para un buen pedido incluye…",
          type: "MULTIPLE_CHOICE",
          options: [
            "Contexto, tarea y formato",
            "Solo la palabra “hazlo”",
            "Códigos y comandos",
            "El precio del producto",
          ],
          correctAnswer: 0,
          explanation: "Contexto (la situación) + tarea (qué quieres) + formato (cómo lo quieres).",
        },
        {
          question: "¿Cuál es el mejor pedido?",
          type: "MULTIPLE_CHOICE",
          options: [
            "“Hazme un correo”",
            "“Escribe algo”",
            "“Correo por favor”",
            "“Escríbeme un correo corto y cálido para recordarle a un cliente que su cotización sigue vigente e invitarlo al showroom”",
          ],
          correctAnswer: 3,
          explanation: "Dice para quién, para qué y cómo: por eso sale mejor.",
        },
        {
          question: "Para cambiar el estilo del texto puedes pedirle…",
          type: "MULTIPLE_CHOICE",
          options: [
            "“Más formal / más corto / sin tecnicismos”",
            "Nada, sale como sale",
            "Reinstalar el programa",
            "Usar otro programa",
          ],
          correctAnswer: 0,
          explanation: "Le pides el ajuste en palabras simples y lo rehace.",
        },
        {
          question: "Dar más contexto hace que la respuesta sea mejor.",
          type: "TRUE_FALSE",
          options: ["Verdadero", "Falso"],
          correctAnswer: 0,
          explanation: "Entre más contexto, más se acerca a lo que necesitas.",
        },
        {
          question: "Si necesitas el tono de la marca, ¿qué haces?",
          type: "MULTIPLE_CHOICE",
          options: [
            "Se lo pides explícitamente (ej. “tono cercano y aspiracional”)",
            "No se puede",
            "Solo sale formal",
            "Hay que programarlo",
          ],
          correctAnswer: 0,
          explanation: "Puedes indicarle el tono y el estilo que quieras.",
        },
      ],
    },
  },

  // ============================ MÓDULO 3 ============================
  {
    title: "Claude en tu día a día de ventas",
    lecciones: [
      {
        title: "Redactar y responder correos",
        durationMin: 9,
        blocks: [
          h("Correos de seguimiento"),
          p(
            "Es de lo más útil: recordar cotizaciones, retomar clientes fríos, agradecer una visita.",
          ),
          info(
            "Ejemplo: “Cliente visitó el showroom de Medellín y cotizó un sauna, pero no ha respondido en 10 días. Escríbeme un correo de seguimiento cálido, corto, que invite a resolver dudas por WhatsApp.”",
          ),
          h("Responder con tacto"),
          p(
            "Cuando un cliente pone una objeción o un mensaje difícil, pídele a Claude un borrador amable y profesional.",
          ),
          info(
            "Ejemplo: “Un cliente respondió que lo va a pensar. Escríbeme una respuesta breve, sin presionar, que mantenga vivo el interés y ofrezca ayuda.”",
          ),
          tip(
            "Siempre léelo antes de enviar: pon el nombre real del cliente y confirma que los datos estén correctos.",
          ),
        ],
      },
      {
        title: "Explicar productos en palabras del cliente",
        durationMin: 8,
        blocks: [
          h("De lo técnico a lo simple"),
          p(
            "Muchos clientes no entienden los términos técnicos. Pídele a Claude que los traduzca a un lenguaje claro y con un beneficio concreto.",
          ),
          info(
            "Ejemplo: “Explícale a un cliente, en lenguaje simple y con un beneficio claro, qué es un sistema de cloración salina y por qué le conviene frente al cloro tradicional.”",
          ),
          warn(
            "Si hay datos técnicos (medidas, capacidades, especificaciones), verifícalos con la ficha oficial de la marca antes de dárselos al cliente. Claude redacta muy bien, pero no inventes especificaciones.",
          ),
        ],
      },
      {
        title: "Resumir documentos y fichas",
        durationMin: 6,
        blocks: [
          h("Resúmenes en segundos"),
          p(
            "Pega un texto largo —una ficha técnica, un correo extenso, una norma— y pídele un resumen a tu medida.",
          ),
          info(
            "Ejemplo: “Resume esta ficha técnica en 5 puntos que le pueda explicar a un cliente, resaltando beneficios y no tecnicismos.”",
          ),
          tip(
            "Puedes pedir “en 5 viñetas”, “en una sola frase”, o “los 3 beneficios para el cliente”.",
          ),
        ],
      },
      {
        title: "Preparar propuestas y responder objeciones",
        durationMin: 9,
        blocks: [
          h("Propuestas más rápidas"),
          p(
            "Dale los datos (producto, necesidad del cliente, puntos a destacar) y pídele una propuesta breve y ordenada que luego tú completas.",
          ),
          info(
            "Ejemplo: “Arma una propuesta breve y ordenada para un cliente que quiere renovar la zona húmeda de su casa con enchapes DOM: destaca durabilidad, acabado y asesoría. Deja espacios para que yo ponga precios.”",
          ),
          h("Objeciones frecuentes"),
          table(
            ["Objeción del cliente", "Qué pedirle a Claude"],
            [
              ["“Está muy caro”", "“Dame 3 formas amables de responder resaltando el valor y la durabilidad, sin bajar el precio.”"],
              ["“Lo voy a pensar”", "“Escríbeme un seguimiento que no presione pero mantenga vivo el interés.”"],
              ["“Vi más barato en otro lado”", "“Ayúdame a responder resaltando el servicio, la garantía y el respaldo de la marca.”"],
            ],
          ),
          warn(
            "No prometas precios, plazos ni garantías que no estén confirmados. Usa Claude para redactar; los números y compromisos los confirmas y los pones tú.",
          ),
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
          options: [
            "Que baje el precio automáticamente",
            "3 formas amables de responder resaltando el valor, sin bajar el precio",
            "Que ignore al cliente",
            "Un descuento",
          ],
          correctAnswer: 1,
          explanation: "Claude te ayuda a responder con tacto; el precio lo manejas tú.",
        },
        {
          question: "Para explicar un producto técnico a un cliente, le pides a Claude que…",
          type: "MULTIPLE_CHOICE",
          options: [
            "Use más tecnicismos",
            "Lo explique simple y con un beneficio claro",
            "Copie la ficha tal cual",
            "No responda",
          ],
          correctAnswer: 1,
          explanation: "El objetivo es que el cliente entienda y vea el beneficio.",
        },
        {
          question: "Antes de darle a un cliente un dato técnico (una medida, una capacidad), debes…",
          type: "MULTIPLE_CHOICE",
          options: [
            "Confiar en lo que diga Claude",
            "Verificarlo con la ficha oficial de la marca",
            "Inventarlo",
            "Preguntarle al cliente",
          ],
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
          question: "Para preparar una propuesta, ¿qué le das a Claude?",
          type: "MULTIPLE_CHOICE",
          options: [
            "Nada",
            "Los datos del producto y lo que quieres destacar",
            "Tu contraseña",
            "El precio de la competencia",
          ],
          correctAnswer: 1,
          explanation: "Con contexto arma una propuesta ordenada que tú completas.",
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

  // ============================ MÓDULO 4 ============================
  {
    title: "Úsalo con cabeza",
    lecciones: [
      {
        title: "Revisa siempre: Claude puede equivocarse",
        durationMin: 6,
        blocks: [
          h("Claude no es infalible"),
          p(
            "A veces Claude da respuestas que suenan muy seguras pero tienen errores o datos inventados (a esto se le llama “alucinar”). Por eso, tú eres el filtro: lee, corrige nombres y datos, y envía solo cuando estés seguro.",
          ),
          tip("Regla de oro: Claude redacta, tú revisas y apruebas."),
        ],
      },
      {
        title: "Cuida la información",
        durationMin: 6,
        blocks: [
          h("Qué NO pegar en Claude"),
          warn(
            "No pegues información sensible o confidencial: datos personales de clientes, condiciones comerciales internas, precios especiales, cifras internas o contratos.",
          ),
          p(
            "Para la mayoría de tareas no hace falta pegar datos privados. Si necesitas personalizar, trabaja con datos genéricos y al final tú pones lo real.",
          ),
          list([
            "Evita: cédulas, teléfonos y correos privados de clientes.",
            "Evita: precios internos, márgenes y descuentos confidenciales.",
            "Evita: contratos y documentos legales.",
          ]),
        ],
      },
      {
        title: "Precios, garantías y datos técnicos: verifica",
        durationMin: 6,
        blocks: [
          h("Los datos duros los pones tú"),
          p(
            "Claude no conoce los precios, garantías ni especificaciones oficiales de Ambiente Azul o DOM Design. Úsalo para redactar y organizar; los datos exactos confírmalos con la fuente oficial.",
          ),
          list([
            "Precios y descuentos → con la lista oficial.",
            "Garantías y plazos → con la información oficial de la empresa.",
            "Datos técnicos → con la ficha de la marca.",
            "Temas legales o tributarios → con el área correspondiente.",
          ]),
          info(
            "Claude es excelente para redactar, resumir y dar ideas; los números y compromisos son tuyos.",
          ),
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
          options: [
            "Que Claude se apaga",
            "Que a veces da datos que suenan seguros pero son incorrectos o inventados",
            "Que ve imágenes",
            "Que funciona lento",
          ],
          correctAnswer: 1,
          explanation: "Por eso siempre revisas antes de usar la respuesta.",
        },
        {
          question: "¿Qué NO debes pegar en Claude?",
          type: "MULTIPLE_CHOICE",
          options: [
            "Un texto general para mejorar la redacción",
            "Datos sensibles de clientes, precios internos o contratos",
            "Una pregunta",
            "Una idea",
          ],
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
          options: [
            "Claude decide y tú envías sin leer",
            "Claude redacta, tú revisas y apruebas",
            "No usar Claude nunca",
            "Copiar y pegar sin mirar",
          ],
          correctAnswer: 1,
          explanation: "Tú siempre tienes la última palabra.",
        },
        {
          question: "Un tema legal o de garantía se confirma…",
          type: "MULTIPLE_CHOICE",
          options: [
            "Con Claude",
            "Con el área correspondiente o la fuente oficial",
            "Con el cliente",
            "No se confirma",
          ],
          correctAnswer: 1,
          explanation: "Los compromisos formales se validan con quien corresponde.",
        },
      ],
    },
  },

  // ============================ MÓDULO 5 ============================
  {
    title: "Práctica guiada",
    lecciones: [
      {
        title: "Ejercicio 1: correo de seguimiento",
        durationMin: 8,
        blocks: [
          h("Manos a la obra"),
          p(
            "Vas a escribir un correo de seguimiento con la receta que aprendiste. Sigue estos pasos:",
          ),
          list([
            "Piensa el contexto: ¿quién es el cliente y qué cotizó?",
            "Escribe el pedido con contexto + tarea + formato.",
            "Lee la respuesta y ajústala (tono, largo, saludo).",
            "Personaliza con el nombre real y los datos correctos.",
            "Revisa y envía.",
          ]),
          info(
            "Prueba este pedido: “Cliente cotizó una piscina para su casa hace 3 semanas y no responde. Escríbeme un correo cálido y corto, con una invitación a agendar una llamada esta semana.”",
          ),
        ],
      },
      {
        title: "Ejercicio 2: explicar un producto",
        durationMin: 7,
        blocks: [
          h("Traduce lo técnico"),
          p(
            "Elige un producto que te cueste explicar y pídele a Claude una versión simple para el cliente.",
          ),
          info(
            "Prueba: “Explica en 3 frases sencillas, sin tecnicismos, qué es un cold plunge y qué beneficio tiene, para un cliente que nunca ha oído el término.”",
          ),
          tip(
            "Si quedó muy técnico, dile: “más simple, como para alguien que no sabe nada del tema”.",
          ),
        ],
      },
      {
        title: "Ejercicio 3: resumir una ficha",
        durationMin: 7,
        blocks: [
          h("Resume para el cliente"),
          p(
            "Toma una ficha o un texto largo de un producto y pídele el resumen enfocado en el cliente.",
          ),
          info(
            "Prueba: “Resume esta ficha en 5 viñetas simples, resaltando los beneficios para el cliente y evitando tecnicismos.” (pega el texto debajo)",
          ),
          warn(
            "Verifica cualquier dato técnico del resumen con la ficha oficial antes de enviárselo al cliente.",
          ),
          h("¡Felicitaciones!"),
          p(
            "Ya tienes lo necesario para usar Claude en tu día a día: pedir bien, aplicarlo a tus tareas y hacerlo con criterio. Úsalo como tu aliado para vender mejor y ahorrar tiempo.",
          ),
        ],
      },
    ],
    examen: {
      title: "Evaluación final — Práctica",
      description: "Cierra el curso repasando lo aprendido.",
      timeLimitMin: 12,
      questions: [
        {
          question: "El orden para usar Claude en un correo es…",
          type: "MULTIPLE_CHOICE",
          options: [
            "Enviar y luego pensar",
            "Contexto → pedir → revisar → personalizar → enviar",
            "Copiar de otro correo",
            "No revisar",
          ],
          correctAnswer: 1,
          explanation: "Primero le das contexto y la tarea, luego revisas y personalizas.",
        },
        {
          question: "Si Claude pone el nombre equivocado del cliente, ¿qué haces?",
          type: "MULTIPLE_CHOICE",
          options: [
            "Lo envías igual",
            "Lo corriges antes de enviar",
            "Lo dejas así",
            "Empiezas de cero",
          ],
          correctAnswer: 1,
          explanation: "Tú revisas y corriges siempre antes de enviar.",
        },
        {
          question: "Un buen pedido para resumir una ficha es…",
          type: "MULTIPLE_CHOICE",
          options: [
            "“Resume”",
            "“Resume esta ficha en 5 puntos simples y con beneficios para el cliente”",
            "“Ficha”",
            "“Hazlo”",
          ],
          correctAnswer: 1,
          explanation: "Le dices el formato y el enfoque; por eso queda útil.",
        },
        {
          question: "¿Puedes pedirle a Claude que ajuste el tono según sea para un hotel o para un cliente residencial?",
          type: "TRUE_FALSE",
          options: ["Verdadero", "Falso"],
          correctAnswer: 0,
          explanation: "Sí: le indicas el tono y el público, y adapta el texto.",
        },
        {
          question: "Antes de enviar una propuesta con precios hecha con ayuda de Claude, ¿qué haces?",
          type: "MULTIPLE_CHOICE",
          options: [
            "Confiar en los precios que puso",
            "Verificar precios y condiciones con la fuente oficial",
            "Nada",
            "Preguntarle al cliente",
          ],
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

async function main() {
  const existe = await prisma.course.findFirst({
    where: { title: CURSO_TITLE },
    select: { id: true },
  });
  if (existe) {
    console.log("⏭️  El curso ya existe. No se hace nada.");
    return;
  }

  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!admin) throw new Error("No hay un SUPER_ADMIN para asignar como autor.");

  const totalMin = modulos.reduce(
    (s, m) => s + m.lecciones.reduce((x, l) => x + l.durationMin, 0),
    0,
  );

  await prisma.course.create({
    data: {
      title: CURSO_TITLE,
      description:
        "Aprende a usar Claude, el asistente de inteligencia artificial, para vender mejor y ahorrar tiempo: redactar correos, responder clientes, explicar productos y preparar propuestas. Sin tecnicismos y con ejemplos reales de Ambiente Azul y DOM Design.",
      category: "FORMACION_CONTINUA",
      company: "AMBAS",
      status: "DRAFT", // borrador: no visible para empleados hasta activarlo
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

  console.log(
    `✅ Curso "${CURSO_TITLE}" creado como BORRADOR — ${modulos.length} módulos, ${totalMin} min.`,
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
