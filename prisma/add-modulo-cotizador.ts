import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Agrega (o REEMPLAZA) el módulo "Cotizador de Piscinas" al curso "Fundamentos
// de Piscinas — Ambiente Azul". Idempotente: si el módulo ya existe, lo borra y
// lo recrea (solo ese módulo; el resto del curso y su progreso quedan intactos).
// Basado en la capacitación en video de Isabel + su transcripción.

const CURSO_TITLE = "Fundamentos de Piscinas — Ambiente Azul";
const MODULO_TITLE = "Cotizador de Piscinas: paso a paso";
// Video de la capacitación (Google Drive). Debe estar compartido como
// "Cualquier persona con el enlace (Lector)" para que los empleados lo vean.
const VIDEO_URL =
  "https://drive.google.com/file/d/1gABqhdsORv5RAv4JYLVx7x9APv80n1H_/view";

const connectionString = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
  }),
});

type Block = Record<string, unknown>;
const h = (text: string): Block => ({ type: "heading", text });
const p = (text: string): Block => ({ type: "paragraph", text });
const list = (items: string[]): Block => ({ type: "list", items });
const info = (text: string): Block => ({ type: "callout", style: "info", text });
const tip = (text: string): Block => ({ type: "callout", style: "tip", text });
const warn = (text: string): Block => ({ type: "callout", style: "warning", text });
const video = (url: string): Block => ({ type: "video", url });
const table = (headers: string[], rows: string[][]): Block => ({ type: "table", headers, rows });

type Leccion = { title: string; durationMin: number; blocks: Block[] };
type Pregunta = {
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: string[];
  correctAnswer: number;
  explanation: string;
};

