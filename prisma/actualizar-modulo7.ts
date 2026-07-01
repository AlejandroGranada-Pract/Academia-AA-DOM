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

// Actualiza EN SITIO el contenido del Módulo 7 del curso "Fundamentos de
// Piscinas" (lecciones 7.1, 7.2 y 7.5) y reemplaza las preguntas del examen 7.
// No borra módulos ni lecciones: conserva ids y el progreso de los usuarios.
// Idempotente (re-ejecutable).

const CURSO_TITLE = "Fundamentos de Piscinas — Ambiente Azul";

type Block = Record<string, unknown>;
const h = (text: string): Block => ({ type: "heading", text });
const p = (text: string): Block => ({ type: "paragraph", text });
const list = (items: string[]): Block => ({ type: "list", items });
const info = (text: string): Block => ({ type: "callout", style: "info", text });
const tip = (text: string): Block => ({ type: "callout", style: "tip", text });
const warn = (text: string): Block => ({ type: "callout", style: "warning", text });
const video = (url: string): Block => ({ type: "video", url });
const table = (headers: string[], rows: string[][]): Block => ({ type: "table", headers, rows });

// ---- Contenido nuevo de las lecciones a actualizar (por título) ----
const lecciones: { title: string; durationMin: number; blocks: Block[] }[] = [
  {
    title: "Capítulos opcionales — Automatización, Robot y Caudalímetro",
    durationMin: 12,
    blocks: [
      h("Por qué son opcionales"),
      p("Estos tres capítulos no son obligatorios para el funcionamiento de la piscina, pero agregan valor significativo. El calculador los muestra desactivados por defecto — el comercial decide cuáles activar según el perfil del cliente."),

      h("Automatización"),
      p("Permite controlar todos los equipos de la piscina desde un panel central o desde el celular: bomba, calentador, iluminación, desinfección, válvulas."),
      p("La automatización aparece en el calculador debajo de los elementos Wellness, porque la cantidad de elementos wellness seleccionados determina qué sistemas de automatización están disponibles."),
      h("Cómo funciona la selección automática"),
      p("El calculador cuenta cuántos tipos de elementos wellness tiene la cotización (no la cantidad de cada uno, sino cuántos tipos distintos). Ejemplo: 2 cascadas Bali (= 1 tipo) + 12 hidrojets (= 1 tipo) + 1 cañón Fidji (= 1 tipo) = 3 elementos wellness. Este conteo aparece como un badge en la tarjeta de automatización."),
      p("Cada sistema de automatización tiene un rango de elementos wellness para el cual aplica:"),
      list([
        "Jandy AquaLink: aparece cuando el proyecto tiene pocos elementos wellness (0 a 2 tipos).",
        "Pentair IntelliCenter: aparece cuando el proyecto tiene más elementos wellness (3+ tipos), porque tiene capacidad para manejar más circuitos.",
      ]),
      p("Esto significa que las opciones de automatización que ve el comercial cambian dinámicamente según los wellness que haya activado arriba."),
      warn("El comercial debe seleccionar primero los elementos wellness y después activar la automatización. Si activa la automatización sin wellness, verá solo las opciones básicas. Si luego agrega wellness, las opciones se actualizan automáticamente."),
      p("Cuándo ofrecerla:"),
      list([
        "Cliente con piscina en casa de recreo (no está todos los días).",
        "Proyecto con múltiples sistemas (bomba + calentador + luces + desinfección).",
        "Proyecto con varios elementos wellness (la automatización permite controlarlos todos desde una sola app).",
        "Cliente que valora la comodidad y la tecnología.",
      ]),
      p("Equipos que maneja el calculador: Pentair IntelliCenter, IntelliConnect, Jandy AquaLink — dependiendo de la complejidad del proyecto y la cantidad de elementos wellness."),
      info("La automatización NO reemplaza el mantenimiento. Programa horarios y enciende/apaga equipos, pero el cliente o su operador siguen siendo responsables de la limpieza física y la revisión periódica."),

      h("Robot limpiafondos"),
      p("Un robot autónomo que limpia fondo, paredes y línea de flotación. Se diferencia del aspirado manual en que no requiere que una persona esté operando la manguera."),
      p("Cuándo ofrecerlo:"),
      list([
        "Piscinas grandes (> 40 m²) donde aspirar manual toma mucho tiempo.",
        "Clientes que no tienen operador de piscina permanente.",
        "Proyectos premium donde la comodidad es prioridad.",
      ]),

      h("Caudalímetro"),
      p("Un instrumento visual que muestra el caudal de agua en tiempo real. Permite verificar que la bomba y el filtro están operando correctamente sin necesidad de herramientas."),
      p("Cuándo ofrecerlo:"),
      list([
        "Piscinas comerciales (hoteles, clubes) donde hay operador técnico.",
        "Proyectos con sistemas complejos (múltiples bombas, calefacción).",
        "Clientes que quieren monitorear el rendimiento de su inversión.",
      ]),

      h("Video: Automatización de piscinas"),
      p("Comparativa de los dos principales sistemas de automatización Pentair (EasyTouch vs IntelliCenter)."),
      video("https://www.youtube.com/watch?v=sLYo8AiTIjE"),
      h("Video: Robot limpiafondos"),
      p("Presenta el Dolphin Carrera 40i (Maytronics) — limpia fondo, paredes y línea de flotación."),
      video("https://www.youtube.com/watch?v=BSXpKYeHipQ"),
    ],
  },
  {
    title: "Wellness — Agua y Aire",
    durationMin: 14,
    blocks: [
      h("Qué es wellness en piscinas"),
      p("Los elementos wellness transforman una piscina funcional en una experiencia sensorial. Se dividen en dos categorías:"),
      list([
        "Agua: cascadas, chorros laminares, deck jets, hidrojets, cañones de agua.",
        "Aire: volcán de burbujas, cama de aire, boquillas de aire plantar.",
      ]),
      h("Cómo funcionan los combos"),
      p("En el calculador, cada elemento wellness es un “combo” que incluye automáticamente todo lo necesario:"),
      table(
        ["Elemento", "Qué incluye el combo"],
        [
          ["Volcán de burbujas", "Cuerpo del volcán + blower (soplador de aire)"],
          ["Cama de aire", "Cuerpo de la cama + blower"],
          ["Cañón Fidji", "Cuerpo del cañón + motobomba dedicada"],
          ["Cascada Bali/Maui", "Cuerpo de la cascada + motobomba dedicada"],
          ["Hidrojets", "Boquillas + motobomba(s) escalada(s) por cantidad"],
          ["Chorros laminares", "Cuerpos de chorro (sin bomba adicional — usan la bomba principal)"],
          ["Deck jets", "Cuerpos de chorro + boquillas"],
        ],
      ),
      warn("Los elementos de aire (volcán, cama) necesitan un blower, NO una motobomba. Los elementos de agua (cascadas, cañones, hidrojets) necesitan una motobomba dedicada, independiente de la bomba principal de filtración."),
      h("Escalamiento por cantidad"),
      p("El calculador ajusta automáticamente los complementos según la cantidad:"),
      list([
        "Hidrojets: de 1 a 4 unidades = 1 motobomba. De 5 a 10 = motobomba más grande. De 11 a 20 = 2 motobombas.",
        "Volcán/Cama: cada unidad lleva su propio blower.",
        "Chorros laminares: la cantidad de cuerpos es libre pero comparten sistema.",
      ]),
      h("Básica vs Full en wellness"),
      p("Algunos combos tienen ítems diferenciados por nivel:"),
      list([
        "Básica (B): blower/bomba de gama estándar.",
        "Full (F): blower/bomba premium con mayor potencia o menor ruido.",
      ]),
      p("Los cuerpos del elemento (volcán, cascada, etc.) son los mismos en ambas propuestas."),
      h("Wellness y Automatización: la conexión"),
      p("Los elementos wellness que seleccione el comercial afectan directamente las opciones de automatización disponibles más abajo. El calculador cuenta cuántos tipos distintos de wellness tiene la cotización y usa ese número para filtrar qué sistemas de automatización mostrar."),
      p("Por ejemplo: si el comercial agrega cascadas + hidrojets + volcán de burbujas (3 tipos), el calculador habilita sistemas de automatización con capacidad para manejar esos 3 circuitos adicionales."),
      tip("Siempre seleccione los elementos wellness ANTES de activar la automatización. El orden importa: primero defina qué wellness lleva el proyecto, y luego elija la automatización que mejor se ajuste a esa cantidad de elementos."),
      info("Qué decirle al cliente: “Los elementos wellness no son un lujo — son lo que hace que usted USE la piscina. Una piscina sin wellness es para nadar; con un volcán de burbujas y unos hidrojets se convierte en su spa privado. El calculador ya incluye la bomba o blower necesario, no hay costos ocultos.”"),
      h("Video: Cómo funcionan los hidrojets"),
      p("Explicación técnica del funcionamiento: cómo mezclan aire y agua para el efecto de hidromasaje (Albercas Aqua)."),
      video("https://www.youtube.com/watch?v=csyCKMGeeDY"),
      h("Videos de referencia por elemento"),
      p("Los siguientes videos están disponibles directamente en el calculador (botón rojo de play junto a cada elemento) y los puedes compartir con el cliente durante la presentación:"),
      list([
        "Volcán de burbujas",
        "Cama de aire",
        "Cañón Fidji / Tahiti",
        "Cascada Bali / Maui",
        "Hidrojets",
        "Chorros laminares / Deck jets",
      ]),
    ],
  },
  {
    title: "Práctica guiada — Cotizar un proyecto real",
    durationMin: 15,
    blocks: [
      h("El proyecto"),
      p("Vamos a cotizar juntos una piscina con estas características:"),
      list([
        "Cliente: Hotel boutique en Rionegro, Antioquia",
        "Tipo: Comercial",
        "Forma: Rectangular, 12 m × 5 m",
        "Profundidad: 1.2 m (poco profunda) a 1.8 m (zona de natación), promedio 1.5 m",
        "Rebosamiento: Desbordante (overflow)",
        "Zona climática: Fría (Rionegro está a 2.125 msnm)",
        "Temperatura objetivo: 28°C",
        "Ubicación: Exterior",
        "Extras: SPA integrado (2×2×0.9 m), playa húmeda (3×2×0.3 m)",
      ]),
      h("Paso 1: Ingresar datos"),
      p("Abrir el calculador e ingresar:"),
      list([
        "Datos del cliente (nombre del hotel, ciudad, contacto)",
        "Tipo: Comercial",
        "Rebosamiento: Desbordante",
        "Forma: Rectangular → 12 × 5 m",
        "Profundidades: 1.2 m mínima, 1.8 m máxima",
        "Zona climática: Fría",
        "Temperatura: 28°C",
        "Interior: No",
        "Elementos especiales: SPA integrado (2×2×0.9), Playa húmeda (3×2×0.3)",
      ]),
      p("Observe el resumen de piscina: debe mostrar el desglose de área y volumen para piscina + spa + playa + tanque de compensación."),
      h("Paso 2: Revisar resultados"),
      p("El calculador presenta los resultados. Verifique mentalmente:"),
      list([
        "Volumen total: ~95-100 m³ (piscina + spa + playa + compensación)",
        "Bomba: caudal requerido alto por ser overflow (+25%) y comercial",
        "Filtro: área de filtración proporcional al caudal",
        "Calefacción: necesaria (14°C ambiente → 28°C deseados = ΔT de 14°C)",
        "Desinfección: al menos clorador en línea + cloración salina (hotel = menos manipulación de químicos)",
        "Iluminación: múltiples luminarias (área grande + playa + spa)",
        "Succiones: mínimo 4 (2 base + 2 por overflow)",
      ]),
      h("Paso 3: Personalizar"),
      list([
        "Active el caudalímetro (es comercial — el técnico necesita verificar caudal).",
        "En Wellness, agregue 4 hidrojets en el SPA — observe que el conteo muestra “1 elem. wellness”.",
        "Active la Automatización (aparece debajo de wellness) — note que las opciones disponibles corresponden a proyectos con 1 elemento wellness. Si agrega más wellness arriba, las opciones de automatización se actualizan.",
        "Active los kits de seguridad (obligatorio), limpieza y balance químico.",
        "Active asesoría, eléctricos y mano de obra.",
        "Revise el comparativo Básica vs Full.",
      ]),
      h("Paso 4: Generar cotización"),
      list([
        "Abra la sección “Mezclar Capítulos”.",
        "Seleccione Full en bomba y calefacción (el ahorro operativo lo justifica para un hotel).",
        "Seleccione Básica en filtración e iluminación (buena relación costo-beneficio).",
        "Seleccione Full en desinfección (menos mantenimiento diario para el hotel).",
        "Active todos los kits.",
        "Revise el total personalizado.",
        "Guarde y genere el PDF comparativo.",
      ]),
      info("Este ejercicio simula un proyecto real. Los valores exactos dependen del catálogo de productos actualizado, pero la lógica de selección siempre será la misma."),
    ],
  },
];

