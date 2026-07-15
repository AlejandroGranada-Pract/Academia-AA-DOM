// Contenido y helpers compartidos de los cursos HotSpring (Comercial y Postventa).
// El módulo "Fundamentos y portafolio" se reutiliza en ambos cursos.

export type Block = Record<string, unknown>;
export const h = (text: string): Block => ({ type: "heading", text });
export const p = (text: string): Block => ({ type: "paragraph", text });
export const list = (items: string[]): Block => ({ type: "list", items });
export const info = (text: string): Block => ({ type: "callout", style: "info", text });
export const tip = (text: string): Block => ({ type: "callout", style: "tip", text });
export const warn = (text: string): Block => ({ type: "callout", style: "warning", text });
export const video = (url: string): Block => ({ type: "video", url });
export const table = (headers: string[], rows: string[][]): Block => ({ type: "table", headers, rows });
// Marcador de recurso descargable (el PDF se adjunta en Drive; aquí queda la nota).
export const descargable = (nombre: string): Block => ({
  type: "callout",
  style: "info",
  text: `📄 Recurso descargable: ${nombre}. (Se adjunta el PDF para descarga.)`,
});

export type Pregunta = {
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE";
  options: string[];
  correctAnswer: number;
  explanation: string;
};
export type Leccion = { title: string; durationMin: number; blocks: Block[] };
export type Examen = { title: string; description: string; timeLimitMin: number; questions: Pregunta[] };
export type Modulo = { title: string; lecciones: Leccion[]; examen: Examen };