const lecciones: Leccion[] = [
  {
    title: "Video: capacitación del cotizador",
    durationMin: 76,
    blocks: [
      h("La capacitación completa en video"),
      p("Este es el video de la capacitación donde se explica, paso a paso y con un proyecto real, cómo llenar la plantilla del cotizador de piscinas. Míralo completo: en las siguientes lecciones tienes la misma información resumida en texto, para consultarla rápido cuando estés cotizando."),
      video(VIDEO_URL),
      info("Consejo: ten el cotizador abierto en otra pestaña e ve replicando los pasos con un proyecto de prueba mientras miras el video."),
      tip("El objetivo del cotizador es que puedas cotizar EN TIEMPO REAL con el cliente: que se vaya con su cotización lista."),
    ],
  },
  {
    title: "Antes de cotizar: datos del proyecto",
    durationMin: 8,
    blocks: [
      h("Lo primero que le dices al cotizador"),
      p("Antes de las dimensiones, el cotizador pide unos datos que definen los cálculos. Ponlos con cuidado: de aquí salen la calefacción y la recirculación."),
      list([
        "Tipología de la piscina: residencial, comercial, wellness, de niños o spa. (Define el periodo de recirculación.)",
        "Temperatura objetivo del agua: a cuántos grados se quiere mantener.",
        "¿Piscina cubierta / en interior? Marca según el caso (lo común es que NO sea interior).",
        "Uso del sistema de calentamiento: programado (solo ciertos días/horas) o permanente. Es clave para los cálculos de calefacción.",
      ]),
      info("Ejemplo de uso programado: “se usa de jueves a domingo, unas 7 horas por día”. Eso cambia el tiempo de calefacción que muestra el cotizador."),
      warn("Deja escrito el uso del sistema de calentamiento en las memorias de la cotización. Si el cliente dice “solo fines de semana” pero en realidad la usa toda la semana, los cálculos cambian: que quede claro por escrito."),
    ],
  },
  {
    title: "Dimensiones de la piscina",
    durationMin: 9,
    blocks: [
      h("Cómo medir bien"),
      p("Esta es la parte más delicada: si los datos entran mal, toda la cotización sale mal. Lean bien el proyecto antes de escribir."),
      list([
        "Área de la piscina: SIN incluir playas, escaleras ni spa. Solo el espejo de agua principal.",
        "Profundidad promedio: si no tienes el plano exacto, aproxima con buen criterio (ej. 1,40 m).",
        "Profundidad máxima: solo cuando la piscina tiene desnivel. Si es pareja, no aplica.",
      ]),
      h("Elementos especiales"),
      p("El cotizador pregunta por los elementos adicionales, y cada uno se mide aparte:"),
      list([
        "Zona de playa: se mide y se ingresa como playa (no se suma al área de la piscina).",
        "Spa integrado: ingresa sus dimensiones (ej. 2,50 × 2,50 m, profundidad 1 m).",
        "Escaleras: hay tres casos — integradas en la playa, escaleras de obra, o escaleras por fuera. Elige el que corresponda al plano.",
      ]),
      tip("Truco para calcular un área irregular: descompón en rectángulos (largo × ancho), suma, y resta el área del spa/jacuzzi si quedó incluida. Ten una calculadora a la mano."),
      warn("Vas a cotizar piscinas que “todavía no existen” (en plano): nunca vas a tener medidas perfectas. Aproxima con criterio y deja constancia de los supuestos."),
    ],
  },
  {
    title: "Recirculación y filtración",
    durationMin: 10,
    blocks: [
      h("El periodo de recirculación (por norma)"),
      p("El cotizador calcula la bomba a partir del volumen y del periodo de recirculación: el tiempo en que TODO el volumen de la piscina debe pasar una vez por el filtro. Es un valor normativo, no un capricho."),
      table(
        ["Tipo de piscina", "Periodo de recirculación"],
        [
          ["Piscina de niños", "1 a 2 horas"],
          ["Spa / jacuzzi", "30 minutos"],
          ["Residencial", "6 horas"],
          ["Comercial", "6 horas"],
          ["Wellness", "4 horas"],
        ],
      ),
      info("Con esto desmontas el mito del cliente de las “4 horitas de motor”: la norma exige que todo el volumen pase por el filtro en el tiempo indicado; por eso la bomba y la tubería se calculan, no se improvisan."),
      h("Horas de filtrado recomendadas"),
      p("Para hablar todos el mismo idioma, la recomendación de Ambiente Azul es:"),
      list([
        "Piscinas: 20 horas de filtrado al día.",
        "Spas / hidromasaje: 10 horas al día.",
      ]),
      h("La bomba de recirculación"),
      p("El cotizador muestra solo las motobombas (velocidad fija o variable) que cumplen con el caudal y el periodo de recirculación, con su costo de operación y el ahorro estimado de la variable frente a la fija."),
      list([
        "Marcas full: Pentair y Jandy.",
        "Marcas económicas: Max Pump y LX.",
        "La “B” al final del nombre = equipo básico; la “S” = equipo full.",
        "Prefiere motobombas con VRS (sistema de liberación de vacío): es un seguro que evita accidentes por succión, importante sobre todo si hay niños.",
      ]),
      h("El filtro: cartucho vs. arena"),
      table(
        ["Filtro", "Nivel de filtración", "Cuándo usarlo"],
        [
          ["Cartucho", "~10 micras (mejor)", "Primera opción. Requiere sacarlo y limpiarlo con manguera."],
          ["Arena", "~20 a 50 micras", "Cuando el agua es muy mala o no habrá mantenimiento permanente."],
        ],
      ),
      warn("Si el agua del lugar es muy mala, el filtro de cartucho se satura rápido y se vuelve un problema. Pregunta siempre dónde estará la piscina y si tendrá quien la mantenga."),
      p("Después del filtro viene la desinfección y dosificación de cloro: normalmente hay una sola opción (un solo producto con el que trabajamos), y el cotizador arma el kit con sus repuestos."),
    ],
  },
  {
    title: "Conducción, wellness y opcionales",
    durationMin: 9,
    blocks: [
      h("Sistemas de conducción de agua"),
      p("El cotizador calcula, según la normativa y las dimensiones, cuántos accesorios lleva la piscina (y salen del color que elegiste):"),
      list([
        "Desnatadores y pozuelos de fondo (o rejillas laterales): según el reglamento.",
        "Tomas de aspirar: calculadas por la longitud de la piscina y la manguera de 15 m; si no cubre, pone dos.",
        "Retornos: según el perímetro de la piscina, más los del spa.",
      ]),
      info("El mínimo reglamentario de succión suele ser “2 + 2” por rebosamiento; el cotizador ya lo aplica. Tú eliges entre pozuelos circulares o rejillas laterales."),
      h("Elementos wellness"),
      p("Aquí agregas la parte de experiencia (si el proyecto la lleva):"),
      list([
        "Hidrojets: cuántos y de qué color (blanco o gris).",
        "Boquillas de aire / volcán de aire.",
        "Pulsadores: elige el color (blanco, cromado, negro) según el enchape exterior; van sobre una caja de empalme del color que combine.",
        "Suit de 2 funciones: uno por cada motobomba blower.",
      ]),
      h("Opcionales y mano de obra"),
      list([
        "Elementos de seguridad, kit de limpieza (piscina o spa) y balance químico: actívalos según lo que quiera el cliente; puedes ajustar cantidad.",
        "Asesoría de planimetría: se debería cobrar siempre; el cotizador la calcula según la ciudad.",
        "Mano de obra de instalación (cuarto de máquinas y accesorios) y el listado de materiales (PVC y eléctricos): el cotizador ya los calcula, así no tienes que armar la lista de materiales a mano.",
      ]),
      tip("Si un ítem no lo quieres, contráelo/apágalo. Puedes modificar cantidades y hasta precios cuando el caso lo amerite."),
    ],
  },
  {
    title: "Cerrar la cotización",
    durationMin: 7,
    blocks: [
      h("Resumen financiero y descuentos"),
      p("Al final aparece el resumen financiero de todo. Puedes dar descuento de dos formas:"),
      list([
        "Descuento global: un porcentaje sobre el total.",
        "Descuento por capítulo: distinto para cada sección (equipos, mano de obra, etc.), para no “bajar las cucas” justo donde hay poco margen.",
      ]),
      h("Guardar y generar el PDF"),
      p("Cuando esté lista, das “Guardar cotización”. Puedes generar dos versiones en PDF:"),
      list([
        "PDF detallado: muestra cada ítem de cada capítulo.",
        "PDF resumido: en los kits muestra un total general, sin desglosar cada elemento.",
      ]),
      info("El PDF queda con el enlace del video y la ficha técnica de los productos que la tengan (los marcados con “V”)."),
      warn("Si el cliente pide algo fuera de lo común (por ejemplo, poner su propio filtro o comprar parte por otro lado), anótalo SIEMPRE en el campo de observaciones de la cotización. Así, si algo falla después, queda claro qué se acordó."),
      h("¡Listo!"),
      p("Con esto puedes cotizar una piscina completa de principio a fin, en tiempo real con el cliente. Practica con proyectos de prueba antes de hacerlo en vivo, y apóyate en el video siempre que tengas dudas."),
    ],
  },
];

