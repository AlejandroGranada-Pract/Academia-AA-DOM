import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Sembrando datos...");

  // ---------------------------------------------------------------------------
  // Usuarios (upsert: se conservan si ya existen)
  // ---------------------------------------------------------------------------
  const adminPassword = await bcrypt.hash("Academia2026*", 12);
  const admin = await prisma.user.upsert({
    where: { email: "isa@ambienteazul.com.co" },
    update: {},
    create: {
      email: "isa@ambienteazul.com.co",
      name: "Isabel Arango",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      company: "AMBAS",
      area: "Administración",
    },
  });

  const admin2Password = await bcrypt.hash("admin1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: { passwordHash: admin2Password, role: "SUPER_ADMIN", active: true },
    create: {
      email: "admin@admin.com",
      name: "Admin",
      passwordHash: admin2Password,
      role: "SUPER_ADMIN",
      company: "AMBAS",
      area: "Administración",
    },
  });

  const empPassword = await bcrypt.hash("Empleado2026*", 12);
  const empleado = await prisma.user.upsert({
    where: { email: "practicante@ambienteazul.com.co" },
    update: {},
    create: {
      email: "practicante@ambienteazul.com.co",
      name: "Practicante AA",
      passwordHash: empPassword,
      role: "EMPLOYEE",
      company: "AMBIENTE_AZUL",
      area: "Comercial",
    },
  });

  const tecPassword = await bcrypt.hash("Tecnico2026*", 12);
  const tecnico = await prisma.user.upsert({
    where: { email: "tecnico@ambienteazul.com.co" },
    update: { area: "Técnico" },
    create: {
      email: "tecnico@ambienteazul.com.co",
      name: "Técnico AA",
      passwordHash: tecPassword,
      role: "EMPLOYEE",
      company: "AMBIENTE_AZUL",
      area: "Técnico",
    },
  });
  console.log("  ✅ Usuarios listos");

  // ---------------------------------------------------------------------------
  // Limpieza de contenido (progreso, intentos y cursos)
  // ---------------------------------------------------------------------------
  await prisma.examAttempt.deleteMany({});
  await prisma.userProgress.deleteMany({});
  await prisma.course.deleteMany({}); // cascada: módulos, lecciones, exámenes
  console.log("  🧹 Contenido anterior limpiado");

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
      passingScore: 100,
      dueDate: new Date("2026-07-31"),
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
                  description:
                    "Confirma lo aprendido sobre quiénes somos, los valores y el reglamento.",
                  passingScore: 100,
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
  // Curso: Asesores Ambiente Azul (portafolio de productos)
  // ---------------------------------------------------------------------------
  const cursoAA = await prisma.course.create({
    data: {
      title: "Asesores: Portafolio Ambiente Azul",
      description:
        "Conoce el portafolio de Ambiente Azul para asesorar con seguridad: spas HotSpring, nado contracorriente, bienestar y piscinas.",
      category: "PRODUCTO",
      company: "AMBIENTE_AZUL",
      status: "PUBLISHED",
      estimatedHours: 1.5,
      passingScore: 70,
      requiredAreas: [],
      createdBy: admin.id,
      modules: {
        create: [
          {
            title: "Spas y nado contracorriente",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Spas portátiles HotSpring",
                  type: "MIXED",
                  order: 1,
                  durationMin: 8,
                  content: {
                    blocks: [
                      { type: "heading", text: "Spas portátiles HotSpring" },
                      {
                        type: "paragraph",
                        text: "Somos los representantes exclusivos para toda Colombia de HotSpring Spas, la marca de spas portátiles más exclusiva a nivel mundial.",
                      },
                      {
                        type: "callout",
                        style: "tip",
                        text: "Identifica siempre la colección HotSpring correcta: Highlife, Limelight, Hotspot o Freeflow.",
                      },
                      { type: "heading", text: "Reconocimientos" },
                      {
                        type: "list",
                        items: [
                          "Mejor distribuidor del año en Latinoamérica (varios años).",
                          "Mejor distribuidor internacional en concepto Wellness.",
                          "Mejor dealer mundial Freeflow Spas.",
                          "Ganadores del premio Masters of Design.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Sistemas de nado contracorriente",
                  type: "MIXED",
                  order: 2,
                  durationMin: 7,
                  content: {
                    blocks: [
                      {
                        type: "heading",
                        text: "Nado contracorriente (Endless Pools)",
                      },
                      {
                        type: "paragraph",
                        text: "Los Sistemas de Entrenamiento Acuático (SEA) de Endless Pools combinan una corriente de natación de velocidad variable con un lujoso sistema de hidromasaje.",
                      },
                      {
                        type: "paragraph",
                        text: "En un solo espacio ofrecen varios usos: hidroterapia, nado contracorriente de velocidad variable y banda caminadora.",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Bienestar y piscinas",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Sauna, turco y cold plunge",
                  type: "MIXED",
                  order: 1,
                  durationMin: 8,
                  content: {
                    blocks: [
                      { type: "heading", text: "Sauna" },
                      {
                        type: "paragraph",
                        text: "Lugar de tranquilidad y rejuvenecimiento: limpia la piel a través de la transpiración, calma los músculos cansados y alivia la mente.",
                      },
                      { type: "heading", text: "Turco / Hamman (baño de vapor)" },
                      {
                        type: "paragraph",
                        text: "Relaja y estimula los músculos, el sistema osteoarticular y circulatorio, y realiza una limpieza profunda de la piel.",
                      },
                      { type: "heading", text: "Cold Plunge" },
                      {
                        type: "paragraph",
                        text: "Inmersión en agua fría (hasta 5 °C) con unidad de refrigeración eficiente, filtración silenciosa 24/7 y filtro de luz ultravioleta germicida.",
                      },
                    ],
                  },
                },
                {
                  title: "Piscinas y mobiliario exterior",
                  type: "MIXED",
                  order: 2,
                  durationMin: 7,
                  content: {
                    blocks: [
                      { type: "heading", text: "Piscinas en polipropileno" },
                      {
                        type: "paragraph",
                        text: "Con hidromasajes y todos los equipos en su interior; muy recomendadas cuando se busca buen espacio.",
                      },
                      {
                        type: "heading",
                        text: "Piscinas industriales (nueva tendencia)",
                      },
                      {
                        type: "paragraph",
                        text: "Diseño minimalista, instalación más fácil y resultados estéticos espectaculares. Personalizables: desbordante o tradicional.",
                      },
                      { type: "heading", text: "Mobiliario de exterior" },
                      {
                        type: "paragraph",
                        text: "Mobiliario elegante y funcional para exteriores de Vondom, una de las marcas más prestigiosas a nivel mundial.",
                      },
                    ],
                  },
                },
              ],
            },
            exams: {
              create: [
                {
                  title: "Evaluación: Portafolio Ambiente Azul",
                  description: "Repasa los productos clave de Ambiente Azul.",
                  passingScore: 70,
                  maxAttempts: 3,
                  timeLimitMin: 8,
                  questions: {
                    create: [
                      {
                        question:
                          "¿De qué marca de spas portátiles somos representantes exclusivos en Colombia?",
                        type: "MULTIPLE_CHOICE",
                        options: ["HotSpring", "Endless Pools", "Vondom"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Somos representantes exclusivos de HotSpring Spas para Colombia.",
                        order: 1,
                      },
                      {
                        question:
                          "El nado contracorriente combina natación de velocidad variable con hidromasaje.",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Correcto: los sistemas SEA de Endless Pools combinan ambas funciones.",
                        order: 2,
                      },
                      {
                        question:
                          "¿Cuáles son productos de bienestar de Ambiente Azul?",
                        type: "MULTI_SELECT",
                        options: ["Sauna", "Cold plunge", "Porcelanato", "Turco"],
                        correctAnswer: [0, 1, 3],
                        points: 2,
                        explanation:
                          "Sauna, cold plunge y turco son productos de bienestar. El porcelanato es de DOM Design.",
                        order: 3,
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
  console.log(`  ✅ Curso creado: ${cursoAA.title}`);

  // ---------------------------------------------------------------------------
  // Curso: Asesores DOM Design (enchapes y acabados)
  // ---------------------------------------------------------------------------
  const cursoDOM = await prisma.course.create({
    data: {
      title: "Asesores: Portafolio DOM Design",
      description:
        "Conoce los materiales y soluciones de DOM Design: enchapes, porcelanato, mosaicos, piezas especiales y piedra natural.",
      category: "PRODUCTO",
      company: "DOM_DESIGN",
      status: "PUBLISHED",
      estimatedHours: 1.5,
      passingScore: 70,
      requiredAreas: [],
      createdBy: admin.id,
      modules: {
        create: [
          {
            title: "Materiales y acabados",
            order: 1,
            lessons: {
              create: [
                {
                  title: "Enchapes y porcelanato",
                  type: "MIXED",
                  order: 1,
                  durationMin: 7,
                  content: {
                    blocks: [
                      { type: "heading", text: "Enchapes especializados" },
                      {
                        type: "paragraph",
                        text: "Enchapes y porcelanato para piscinas, zonas húmedas y terrazas, con piezas especiales que logran esquinas perfectas y acabados de alto nivel.",
                      },
                    ],
                  },
                },
                {
                  title: "Mosaicos para piscinas",
                  type: "MIXED",
                  order: 2,
                  durationMin: 6,
                  content: {
                    blocks: [
                      { type: "heading", text: "Mosaicos" },
                      {
                        type: "paragraph",
                        text: "Mosaico vítreo para piscinas y zonas húmedas (marcas como Ezarri). Permite personalizar la piscina con efectos y acabados únicos.",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: "Soluciones especializadas",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Piezas especiales y sistema Join Point",
                  type: "MIXED",
                  order: 1,
                  durationMin: 7,
                  content: {
                    blocks: [
                      {
                        type: "heading",
                        text: "Piezas especiales, lechada y sistema Join Point",
                      },
                      {
                        type: "list",
                        items: [
                          "Diferentes acabados, tonos y opciones fotoluminiscentes.",
                          "Lechada que combina y piezas de borde para mejores remates.",
                          "Más fácil de instalar, de hacer curvas y mucho más resistente.",
                          "Rejilla invisible y rejilla flex para piscina desbordante.",
                        ],
                      },
                    ],
                  },
                },
                {
                  title: "Piedra Bali y colección Trésor",
                  type: "MIXED",
                  order: 2,
                  durationMin: 6,
                  content: {
                    blocks: [
                      { type: "heading", text: "Piedra Bali" },
                      {
                        type: "paragraph",
                        text: "La piedra natural favorita mundialmente para piscinas (Bali, Australia, Tailandia, EE.UU.). Gracias a su zeolita, ayuda a purificar el agua absorbiendo metales pesados, toxinas y contaminantes.",
                      },
                      { type: "heading", text: "Porcelanato Trésor" },
                      {
                        type: "paragraph",
                        text: "Porcelanato inspirado en la piedra Bali (colección Trésor), ideal para quienes buscan ese look con las ventajas del porcelanato.",
                      },
                    ],
                  },
                },
              ],
            },
            exams: {
              create: [
                {
                  title: "Evaluación: Portafolio DOM Design",
                  description: "Repasa los materiales y soluciones de DOM Design.",
                  passingScore: 70,
                  maxAttempts: 3,
                  timeLimitMin: 8,
                  questions: {
                    create: [
                      {
                        question: "¿Para qué espacios son los enchapes de DOM Design?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Solo fachadas",
                          "Piscinas, zonas húmedas y terrazas",
                          "Pisos de oficina",
                        ],
                        correctAnswer: 1,
                        points: 1,
                        explanation:
                          "Los enchapes de DOM Design son para piscinas, zonas húmedas y terrazas.",
                        order: 1,
                      },
                      {
                        question:
                          "La Piedra Bali ayuda a purificar el agua gracias a la zeolita.",
                        type: "TRUE_FALSE",
                        options: ["Verdadero", "Falso"],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Correcto: la zeolita de la Piedra Bali absorbe metales pesados, toxinas y contaminantes.",
                        order: 2,
                      },
                      {
                        question:
                          "¿Qué facilita la instalación, las curvas y mejores remates en los enchapes?",
                        type: "MULTIPLE_CHOICE",
                        options: [
                          "Las piezas de borde y el sistema Join Point",
                          "El concreto tradicional",
                          "La pintura epóxica",
                        ],
                        correctAnswer: 0,
                        points: 1,
                        explanation:
                          "Las piezas de borde y el sistema Join Point facilitan la instalación, las curvas y la resistencia.",
                        order: 3,
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
  console.log(`  ✅ Curso creado: ${cursoDOM.title}`);

  // ---------------------------------------------------------------------------
  // Grupos: el grupo Comercial recibe los dos cursos de asesores
  // ---------------------------------------------------------------------------
  await prisma.grupo.upsert({
    where: { name: "Técnico" },
    update: { users: { set: [{ id: tecnico.id }] }, courses: { set: [] } },
    create: { name: "Técnico", users: { connect: [{ id: tecnico.id }] } },
  });
  await prisma.grupo.upsert({
    where: { name: "Comercial" },
    update: {
      users: { set: [{ id: empleado.id }] },
      courses: { set: [{ id: cursoAA.id }, { id: cursoDOM.id }] },
    },
    create: {
      name: "Comercial",
      users: { connect: [{ id: empleado.id }] },
      courses: { connect: [{ id: cursoAA.id }, { id: cursoDOM.id }] },
    },
  });
  console.log("  ✅ Grupos: Técnico, Comercial (con cursos de asesores)");

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