// ---- Preguntas del examen 7 (reemplazo completo: ahora 7 preguntas) ----
const EXAMEN7_TITLE = "Evaluación — Cotización Completa";
const preguntas7 = [
  {
    question: "¿Cuál es la diferencia técnica entre la propuesta Básica y la Full?",
    type: "MULTIPLE_CHOICE" as const,
    options: [
      "La Básica usa menos equipos",
      "La Full tiene cálculos más precisos",
      "Ambas usan los mismos cálculos pero con productos de diferente gama",
      "La Básica no incluye calefacción",
    ],
    correctAnswer: 2,
    explanation: "Es el mismo motor de cálculo; solo cambia la gama (marca/nivel) del producto que cubre cada requerimiento.",
  },
  {
    question: "Un volcán de burbujas necesita una motobomba dedicada.",
    type: "TRUE_FALSE" as const,
    options: ["Verdadero", "Falso"],
    correctAnswer: 1,
    explanation: "Falso: necesita un blower (soplador de aire), no una motobomba. Las motobombas dedicadas son para elementos de agua.",
  },
  {
    question: "¿Qué kit es OBLIGATORIO por normativa colombiana para piscinas de uso colectivo?",
    type: "MULTIPLE_CHOICE" as const,
    options: [
      "Kit de limpieza",
      "Kit de balance químico",
      "Kit de seguridad (señalización, salvavidas, reglas de uso)",
      "Mano de obra",
    ],
    correctAnswer: 2,
    explanation: "El kit de seguridad es exigido por la Resolución 929 de 2026 y la Ley 1209 de 2008.",
  },
  {
    question: "En la sección “Mezclar Capítulos”, ¿puede el comercial incluir kits diferentes para cada columna?",
    type: "MULTIPLE_CHOICE" as const,
    options: [
      "No, los kits son iguales en ambas propuestas",
      "Sí, cada kit tiene toggles independientes para Básica y Full",
      "Solo en la versión impresa",
      "Solo el administrador puede cambiarlos",
    ],
    correctAnswer: 1,
    explanation: "Cada kit se activa/desactiva de forma independiente en cada propuesta.",
  },
  {
    question: "¿Qué estrategia comercial aprovecha el comparativo Básica vs Full?",
    type: "MULTIPLE_CHOICE" as const,
    options: [
      "Mostrar que la Básica es suficiente y no necesita más",
      "Presionar al cliente para que compre siempre Full",
      "Usar el efecto ancla: el cliente ve Full como referencia y personaliza mezclando capítulos",
      "Ocultar los precios hasta el final",
    ],
    correctAnswer: 2,
    explanation: "El anclaje: el total Full sirve de referencia y el cliente arma una personalizada entre el 60% y 80% de ese valor.",
  },
  {
    question: "Para un hotel que no tiene técnico permanente, ¿cuáles opciones agregaría?",
    type: "MULTIPLE_CHOICE" as const,
    options: [
      "Solo robot limpiafondos",
      "Automatización + robot limpiafondos + caudalímetro",
      "Automatización (control remoto de equipos) + desinfección automatizada (cloración salina)",
      "Ninguno — los opcionales son solo para residencial",
    ],
    correctAnswer: 2,
    explanation: "Sin técnico permanente, conviene automatizar el control de equipos y la dosificación de desinfección.",
  },
  {
    question: "Un comercial activa la automatización ANTES de seleccionar los elementos wellness. ¿Qué pasa?",
    type: "MULTIPLE_CHOICE" as const,
    options: [
      "El calculador muestra un error y no permite continuar",
      "La automatización se desactiva automáticamente",
      "Ve solo las opciones de automatización básicas; al agregar wellness después, las opciones se actualizan según la cantidad de elementos",
      "No pasa nada, el orden no importa",
    ],
    correctAnswer: 2,
    explanation: "El orden importa: primero se eligen los wellness y luego la automatización, cuyas opciones dependen de cuántos tipos de wellness haya.",
  },
];