const preguntas: Pregunta[] = [
  {
    question: "El área de la piscina que se ingresa en el cotizador NO incluye…",
    type: "MULTIPLE_CHOICE",
    options: ["El espejo de agua principal", "Playas, escaleras ni spa", "La profundidad", "El volumen"],
    correctAnswer: 1,
    explanation: "El área es solo el espejo de agua principal; playas, escaleras y spa se miden aparte.",
  },
  {
    question: "El periodo de recirculación de una piscina residencial es de…",
    type: "MULTIPLE_CHOICE",
    options: ["30 minutos", "2 horas", "6 horas", "24 horas"],
    correctAnswer: 2,
    explanation: "Residencial y comercial: 6 horas. Wellness: 4 h. Spa: 30 min. Niños: 1–2 h.",
  },
  {
    question: "¿Cuántas horas de filtrado al día recomienda Ambiente Azul para piscinas?",
    type: "MULTIPLE_CHOICE",
    options: ["4 horas", "10 horas", "20 horas", "2 horas"],
    correctAnswer: 2,
    explanation: "Piscinas 20 horas/día; spas e hidromasaje 10 horas/día.",
  },
  {
    question: "Entre filtro de cartucho y de arena, ¿cuál es la primera opción por su mejor filtración?",
    type: "MULTIPLE_CHOICE",
    options: ["Arena", "Cartucho", "Da igual", "Ninguno"],
    correctAnswer: 1,
    explanation: "El cartucho llega a ~10 micras (mejor). La arena (20–50 µm) se usa si el agua es muy mala o no habrá mantenimiento.",
  },
  {
    question: "El VRS (sistema de liberación de vacío) de una motobomba sirve para…",
    type: "MULTIPLE_CHOICE",
    options: ["Ahorrar energía", "Seguridad: evitar accidentes por succión (clave con niños)", "Calentar el agua", "Filtrar mejor"],
    correctAnswer: 1,
    explanation: "Es un seguro que actúa ante una pérdida de presión; importante sobre todo si hay niños.",
  },
  {
    question: "El mito de las “4 horitas de motor” se desmonta explicando…",
    type: "MULTIPLE_CHOICE",
    options: ["Que gasta poca energía", "El periodo de recirculación: por norma, todo el volumen debe pasar por el filtro en cierto tiempo", "Que la bomba es lenta", "Que el agua no se ensucia"],
    correctAnswer: 1,
    explanation: "El periodo de recirculación es normativo; por eso la bomba y la tubería se calculan.",
  },
  {
    question: "Al guardar la cotización puedes generar el PDF en dos versiones: detallado y resumido.",
    type: "TRUE_FALSE",
    options: ["Verdadero", "Falso"],
    correctAnswer: 0,
    explanation: "El detallado muestra cada ítem; el resumido muestra los kits como un total general.",
  },
  {
    question: "Si el cliente pide algo fuera de lo común (p. ej. poner su propio filtro), no hace falta dejarlo registrado.",
    type: "TRUE_FALSE",
    options: ["Verdadero", "Falso"],
    correctAnswer: 1,
    explanation: "Falso: se anota SIEMPRE en observaciones para que quede claro qué se acordó.",
  },
];

