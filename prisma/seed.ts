import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// Nota: import relativo (no alias @/) porque el seed corre con tsx fuera de Next.js.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Sembrando datos iniciales...");

  // Usuario Super Admin (gestión total)
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
  console.log(`  ✅ Super Admin: ${admin.email}`);

  // Super Admin adicional (credenciales simples para pruebas)
  const admin2Password = await bcrypt.hash("admin1234", 12);
  const admin2 = await prisma.user.upsert({
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
  console.log(`  ✅ Super Admin: ${admin2.email}`);

  // Usuario de prueba (empleado) para validar el flujo de aprendizaje
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
  console.log(`  ✅ Empleado de prueba (Comercial): ${empleado.email}`);

  // Empleado del área Técnico (para probar la asignación por área)
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
  console.log(`  ✅ Empleado de prueba (Técnico): ${tecnico.email}`);

  // ---------------------------------------------------------------------------
  // Cursos de prueba (con módulos y lecciones). Idempotente: si ya existe un
  // curso con el mismo título, lo salta.
  // ---------------------------------------------------------------------------
  const CURSOS = [
    {
      title: "Inducción General AA | DOM",
      description:
        "Conoce quiénes somos, nuestras marcas y las políticas que nos hacen únicos. Punto de partida para todo el equipo.",
      category: "INDUCCION" as const,
      company: "AMBAS" as const,
      estimatedHours: 2,
      dueDate: new Date("2026-06-30"),
      requiredAreas: [], // Inducción: para todos
      modules: [
        {
          title: "Bienvenida",
          order: 1,
          lessons: [
            {
              // Video CORTO (~19s): ideal para probar "ver completo" rápido.
              title: "Mensaje de bienvenida (video)",
              type: "VIDEO" as const,
              order: 1,
              durationMin: 1,
              content: {
                videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
                source: "youtube",
                description:
                  "Un saludo del equipo. Míralo completo para continuar.",
              },
            },
            {
              title: "Quiénes somos",
              type: "MIXED" as const,
              order: 2,
              durationMin: 8,
              content: {
                blocks: [
                  { type: "heading", text: "Dos empresas, una familia" },
                  {
                    type: "paragraph",
                    text: "Ambiente Azul y DOM Design son empresas hermanas: compartimos socios, clientes y la pasión por el detalle.",
                  },
                  {
                    type: "callout",
                    style: "tip",
                    text: "Ambiente Azul: la felicidad fluye mejor en el agua. DOM: we exist because the details DO Matter.",
                  },
                ],
              },
            },
          ],
          // Examen del módulo (se desbloquea al terminar las lecciones).
          exam: {
            title: "Evaluación: Bienvenida",
            description:
              "Confirma lo aprendido sobre quiénes somos y nuestras marcas.",
            passingScore: 70,
            maxAttempts: 3,
            timeLimitMin: 10,
            questions: [
              {
                question: "¿Cuál es el lema de Ambiente Azul?",
                type: "MULTIPLE_CHOICE",
                options: [
                  "La felicidad fluye mejor en el agua",
                  "Los detalles DO Matter",
                  "Calidad y servicio",
                ],
                correctAnswer: 0,
                points: 1,
                explanation:
                  "El lema de Ambiente Azul es \"La felicidad fluye mejor en el agua\".",
                order: 1,
              },
              {
                question:
                  "Ambiente Azul y DOM Design son empresas hermanas.",
                type: "TRUE_FALSE",
                options: ["Verdadero", "Falso"],
                correctAnswer: 0,
                points: 1,
                explanation:
                  "Sí: comparten socios y son complementarias.",
                order: 2,
              },
              {
                question: "¿Cuáles marcas representa DOM Design?",
                type: "MULTI_SELECT",
                options: [
                  "Cerámica Euro",
                  "HotSpring Spas",
                  "Ezarri",
                  "Endless Pool",
                ],
                correctAnswer: [0, 2],
                points: 2,
                explanation:
                  "DOM representa Cerámica Euro, Cerámica Mayor, Rosagres y Ezarri. HotSpring y Endless Pool son de Ambiente Azul.",
                order: 3,
              },
            ],
          },
        },
        {
          title: "Nuestras marcas y cultura",
          order: 2,
          lessons: [
            {
              title: "Nuestras marcas (video)",
              type: "VIDEO" as const,
              order: 1,
              durationMin: 4,
              content: {
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                source: "youtube",
                description:
                  "Recorrido por las marcas que representamos. (Para probar, arrastra el video cerca del final.)",
              },
            },
            {
              title: "Cómo trabajamos (video)",
              type: "VIDEO" as const,
              order: 2,
              durationMin: 4,
              content: {
                videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
                source: "youtube",
                description: "Nuestra forma de trabajar y atender al cliente.",
              },
            },
            {
              title: "Código de conducta",
              type: "TEXT" as const,
              order: 3,
              durationMin: 6,
              content: {
                blocks: [
                  { type: "heading", text: "Cómo nos comportamos" },
                  {
                    type: "paragraph",
                    text: "Profesionalismo, calidez y atención al detalle en cada interacción con clientes y especificadores.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Instalación de Piscinas en Fibra de Vidrio",
      description:
        "Capacitación técnica para el equipo de instalación: preparación del terreno, montaje y sistemas de filtración.",
      category: "TECNICO" as const,
      company: "AMBIENTE_AZUL" as const,
      estimatedHours: 6,
      requiredAreas: ["Técnico"], // solo para el área Técnico
      modules: [
        {
          title: "Preparación del terreno",
          order: 1,
          lessons: [
            {
              title: "Excavación y nivelación",
              type: "VIDEO" as const,
              order: 1,
              durationMin: 12,
              content: {
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                source: "youtube",
                description:
                  "Pasos para excavar y nivelar correctamente antes de instalar la piscina.",
              },
            },
            {
              title: "Bases y soportes",
              type: "MIXED" as const,
              order: 2,
              durationMin: 15,
              content: {
                blocks: [
                  { type: "heading", text: "Preparando la base" },
                  {
                    type: "paragraph",
                    text: "Una base bien compactada evita asentamientos futuros.",
                  },
                  {
                    type: "callout",
                    style: "warning",
                    text: "Nunca instalar sobre terreno sin compactar.",
                  },
                ],
              },
            },
          ],
        },
        {
          title: "Sistemas y acabados",
          order: 2,
          lessons: [
            {
              title: "Sistemas de filtración",
              type: "MIXED" as const,
              order: 1,
              durationMin: 18,
              content: {
                blocks: [
                  { type: "heading", text: "Filtración y bombas" },
                  {
                    type: "paragraph",
                    text: "El corazón de una piscina saludable es su sistema de filtración.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      title: "Portafolio DOM Design — Enchapes y Mosaicos",
      description:
        "Conoce el portafolio de materiales: porcelanatos, mosaicos Ezarri y piedra natural, y cómo presentarlos a especificadores.",
      category: "PRODUCTO" as const,
      company: "DOM_DESIGN" as const,
      estimatedHours: 3,
      requiredAreas: ["Comercial"], // solo para el área Comercial
      modules: [
        {
          title: "Materiales",
          order: 1,
          lessons: [
            {
              title: "Mosaicos Ezarri",
              type: "MIXED" as const,
              order: 1,
              durationMin: 9,
              content: {
                blocks: [
                  { type: "heading", text: "El mosaico que define el borde" },
                  {
                    type: "paragraph",
                    text: "Ezarri es referente mundial en mosaico de vidrio para piscinas y zonas húmedas.",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ];

  for (const c of CURSOS) {
    // Re-crea el curso si ya existe (borra módulos/lecciones/progreso en cascada).
    await prisma.course.deleteMany({ where: { title: c.title } });
    await prisma.course.create({
      data: {
        title: c.title,
        description: c.description,
        category: c.category,
        company: c.company,
        status: "PUBLISHED",
        estimatedHours: c.estimatedHours,
        dueDate: (c as { dueDate?: Date }).dueDate ?? null,
        requiredAreas: c.requiredAreas,
        createdBy: admin.id,
        modules: {
          create: c.modules.map((m) => {
            // Algunos módulos traen examen (campo opcional).
            const mod = m as typeof m & { exam?: any };
            return {
              title: m.title,
              order: m.order,
              lessons: {
                create: m.lessons.map((l) => ({
                  title: l.title,
                  type: l.type,
                  order: l.order,
                  durationMin: l.durationMin,
                  content: l.content,
                })),
              },
              ...(mod.exam
                ? {
                    exams: {
                      create: [
                        {
                          title: mod.exam.title,
                          description: mod.exam.description,
                          passingScore: mod.exam.passingScore,
                          maxAttempts: mod.exam.maxAttempts,
                          timeLimitMin: mod.exam.timeLimitMin,
                          questions: { create: mod.exam.questions },
                        },
                      ],
                    },
                  }
                : {}),
            };
          }),
        },
      },
    });
    console.log(`  ✅ Curso creado: ${c.title}`);
  }

  // ---------------------------------------------------------------------------
  // Grupos (roles funcionales) con sus cursos y usuarios.
  // ---------------------------------------------------------------------------
  const piscinas = await prisma.course.findFirst({
    where: { title: "Instalación de Piscinas en Fibra de Vidrio" },
  });
  const dom = await prisma.course.findFirst({
    where: { title: "Portafolio DOM Design — Enchapes y Mosaicos" },
  });

  await prisma.grupo.upsert({
    where: { name: "Técnico" },
    update: {
      users: { set: [{ id: tecnico.id }] },
      courses: piscinas ? { set: [{ id: piscinas.id }] } : { set: [] },
    },
    create: {
      name: "Técnico",
      users: { connect: [{ id: tecnico.id }] },
      courses: piscinas ? { connect: [{ id: piscinas.id }] } : undefined,
    },
  });
  await prisma.grupo.upsert({
    where: { name: "Comercial" },
    update: {
      users: { set: [{ id: empleado.id }] },
      courses: dom ? { set: [{ id: dom.id }] } : { set: [] },
    },
    create: {
      name: "Comercial",
      users: { connect: [{ id: empleado.id }] },
      courses: dom ? { connect: [{ id: dom.id }] } : undefined,
    },
  });
  console.log("  ✅ Grupos: Técnico, Comercial");

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
