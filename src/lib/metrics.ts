import { prisma } from "@/lib/db";
import { effectiveDueDate } from "@/lib/vencimiento";

// Población medida: empleados y líderes activos (los admins crean contenido,
// no se miden; los externos quedan fuera del denominador de cumplimiento).
const LEARNER_ROLES = ["EMPLOYEE", "AREA_LEADER"] as const;

export type CursoMetric = {
  id: string;
  title: string;
  category: string;
  company: string;
  elegibles: number;
  completados: number;
  enProgreso: number;
  sinIniciar: number;
  tasaFinalizacion: number; // 0-100
  promedioExamen: number | null;
};

export type ExamenMetric = {
  id: string;
  title: string;
  cursoTitle: string;
  promedio: number | null; // promedio del mejor intento por usuario
  passingScore: number;
  intentosPromedioAprobar: number | null;
  tomado: number; // cuántos lo presentaron (intentos completados)
  abandonados: number; // intentos abandonados (abrió y se salió sin enviar)
};

export type RankingItem = { userId: string; name: string; certificados: number };

export type AdminMetrics = {
  usuariosActivos: number;
  cursosActivos: number;
  certificadosEmitidos: number;
  promedioGlobalExamenes: number | null;
  tasaFinalizacionGlobal: number;
  cursos: CursoMetric[];
  examenes: ExamenMetric[];
  ranking: RankingItem[];
};

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [learners, cursos, certificados, progresos, intentos] =
    await Promise.all([
      prisma.user.findMany({
        where: { active: true, role: { in: [...LEARNER_ROLES] } },
        select: { id: true, name: true, grupos: { select: { id: true } } },
      }),
      prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          category: true,
          company: true,
          grupos: { select: { id: true } },
          modules: {
            select: {
              lessons: { select: { id: true } },
              exams: { select: { id: true, title: true, passingScore: true } },
            },
          },
        },
      }),
      prisma.certificate.findMany({ select: { userId: true, courseId: true } }),
      prisma.userProgress.findMany({ select: { userId: true, lessonId: true } }),
      prisma.examAttempt.findMany({
        select: {
          userId: true,
          examId: true,
          score: true,
          passed: true,
          status: true,
        },
      }),
    ]);

  const learnerById = new Map(learners.map((u) => [u.id, u]));
  const learnerIds = new Set(learners.map((u) => u.id));

  // Mapas lección→curso y examen→curso
  const lessonToCourse = new Map<string, string>();
  const examToCourse = new Map<string, string>();
  for (const c of cursos) {
    for (const m of c.modules) {
      for (const l of m.lessons) lessonToCourse.set(l.id, c.id);
      for (const e of m.exams) examToCourse.set(e.id, c.id);
    }
  }

  // Certificados por curso (solo learners)
  const certsByCourse = new Map<string, Set<string>>();
  const certCountByUser = new Map<string, number>();
  for (const cert of certificados) {
    if (!learnerIds.has(cert.userId)) continue;
    (certsByCourse.get(cert.courseId) ??
      certsByCourse.set(cert.courseId, new Set()).get(cert.courseId)!).add(
      cert.userId,
    );
    certCountByUser.set(cert.userId, (certCountByUser.get(cert.userId) ?? 0) + 1);
  }

  // Usuarios que iniciaron cada curso (con algún progreso)
  const startedByCourse = new Map<string, Set<string>>();
  for (const p of progresos) {
    if (!learnerIds.has(p.userId)) continue;
    const courseId = lessonToCourse.get(p.lessonId);
    if (!courseId) continue;
    (startedByCourse.get(courseId) ??
      startedByCourse.set(courseId, new Set()).get(courseId)!).add(p.userId);
  }

  // Intentos por examen → por usuario. Solo los COMPLETED cuentan para puntajes;
  // los ABANDONED se cuentan aparte (monitoreo) y NO afectan promedios.
  const attemptsByExam = new Map<
    string,
    Map<string, { count: number; best: number; passed: boolean }>
  >();
  const abandonadosByExam = new Map<string, number>();
  for (const a of intentos) {
    if (!learnerIds.has(a.userId)) continue;
    if (a.status !== "COMPLETED") {
      if (a.status === "ABANDONED") {
        abandonadosByExam.set(
          a.examId,
          (abandonadosByExam.get(a.examId) ?? 0) + 1,
        );
      }
      continue;
    }
    const perUser =
      attemptsByExam.get(a.examId) ??
      attemptsByExam.set(a.examId, new Map()).get(a.examId)!;
    const e = perUser.get(a.userId) ?? { count: 0, best: 0, passed: false };
    e.count += 1;
    e.best = Math.max(e.best, a.score);
    e.passed = e.passed || a.passed;
    perUser.set(a.userId, e);
  }

  // Elegibilidad por curso (misma regla que la visibilidad: INDUCCION a todos,
  // resto por intersección de grupos).
  const eligibleFor = (c: (typeof cursos)[number]): Set<string> => {
    if (c.category === "INDUCCION") return new Set(learnerIds);
    const groups = new Set(c.grupos.map((g) => g.id));
    if (groups.size === 0) return new Set();
    return new Set(
      learners.filter((u) => u.grupos.some((g) => groups.has(g.id))).map((u) => u.id),
    );
  };

  // Métricas por examen
  const examenes: ExamenMetric[] = [];
  const examPromedioById = new Map<string, number | null>();
  for (const c of cursos) {
    for (const m of c.modules) {
      for (const ex of m.exams) {
        const perUser = attemptsByExam.get(ex.id);
        const bests = perUser ? Array.from(perUser.values()).map((v) => v.best) : [];
        const promedio = bests.length
          ? Math.round(bests.reduce((s, x) => s + x, 0) / bests.length)
          : null;
        examPromedioById.set(ex.id, promedio);
        const passers = perUser
          ? Array.from(perUser.values()).filter((v) => v.passed)
          : [];
        const intentosPromedioAprobar = passers.length
          ? Math.round(
              (passers.reduce((s, v) => s + v.count, 0) / passers.length) * 10,
            ) / 10
          : null;
        examenes.push({
          id: ex.id,
          title: ex.title,
          cursoTitle: c.title,
          promedio,
          passingScore: ex.passingScore,
          intentosPromedioAprobar,
          tomado: perUser ? perUser.size : 0,
          abandonados: abandonadosByExam.get(ex.id) ?? 0,
        });
      }
    }
  }

  // Métricas por curso
  let sumCompletados = 0;
  let sumElegibles = 0;
  const cursosM: CursoMetric[] = cursos.map((c) => {
    const eligible = eligibleFor(c);
    const completedSet = certsByCourse.get(c.id) ?? new Set<string>();
    const startedSet = startedByCourse.get(c.id) ?? new Set<string>();

    const completados = Array.from(completedSet).filter((id) =>
      eligible.has(id),
    ).length;
    const enProgreso = Array.from(startedSet).filter(
      (id) => eligible.has(id) && !completedSet.has(id),
    ).length;
    const elegibles = eligible.size;
    const sinIniciar = Math.max(0, elegibles - completados - enProgreso);

    sumCompletados += completados;
    sumElegibles += elegibles;

    const examAvgs = c.modules
      .flatMap((m) => m.exams.map((e) => examPromedioById.get(e.id)))
      .filter((x): x is number => x != null);
    const promedioExamen = examAvgs.length
      ? Math.round(examAvgs.reduce((s, x) => s + x, 0) / examAvgs.length)
      : null;

    return {
      id: c.id,
      title: c.title,
      category: c.category,
      company: c.company,
      elegibles,
      completados,
      enProgreso,
      sinIniciar,
      tasaFinalizacion: elegibles
        ? Math.round((completados / elegibles) * 100)
        : 0,
      promedioExamen,
    };
  });

  // Promedio global de exámenes (todos los mejores intentos)
  const allBests: number[] = [];
  for (const perUser of Array.from(attemptsByExam.values())) {
    for (const v of Array.from(perUser.values())) allBests.push(v.best);
  }
  const promedioGlobalExamenes = allBests.length
    ? Math.round(allBests.reduce((s, x) => s + x, 0) / allBests.length)
    : null;

  // Ranking top 5 por certificados
  const ranking: RankingItem[] = Array.from(certCountByUser.entries())
    .map(([userId, n]) => ({
      userId,
      name: learnerById.get(userId)?.name ?? "—",
      certificados: n,
    }))
    .sort((a, b) => b.certificados - a.certificados)
    .slice(0, 5);

  return {
    usuariosActivos: learners.length,
    cursosActivos: cursos.length,
    certificadosEmitidos: certificados.length,
    promedioGlobalExamenes,
    tasaFinalizacionGlobal: sumElegibles
      ? Math.round((sumCompletados / sumElegibles) * 100)
      : 0,
    cursos: cursosM,
    examenes,
    ranking,
  };
}