async function main() {
  const curso = await prisma.course.findFirst({
    where: { title: CURSO_TITLE },
    select: { id: true },
  });
  if (!curso) throw new Error(`No se encontró el curso "${CURSO_TITLE}".`);

  // Idempotencia: borra el módulo si ya existía (cascada a sus lecciones/examen).
  const previo = await prisma.module.findFirst({
    where: { courseId: curso.id, title: MODULO_TITLE },
    select: { id: true },
  });
  if (previo) {
    await prisma.module.delete({ where: { id: previo.id } });
    console.log("♻️  Módulo anterior eliminado; se recrea.");
  }

  const last = await prisma.module.findFirst({
    where: { courseId: curso.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? 0) + 1;

  await prisma.module.create({
    data: {
      courseId: curso.id,
      title: MODULO_TITLE,
      order,
      lessons: {
        create: lecciones.map((l, li) => ({
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
            title: "Evaluación — Cotizador de Piscinas",
            description: "Comprueba que sabes usar el cotizador de principio a fin.",
            passingScore: 70,
            maxAttempts: 3,
            timeLimitMin: 12,
            order: lecciones.length + 1,
            questions: {
              create: preguntas.map((q, qi) => ({
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
    },
  });

  console.log(
    `✅ Módulo "${MODULO_TITLE}" agregado a "${CURSO_TITLE}" como módulo ${order} — ${lecciones.length} lecciones + examen.`,
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