// ===================================================================
// MÓDULO REUTILIZABLE — Fundamentos y portafolio
// (Módulo 1 del Curso 1 = Módulo 0 del Curso 2)
// ===================================================================
export function moduloFundamentos(): Modulo {
  return {
    title: "Fundamentos y portafolio",
    lecciones: [
      {
        title: "Qué es un spa portátil (y por qué no es “una tina”)",
        durationMin: 8,
        blocks: [
          h("Un equipo de bienestar, no una tina"),
          p("Un spa portátil es un equipo de bienestar completo que combina tres elementos terapéuticos en un solo lugar: calor, flotación y masaje con agua a presión (hidroterapia). El agua templada dilata los vasos sanguíneos y relaja la musculatura; la flotación libera a las articulaciones del peso del cuerpo; y los jets, ubicados con precisión, trabajan los grupos musculares que más tensión acumulan. Esa combinación convierte quince o veinte minutos en el spa en una experiencia real de recuperación física y mental."),
          h("Cómo está compuesto"),
          p("Técnicamente lleva: un casco acrílico donde se sientan los usuarios, un conjunto de jets alimentados por una o varias bombas, un calentador que mantiene la temperatura, un sistema de filtración, una cubierta térmica que conserva el calor, un gabinete exterior y un panel de control. Todo llega armado de fábrica: a diferencia de una piscina, no hay obra civil ni excavación; el spa se instala sobre una base nivelada y se conecta a la electricidad."),
          h("No lo confundas con…"),
          list([
            "No es una piscina: la piscina es para nadar y refrescarse; el spa es para calentarse, relajarse y hacer hidroterapia todo el año.",
            "No es un spa inflable: los inflables funcionan con burbujas de aire (no hidroterapia real), aíslan mal y no duran. Un HotSpring es un equipo de por vida.",
          ]),
          tip("Cómo usarlo con el cliente: vende la experiencia, no la ficha técnica. Pregunta cómo termina sus días, si sufre de dolores de espalda o cuello, cómo le gustaría desconectarse. En Ambiente Azul creemos que la felicidad fluye mejor en el agua."),
        ],
      },
      {
        title: "Ambiente Azul y HotSpring: la marca que respalda la venta",
        durationMin: 7,
        blocks: [
          h("Representante exclusivo en Colombia"),
          p("Ambiente Azul es el representante exclusivo de HotSpring en Colombia, con showrooms en Medellín, Bogotá y Miami. Atendemos al cliente residencial premium y a clubes y hoteles. Ser representante exclusivo significa que el cliente no solo compra un spa: compra el respaldo de un canal autorizado con acceso a repuestos originales, servicio técnico especializado y acompañamiento durante toda la vida del equipo."),
          h("HotSpring, la marca líder"),
          p("HotSpring, fabricada por Watkins Wellness, es la marca de spas más vendida del mundo, con más de 45 años perfeccionando el arte del masaje con agua caliente. Su promesa de marca resume su filosofía: “Every Day Made Better” — cada día, mejor. Detrás hay una calidad legendaria: cascos de acrílico coextruido con refuerzo de ABS resistente a impactos, subestructura y base de polímero que no se oxidan ni se pudren, y una ingeniería pensada para durar años."),
          info("Por qué importa en la venta: un spa es una inversión de largo plazo. El cliente necesita confiar en que la marca estará ahí en 5 o 10 años. Comprar un HotSpring con Ambiente Azul = la marca más vendida del mundo + un representante exclusivo que responde en el país."),
          tip("Cómo usarlo con el cliente: cuando dude, lleva la conversación al respaldo. “Este equipo lo va a tener muchos años; con nosotros tiene la marca líder del mundo y servicio propio en Colombia.” El showroom es tu mejor herramienta: invítalo a vivir la experiencia."),
        ],
      },
      {
        title: "El portafolio: estrategia “Bueno, Mejor, Superior”",
        durationMin: 8,
        blocks: [
          h("Un portafolio organizado por tipo de comprador"),
          p("HotSpring no tiene “un spa”: tiene un portafolio organizado por tipo de comprador. Entender esta escalera es lo que te permite recomendar bien y hacer trade-up (subir de gama) cuando tiene sentido para el cliente."),
          table(
            ["Colección", "Posición", "Para quién es", "Sello distintivo"],
            [
              ["Hot Spot", "Bueno (valor)", "Calidad HotSpring a precio ajustado", "Estilo + rendimiento + fiabilidad"],
              ["Limelight", "Mejor", "Valora el diseño y más funciones", "Estilo contemporáneo e iluminación"],
              ["Highlife", "Superior", "Espera lo mejor y la mejor hidroterapia", "Diseño arquitectónico y Moto-Massage DX"],
              ["Freeflow", "Entrada / plug-and-play", "Empieza o tiene límites de instalación", "Se conecta a 110V, sin obra mayor"],
              ["Vigor", "Baño frío", "Busca recuperación y terapia de frío", "Complemento perfecto del spa"],
            ],
          ),
          p("La lógica de venta es sencilla: primero identificas al comprador, después le muestras la colección que encaja. Un cliente que busca lo mejor no debería empezar viendo un Hot Spot; y a uno sensible al presupuesto no lo abrumes con un Highlife de siete puestos. Freeflow es la puerta de entrada; Vigor es venta cruzada con cualquier spa."),
          tip("Cómo usarlo con el cliente: ubica al cliente en la escalera con dos o tres preguntas (Módulo “Cómo elegir el spa”). Luego ancla la conversación en la colección correcta y, si lo valora, muéstrale qué gana subiendo un escalón."),
          h("Puntos clave"),
          list([
            "El spa combina calor + flotación + hidroterapia; se vende la experiencia, no la ficha.",
            "No confundir con piscina ni con inflable: el HotSpring es un equipo de por vida.",
            "Ambiente Azul = representante exclusivo HotSpring en Colombia (Medellín, Bogotá, Miami).",
            "HotSpring (Watkins Wellness): marca más vendida del mundo, 45+ años, calidad legendaria (acrílico + ABS).",
            "Escalera: Hot Spot (Bueno) · Limelight (Mejor) · Highlife (Superior) + Freeflow (entrada) + Vigor (baño frío).",
          ]),
        ],
      },
    ],
    examen: {
      title: "Evaluación — Fundamentos y portafolio",
      description: "Qué vendemos, la marca y cómo está organizado el portafolio.",
      timeLimitMin: 10,
      questions: [
        {
          question: "¿Qué tres elementos terapéuticos combina un spa portátil?",
          type: "MULTIPLE_CHOICE",
          options: ["Calor, flotación e hidroterapia", "Agua, sal y ozono", "Luz, sonido y aroma", "Cloro, filtro y bomba"],
          correctAnswer: 0,
          explanation: "Calor + flotación + masaje con agua a presión (hidroterapia).",
        },
        {
          question: "¿Por qué es un argumento de venta que Ambiente Azul sea representante exclusivo?",
          type: "MULTIPLE_CHOICE",
          options: ["Porque es más barato", "Da respaldo local: repuestos originales, servicio técnico y acompañamiento de por vida", "Porque regala accesorios", "No es un argumento"],
          correctAnswer: 1,
          explanation: "El respaldo local (repuestos, servicio, acompañamiento) es el diferencial frente a compras sin soporte.",
        },
        {
          question: "Ordena de menor a mayor gama: Highlife, Hot Spot, Limelight.",
          type: "MULTIPLE_CHOICE",
          options: ["Highlife → Limelight → Hot Spot", "Hot Spot → Limelight → Highlife", "Limelight → Hot Spot → Highlife", "Todas son iguales"],
          correctAnswer: 1,
          explanation: "Bueno → Mejor → Superior: Hot Spot → Limelight → Highlife.",
        },
        {
          question: "¿Qué colección recomendarías a un cliente que quiere empezar sencillo y sin obra eléctrica?",
          type: "MULTIPLE_CHOICE",
          options: ["Highlife", "Limelight", "Freeflow (plug-and-play 110V)", "Vigor"],
          correctAnswer: 2,
          explanation: "Freeflow es plug-and-play a 110V: sin obra eléctrica mayor.",
        },
      ],
    },
  };
}