// ===========================================================================
// Dashboard del líder de área: su equipo = empleados/líderes activos de su
// misma área (campo `area`). Excluye al propio líder.
// ===========================================================================

export type CursoVencido = { title: string; fecha: string };

export type TeamMember = {
  userId: string;
  name: string;
  completados: number;
  pendientes: number;
  promedio: number | null;
  vencidos: number;
  cursosVencidos: CursoVencido[];
  abandonados: number; // exámenes abiertos y no enviados
};

export type CursoFinalizacion = {
  id: string;
  title: string;
  elegibles: number;
  completados: number;
  tasa: number;
};

export type LeaderMetrics = {
  grupos: string[]; // nombres de los grupos que lidera
  equipo: TeamMember[];
  promedioEquipo: number | null;
  cursosBajaFinalizacion: CursoFinalizacion[];
  empleadosVencidos: {
    userId: string;
    name: string;
    vencidos: number;
    cursos: CursoVencido[];
  }[];
};

export async function getLeaderMetrics(userId: string): Promise<LeaderMetrics> {
  const viewer = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      gruposLiderados: { select: { id: true, name: true } },
    },
  });

  // Un SUPER_ADMIN sin grupos liderados ve todos los grupos (para previsualizar);
  // un AREA_LEADER ve solo los que lidera.
  let gruposLiderados = viewer?.gruposLiderados ?? [];
  if (viewer?.role === "SUPER_ADMIN" && gruposLiderados.length === 0) {
    gruposLiderados = await prisma.grupo.findMany({ select: { id: true, name: true } });
  }
  const grupoIds = new Set(gruposLiderados.map((g) => g.id));

  if (grupoIds.size === 0) {
    return {
      grupos: [],
      equipo: [],
      promedioEquipo: null,
      cursosBajaFinalizacion: [],
      empleadosVencidos: [],
    };
  }

  const [miembros, cursos, certificados, intentos] = await Promise.all([
    prisma.user.findMany({
      where: {
        active: true,
        role: { in: [...LEARNER_ROLES] },
        grupos: { some: { id: { in: Array.from(grupoIds) } } },
        NOT: { id: userId },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        grupos: { select: { id: true } },
      },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        category: true,
        dueDate: true,
        dueDays: true,
        createdAt: true,
        grupos: { select: { id: true } },
      },
    }),
    prisma.certificate.findMany({ select: { userId: true, courseId: true } }),
    prisma.examAttempt.findMany({
      select: { userId: true, examId: true, score: true, status: true },
    }),
  ]);

  const memberIds = new Set(miembros.map((u) => u.id));

  // Certificados por usuario (set de courseId)
  const certsByUser = new Map<string, Set<string>>();
  for (const c of certificados) {
    if (!memberIds.has(c.userId)) continue;
    (certsByUser.get(c.userId) ??
      certsByUser.set(c.userId, new Set()).get(c.userId)!).add(c.courseId);
  }

  // Mejor puntaje por (usuario, examen) → para el promedio por persona.
  // Solo COMPLETED cuenta; los ABANDONED se cuentan aparte (monitoreo).
  const bestByUserExam = new Map<string, Map<string, number>>();
  const abandonadosByUser = new Map<string, number>();
  for (const a of intentos) {
    if (!memberIds.has(a.userId)) continue;
    if (a.status !== "COMPLETED") {
      if (a.status === "ABANDONED") {
        abandonadosByUser.set(
          a.userId,
          (abandonadosByUser.get(a.userId) ?? 0) + 1,
        );
      }
      continue;
    }
    const perExam =
      bestByUserExam.get(a.userId) ??
      bestByUserExam.set(a.userId, new Map()).get(a.userId)!;
    perExam.set(a.examId, Math.max(perExam.get(a.examId) ?? 0, a.score));
  }

  const now = new Date();
  const cursoEsElegible = (
    c: (typeof cursos)[number],
    grupos: { id: string }[],
  ): boolean => {
    if (c.category === "INDUCCION") return true;
    const groups = new Set(c.grupos.map((g) => g.id));
    if (groups.size === 0) return false;
    return grupos.some((g) => groups.has(g.id));
  };

  // Métricas por miembro
  const equipo: TeamMember[] = miembros.map((u) => {
    const elegibles = cursos.filter((c) => cursoEsElegible(c, u.grupos));
    const certs = certsByUser.get(u.id) ?? new Set<string>();
    const completados = elegibles.filter((c) => certs.has(c.id)).length;
    const cursosVencidos: CursoVencido[] = elegibles
      .map((c) => ({ c, due: effectiveDueDate(c, u.createdAt) }))
      .filter(({ c, due }) => due && due < now && !certs.has(c.id))
      .map(({ c, due }) => ({ title: c.title, fecha: (due as Date).toISOString() }));

    const perExam = bestByUserExam.get(u.id);
    const bests = perExam ? Array.from(perExam.values()) : [];
    const promedio = bests.length
      ? Math.round(bests.reduce((s, x) => s + x, 0) / bests.length)
      : null;

    return {
      userId: u.id,
      name: u.name ?? "—",
      completados,
      pendientes: elegibles.length - completados,
      promedio,
      vencidos: cursosVencidos.length,
      cursosVencidos,
      abandonados: abandonadosByUser.get(u.id) ?? 0,
    };
  });

  // Promedio del equipo (de quienes tienen puntaje)
  const conPromedio = equipo.filter((m) => m.promedio != null);
  const promedioEquipo = conPromedio.length
    ? Math.round(
        conPromedio.reduce((s, m) => s + (m.promedio as number), 0) /
          conPromedio.length,
      )
    : null;

  // Cursos con menor finalización dentro del equipo
  const cursosFin: CursoFinalizacion[] = cursos
    .map((c) => {
      const elegiblesMiembros = miembros.filter((u) =>
        cursoEsElegible(c, u.grupos),
      );
      const completados = elegiblesMiembros.filter((u) =>
        (certsByUser.get(u.id) ?? new Set()).has(c.id),
      ).length;
      const elegibles = elegiblesMiembros.length;
      return {
        id: c.id,
        title: c.title,
        elegibles,
        completados,
        tasa: elegibles ? Math.round((completados / elegibles) * 100) : 0,
      };
    })
    .filter((c) => c.elegibles > 0)
    .sort((a, b) => a.tasa - b.tasa)
    .slice(0, 5);

  const empleadosVencidos = equipo
    .filter((m) => m.vencidos > 0)
    .map((m) => ({
      userId: m.userId,
      name: m.name,
      vencidos: m.vencidos,
      cursos: m.cursosVencidos,
    }));

  return {
    grupos: gruposLiderados.map((g) => g.name),
    equipo,
    promedioEquipo,
    cursosBajaFinalizacion: cursosFin,
    empleadosVencidos,
  };
}