async function main() {
  const curso = await prisma.course.findFirst({
    where: { title: CURSO_TITLE },
    select: { id: true },
  });
  if (!curso) throw new Error(`No se encontró el curso "${CURSO_TITLE}".`);

  // 1) Actualiza el contenido de las lecciones (por título, dentro del curso).
  for (const l of lecciones) {
    const res = await prisma.lesson.updateMany({
      where: { title: l.title, module: { courseId: curso.id } },
      data: { durationMin: l.durationMin, content: { blocks: l.blocks } as object },
    });
    console.log(`Lección "${l.title}": ${res.count} actualizada(s).`);
  }

  // 2) Reemplaza las preguntas del examen 7.
  const examen = await prisma.exam.findFirst({
    where: { title: EXAMEN7_TITLE, module: { courseId: curso.id } },
    select: { id: true },
  });
  if (!examen) throw new Error(`No se encontró el examen "${EXAMEN7_TITLE}".`);
  await prisma.examQuestion.deleteMany({ where: { examId: examen.id } });
  for (let i = 0; i < preguntas7.length; i++) {
    const q = preguntas7[i];
    await prisma.examQuestion.create({
      data: {
        examId: examen.id,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: 1,
        explanation: q.explanation,
        order: i + 1,
      },
    });
  }
  console.log(`Examen "${EXAMEN7_TITLE}": ${preguntas7.length} preguntas.`);

  console.log("✅ Módulo 7 actualizado.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
