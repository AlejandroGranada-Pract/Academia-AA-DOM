import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);
const adapter = new PrismaPg({
  connectionString,
  ...(isLocalDb ? {} : { ssl: { rejectUnauthorized: false } }),
});
const prisma = new PrismaClient({ adapter });

// Carpeta con las imágenes extraídas de las presentaciones (slides) del curso de
// piscinas. Cada PNG se guarda como ImageAsset (Bytes en Postgres) y se sirve por
// /api/imagenes/<id>. Devuelve la URL lista para usar en un bloque { type: "image" }.
const SEED_ASSETS_PISCINAS = join(
  process.cwd(),
  "prisma",
  "seed-assets",
  "piscinas",
);
async function crearImagenPiscina(file: string, name: string): Promise<string> {
  const data = readFileSync(join(SEED_ASSETS_PISCINAS, file));
  const img = await prisma.imageAsset.create({
    data: { name, mime: "image/png", size: data.length, data },
  });
  return `/api/imagenes/${img.id}`;
}

async function main() {
  console.log("🌱 Sembrando datos...");

  // ---------------------------------------------------------------------------
  // Usuarios (upsert: se conservan si ya existen)
  // ---------------------------------------------------------------------------
  const adminPassword = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {
      name: "Admin",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      company: "AMBAS",
      area: "Administración",
      active: true,
    },
    create: {
      email: "admin@admin.com",
      name: "Admin",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      company: "AMBAS",
      area: "Administración",
    },
  });

  const tecPassword = await bcrypt.hash("tec123", 12);
  const tecnico = await prisma.user.upsert({
    where: { email: "tecnico@gmail.com" },
    update: {
      name: "Técnico",
      passwordHash: tecPassword,
      role: "EMPLOYEE",
      company: "AMBIENTE_AZUL",
      area: "Técnico",
      active: true,
    },
    create: {
      email: "tecnico@gmail.com",
      name: "Técnico",
      passwordHash: tecPassword,
      role: "EMPLOYEE",
      company: "AMBIENTE_AZUL",
      area: "Técnico",
    },
  });
  console.log("  ✅ Usuarios listos (admin + técnico)");

  // ---------------------------------------------------------------------------
  // Limpieza de contenido (progreso, intentos y cursos)
  // ---------------------------------------------------------------------------
  await prisma.examAttempt.deleteMany({}); // reinicia el progreso de exámenes
  await prisma.userProgress.deleteMany({}); // reinicia el progreso de lecciones
  await prisma.certificate.deleteMany({});
  await prisma.courseAssignment.deleteMany({});
  await prisma.grupo.deleteMany({}); // se recrean abajo
  await prisma.course.deleteMany({}); // cascada: módulos, lecciones, exámenes
  await prisma.imageAsset.deleteMany({}); // se recrean abajo desde seed-assets/
  // Solo deben existir dos usuarios: el admin y el técnico.
  await prisma.user.deleteMany({
    where: { email: { notIn: ["admin@admin.com", "tecnico@gmail.com"] } },
  });
  console.log("  🧹 Contenido anterior limpiado (progreso reiniciado)");

  // ---------------------------------------------------------------------------
  // Curso: Inducción General AA | DOM
  // ---------------------------------------------------------------------------
  await prisma.course.create({
    data: {
      title: "Inducción General AA | DOM",
      description:
        "Bienvenido a Ambiente Azul y DOM Design. Conoce quiénes somos, nuestros valores, el reglamento interno y la información práctica para tu día a día.",
      category: "INDUCCION",
      company: "AMBAS",
      status: "PUBLISHED",
      estimatedHours: 2,
      passingScore: 85,
      dueDays: 15, // plazo relativo: 15 días desde que el empleado ingresa
      requiredAreas: [],
      createdBy: admin.id,
      modules: {
        create: [
          {
            title: "Quiénes somos",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Lo que nos apasiona",
                  type: "MIXED",
                  order: 1,
                  durationMin: 6,
                  content: {
                    blocks: [
                      { type: "heading", text: "Lo que nos apasiona" },
                      {
                        type: "paragraph",
                        text: "Diseñamos experiencias memorables mediante la generación de espacios y ambientes únicos que conectan los sentidos y proyectan tu esencia, para generar calidad de vida, bienestar y felicidad.",
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "La felicidad fluye mejor en el agua.",
                      },
                      { type: "heading", text: "Propósito superior" },
                      {
                        type: "paragraph",
                        text: "Generar experiencias memorables, al conectar los sentidos y la esencia de las personas, a través de ambientes únicos, buscando su bienestar y felicidad.",
                      },
                    ],
                  },
                },
                {
                  title: "Nuestras dos empresas",
                  type: "MIXED",
                  order: 2,
                  durationMin: 7,
                  content: {
                    blocks: [
                      { type: "heading", text: "Ambiente Azul" },
                      {
                        type: "paragraph",
                        text: "Ha desarrollado un portafolio diverso de productos y servicios, incluyendo spas portátiles, piscinas wellness, sistemas de nado contracorriente, saunas, turcos y mobiliario para exteriores.",
                      },
                      { type: "heading", text: "DOM Design" },
                      {
                        type: "paragraph",
                        text: "Sistemas constructivos para piscinas y enchapes especializados para piscinas, zonas húmedas y terrazas. Soluciones personalizadas con tecnologías avanzadas y procesos eficientes, que cumplen los más altos estándares de la industria.",
                      },
                      {
                        type: "callout",
                        style: "info",
                        text: "Somos creadores de espacios lúdicos y de relajación a través del agua. ambienteazul.com.co · domdesign.co",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Nuestros valores",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Los 7 valores que nos definen",
                  type: "MIXED",
                  order: 1,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Nuestros valores" },
                      {
                        type: "list",
                        items: [
                          "Compromiso",
                          "Proactividad",
                          "Innovación",
                          "Mejoramiento continuo",
                          "Trabajo en equipo",
                          "Recursividad",
                          "Flexibilidad",
                        ],
                      },
                      { type: "heading", text: "Compromiso" },
                      {
                        type: "paragraph",
                        text: "Actitud de responsabilidad, sentido de pertenencia y dedicación hacia los objetivos de la empresa, cumpliendo de manera oportuna con las funciones asignadas y velando por el bienestar organizacional.",
                      },
                      { type: "heading", text: "Proactividad" },
                      {
                        type: "paragraph",
                        text: "Capacidad de anticiparse a las necesidades, problemas u oportunidades, actuando de manera autónoma y responsable para generar soluciones antes de que sean solicitadas.",
                      },
                      { type: "heading", text: "Innovación" },
                      {
                        type: "paragraph",
                        text: "Generar ideas, métodos o mejoras que aporten valor a los procesos, productos o servicios, fomentando la creatividad y la apertura al cambio.",
                      },
                      { type: "heading", text: "Mejoramiento continuo" },
                      {
                        type: "paragraph",
                        text: "Proceso constante de análisis, ajuste y optimización de actividades para elevar la calidad, reducir fallas y potenciar la eficiencia.",
                      },
                      { type: "heading", text: "Trabajo en equipo" },
                      {
                        type: "paragraph",
                        text: "Colaboración armónica y efectiva entre personas para alcanzar metas comunes, fomentando la comunicación, el respeto y la cooperación.",
                      },
                      { type: "heading", text: "Recursividad" },
                      {
                        type: "paragraph",
                        text: "Capacidad para encontrar soluciones efectivas utilizando los recursos disponibles, adaptándose a las circunstancias y pensando de manera creativa.",
                      },
                      { type: "heading", text: "Flexibilidad" },
                      {
                        type: "paragraph",
                        text: "Capacidad de adaptarse con apertura y agilidad a cambios en procesos, roles, prioridades u horarios, manteniendo la efectividad y una actitud positiva.",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Reglamento interno de trabajo",
            order: 3,
            lessons: {
              create: [
                {
                  title: "Obligaciones y derechos",
                  type: "MIXED",
                  order: 1,
                  durationMin: 6,
                  content: {
                    blocks: [
                      { type: "heading", text: "Obligaciones y derechos" },
                      {
                        type: "list",
                        items: [
                          "Recibir y participar en la capacitación y demás actividades del SG-SST.",
                          "Hacer uso correcto de los elementos de protección personal (EPP).",
                          "Ejecutar el trabajo con honradez, compromiso, eficiencia y buena voluntad.",
                          "Permanecer durante la jornada en el sitio de trabajo, con dedicación y armonía con los compañeros.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Prohibiciones",
                  type: "MIXED",
                  order: 2,
                  durationMin: 7,
                  content: {
                    blocks: [
                      { type: "heading", text: "Prohibiciones" },
                      {
                        type: "list",
                        items: [
                          "Presentarse al trabajo en estado de embriaguez o bajo el efecto de drogas.",
                          "Faltar al trabajo sin justa causa o sin permiso de la empresa.",
                          "Ejecutar cualquier tipo de violencia o agresión física o psicológica.",
                          "Acoso sexual en cualquiera de sus formas.",
                          "Apropiarse indebidamente de bienes de la empresa, compañeros, clientes o contratistas.",
                          "Violar la reserva y confidencialidad de la información de la empresa y sus clientes.",
                          "Tratar de forma irrespetuosa a clientes, usuarios o contratistas.",
                        ],
                      },
                      {
                        type: "callout",
                        style: "warning",
                        text: "El incumplimiento del reglamento puede acarrear sanciones disciplinarias.",
                      },
                    ],
                  },
                },
                {
                  title: "Principios de convivencia",
                  type: "MIXED",
                  order: 3,
                  durationMin: 5,
                  content: {
                    blocks: [
                      { type: "heading", text: "Principios de convivencia" },
                      {
                        type: "list",
                        items: [
                          "Respetar el elemento más valioso: el talento humano.",
                          "Trabajar juntos, entregando lo mejor de cada uno.",
                          "Coherencia entre el pensar y el actuar.",
                          "Respeto por los demás (asertividad y dignidad).",
                          "Comunicación abierta, respetuosa y asertiva.",
                          "Apertura a la crítica constructiva.",
                          "Cocreación de un espacio de trabajo agradable.",
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Información práctica",
            order: 4,
            lessons: {
              create: [
                {
                  title: "Horarios de trabajo",
                  type: "MIXED",
                  order: 1,
                  durationMin: 4,
                  content: {
                    blocks: [
                      { type: "heading", text: "Horarios de trabajo" },
                      {
                        type: "paragraph",
                        text: "Jornada laboral: 44 horas a la semana.",
                      },
                      { type: "heading", text: "Área administrativa" },
                      {
                        type: "list",
                        items: [
                          "Lunes a jueves: 7:00 a.m. a 5:00 p.m.",
                          "Viernes: 7:00 a.m. a 4:00 p.m.",
                          "Sábados (en rotación, según disponibilidad): 8:00 a.m. a 12:00 m.",
                        ],
                      },
                      { type: "heading", text: "Área comercial" },
                      {
                        type: "list",
                        items: [
                          "Lunes a viernes: 8:00 a.m. a 6:00 p.m.",
                          "Sábados: sujeto a ferias y eventos.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Permisos, incapacidades y licencias",
                  type: "MIXED",
                  order: 2,
                  durationMin: 5,
                  content: {
                    blocks: [
                      {
                        type: "heading",
                        text: "Permisos, incapacidades y licencias",
                      },
                      {
                        type: "list",
                        items: [
                          "Paso 1. Informar la incapacidad o permiso antes o durante la ausencia (mínimo 24 horas antes, salvo urgencias).",
                          "Paso 2. Diligenciar el formulario, autorizado por el jefe inmediato. En incapacidad, presentar el documento original de la EPS o ARL.",
                          "Paso 3. \"Gestión del Ser\" valida la información y radica ante EPS/ARL.",
                          "Paso 4. Registro en el sistema de nómina y control de ausentismo.",
                        ],
                      },
                      {
                        type: "callout",
                        style: "info",
                        text: "La solicitud de permisos se realiza y autoriza directamente con el jefe inmediato.",
                      },
                    ],
                  },
                },
                {
                  title: "Presentación personal y EPP",
                  type: "MIXED",
                  order: 3,
                  durationMin: 4,
                  content: {
                    blocks: [
                      { type: "heading", text: "Presentación personal" },
                      {
                        type: "paragraph",
                        text: "Respetamos la diversidad cultural y religiosa. Buscamos comodidad, limpieza y coherencia con la imagen institucional.",
                      },
                      {
                        type: "callout",
                        style: "warning",
                        text: "En áreas técnicas y operativas es OBLIGATORIO el uso de los elementos de protección personal (EPP).",
                      },
                    ],
                  },
                },
              ],
            },
            // Examen final de la inducción (en el último módulo)
            exams: {
              create: [
                {
                  title: "Evaluación final de Inducción",
                  order: 4,
                  description:
                    "Confirma lo aprendido sobre quiénes somos, los valores y el reglamento.",
                  passingScore: 85,
                  maxAttempts: 3,
                  timeLimitMin: 10,
                  questions: {
                    create: [
                      {
                        question: "¿Cuál es el lema de Ambiente Azul?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "La felicidad fluye mejor en el agua",
                          "Los detalles DO Matter",
                          "Calidad y servicio ante todo",
                        ],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          'El lema de Ambiente Azul es "La felicidad fluye mejor en el agua".',
                        order: 1,
                      },
                      {
                        question:
                          "¿Cuáles de los siguientes son valores de la organización?",
                        type: "MULTI_SELECT",
                        options: [
                          "Compromiso",
                          "Improvisación",
                          "Trabajo en equipo",
                          "Flexibilidad",
                        ],
                        correctAnswer: [0, 2, 3],
                        points: 2,
                        explanation:
                          "Los valores incluyen Compromiso, Trabajo en equipo y Flexibilidad. La 'improvisación' no es un valor de la organización.",
                        order: 2,
                      },
                      {
                        question:
                          "En áreas técnicas y operativas, el uso de EPP es obligatorio.",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Correcto: en áreas técnicas y operativas el uso de EPP es obligatorio.",
                        order: 3,
                      },
                      {
                        question: "¿Cuál es la jornada laboral semanal?",
                        type: "MULTIPLE_CHOICE",
                        options: ["40 horas", "44 horas", "48 horas"],
                        correctAnswer: 1,
                        points: 1,
                        explanation: "La jornada laboral es de 44 horas a la semana.",
                        order: 4,
                      },
                      {
                        question: "¿En qué se especializa DOM Design?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Spas portátiles importados",
                          "Sistemas constructivos y enchapes para piscinas y zonas húmedas",
                          "Mobiliario de oficina",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "DOM Design se especializa en sistemas constructivos para piscinas y enchapes para piscinas, zonas húmedas y terrazas.",
                        order: 5,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("  ✅ Curso creado: Inducción General AA | DOM");

  // ---------------------------------------------------------------------------
  // Curso: Fundamentos de Piscinas — Ambiente Azul
  // ---------------------------------------------------------------------------
  // Imágenes del curso, extraídas de las presentaciones oficiales (AS - 01 Concepto,
  // AS - 02 Anatomía e Hidráulica Piscinas) y guardadas como ImageAsset.
  const imgDefinicion = await crearImagenPiscina(
    "concepto-definicion.png",
    "Una piscina es: agua · contenida · segura",
  );
  const imgPilares = await crearImagenPiscina(
    "concepto-3pilares.png",
    "Los 3 pilares de seguridad: microbiológica, química y física",
  );
  const img6Sistemas = await crearImagenPiscina(
    "anat-6sistemas.png",
    "Los 6 sistemas esenciales de una piscina",
  );
  const img11Componentes = await crearImagenPiscina(
    "anat-11componentes.png",
    "Los 11 componentes principales de una piscina",
  );
  const imgHidra5Preguntas = await crearImagenPiscina(
    "hidra-5preguntas.png",
    "Las 5 preguntas clave de la hidráulica",
  );
  const imgHidraVolumen = await crearImagenPiscina(
    "hidra-volumen.png",
    "Cálculo de volumen de la piscina (litros y galones)",
  );
  const imgHidraRecirc = await crearImagenPiscina(
    "hidra-recirculacion.png",
    "Período de recirculación: % de agua limpia por horas de filtrado",
  );
  const imgHidraTDH = await crearImagenPiscina(
    "hidra-tdh.png",
    "Pérdidas por fricción acumuladas en el circuito (TDH)",
  );
  const imgHidraBomba = await crearImagenPiscina(
    "hidra-bomba.png",
    "Selección de bomba por curva de rendimiento",
  );
  const imgHidraFiltro = await crearImagenPiscina(
    "hidra-filtro.png",
    "Selección de filtro según VMF y capacidad de filtración",
  );
  console.log("  🖼️  Imágenes del curso de piscinas creadas");

  const cursoPiscinas = await prisma.course.create({
    data: {
      title: "Fundamentos de Piscinas — Ambiente Azul",
      description:
        "Entiende el negocio de las piscinas: qué son, cómo funcionan, la normativa colombiana (Resolución 929 de 2026), hidráulica básica y el cuarto técnico. Para vendedores, personal nuevo y todo el equipo.",
      category: "CAPACITACION_AREA",
      company: "AMBIENTE_AZUL",
      status: "PUBLISHED",
      estimatedHours: 11,
      passingScore: 70,
      requiredAreas: [],
      createdBy: admin.id,
      modules: {
        create: [
          // ===================== MÓDULO 1 =====================
          {
            title: "Concepto de Piscina",
            order: 1,
            lessons: {
              create: [
                {
                  title: "¿Qué es una piscina?",
                  type: "MIXED",
                  order: 1,
                  durationMin: 10,
                  content: {
                    blocks: [
                      { type: "heading", text: "Bienvenida" },
                      {
                        type: "paragraph",
                        text: "Bienvenido a Ambiente Azul. En este curso vas a entender los fundamentos del negocio de las piscinas: qué son, cómo funcionan, qué exige la ley y cómo se diseña su parte técnica.",
                      },
                      { type: "heading", text: "Define una piscina en 3 palabras" },
                      {
                        type: "paragraph",
                        text: "Antes de seguir, piensa: si tuvieras que definir una piscina en solo 3 palabras, ¿cuáles serían? Las palabras clave son: AGUA, CONTENIDA y SEGURA.",
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "Una piscina es AGUA CONTENIDA SEGURA. Tres palabras que resumen todo el concepto.",
                      },
                      {
                        type: "image",
                        url: imgDefinicion,
                        caption: "Los 3 elementos del concepto: agua, contenida y segura.",
                      },
                      { type: "heading", text: "Etimología e historia" },
                      {
                        type: "paragraph",
                        text: "La palabra PISCINA viene del latín PISCIS (pez). En la antigüedad, los peces eran el sistema natural de limpieza del agua: consumían larvas y microorganismos, manteniendo el agua sana.",
                      },
                      {
                        type: "paragraph",
                        text: "Aunque la tecnología evolucione, la definición sigue igual: agua contenida y segura.",
                      },
                    ],
                  },
                },
                {
                  title: "Los 3 pilares de seguridad",
                  type: "MIXED",
                  order: 2,
                  durationMin: 8,
                  content: {
                    blocks: [
                      { type: "heading", text: "Los 3 pilares de seguridad" },
                      {
                        type: "paragraph",
                        text: "Cuando hablamos de seguridad en una piscina, ¿qué incluye? Tres pilares fundamentales.",
                      },
                      {
                        type: "image",
                        url: imgPilares,
                        caption: "Seguridad microbiológica, química y física.",
                      },
                      { type: "heading", text: "1. Seguridad microbiológica" },
                      {
                        type: "paragraph",
                        text: "Protección contra virus, bacterias, hongos, protozoos y microorganismos nocivos. Aquí comienza la salud del agua.",
                      },
                      { type: "heading", text: "2. Seguridad química" },
                      {
                        type: "paragraph",
                        text: "Agua correctamente balanceada en todos sus parámetros. Ni agresiva, ni corrosiva, ni peligrosa para el cuerpo humano.",
                      },
                      { type: "heading", text: "3. Seguridad física" },
                      {
                        type: "paragraph",
                        text: "Protección de la integridad de los usuarios. Prevención de caídas, golpes, atrapamientos y accidentes.",
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "Estos 3 pilares son la base de todo lo que hacemos en Ambiente Azul. Cada sistema, componente y decisión de diseño debe responder a al menos uno de ellos.",
                      },
                    ],
                  },
                },
                {
                  title: "Video: ¿Qué es y cómo funciona una piscina?",
                  type: "MIXED",
                  order: 3,
                  durationMin: 14,
                  content: {
                    blocks: [
                      {
                        type: "paragraph",
                        text: "Este video explicativo resume el funcionamiento completo de una piscina y complementa los conceptos anteriores.",
                      },
                      {
                        type: "video",
                        url: "https://www.youtube.com/watch?v=OojXkd7BidE",
                      },
                      {
                        type: "paragraph",
                        text: "Este video te da una visión general de cómo funciona una piscina. En los siguientes módulos vamos a profundizar en cada uno de estos sistemas.",
                      },
                    ],
                  },
                },
              ],
            },
            exams: {
              create: [
                {
                  title: "Evaluación — Concepto de Piscina",
                  description:
                    "Confirma los conceptos básicos: definición, pilares de seguridad e historia.",
                  passingScore: 70,
                  maxAttempts: 3,
                  timeLimitMin: 10,
                  order: 4,
                  questions: {
                    create: [
                      {
                        question:
                          "¿Cuál es la definición esencial de una piscina según Ambiente Azul?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Un espacio recreativo con agua tratada",
                          "Agua contenida segura",
                          "Una estructura de concreto con sistema de filtración",
                          "Un cuerpo de agua con cloro",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "La definición más simple y poderosa: una piscina es AGUA CONTENIDA SEGURA.",
                        order: 1,
                      },
                      {
                        question:
                          "¿Cuáles son los 3 pilares de seguridad de una piscina?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Estructural, eléctrica y química",
                          "Microbiológica, química y física",
                          "Filtración, desinfección y climatización",
                          "Preventiva, correctiva y predictiva",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "Los 3 pilares son: microbiológica (protección contra patógenos), química (agua balanceada) y física (integridad del usuario).",
                        order: 2,
                      },
                      {
                        question:
                          "La palabra \"piscina\" proviene del latín \"PISCIS\", que significa \"pez\".",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Correcto. PISCINA viene de PISCIS (pez). En la antigüedad los peces mantenían el agua limpia consumiendo larvas y microorganismos.",
                        order: 3,
                      },
                      {
                        question: "La seguridad química se refiere a:",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Proteger la piscina contra incendios",
                          "Evitar el uso de productos peligrosos",
                          "Mantener el agua correctamente balanceada, ni agresiva ni corrosiva",
                          "Usar solo cloro orgánico",
                        ],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "La seguridad química garantiza que el agua esté equilibrada en todos sus parámetros, sin ser agresiva ni peligrosa para el cuerpo humano.",
                        order: 4,
                      },
                      {
                        question:
                          "¿Qué función cumplían los peces en los depósitos de agua de la antigüedad?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Decorativa",
                          "Indicador de temperatura",
                          "Sistema natural de limpieza: consumían larvas y microorganismos",
                          "Generaban movimiento en el agua",
                        ],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "Los peces eran el sistema de seguridad del agua antes de la tecnología moderna: consumían larvas, microorganismos y agentes patógenos.",
                        order: 5,
                      },
                    ],
                  },
                },
              ],
            },
          },

          // ===================== MÓDULO 2 =====================
          {
            title: "Anatomía de una Piscina",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Los 6 sistemas esenciales",
                  type: "MIXED",
                  order: 1,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Los 6 sistemas esenciales" },
                      {
                        type: "paragraph",
                        text: "¿Cuántos sistemas son realmente esenciales para que exista una piscina? La respuesta: 6 sistemas.",
                      },
                      {
                        type: "image",
                        url: img6Sistemas,
                        caption: "Vaso, agua, conducción, filtración, desinfección e iluminación.",
                      },
                      {
                        type: "list",
                        items: [
                          "Vaso — Estructura estanca que contiene el agua. Define forma, tamaño y límites físicos. Sin vaso no hay contención.",
                          "Agua — Sistema vivo y dinámico. Interactúa con personas, materiales y demás sistemas. Debe ser controlada, equilibrada y protegida.",
                          "Sistema de conducción — Tuberías y accesorios por donde circula el agua del vaso al cuarto técnico y de regreso. Es el sistema circulatorio.",
                          "Sistema de filtración — Motobomba + filtro. Remueve partículas, retiene sólidos y mantiene la claridad del agua.",
                          "Sistema de desinfección — Protege la seguridad microbiológica. Tecnologías: lámparas UV, generadores de cloro, cloradores de pastillas, ozono.",
                          "Sistema de iluminación — Aporta diseño visual y seguridad para el uso nocturno.",
                        ],
                      },
                      {
                        type: "callout",
                        style: "info",
                        text: "Piensa en la piscina como un cuerpo humano: el vaso es el esqueleto, el agua es la sangre, la conducción son las venas y arterias, la filtración son los riñones, la desinfección es el sistema inmune y la iluminación son los ojos.",
                      },
                    ],
                  },
                },
                {
                  title: "Los 11 componentes principales",
                  type: "MIXED",
                  order: 2,
                  durationMin: 14,
                  content: {
                    blocks: [
                      { type: "heading", text: "Los 11 componentes principales" },
                      {
                        type: "image",
                        url: img11Componentes,
                        caption: "Diagrama de los 11 componentes de una piscina y su ubicación en el circuito.",
                      },
                      {
                        type: "list",
                        items: [
                          "Desnatador (skimmer) — Filtración superficial: captura hojas, insectos y partículas flotantes. Tiene compuerta regulable, canasta colectora y tapa de acceso.",
                          "Pozuelos de fondo (drenes) — Succionan agua desde el fondo. Permiten vaciado parcial o total. Deben tener cubiertas antiatrapamiento.",
                          "Toma de aspirar — Punto de conexión para la aspiradora manual. Permite limpiar el fondo y las paredes.",
                          "Motobomba — Corazón del sistema. Genera el movimiento del agua por todo el circuito.",
                          "Filtro — Retiene partículas sólidas. Tipos: arena, cartucho, diatomeas.",
                          "Calefacción — Bomba de calor, calentador de gas o sistema solar. Controla la temperatura del agua.",
                          "Clorador en línea — Dosifica el desinfectante de forma continua y controlada.",
                          "Retornos (jets) — Devuelven el agua filtrada y tratada a la piscina. Su ubicación es clave para la circulación.",
                          "Reflectores — Iluminación subacuática, LED de colores o blanco.",
                          "Rebose (antidiluvio) — Controla el nivel de agua y evita desbordamientos por lluvia.",
                          "Desagüe — Permite el vaciado completo de la piscina para mantenimiento.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Video: Electrólisis salina y tratamiento del agua",
                  type: "MIXED",
                  order: 3,
                  durationMin: 12,
                  content: {
                    blocks: [
                      {
                        type: "paragraph",
                        text: "Video sobre sistemas de tratamiento del agua y la electrólisis salina como alternativa de desinfección.",
                      },
                      {
                        type: "video",
                        url: "https://www.youtube.com/watch?v=zumvji_JpPU",
                      },
                      {
                        type: "paragraph",
                        text: "La electrólisis salina es una de las tecnologías más modernas para la desinfección del agua: genera cloro a partir de sal, eliminando la necesidad de manipular químicos directamente.",
                      },
                    ],
                  },
                },
              ],
            },
            exams: {
              create: [
                {
                  title: "Evaluación — Anatomía de una Piscina",
                  description:
                    "Sistemas esenciales y componentes principales de una piscina.",
                  passingScore: 70,
                  maxAttempts: 3,
                  timeLimitMin: 15,
                  order: 4,
                  questions: {
                    create: [
                      {
                        question:
                          "¿Cuántos sistemas esenciales conforman la anatomía de una piscina?",
                        type: "MULTIPLE_CHOICE",
                        options: ["4", "5", "6", "8"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "Son 6: Vaso, Agua, Conducción, Filtración, Desinfección e Iluminación.",
                        order: 1,
                      },
                      {
                        question: "¿Cuál es la función del desnatador (skimmer)?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Calentar el agua",
                          "Capturar partículas flotantes de la superficie",
                          "Inyectar cloro al agua",
                          "Iluminar la piscina",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "El desnatador captura hojas, insectos y residuos flotantes antes de que se dispersen, para que el sistema de filtración los elimine.",
                        order: 2,
                      },
                      {
                        question: "El sistema de conducción se compara con:",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "El esqueleto del cuerpo humano",
                          "El sistema circulatorio (venas y arterias)",
                          "El sistema nervioso",
                          "El sistema digestivo",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "Las tuberías por donde circula el agua son como las venas y arterias: llevan el agua del vaso al cuarto técnico y de regreso.",
                        order: 3,
                      },
                      {
                        question:
                          "¿Cuáles de los siguientes son componentes del sistema de filtración? (Selecciona todos los correctos)",
                        type: "MULTI_SELECT",
                        options: [
                          "Motobomba",
                          "Reflectores",
                          "Filtro",
                          "Desnatador",
                          "Retornos",
                        ],
                        correctAnswer: [0, 2],
                        points: 2,
                        explanation:
                          "El sistema de filtración se compone principalmente de la motobomba (genera el movimiento) y el filtro (retiene sólidos).",
                        order: 4,
                      },
                      {
                        question:
                          "¿Cuál sistema protege la seguridad microbiológica del agua?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Sistema de conducción",
                          "Sistema de filtración",
                          "Sistema de desinfección",
                          "Sistema de iluminación",
                        ],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "El sistema de desinfección (UV, cloro, ozono, electrólisis) elimina virus, bacterias y microorganismos nocivos.",
                        order: 5,
                      },
                      {
                        question:
                          "Los pozuelos de fondo deben tener cubiertas antiatrapamiento por seguridad.",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Correcto. Las cubiertas antiatrapamiento son obligatorias para evitar que una persona quede atrapada por la succión.",
                        order: 6,
                      },
                    ],
                  },
                },
              ],
            },
          },

          // ===================== MÓDULO 3 =====================
          {
            title: "Normativa Colombiana — Resolución 929 de 2026",
            order: 3,
            lessons: {
              create: [
                {
                  title: "Marco legal: ¿qué dice la nueva resolución?",
                  type: "MIXED",
                  order: 1,
                  durationMin: 15,
                  content: {
                    blocks: [
                      {
                        type: "callout",
                        style: "warning",
                        text: "Esta resolución es NUEVA (12 de mayo de 2026). Todo el equipo de Ambiente Azul debe conocerla porque afecta directamente cómo diseñamos, construimos y entregamos piscinas.",
                      },
                      { type: "heading", text: "¿Qué es?" },
                      {
                        type: "paragraph",
                        text: "Resolución 000929 del Ministerio de Salud y Protección Social. Adopta criterios técnicos constructivos y de seguridad para establecimientos con piscinas.",
                      },
                      { type: "heading", text: "¿A quién aplica?" },
                      {
                        type: "paragraph",
                        text: "A todos: personas naturales o jurídicas, públicas o privadas, responsables de establecimientos con piscinas abiertas al público o de uso restringido. Las piscinas privadas unihabitacionales también deben cumplir normas mínimas (Art. 11, Ley 1209 de 2008).",
                      },
                      { type: "heading", text: "Contexto" },
                      {
                        type: "paragraph",
                        text: "Entre 2005 y 2022, Colombia registró 6.832 muertes por ahogamiento en piscinas. El 30% fueron niños en primera infancia.",
                      },
                      { type: "heading", text: "Certificado de cumplimiento" },
                      {
                        type: "paragraph",
                        text: "Tiene una vigencia de 4 años y lo expide la autoridad administrativa del municipio.",
                      },
                      {
                        type: "heading",
                        text: "Documentos requeridos para el certificado (Art. 5)",
                      },
                      {
                        type: "list",
                        items: [
                          "Licencia de aprobación de piscinas",
                          "Planos de planta y cortes",
                          "Planos de sistemas eléctricos",
                          "Planos de sistemas hidráulicos",
                          "Memorias descriptivas de construcción y técnica",
                          "Manual de operación y protocolos de mantenimiento",
                          "Descripción de disposición de lodos del lavado",
                          "Plan de seguridad y reglamento de uso",
                          "Concepto sanitario",
                        ],
                      },
                      {
                        type: "callout",
                        style: "info",
                        text: "Cuando un cliente pregunta por los requisitos legales, debemos poder explicarle qué documentos necesita. Eso nos posiciona como expertos, no solo como instaladores.",
                      },
                    ],
                  },
                },
                {
                  title: "Criterios constructivos",
                  type: "MIXED",
                  order: 2,
                  durationMin: 14,
                  content: {
                    blocks: [
                      { type: "heading", text: "Planos" },
                      {
                        type: "list",
                        items: [
                          "Se requieren planos informativos (visibles en el área de bañistas) y planos técnicos constructivos.",
                          "Los planos técnicos deben incluir: tratamiento, calentamiento, eléctricos, hidráulicos y gas.",
                          "Deben cumplir la norma sismo resistente.",
                        ],
                      },
                      { type: "heading", text: "Formas del estanque" },
                      {
                        type: "list",
                        items: [
                          "Prohibidos túneles sumergidos u obstrucciones subacuáticas.",
                          "Prohibidas zonas muertas (ángulos o recodos que dificulten la circulación).",
                          "Pisos y paredes: superficie uniforme, sin resaltos ni filos.",
                        ],
                      },
                      { type: "heading", text: "Vértices" },
                      {
                        type: "paragraph",
                        text: "Los vértices entre muros y piso deben ser redondeados (a manera de media caña) o con chaflán, para evitar la acumulación de contaminantes y facilitar la limpieza.",
                      },
                      { type: "heading", text: "Profundidad" },
                      {
                        type: "list",
                        items: [
                          "Bañistas menores de 6 años: máximo 0,60 m de profundidad.",
                          "Corredor sumergido: máximo 10 cm de profundidad.",
                          "Las profundidades deben señalizarse en ambos lados, en paredes, en el corredor al borde y en el cambio de inclinación del piso.",
                          "Señalización en colores vistosos, con letras y números de mínimo 10 cm.",
                        ],
                      },
                      { type: "heading", text: "Escaleras" },
                      {
                        type: "list",
                        items: [
                          "Mínimo 1 medio de entrada/salida por cada 25 m de perímetro.",
                          "Escaleras fijas: contrahuella máx. 23 cm, huella mín. 25 cm, ancho 60 cm.",
                          "Deben tener barandales resistentes a la corrosión.",
                          "Pisos antideslizantes y bordes de diferente color.",
                        ],
                      },
                      { type: "heading", text: "Accesibilidad" },
                      {
                        type: "paragraph",
                        text: "Las piscinas públicas deben tener al menos 1 medio accesible para personas con movilidad reducida (rampas, elevadores o entradas de profundidad cero).",
                      },
                    ],
                  },
                },
                {
                  title: "Sistema de recirculación y equipos",
                  type: "MIXED",
                  order: 3,
                  durationMin: 16,
                  content: {
                    blocks: [
                      { type: "heading", text: "Desagüe sumergido" },
                      {
                        type: "list",
                        items: [
                          "Mínimo 2 desagües sumergidos balanceados hidráulicamente, con separación mínima de 0,90 m.",
                          "Cubiertas antiatrapamiento + sistema de liberación de vacío + botón de apagado de emergencia.",
                          "Las cubiertas deben tener mínimo 4 veces el área de la tubería de descarga.",
                        ],
                      },
                      { type: "heading", text: "Revestimientos" },
                      {
                        type: "list",
                        items: [
                          "Color que permita ver el fondo independiente de la profundidad.",
                          "Impermeable, atérmico, resistente a la abrasión y a la tracción mecánica.",
                          "Fácil limpieza y desinfección; estable frente a los químicos del tratamiento.",
                        ],
                      },
                      { type: "heading", text: "Corredores y andenes" },
                      {
                        type: "list",
                        items: [
                          "Ancho mínimo: 1,20 m desde el borde.",
                          "Material atérmico, antideslizante, impermeable y no poroso.",
                          "Inclinación del 3% al 5% hacia los drenajes.",
                          "Bordes redondeados, sin filos ni esquinas afiladas.",
                        ],
                      },
                      { type: "heading", text: "Periodo de recirculación" },
                      {
                        type: "list",
                        items: [
                          "Piscina pública abierta: recirculación 4-6 h, 4 veces/día (16-24 h/día).",
                          "Piscina de uso restringido: 4-6 h, 2-4 veces/día (8-24 h/día).",
                          "Piscina infantil (<0,6 m): 1-2 h, 12 veces/día (12-24 h/día).",
                          "Estructuras similares (spas): 0,5 h, 12 veces/día (6 h/día).",
                        ],
                      },
                      { type: "heading", text: "Tuberías" },
                      {
                        type: "list",
                        items: [
                          "Velocidad máxima línea de presión: 2,4 m/s.",
                          "Velocidad máxima línea de succión: 1,8 m/s.",
                          "Diámetro máximo: 8 pulgadas.",
                          "Prueba de estanqueidad: máximo 21 PSI (1,5 bar).",
                        ],
                      },
                      { type: "heading", text: "Filtros y desnatadores" },
                      {
                        type: "list",
                        items: [
                          "Turbidez máxima: 3 NTU.",
                          "Velocidad de filtración piscinas públicas: 20-40 m³/h/m²; restringidas: máx. 50 m³/h/m².",
                          "1 desnatador por cada 46,5 m² de lámina de agua.",
                          "Áreas >312 m²: sistema de sobreflujo perimetral (mín. 50% del perímetro).",
                          "Boquillas de inyección (retornos): 1 inyector cada 6 m de perímetro, a 30 cm del fondo y a 1,5 m de los desnatadores.",
                        ],
                      },
                      { type: "heading", text: "Cuarto de equipos" },
                      {
                        type: "list",
                        items: [
                          "Uso exclusivo y fácil circulación.",
                          "Señalización de válvulas y marcado de tuberías (sentido, temperatura, tipo de fluido).",
                          "Iluminación y ventilación adecuadas.",
                          "Drenajes con rejillas de seguridad y extintor de incendios.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Seguridad, salvavidas y reglamento de uso",
                  type: "MIXED",
                  order: 4,
                  durationMin: 14,
                  content: {
                    blocks: [
                      { type: "heading", text: "Número máximo de bañistas" },
                      {
                        type: "list",
                        items: [
                          "Profundidad < 1 m: 1 bañista por cada 2,2 m².",
                          "Profundidad 1 - 1,5 m: 1 bañista por cada 2,7 m².",
                          "Profundidad > 1,5 m: 1 bañista por cada 4,0 m².",
                          "Estructura similar (spa): 1 bañista por cada 0,9 m².",
                        ],
                      },
                      { type: "heading", text: "Operario certificado" },
                      {
                        type: "paragraph",
                        text: "Las piscinas de uso colectivo DEBEN tener operario certificado (por el SENA o entidades acreditadas bajo ISO/IEC 17024).",
                      },
                      { type: "heading", text: "Reglamento de uso obligatorio" },
                      {
                        type: "list",
                        items: [
                          "Prohibir el ingreso de menores de 12 años sin un adulto responsable.",
                          "Prohibir bañistas con heridas visibles o infecciones.",
                          "Prohibir joyas y accesorios que causen lesiones.",
                          "Prohibir el ingreso bajo efectos de alcohol o sustancias.",
                          "Exigir ducha antes de ingresar.",
                          "Prohibir mascotas.",
                          "Prohibir juegos violentos y carreras en el perímetro.",
                          "Prohibir envases de vidrio.",
                          "Definir horario y aforo máximo.",
                          "Prohibir alcohol y comida dentro del estanque.",
                          "Prohibir tabaco en el perímetro.",
                          "Uso obligatorio de gorro.",
                        ],
                      },
                      {
                        type: "callout",
                        style: "warning",
                        text: "Este reglamento debe estar fijo en un lugar visible junto a cada piscina. Es obligatorio y verificable por las autoridades.",
                      },
                      { type: "heading", text: "Salvavidas y elementos de rescate" },
                      {
                        type: "list",
                        items: [
                          "1 salvavidas por cada estanque con superficie ≤ 312 m²; para áreas mayores, 1 adicional proporcional al incremento.",
                          "Piscinas en condominios: 1 salvavidas por cada 20 menores de 14 años.",
                          "Mínimo 3 elementos de rescate: 2 flotantes (aro salvavidas con cuerda / boya) + 1 de extensión (tubo de rescate / pértiga).",
                          "Teléfono habilitado con números de emergencia, señalizado y de fácil acceso.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Resolución 929 completa (PDF)",
                  type: "MIXED",
                  order: 5,
                  durationMin: 5,
                  content: {
                    blocks: [
                      {
                        type: "paragraph",
                        text: "Descarga aquí el texto completo de la Resolución 929 de 2026 para consulta. Es importante tener este documento como referencia para cualquier proyecto de piscina.",
                      },
                      {
                        type: "pdf",
                        url: "https://drive.google.com/file/d/1jo4cGI91eIpt4MJqAZoqVjnu0-Vp_aLI/view",
                        title: "Resolución No. 929 de 2026",
                      },
                    ],
                  },
                },
              ],
            },
            exams: {
              create: [
                {
                  title: "Evaluación — Normativa Colombiana",
                  description:
                    "Resolución 929 de 2026: requisitos, criterios constructivos y seguridad.",
                  passingScore: 70,
                  maxAttempts: 3,
                  timeLimitMin: 20,
                  order: 6,
                  questions: {
                    create: [
                      {
                        question:
                          "¿Cuál es la vigencia del certificado de cumplimiento de normas de seguridad para piscinas?",
                        type: "MULTIPLE_CHOICE",
                        options: ["1 año", "2 años", "4 años", "10 años"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "Según el Artículo 4, el certificado tiene vigencia de 4 años, siempre que no haya modificaciones de obra.",
                        order: 1,
                      },
                      {
                        question:
                          "¿Cuál es la profundidad máxima permitida para piscinas de bañistas menores de 6 años?",
                        type: "MULTIPLE_CHOICE",
                        options: ["0,30 m", "0,45 m", "0,60 m", "1,00 m"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "Los estanques para bañistas menores de 6 años deben tener máximo 0,60 m de profundidad.",
                        order: 2,
                      },
                      {
                        question:
                          "¿Cuántos desagües sumergidos mínimo debe tener una piscina?",
                        type: "MULTIPLE_CHOICE",
                        options: ["1", "2", "3", "Depende del tamaño"],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "Mínimo 2 desagües sumergidos, balanceados hidráulicamente, con separación mínima de 0,90 m y cubiertas antiatrapamiento.",
                        order: 3,
                      },
                      {
                        question:
                          "¿Cada cuántos metros cuadrados de lámina de agua se requiere un desnatador?",
                        type: "MULTIPLE_CHOICE",
                        options: ["25 m²", "42 m²", "46,5 m²", "60 m²"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "1 desnatador por cada 46,5 m² de lámina de agua. Para áreas mayores a 312 m² se requiere sistema de sobreflujo perimetral.",
                        order: 4,
                      },
                      {
                        question:
                          "Es obligatorio prohibir el ingreso de menores de 12 años sin acompañamiento de un adulto responsable.",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Correcto. Es parte del reglamento de uso obligatorio.",
                        order: 5,
                      },
                      {
                        question:
                          "¿Cuál es el ancho mínimo del corredor perimetral (andén) de una piscina?",
                        type: "MULTIPLE_CHOICE",
                        options: ["0,60 m", "0,90 m", "1,20 m", "1,50 m"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "Mínimo 1,20 m desde el borde, en material atérmico, antideslizante e impermeable, con inclinación del 3% al 5% hacia los drenajes.",
                        order: 6,
                      },
                      {
                        question:
                          "¿Cada cuánto se debe filtrar todo el volumen de agua en una piscina infantil?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Cada 30 minutos",
                          "Cada 1-2 horas",
                          "Cada 4-6 horas",
                          "Cada 12 horas",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "Las piscinas infantiles (profundidad <0,6 m) requieren un periodo de recirculación de 1-2 horas, con tasa de rotación de 12 veces al día.",
                        order: 7,
                      },
                      {
                        question:
                          "¿Cuáles de los siguientes elementos de rescate son obligatorios junto a una piscina? (Selecciona todos los correctos)",
                        type: "MULTI_SELECT",
                        options: [
                          "Aro salvavidas con cuerda",
                          "Desfibrilador automático",
                          "Boya de rescate",
                          "Tubo de rescate o pértiga",
                          "Tanque de oxígeno",
                        ],
                        correctAnswer: [0, 2, 3],
                        points: 2,
                        explanation:
                          "Se requieren mínimo 3 elementos: 2 flotantes (aro / boya) + 1 de extensión (tubo / pértiga), visibles y en buen estado.",
                        order: 8,
                      },
                    ],
                  },
                },
              ],
            },
          },

          // ===================== MÓDULO 4 =====================
          {
            title: "Hidráulica Básica de Piscinas",
            order: 4,
            lessons: {
              create: [
                {
                  title: "Volumen: ¿cuánta agua tiene la piscina?",
                  type: "MIXED",
                  order: 1,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "¿Qué es la hidráulica?" },
                      {
                        type: "paragraph",
                        text: "La hidráulica es el estudio del comportamiento de los líquidos en reposo y en movimiento.",
                      },
                      {
                        type: "heading",
                        text: "Las 5 preguntas clave de la hidráulica en piscinas",
                      },
                      {
                        type: "list",
                        items: [
                          "¿Cuánta agua tiene? → VOLUMEN",
                          "¿En cuánto tiempo se filtra? → PERIODO DE RECIRCULACIÓN",
                          "¿A qué velocidad se mueve? → CAUDAL (Q)",
                          "¿Cuánta resistencia encuentra? → PÉRDIDAS POR FRICCIÓN",
                          "¿Cómo superamos las resistencias? → SELECCIÓN DE BOMBA / FILTRO",
                        ],
                      },
                      {
                        type: "image",
                        url: imgHidra5Preguntas,
                        caption: "Las 5 preguntas de la hidráulica y su respuesta técnica.",
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "Fórmula de conversión: Litros ÷ 3,78 = Galones. El volumen se calcula con las medidas de la piscina y sus profundidades variables.",
                      },
                      {
                        type: "image",
                        url: imgHidraVolumen,
                        caption: "Ejemplo: una piscina de 13 × 4 m con profundidad variable ≈ 29.060 galones.",
                      },
                    ],
                  },
                },
                {
                  title: "Periodo de recirculación y caudal",
                  type: "MIXED",
                  order: 2,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Periodo de recirculación" },
                      {
                        type: "paragraph",
                        text: "Es el tiempo requerido para mover todo el volumen de agua a través del sistema una sola vez.",
                      },
                      {
                        type: "list",
                        items: [
                          "Piscinas privadas: 6 horas (360 min).",
                          "Piscinas públicas: 4-6 horas (240-360 min).",
                          "Parques acuáticos: 1-2 horas (60-120 min).",
                          "Piscinas de niños: 1-2 horas.",
                          "Spas / jacuzzis: 30 min.",
                        ],
                      },
                      {
                        type: "heading",
                        text: "¿Cuánto se limpia el agua según las recirculaciones?",
                      },
                      {
                        type: "list",
                        items: [
                          "1 recirculación (6 h) = 63% del agua limpia.",
                          "2 recirculaciones (12 h) = 86%.",
                          "3 recirculaciones (18 h) = 95%.",
                          "4 recirculaciones (24 h) = 98%.",
                        ],
                      },
                      {
                        type: "image",
                        url: imgHidraRecirc,
                        caption: "A más recirculaciones diarias, mayor porcentaje de agua limpia (6 h = 63% … 24 h = 98%).",
                      },
                      { type: "heading", text: "Caudal (Q)" },
                      {
                        type: "paragraph",
                        text: "Es la velocidad de flujo del agua. Debe satisfacer el periodo de recirculación y las velocidades permitidas por ley. Se agrega un 20% al caudal calculado para obtener el Caudal de Diseño.",
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "Cuando un cliente pregunta \"¿cuántas horas debo tener prendida la bomba?\", la respuesta técnica es: idealmente 24 horas. El mínimo es cumplir al menos 1 recirculación completa (6 horas para piscinas privadas).",
                      },
                    ],
                  },
                },
                {
                  title: "Pérdidas por fricción y TDH",
                  type: "MIXED",
                  order: 3,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Pérdidas por fricción" },
                      {
                        type: "paragraph",
                        text: "Todo elemento por donde pasa el agua crea resistencia: codos, válvulas, filtros, desnatadores, tuberías. La suma de TODAS las resistencias es el TDH (Cabeza Total Dinámica), medido en pies de agua.",
                      },
                      {
                        type: "image",
                        url: imgHidraTDH,
                        caption: "Cada accesorio suma pérdida: desnatador 2 ft, codo 5,5 ft, filtro 7 ft, retorno 6,2 ft. El total es el TDH.",
                      },
                      {
                        type: "list",
                        items: [
                          "Ejemplo: desnatador a 40 GPM = 2 ft de pérdida.",
                          "Ejemplo: filtro a 75 GPM = 7 ft de pérdida.",
                          "La selección de accesorios afecta directamente el TDH.",
                          "Desnatadores: 1 por cada 42 m² (la Res. 929 actualizó a 46,5 m²).",
                          "Retornos: perímetro (m) ÷ 7,8 m. Reflectores: 91 lúmenes por m².",
                        ],
                      },
                      {
                        type: "callout",
                        style: "info",
                        text: "No necesitas memorizar estas fórmulas. Lo importante es entender el concepto: mientras más accesorios y más largo el recorrido, más potente debe ser la bomba.",
                      },
                    ],
                  },
                },
                {
                  title: "Selección de bomba y filtro",
                  type: "MIXED",
                  order: 4,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Selección de la motobomba" },
                      {
                        type: "paragraph",
                        text: "Se selecciona por su CURVA DE RENDIMIENTO, usando dos datos: el Caudal (Q) y el TDH. La bomba debe entregar el caudal requerido venciendo toda la resistencia del sistema.",
                      },
                      {
                        type: "image",
                        url: imgHidraBomba,
                        caption: "Una bomba muy grande o muy pequeña no sirve: se busca la que cruza el punto Q–TDH (curva correcta).",
                      },
                      { type: "heading", text: "Selección del filtro" },
                      {
                        type: "image",
                        url: imgHidraFiltro,
                        caption: "Diatomeas (2-5 µm), arena (20-40 µm) y cartucho (8-15 µm), cada uno con su VMF.",
                      },
                      {
                        type: "list",
                        items: [
                          "Velocidad del medio filtrante (VMF) — Arena: 15 GPM/ft²; Cartucho: 1,5 GPM/ft²; Arena y grava: 10-15 GPM/ft²; Diatomeas: 0,375 GPM/ft².",
                          "Capacidad de filtración — Diatomeas: 2-5 micras; Cartucho: 8-15 micras; Arena: 20-40 micras.",
                          "Referencia: 1 grano de sal = 90-100 micrones; 1 bacteria = 2 micrones; 1 alga = 1 micrón.",
                        ],
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "Para vendedores: cuando un cliente pregunta \"¿qué filtro necesito?\", depende del volumen, el periodo de recirculación deseado y el nivel de filtración requerido. El área técnica hace el cálculo exacto, pero tú debes entender los conceptos para explicar por qué se recomienda uno u otro.",
                      },
                      {
                        type: "heading",
                        text: "Bibliografía de referencia",
                      },
                      {
                        type: "list",
                        items: [
                          "NSPF (National Swimming Pool Foundation) — Guía Pool & Spa Operator.",
                          "Ministerio de Salud — Resolución 929 de 2026.",
                          "Pentair — Hydromatic Residential Resource Center.",
                          "Sta-Rite Industries — Basic Training Manual.",
                        ],
                      },
                    ],
                  },
                },
              ],
            },
            exams: {
              create: [
                {
                  title: "Evaluación — Hidráulica Básica",
                  description:
                    "Volumen, recirculación, caudal, TDH y selección de equipos.",
                  passingScore: 70,
                  maxAttempts: 3,
                  timeLimitMin: 15,
                  order: 5,
                  questions: {
                    create: [
                      {
                        question:
                          "¿Cuál es el periodo de recirculación recomendado para una piscina privada?",
                        type: "MULTIPLE_CHOICE",
                        options: ["2 horas", "4 horas", "6 horas", "12 horas"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "El periodo estándar para piscinas privadas es de 6 horas (360 minutos). Para públicas, 4-6 horas.",
                        order: 1,
                      },
                      {
                        question:
                          "Si una piscina filtra su volumen completo 4 veces en 24 horas, ¿qué porcentaje del agua se ha limpiado?",
                        type: "MULTIPLE_CHOICE",
                        options: ["75%", "86%", "95%", "98%"],
                        correctAnswer: 3,
                        points: 1,
                        explanation:
                          "1 recirculación = 63%, 2 = 86%, 3 = 95%, 4 recirculaciones (24 h) = 98% del agua limpia.",
                        order: 2,
                      },
                      {
                        question: "¿Qué es el TDH?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "El volumen total de la piscina",
                          "La suma de todas las resistencias que encuentra el agua en el sistema",
                          "La velocidad del flujo de agua",
                          "El tiempo de filtración diario",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "El TDH (Cabeza Total Dinámica) es la suma de todas las pérdidas por fricción del sistema: tuberías, codos, válvulas, filtro, desnatadores, etc.",
                        order: 3,
                      },
                      {
                        question:
                          "¿Qué tipo de filtro tiene la mayor capacidad de filtración (menor tamaño de partícula)?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Arena",
                          "Cartucho",
                          "Diatomeas (DE)",
                          "Arena y grava",
                        ],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "Diatomeas filtra de 2-5 micras, cartucho 8-15, arena 20-40. A menor número de micras, mayor capacidad de filtración.",
                        order: 4,
                      },
                      {
                        question:
                          "Al calcular el caudal, se debe agregar un 20% adicional para obtener el Caudal de Diseño.",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Correcto. El 20% adicional es un factor de seguridad para que el sistema opere bien incluso en condiciones no ideales.",
                        order: 5,
                      },
                    ],
                  },
                },
              ],
            },
          },

          // ===================== MÓDULO 5 =====================
          {
            title: "Cuarto Técnico de Máquinas",
            order: 5,
            lessons: {
              create: [
                {
                  title: "Dimensiones y construcción",
                  type: "MIXED",
                  order: 1,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Pruebas previas" },
                      {
                        type: "list",
                        items: [
                          "Prueba de estanqueidad del vaso: verificar que no haya fugas.",
                          "Prueba de presión hidrostática: comprobar la hermeticidad de las redes hidráulicas hasta el cuarto técnico.",
                        ],
                      },
                      { type: "heading", text: "Dimensiones mínimas" },
                      {
                        type: "list",
                        items: [
                          "Corredor de circulación alrededor de equipos: mínimo 1,2 m de ancho.",
                          "Espacio libre entre equipos: mínimo 0,9 m para mantenimiento.",
                          "Altura libre de circulación: mínimo 2,4 m.",
                        ],
                      },
                      { type: "heading", text: "Construcción y acabado" },
                      {
                        type: "list",
                        items: [
                          "Estructura estable que soporte esfuerzos mecánicos.",
                          "Todas las superficies impermeabilizadas.",
                          "Aislamiento acústico para atenuar el sonido de motores y absorber vibraciones.",
                          "Piso antideslizante con pendientes hacia drenaje general (mín. 2\").",
                          "Paredes y techo (<2,4 m): pintados de blanco semibrillante para maximizar la reflexión de luz; por encima de 2,4 m, pintura brillante.",
                        ],
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "Un cuarto de máquinas bien diseñado extiende la vida útil de todos los equipos. La ventilación es OBLIGATORIA para evitar ambientes corrosivos.",
                      },
                    ],
                  },
                },
                {
                  title: "Acceso, ventilación y energía",
                  type: "MIXED",
                  order: 2,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Acceso" },
                      {
                        type: "list",
                        items: [
                          "Puerta: mínimo 0,9 m x 1,8 m, apersianada en su totalidad para el intercambio de aire.",
                          "Escotilla: mínimo 0,9 m x 0,9 m, apertura hacia arriba, resistencia 200 kg.",
                        ],
                      },
                      { type: "heading", text: "Ventilación" },
                      {
                        type: "paragraph",
                        text: "Sistema combinado natural y/o mecánico que garantice: renovación de aire, evacuación de calor, control de condensación y dispersión de vapores corrosivos.",
                      },
                      {
                        type: "callout",
                        style: "warning",
                        text: "La ventilación es IMPERATIVA (obligatoria) para evitar un ambiente corrosivo que comprometa la seguridad del operario y la vida útil de los equipos.",
                      },
                      { type: "heading", text: "Energía e iluminación" },
                      {
                        type: "list",
                        items: [
                          "Tablero de potencia conectado a la red de distribución según el cuadro de cargas.",
                          "Mínimo 1 toma de corriente operativa para instalaciones y mantenimiento.",
                          "Conexión a puesta a tierra física mediante varilla Copperweld.",
                          "Energía provisional: debe cumplir NTC 2050. Las fallas eléctricas con energía provisional NO las cubre la garantía.",
                          "Iluminación: 200 Lux a nivel del suelo, con interruptor interno próximo al acceso.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Redes hidráulicas y equipos",
                  type: "MIXED",
                  order: 3,
                  durationMin: 12,
                  content: {
                    blocks: [
                      { type: "heading", text: "Redes hidráulicas y desagües" },
                      {
                        type: "list",
                        items: [
                          "1 alimentación hidráulica PVC-P (mín. 3/4\") con válvula para llenado desde el acueducto.",
                          "1 canilla con poceta (0,6 m x 0,6 m) para limpieza de filtros, disolución de productos y aseo.",
                          "1 drenaje adicional (mín. 2\") por cada sistema de filtración, además del drenaje general.",
                        ],
                      },
                      { type: "heading", text: "Bases para motobombas" },
                      {
                        type: "list",
                        items: [
                          "Base firme de concreto o plataforma rígida: 0,6 m x 0,3 m x 0,25 m (alto).",
                          "Acoplamiento flexible antivibratorio.",
                          "Fijación con pernos de anclaje para balance dinámico.",
                        ],
                      },
                      { type: "heading", text: "Automatización y calentador de gas interior" },
                      {
                        type: "list",
                        items: [
                          "Cable UTP guiado desde el router hasta el tablero de automatización.",
                          "Calentador exterior: cable encauchetado AWG 2x16 para señal.",
                          "Calentador de gas interior: punto de gas calculado según consumo; ducto de escape para monóxido (Tipo B) en acero inoxidable o galvanizado de doble pared con trampa de agua.",
                          "Aberturas de ventilación y combustión: 0,001 m² por cada 1.000 BTU (a 0,30 m del techo y del suelo respectivamente).",
                        ],
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "El lugar IDEAL para la climatización es al aire libre. La instalación interior de calentadores de gas requiere todas las medidas de ventilación descritas.",
                      },
                    ],
                  },
                },
              ],
            },
            exams: {
              create: [
                {
                  title: "Evaluación — Cuarto Técnico de Máquinas",
                  description:
                    "Dimensiones, ventilación, energía y equipos del cuarto técnico.",
                  passingScore: 70,
                  maxAttempts: 3,
                  timeLimitMin: 15,
                  order: 4,
                  questions: {
                    create: [
                      {
                        question:
                          "¿Cuál es el ancho mínimo del corredor de circulación alrededor de los equipos en el cuarto técnico?",
                        type: "MULTIPLE_CHOICE",
                        options: ["0,6 m", "0,9 m", "1,2 m", "1,5 m"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "El corredor alrededor de la zona de equipos debe ser de mínimo 1,2 m de ancho para circulación segura.",
                        order: 1,
                      },
                      {
                        question:
                          "La ventilación en el cuarto de máquinas es opcional si el cuarto es grande.",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "Falso. La ventilación es OBLIGATORIA sin importar el tamaño: evita ambientes corrosivos, sobrecalentamiento y protege al operario.",
                        order: 2,
                      },
                      {
                        question:
                          "¿De qué color deben pintarse las paredes del cuarto de máquinas y por qué?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Gris, para disimular la suciedad",
                          "Blanco semibrillante, para maximizar la reflexión de luz",
                          "Azul, para identificar que es zona de agua",
                          "No importa el color",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "Blanco semibrillante (<2,4 m) incrementa el coeficiente de reflexión de la luz, combatiendo la penumbra en el cuarto técnico.",
                        order: 3,
                      },
                      {
                        question:
                          "¿Cuál es la iluminación mínima requerida a nivel del suelo en el cuarto técnico?",
                        type: "MULTIPLE_CHOICE",
                        options: ["100 Lux", "150 Lux", "200 Lux", "300 Lux"],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "200 Lux a nivel del suelo, con interruptor interno próximo al acceso.",
                        order: 4,
                      },
                      {
                        question:
                          "¿Dónde es el lugar ideal para instalar la climatización (bomba de calor / calentador)?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Dentro del cuarto técnico",
                          "En el sótano",
                          "Al aire libre",
                          "Junto a la piscina",
                        ],
                        correctAnswer: 2,
                        points: 1,
                        explanation:
                          "El lugar ideal es al aire libre. Si se instala en interior, se requieren todas las medidas de ventilación para combustión y escape de monóxido.",
                        order: 5,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log("  ✅ Curso creado: Fundamentos de Piscinas — Ambiente Azul");

  // ---------------------------------------------------------------------------
  // Grupos: Comercial y Técnico ven el curso de Fundamentos de Piscinas
  // ---------------------------------------------------------------------------
  await prisma.grupo.upsert({
    where: { name: "Técnico" },
    update: {
      users: { set: [{ id: tecnico.id }] },
      courses: { set: [{ id: cursoPiscinas.id }] },
    },
    create: {
      name: "Técnico",
      users: { connect: [{ id: tecnico.id }] },
      courses: { connect: [{ id: cursoPiscinas.id }] },
    },
  });
  console.log("  ✅ Grupo: Técnico (con Fundamentos de Piscinas)");

  console.log("🌱 Seed completado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
