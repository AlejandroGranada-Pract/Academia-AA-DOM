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

// Inserta los Módulos 6 y 7 ("Del Cálculo a la Cotización") en el curso
// "Fundamentos de Piscinas — Ambiente Azul". Idempotente: si el módulo 6 ya
// existe (por título), no hace nada.

const CURSO_TITLE = "Fundamentos de Piscinas — Ambiente Azul";
const MOD6_TITLE = "Capítulos de la Cotización: Sistemas Esenciales";
const MOD7_TITLE = "La Cotización Completa: Opcionales, Kits y Presentación";

type Block = Record<string, unknown>;
const h = (text: string): Block => ({ type: "heading", text });
const p = (text: string): Block => ({ type: "paragraph", text });
const list = (items: string[]): Block => ({ type: "list", items });
const info = (text: string): Block => ({ type: "callout", style: "info", text });
const warn = (text: string): Block => ({ type: "callout", style: "warning", text });
const tip = (text: string): Block => ({ type: "callout", style: "tip", text });
const video = (url: string): Block => ({ type: "video", url });
const table = (headers: string[], rows: string[][]): Block => ({
  type: "table",
  headers,
  rows,
});

// ---------------------------------------------------------------------------
// MÓDULO 6
// ---------------------------------------------------------------------------

const mod6Lessons = [
  {
    title: "Datos del proyecto — Lo que alimenta el cálculo",
    durationMin: 10,
    blocks: [
      h("Lo que alimenta el cálculo"),
      p(
        "Antes de que el calculador sugiera un solo equipo, necesita conocer las características del proyecto. Cada dato que ingresamos en el paso 1 del calculador tiene un impacto directo en los equipos que se recomiendan. No es un formulario burocrático — es la base técnica de toda la cotización.",
      ),
      h("Dimensiones y volumen"),
      p("Las dimensiones de la piscina determinan dos valores fundamentales:"),
      list([
        "Superficie (m²): Define cuántas luminarias necesitamos, cuántas succiones de fondo y cuántos retornos.",
        "Volumen (m³): Define el tamaño de la bomba, el filtro, el sistema de desinfección y la calefacción.",
      ]),
      p("La fórmula de volumen depende de la forma:"),
      list([
        "Rectangular: largo × ancho × profundidad promedio",
        "Circular: π × (diámetro/2)² × profundidad promedio",
        "Forma libre: el usuario ingresa el área directamente",
      ]),
      tip(
        "Si la piscina tiene playa húmeda o spa integrado, su volumen se suma al total. Si tiene escaleras dentro de la playa, su volumen se resta.",
      ),
      h("Tipo de piscina"),
      p(
        "El tipo de piscina afecta directamente el tiempo de recirculación (cuántas horas tarda en pasar toda el agua por el filtro):",
      ),
      table(
        ["Tipo", "Recirculación", "Por qué"],
        [
          ["Residencial", "6 horas", "Bañistas controlados, uso intermitente"],
          ["Comercial", "6 horas", "Mayor volumen pero con sistemas reforzados"],
          ["Wellness", "4 horas", "Agua caliente = mayor riesgo de bacterias"],
          ["SPA", "30 minutos", "Volumen pequeño + temperatura alta + muchos bañistas por m³"],
          ["Infantil", "2 horas", "Normativa exige recirculación rápida por riesgo sanitario"],
        ],
      ),
      warn(
        "Un SPA necesita recircular TODA su agua cada 30 minutos. Esto significa que la bomba y el filtro de un SPA, aunque sea pequeño, deben manejar un caudal proporcionalmente mucho mayor que el de una piscina grande.",
      ),
      h("Tipo de rebosamiento"),
      p("El rebosamiento (cómo sale el agua de la superficie) tiene impacto en múltiples sistemas:"),
      list([
        "Desnatador (Skimmer): El agua sale por un orificio en la pared. Es el más común en residencial. Requiere desnatadores y no necesita tanque de compensación.",
        "Desbordante (Overflow): El agua sale por todo el perímetro hacia una canaleta. Requiere tanque de compensación y succiones laterales.",
        "Infinita (Infinity): El agua cae por uno o más bordes creando el efecto visual de “piscina sin fin”. Requiere tanque de compensación.",
        "Desbordante + Infinita: Combinación de ambos. Es la configuración que mayor caudal de bomba exige (+30% sobre el caudal base).",
      ]),
      tip(
        "Las piscinas overflow e infinity necesitan entre un 10% y 30% más de caudal de bombeo que una piscina con skimmer, porque deben mover el agua del tanque de compensación de vuelta al vaso.",
      ),
      h("Zona climática y temperatura"),
      p("Colombia tiene tres zonas climáticas que el calculador usa para la calefacción:"),
      table(
        ["Zona", "Altitud", "Temp. ambiente ref.", "Humedad"],
        [
          ["Cálida", "< 500 msnm", "30°C", "75%"],
          ["Templada", "500 – 1.800 msnm", "20°C", "70%"],
          ["Fría", "> 1.800 msnm", "14°C", "65%"],
        ],
      ),
      p(
        "La diferencia entre la temperatura del agua deseada y la temperatura ambiente determina las pérdidas de calor y, por tanto, el tamaño del calentador.",
      ),
      h("Interior vs Exterior"),
      p(
        "Una piscina cubierta (interior) pierde hasta un 50% menos de calor por evaporación que una exterior, porque no está expuesta al viento. Esto significa un calentador más pequeño y menor costo operativo.",
      ),
      info(
        "El calculador usa un factor de viento de 0.5 para piscinas interiores y 1.0 para exteriores. Esto reduce a la mitad las pérdidas por evaporación en piscinas cubiertas.",
      ),
    ],
  },
  {
    title: "Filtración — Por qué el calculador sugiere ese filtro",
    durationMin: 12,
    blocks: [
      h("El concepto"),
      p(
        "El filtro es el corazón de la calidad del agua. Su trabajo: atrapar las partículas que el ojo no ve (entre 8 y 40 micras) para que el desinfectante pueda trabajar sobre un agua limpia. Sin una buena filtración, ningún sistema de desinfección funciona bien.",
      ),
      h("La fórmula que usa el calculador"),
      p("El calculador necesita una sola cifra del filtro: su área de filtración (en pies cuadrados, ft²)."),
      p("La fórmula es: Área requerida = Caudal (GPM) ÷ Velocidad de filtración"),
      p("Donde:"),
      list([
        "Caudal GPM viene del cálculo de la bomba (siguiente lección)",
        "Velocidad de filtración depende del tipo de filtro:",
        "Arena: 15 GPM/ft² (el agua pasa rápido por mucha área)",
        "Cartucho: 0.375 GPM/ft² (el agua pasa lento por un medio fino)",
      ]),
      info(
        "Ejemplo — Piscina de 60 m³ con caudal de 80 GPM: Arena: 80 ÷ 15 = 5.3 ft² → filtro de 6 ft² (el más cercano superior). Cartucho: 80 ÷ 0.375 = 213 ft² → cartucho de 220 ft².",
      ),
      h("Arena vs Cartucho: cuándo recomienda cada uno"),
      p("El calculador siempre calcula ambos tipos y presenta opciones. La diferencia clave:"),
      table(
        ["Criterio", "Arena", "Cartucho"],
        [
          ["Finura de filtración", "20-40 micras", "8-15 micras"],
          ["Mantenimiento", "Retrolavado (consume agua)", "Limpieza manual del cartucho"],
          ["Espacio", "Más grande", "Más compacto"],
          ["Vida útil del medio", "5-7 años (arena)", "1-2 años (cartucho)"],
          ["Ideal para", "Alto uso, comercial", "Residencial, spas"],
        ],
      ),
      tip(
        "Un cartucho filtra partículas hasta 3 veces más pequeñas que la arena, pero requiere un área de filtración mucho mayor (por eso los cartuchos son físicamente grandes aunque parezcan más “compactos”).",
      ),
      h("Básica vs Full en filtración"),
      list([
        "Básica: Filtros de marcas económicas con buen rendimiento. Ejemplo: SPL Filtro Arena Splash.",
        "Full: Filtros premium con tanques en fibra de vidrio resistentes a UV y corrosión, válvulas de alto rendimiento. Ejemplo: MAX Filtro Arena Fibra de Vidrio MaxFilter Elite.",
      ]),
      p(
        "La diferencia no está en la capacidad de filtración (ambos cubren el área requerida), sino en la durabilidad y calidad del material.",
      ),
      info(
        "Qué decirle al cliente: “El filtro que le recomendamos procesa toda el agua de su piscina X veces al día. La opción básica cumple con la capacidad técnica; la opción full le da un tanque más resistente que dura más años sin degradarse por el sol o los químicos.”",
      ),
      h("Video: Cómo funciona el sistema de filtración"),
      p("Explica el circuito completo de filtración y para qué sirve cada componente."),
      video("https://www.youtube.com/watch?v=QHM7DbKx6kY"),
      h("Video: Filtro de arena — posiciones de la válvula"),
      p(
        "Detalla el funcionamiento de la válvula selectora: filtración, lavado, enjuague, circulación y desagüe.",
      ),
      video("https://www.youtube.com/watch?v=JQl9LA2SJ60"),
    ],
  },
  {
    title: "Motobomba — Velocidad fija vs variable",
    durationMin: 12,
    blocks: [
      h("El concepto"),
      p(
        "La motobomba es el motor del sistema hidráulico. Mueve el agua desde el vaso de la piscina, a través del filtro y los equipos de tratamiento, y de vuelta a la piscina. Es también el equipo que más energía consume — por eso la diferencia entre velocidad fija y variable es tan importante.",
      ),
      h("Cómo calcula el caudal necesario"),
      p("El calculador usa esta fórmula: Caudal (GPM) = Volumen en galones ÷ (Tiempo de recirculación en horas × 60)"),
      p("Ejemplo: Piscina residencial de 60 m³"),
      list([
        "60 m³ = 15.850 galones",
        "Recirculación: 6 horas",
        "Caudal = 15.850 ÷ (6 × 60) = 44 GPM",
      ]),
      warn(
        "Si la piscina es overflow o infinita, el calculador agrega entre un 10% y un 30% al caudal base, porque el agua debe recircular desde el tanque de compensación.",
      ),
      h("TDH: la resistencia del sistema"),
      p(
        "El TDH (Total Dynamic Head) es la resistencia total que la bomba debe vencer: tubería, filtro, calentador, altura, accesorios. El calculador usa valores de referencia:",
      ),
      list(["Residencial: 50 ft", "Comercial: 60 ft"]),
      p("Con el caudal y el TDH, el calculador busca bombas cuya curva de rendimiento cubra ambos valores."),
      h("Velocidad fija vs variable: el argumento de venta"),
      table(
        ["Aspecto", "Fija", "Variable"],
        [
          ["Inversión inicial", "Menor (30-50% menos)", "Mayor"],
          ["Consumo eléctrico", "100% siempre", "Hasta 80% menos"],
          ["Ruido", "Más ruidosa", "Ultra silenciosa"],
          ["Vida útil", "Estándar", "Mayor (menor desgaste)"],
          ["Automatización", "Limitada", "Ajusta velocidad según demanda"],
        ],
      ),
      tip(
        "El calculador calcula el costo mensual de operación para cada bomba. Para velocidad variable usa la ley de afinidad simplificada: a la mitad de velocidad, el consumo baja a un 35% del original. Esto permite mostrar al cliente el ahorro mensual y anual de Full vs Básica.",
      ),
      h("Básica vs Full en bombas"),
      list([
        "Básica: Bombas de velocidad fija o variable de gama económica (LX, marcas emergentes).",
        "Full: Bombas de velocidad variable premium (Pentair IntelliFlo, Jandy ePump) con sensores integrados, compatibilidad con automatización y protección anti-atrapamiento.",
      ]),
      h("Cómo presentar el ahorro"),
      p("El comparativo del calculador muestra automáticamente:"),
      list([
        "Ahorro mensual: diferencia en costo operativo entre básica y full",
        "Ahorro anual: × 12 meses",
      ]),
      info(
        "Ejemplo: Si la bomba básica cuesta $81.900/mes en energía y la full cuesta $24.500/mes, el ahorro es de $57.400/mes = $688.800/año. En 2-3 años, la diferencia de precio del equipo se paga sola.",
      ),
      h("Video: Bombas de velocidad variable"),
      p(
        "Hayward explica el concepto de velocidad variable, el ahorro energético (hasta 85%) y las ventajas frente a bombas convencionales.",
      ),
      video("https://www.youtube.com/watch?v=LI0y6C94xiI"),
    ],
  },
  {
    title: "Desinfección y Dosificación",
    durationMin: 14,
    blocks: [
      h("El concepto"),
      p(
        "La desinfección elimina bacterias, virus y microorganismos del agua. No basta con filtrar — los patógenos pasan por el filtro. Por eso toda piscina necesita al menos un método de desinfección activo.",
      ),
      h("Los métodos que maneja el calculador"),
      p("El calculador permite seleccionar uno o varios métodos simultáneos:"),
      table(
        ["Método", "Cómo funciona", "Criterio de selección"],
        [
          ["Clorador en línea", "Dispensa cloro automáticamente en la tubería de retorno", "Por volumen de la piscina (m³)"],
          ["Cloración salina", "Electrólisis convierte sal disuelta en cloro", "Por volumen en litros"],
          ["UV (Ultravioleta)", "Luz UV destruye ADN de microorganismos", "Por caudal (GPM) de la bomba"],
          ["Ozono", "Gas oxidante que elimina patógenos", "Por volumen (g/h necesarios)"],
          ["Control de pH", "Dosificador automático mantiene pH ideal", "Por volumen (m³)"],
        ],
      ),
      h("Combinaciones más comunes"),
      list([
        "Clorador en línea — La opción más económica. El comercial agrega pastillas periódicamente.",
        "Clorador en línea + Cloración salina — Agua “suave”, menor manipulación de químicos. La sal genera el cloro automáticamente.",
        "UV + Ozono (AOP) — Doble desinfección avanzada. Reduce hasta 90% el uso de cloro. Ideal para clientes sensibles al cloro.",
        "Cualquiera + Control de pH — El pH controla la eficacia del cloro. Un pH fuera de rango (ideal: 7.2-7.6) reduce hasta un 80% la capacidad del desinfectante.",
      ]),
      warn(
        "El calculador intenta hacer match de marca entre el clorador y el controlador de pH. Si el cliente lleva cloración salina Pentair, el control de pH sugerido será Pentair también, para garantizar compatibilidad.",
      ),
      h("La fórmula detrás"),
      p("Para cada método, el calculador calcula una “capacidad requerida” y busca el equipo que la cubra:"),
      list([
        "Cloro: volumen × 0.2 g/h por m³",
        "Sal: volumen × 1.000 (en litros)",
        "UV: igual al caudal GPM de la bomba (todo el agua pasa por la cámara UV)",
        "Ozono: volumen × 0.5 g/h por m³",
      ]),
      h("Básica vs Full en desinfección"),
      list([
        "Básica: Clorador en línea + flotador de cloro. Sencillo, económico, requiere más intervención manual.",
        "Full: Cloración salina con control de pH automático, o UV+Ozono. Menos químicos, más automatizado.",
      ]),
      info(
        "Qué decirle al cliente: “La propuesta básica le da un sistema de desinfección confiable que funciona bien si usted o su operador le dedican 15 minutos a la semana. La propuesta full automatiza la dosificación — el sistema se ajusta solo y usted puede olvidarse del mantenimiento químico diario.”",
      ),
      h("Video: Cloración salina"),
      p("Explicación completa del sistema de cloración salina y electrólisis."),
      video("https://www.youtube.com/watch?v=m-Wo1IY7EMI"),
      h("Video: Sistemas de desinfección Hayward"),
      p(
        "Cubre los tres sistemas (cloración salina, UV y ozono) en un solo video — ideal para entender las diferencias y cuándo usar cada uno.",
      ),
      video("https://www.youtube.com/watch?v=x-ZsmjqaiQQ"),
    ],
  },
  {
    title: "Calefacción — Gas, bomba de calor e híbrida",
    durationMin: 14,
    blocks: [
      h("El concepto"),
      p(
        "La calefacción mantiene el agua a la temperatura deseada compensando las pérdidas de calor. En Colombia, la altitud determina la necesidad: en tierra caliente raramente se necesita, pero en Bogotá (2.600 m) o Medellín (1.500 m) es casi obligatorio para un uso cómodo.",
      ),
      h("Cómo calcula las pérdidas de calor"),
      p("El calculador estima la energía que la piscina pierde cada hora por:"),
      list([
        "Evaporación (la mayor pérdida, ~70%): depende de superficie, humedad relativa y viento",
        "Radiación (10-15%): calor que escapa al ambiente",
        "Factor de rebosamiento: las piscinas overflow/infinito pierden más calor porque hay más superficie de agua expuesta",
      ]),
      table(
        ["Rebosamiento", "Factor"],
        [
          ["Skimmer", "×1.0 (referencia)"],
          ["Infinito (1 borde)", "×1.15"],
          ["Overflow perimetral", "×1.25"],
          ["Overflow + Infinito", "×1.30"],
        ],
      ),
      tip(
        "Una piscina infinity pierde un 15% más de calor que la misma piscina con skimmer, solo por tener un borde sin contención. Esto se traduce en un calentador más grande y mayor costo operativo.",
      ),
      h("Los tres tipos de calefacción"),
      table(
        ["Tipo", "Cómo funciona", "Ventaja principal", "Ideal para"],
        [
          ["Gas", "Quema gas natural/propano", "Calentamiento rápido", "Uso ocasional, SPAs"],
          ["Bomba de calor", "Extrae calor del aire (como un A/C invertido)", "Hasta 80% más económica", "Uso frecuente"],
          ["Eléctrica", "Resistencia eléctrica", "Compacta, sin combustión", "SPAs pequeños"],
        ],
      ),
      h("Costos operativos (referencia Medellín estrato 6)"),
      p("El calculador usa estos valores para comparar:"),
      list(["Gas natural: ~$303/kWh", "Electricidad (bomba de calor / eléctrico): ~$1.000/kWh"]),
      p(
        "Pero la bomba de calor tiene un COP (coeficiente de rendimiento) de 4-6, es decir, por cada kW de electricidad que consume, genera 4-6 kW de calor. Esto la hace MÁS barata que el gas a pesar del precio del kWh eléctrico.",
      ),
      info(
        "Ejemplo — Piscina de 60 m³ en zona fría (14°C → 28°C): Gas ~$450.000/mes; Bomba de calor inverter ~$180.000/mes; Ahorro $270.000/mes = $3.240.000/año.",
      ),
      h("Calefacción híbrida"),
      p("Para clientes que quieren lo mejor de ambos mundos:"),
      list([
        "Bomba de calor: mantiene la temperatura base día a día (económica)",
        "Gas: sube la temperatura rápidamente cuando hay un evento o se necesita el SPA ya",
      ]),
      p("El calculador permite seleccionar múltiples sistemas de calefacción simultáneamente."),
      h("Cómo selecciona el equipo"),
      p("El calculador ordena las recomendaciones así:"),
      list([
        "Primero bombas de calor (menor costo operativo)",
        "Luego gas (calentamiento rápido)",
        "Luego eléctrico (solo para SPAs pequeños)",
      ]),
      p(
        "Dentro de cada tipo, ordena por menor tiempo de calentamiento inicial (cuántas horas tarda en subir el agua desde temperatura ambiente hasta la deseada).",
      ),
      h("Video: Bombas de calor para piscinas"),
      p("Guía completa sobre funcionamiento, dimensionamiento y consideraciones de instalación."),
      video("https://www.youtube.com/watch?v=H6-LZ2iLqQQ"),
      h("Video: Gas vs Bomba de calor"),
      p("Comparativa directa con datos de eficiencia y costos operativos (Superpools)."),
      video("https://www.youtube.com/watch?v=zEKdzv9oBmY"),
    ],
  },
  {
    title: "Iluminación y Conducción de Agua",
    durationMin: 12,
    blocks: [
      h("Iluminación: el concepto"),
      p(
        "La iluminación no es solo estética — la Resolución 929 exige niveles mínimos de iluminación para seguridad. El calculador determina la cantidad de luminarias basándose en el área de la piscina.",
      ),
      h("Cómo calcula las luminarias"),
      p("El calculador usa reglas de espaciado almacenadas en cada producto:"),
      list([
        "Por metro lineal: 1 luminaria cada X metros de largo (ej. cada 3 m)",
        "Por metro cuadrado: 1 luminaria cada X m² (ej. cada 20 m²)",
      ]),
      p("Referencia mínima normativa: 1 luminaria por cada 20 m² de superficie."),
      p("Además calcula los lúmenes requeridos:"),
      list(["Residencial: 91 lm/m²", "Comercial: 150 lm/m²"]),
      tip(
        "El calculador asigna luminarias por zonas separadas: piscina principal, playa húmeda (si tiene) y spa integrado (si tiene). Cada zona puede tener diferentes tipos de luminarias.",
      ),
      h("Opciones de color"),
      list([
        "Blanco frío: Luz blanca brillante, máxima visibilidad",
        "Blanco cálido: Luz tenue y acogedora, ideal para ambientes relajados",
        "RGB: Multicolor programable — requiere controlador adicional (el calculador lo agrega automáticamente)",
      ]),
      h("Transformador y escudo"),
      p("Dos accesorios que el calculador agrega automáticamente:"),
      list([
        "Transformador: Suma los watts de todas las luminarias y busca un transformador que cubra la potencia total. Si uno no alcanza, calcula la combinación necesaria.",
        "Escudo embellecedor: Si la luminaria lo requiere, el calculador agrega un escudo por cada luminaria, del mismo color/familia.",
      ]),
      h("Conducción de agua: succiones y retornos"),
      p("El sistema hidráulico de una piscina tiene dos tipos de boquillas en el vaso:"),
      p("Succiones (por donde sale el agua del vaso):"),
      list([
        "Mínimo 2 siempre (normativa de seguridad anti-atrapamiento)",
        "1 adicional por cada 50 m² de superficie",
        "Piscinas overflow/infinity: +2 succiones adicionales en el fondo del tanque",
      ]),
      p("Retornos (por donde entra el agua al vaso):"),
      list([
        "1 cada 6 metros de perímetro",
        "+2 si tiene spa integrado",
        "Adicionales si tiene playa húmeda",
      ]),
      list([
        "Toma de aspirar: 1 si la piscina mide hasta 25 m de largo; 2 si mide más.",
        "Desnatador: Solo para piscinas con skimmer. 1 por cada 42 m² de área total.",
        "Rebose: Igual al número de succiones de fondo.",
      ]),
      h("Conexiones de pared"),
      p(
        "El calculador cuenta automáticamente todas las penetraciones en la pared del vaso (luminarias + tomas + retornos + reboses) y recomienda la cantidad de conexiones de pared necesarias.",
      ),
      h("Video: Iluminación LED en piscinas"),
      p(
        "Muestra cómo conseguir efectos de color con tecnología LED, opciones RGB y programación de secuencias.",
      ),
      video("https://www.youtube.com/watch?v=Vw8-7Uv34gg"),
    ],
  },
];

const examen6 = {
  title: "Evaluación — Sistemas Esenciales",
  description: "Confirma los sistemas de la cotización: datos del proyecto, filtración, bomba, desinfección, calefacción e iluminación.",
  passingScore: 70,
  maxAttempts: 3,
  timeLimitMin: 15,
  questions: [
    {
      question: "¿Cuánto tiempo tarda en recircular toda el agua de un SPA según la normativa?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["6 horas", "2 horas", "30 minutos", "1 hora"],
      correctAnswer: 2,
      explanation: "Un SPA debe recircular toda su agua cada 30 minutos por su alta temperatura y carga de bañistas.",
    },
    {
      question: "¿Qué tipo de rebosamiento exige mayor caudal de bombeo?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Desnatador (Skimmer)", "Desbordante (Overflow)", "Infinita", "Desbordante + Infinita"],
      correctAnswer: 3,
      explanation: "La combinación desbordante + infinita exige el mayor caudal (+30% sobre el caudal base).",
    },
    {
      question: "¿Cuál es la principal ventaja de una bomba de velocidad variable frente a una de velocidad fija?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Mayor caudal máximo", "Hasta 80% de ahorro en consumo eléctrico", "Menor tamaño físico", "No requiere mantenimiento"],
      correctAnswer: 1,
      explanation: "La velocidad variable ajusta el consumo a la demanda, logrando hasta 80% de ahorro energético.",
    },
    {
      question: "Un filtro de cartucho filtra partículas más finas que uno de arena.",
      type: "TRUE_FALSE" as const,
      options: ["Verdadero", "Falso"],
      correctAnswer: 0,
      explanation: "Verdadero: cartucho 8-15 micras vs arena 20-40 micras.",
    },
    {
      question: "¿Qué sistema de calefacción tiene el menor costo operativo mensual para uso frecuente?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["Gas natural", "Bomba de calor inverter", "Calentador eléctrico", "Todos cuestan lo mismo"],
      correctAnswer: 1,
      explanation: "La bomba de calor inverter, con COP de 4-6, es la más económica en operación para uso frecuente.",
    },
    {
      question: "¿Cuál es la cantidad mínima de succiones de fondo que debe tener cualquier piscina?",
      type: "MULTIPLE_CHOICE" as const,
      options: ["1", "2", "3", "Depende del área"],
      correctAnswer: 1,
      explanation: "Mínimo 2 succiones siempre, por normativa de seguridad anti-atrapamiento.",
    },
    {
      question: "Un cliente tiene una piscina en Bogotá (2.600 msnm) con bordes infinitos. ¿Qué dos factores hacen que necesite un calentador más grande que una piscina con skimmer en la misma ciudad?",
      type: "MULTIPLE_CHOICE" as const,
      options: [
        "Mayor volumen y mayor profundidad",
        "Mayor pérdida por evaporación (viento en borde infinito) y factor de rebosamiento ×1.15",
        "Mayor número de bañistas",
        "Mayor superficie de piscina",
      ],
      correctAnswer: 1,
      explanation: "El borde infinito aumenta la evaporación y aplica un factor de rebosamiento ×1.15 sobre las pérdidas de calor.",
    },
    {
      question: "¿Por qué el calculador agrega automáticamente un controlador de iluminación cuando se selecciona color RGB?",
      type: "MULTIPLE_CHOICE" as const,
      options: [
        "Porque las luces RGB consumen más energía",
        "Porque las luces RGB necesitan un controlador para sincronizar colores y secuencias",
        "Porque la normativa lo exige",
        "Porque es más barato en combo",
      ],
      correctAnswer: 1,
      explanation: "Las luces RGB requieren un controlador para programar colores y secuencias.",
    },
  ],
};

// ---------------------------------------------------------------------------
// MÓDULO 7
// ---------------------------------------------------------------------------

const mod7Lessons = [
  {
    title: "Capítulos opcionales — Automatización, Robot y Caudalímetro",
    durationMin: 10,
    blocks: [
      h("Por qué son opcionales"),
      p(
        "Estos tres capítulos no son obligatorios para el funcionamiento de la piscina, pero agregan valor significativo. El calculador los calcula siempre pero los muestra desactivados por defecto — el comercial decide cuáles activar según el perfil del cliente.",
      ),
      h("Automatización"),
      p(
        "Permite controlar todos los equipos de la piscina desde un panel central o desde el celular: bomba, calentador, iluminación, desinfección, válvulas.",
      ),
      p("Cuándo ofrecerla:"),
      list([
        "Cliente con piscina en casa de recreo (no está todos los días)",
        "Proyecto con múltiples sistemas (bomba + calentador + luces + desinfección)",
        "Cliente que valora la comodidad y la tecnología",
      ]),
      p("Equipos que maneja el calculador: Pentair IntelliCenter, IntelliConnect, Jandy AquaLink — dependiendo de la complejidad del proyecto."),
      info(
        "La automatización NO reemplaza el mantenimiento. Programa horarios y enciende/apaga equipos, pero el cliente o su operador siguen siendo responsables de la limpieza física y la revisión periódica.",
      ),
      h("Robot limpiafondos"),
      p(
        "Un robot autónomo que limpia fondo, paredes y línea de flotación. Se diferencia del aspirado manual en que no requiere que una persona esté operando la manguera.",
      ),
      p("Cuándo ofrecerlo:"),
      list([
        "Piscinas grandes (> 40 m²) donde aspirar manual toma mucho tiempo",
        "Clientes que no tienen operador de piscina permanente",
        "Proyectos premium donde la comodidad es prioridad",
      ]),
      h("Caudalímetro"),
      p(
        "Un instrumento visual que muestra el caudal de agua en tiempo real. Permite verificar que la bomba y el filtro están operando correctamente sin necesidad de herramientas.",
      ),
      p("Cuándo ofrecerlo:"),
      list([
        "Piscinas comerciales (hoteles, clubes) donde hay operador técnico",
        "Proyectos con sistemas complejos (múltiples bombas, calefacción)",
        "Clientes que quieren monitorear el rendimiento de su inversión",
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
    durationMin: 12,
    blocks: [
      h("Qué es wellness en piscinas"),
      p("Los elementos wellness transforman una piscina funcional en una experiencia sensorial. Se dividen en dos categorías:"),
      list([
        "Agua: Cascadas, chorros laminares, deck jets, hidrojets, cañones de agua",
        "Aire: Volcán de burbujas, cama de aire, boquillas de aire plantar",
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
      warn(
        "Los elementos de aire (volcán, cama) necesitan un blower, NO una motobomba. Los elementos de agua (cascadas, cañones, hidrojets) necesitan una motobomba dedicada, independiente de la bomba principal de filtración.",
      ),
      h("Escalamiento por cantidad"),
      p("El calculador ajusta automáticamente los complementos según la cantidad:"),
      list([
        "Hidrojets: De 1 a 4 unidades = 1 motobomba. De 5 a 10 = motobomba más grande. De 11 a 20 = 2 motobombas.",
        "Volcán/Cama: Cada unidad lleva su propio blower.",
        "Chorros laminares: La cantidad de cuerpos es libre pero comparten sistema.",
      ]),
      h("Básica vs Full en wellness"),
      p("Algunos combos tienen ítems diferenciados por nivel:"),
      list([
        "Básica (B): Blower/bomba de gama estándar",
        "Full (F): Blower/bomba premium con mayor potencia o menor ruido",
      ]),
      p("Los cuerpos del elemento (volcán, cascada, etc.) son los mismos en ambas propuestas."),
      info(
        "Qué decirle al cliente: “Los elementos wellness no son un lujo — son lo que hace que usted USE la piscina. Una piscina sin wellness es para nadar; con un volcán de burbujas y unos hidrojets se convierte en su spa privado. El calculador ya incluye la bomba o blower necesario, no hay costos ocultos.”",
      ),
      h("Video: Cómo funcionan los hidrojets"),
      p("Explicación técnica del funcionamiento: cómo mezclan aire y agua para el efecto de hidromasaje (Albercas Aqua)."),
      video("https://www.youtube.com/watch?v=csyCKMGeeDY"),
      h("Videos de referencia por elemento"),
      p(
        "Los siguientes videos están disponibles directamente en el calculador (botón rojo de play junto a cada elemento) y los puedes compartir con el cliente durante la presentación:",
      ),
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
    title: "Kits y Servicios Adicionales",
    durationMin: 10,
    blocks: [
      h("Por qué existen los kits"),
      p(
        "Los capítulos del calculador cubren los equipos principales, pero una piscina funcional necesita complementos que no son “equipos” propiamente: elementos de seguridad, químicos para arranque, herramientas de limpieza, instalación eléctrica, etc. Los kits agrupan estos complementos para no olvidarlos.",
      ),
      h("Kit de Seguridad"),
      p("Incluye los elementos exigidos por la Resolución 929 de 2026 y la Ley 1209 de 2008:"),
      list([
        "Señalización de profundidades",
        "Salvavidas tipo aro",
        "Flotador de rescate",
        "Reglas de uso",
      ]),
      warn(
        "La normativa colombiana exige estos elementos en TODA piscina de uso colectivo. Incluirlos en la cotización demuestra al cliente que Ambiente Azul conoce y cumple la regulación vigente.",
      ),
      h("Kit de Limpieza"),
      p("Herramientas para el mantenimiento manual de la piscina:"),
      list([
        "Manguera de aspiración",
        "Cabezal de aspirado",
        "Cepillo de pared",
        "Malla recoge-hojas (hoja y bolsa)",
        "Barra telescópica",
        "Kit de test químico",
      ]),
      p("Para SPAs integrados hay un kit separado con herramientas de menor tamaño."),
      h("Kit de Balance Químico"),
      p("Los químicos necesarios para la puesta en marcha y el primer mes de operación:"),
      list([
        "Cloro granulado o pastillas",
        "Regulador de pH (ácido/base)",
        "Alguicida",
        "Floculante",
        "Estabilizador (ácido cianúrico)",
      ]),
      h("Servicios: Asesoría, Eléctricos y Mano de Obra"),
      p("Tres ítems que representan servicios, no productos físicos:"),
      table(
        ["Servicio", "Qué cubre"],
        [
          ["Asesoría, Planimetría y Transporte", "Visita técnica al proyecto, elaboración de planos hidráulicos del cuarto de máquinas, y envío de todos los equipos al sitio"],
          ["Accesorios Eléctricos CM", "Tablero eléctrico del cuarto de máquinas, breakers, cables, conduit, conexiones — todo lo necesario para alimentar eléctricamente los equipos"],
          ["Mano de Obra Instalación CM", "Instalación hidráulica y eléctrica de todos los equipos en el cuarto de máquinas por personal certificado de Ambiente Azul"],
        ],
      ),
      tip(
        "Estos tres servicios son editables en el calculador. El comercial puede ajustar las cantidades y los precios según la complejidad del proyecto antes de generar la cotización.",
      ),
      h("En la Propuesta Personalizada"),
      p("Los kits aparecen tanto en las propuestas Básica/Full como en la sección de “Mezclar Capítulos”. El comercial puede:"),
      list([
        "Activar kits diferentes en cada propuesta (ej. seguridad en ambas, mano de obra solo en full)",
        "Incluir/excluir kits individualmente en la propuesta personalizada",
        "El total se recalcula automáticamente",
      ]),
    ],
  },
  {
    title: "Básica vs Full vs Personalizada — Estrategia Comercial",
    durationMin: 14,
    blocks: [
      h("Las tres propuestas"),
      p("El calculador genera tres opciones para cada proyecto:"),
      list([
        "Básica: Equipos de gama económica que cumplen técnicamente. Menor inversión.",
        "Full: Equipos premium con mayor eficiencia, durabilidad y funcionalidad. Mayor inversión, menor costo operativo.",
        "Personalizada: El comercial mezcla capítulos de Básica y Full según lo que más le convenga al cliente.",
      ]),
      h("Cómo se arman Básica y Full"),
      p("No son fórmulas diferentes — es el MISMO motor con distintos catálogos:"),
      list([
        "Básica: Solo usa productos marcados como nivel “B” (básico) o “BF” (ambos)",
        "Full: Solo usa productos marcados como nivel “F” (full) o “BF” (ambos)",
      ]),
      p(
        "Los cálculos de caudal, área de filtración, BTU, luminarias, etc. son idénticos. Lo que cambia es la marca y gama del producto que cubre ese requerimiento.",
      ),
      h("El poder del comparativo"),
      p("La propuesta comparativa (PDF impreso) muestra ambas opciones lado a lado, capítulo por capítulo. Esto le permite al cliente:"),
      list([
        "Ver exactamente QUÉ cambia entre básica y full en cada sistema",
        "Entender el PORQUÉ del diferencial de precio",
        "Tomar decisiones informadas por capítulo, no por precio total",
      ]),
      tip(
        "Las características comparativas (textos debajo de cada producto) están diseñadas para que el cliente entienda la diferencia sin conocimiento técnico. Por ejemplo: “Hasta 80% de ahorro energético” le dice más al cliente que “Motor de imanes permanentes con VFD integrado”.",
      ),
      h("La estrategia del “ancla”"),
      p("El comparativo funciona con el principio psicológico de anclaje:"),
      list([
        "El cliente ve primero el total Full (más alto) — eso se convierte en su referencia mental",
        "Luego ve el total Básica (más bajo) — parece muy accesible en comparación",
        "La Personalizada le da control — puede elegir dónde invertir más y dónde ahorrar",
      ]),
      info(
        "La mayoría de los clientes terminan eligiendo una propuesta personalizada que está entre el 60% y el 80% del valor Full. Casi nunca eligen 100% Básica cuando ven el comparativo.",
      ),
      h("Cómo usar “Mezclar Capítulos”"),
      p("La sección de Propuesta Personalizada permite:"),
      list([
        "Hacer clic en cada capítulo para elegir si tomar la opción Básica o Full",
        "Los capítulos opcionales pueden dejarse sin seleccionar",
        "Los kits se activan/desactivan independientemente",
        "El total se recalcula en tiempo real",
      ]),
      p("Atajos: “Todo Básica” selecciona todos los capítulos en versión básica; “Todo Full” selecciona todos en versión full. Desde ahí el comercial ajusta los que quiera."),
      h("Consejos para la presentación al cliente"),
      list([
        "Empezar por el contexto: “Su piscina tiene X m³, está a Y metros de altitud, con sistema Z de rebosamiento. Esto es lo que necesita técnicamente...”",
        "Mostrar el comparativo capítulo por capítulo: no saltar directo al total.",
        "Enfatizar el ahorro operativo: en bomba y calefacción, el ahorro mensual es un argumento poderoso.",
        "Usar los videos: cada equipo tiene un botón de video. Reproducirlo hace tangible lo que el cliente compra.",
        "Cerrar con la personalizada: “¿Le gustaría que armemos una propuesta con lo que más le gustó de cada opción?”",
      ]),
      h("Video: Cuarto de máquinas real en Colombia"),
      p(
        "Muestra un cuarto de máquinas real en Colombia con todos los equipos conectados (proyecto en Villavicencio) — útil para visualizar lo que se está cotizando.",
      ),
      video("https://www.youtube.com/watch?v=ICVw_jLAVVc"),
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
        "Bomba: Caudal requerido alto por ser overflow (+25%) y comercial",
        "Filtro: Área de filtración proporcional al caudal",
        "Calefacción: Necesaria (14°C ambiente → 28°C deseados = ΔT de 14°C)",
        "Desinfección: Al menos clorador en línea + cloración salina (hotel = menos manipulación de químicos)",
        "Iluminación: Múltiples luminarias (área grande + playa + spa)",
        "Succiones: Mínimo 4 (2 base + 2 por overflow)",
      ]),
      h("Paso 3: Personalizar"),
      list([
        "Active la automatización (es un hotel — el operador necesita control centralizado)",
        "Active el caudalímetro (es comercial — el técnico necesita verificar caudal)",
        "En wellness, agregue 4 hidrojets en el SPA",
        "Active los kits de seguridad (obligatorio), limpieza, balance químico",
        "Active asesoría, eléctricos y mano de obra",
        "Revise el comparativo Básica vs Full",
      ]),
      h("Paso 4: Generar cotización"),
      list([
        "Abra la sección “Mezclar Capítulos”",
        "Seleccione Full en bomba y calefacción (el ahorro operativo lo justifica para un hotel)",
        "Seleccione Básica en filtración e iluminación (buena relación costo-beneficio)",
        "Seleccione Full en desinfección (menos mantenimiento diario para el hotel)",
        "Active todos los kits",
        "Revise el total personalizado",
        "Guarde y genere el PDF comparativo",
      ]),
      info(
        "Este ejercicio simula un proyecto real. Los valores exactos dependen del catálogo de productos actualizado, pero la lógica de selección siempre será la misma.",
      ),
    ],
  },
];

const examen7 = {
  title: "Evaluación — Cotización Completa",
  description: "Pon a prueba la estrategia comercial: opcionales, wellness, kits y propuestas Básica/Full/Personalizada.",
  passingScore: 70,
  maxAttempts: 3,
  timeLimitMin: 12,
  questions: [
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
  ],
};

// ---------------------------------------------------------------------------

async function crearModulo(
  courseId: string,
  order: number,
  title: string,
  lessons: { title: string; durationMin: number; blocks: Block[] }[],
  examen: typeof examen6,
) {
  await prisma.module.create({
    data: {
      courseId,
      title,
      order,
      lessons: {
        create: lessons.map((l, i) => ({
          title: l.title,
          type: "MIXED",
          order: i + 1,
          durationMin: l.durationMin,
          content: { blocks: l.blocks } as object,
        })),
      },
      exams: {
        create: [
          {
            title: examen.title,
            description: examen.description,
            passingScore: examen.passingScore,
            maxAttempts: examen.maxAttempts,
            timeLimitMin: examen.timeLimitMin,
            order: lessons.length + 1,
            questions: {
              create: examen.questions.map((q, i) => ({
                question: q.question,
                type: q.type,
                options: q.options,
                correctAnswer: q.correctAnswer,
                points: 1,
                explanation: q.explanation,
                order: i + 1,
              })),
            },
          },
        ],
      },
    },
  });
}

async function main() {
  const curso = await prisma.course.findFirst({
    where: { title: CURSO_TITLE },
    include: { modules: { select: { title: true, order: true } } },
  });
  if (!curso) {
    throw new Error(`No se encontró el curso "${CURSO_TITLE}".`);
  }

  if (curso.modules.some((m) => m.title === MOD6_TITLE)) {
    console.log("⏭️  Los módulos 6 y 7 ya existen. No se hace nada.");
    return;
  }

  const maxOrder = curso.modules.reduce((mx, m) => Math.max(mx, m.order), 0);
  console.log(
    `📚 Curso "${curso.title}" — ${curso.modules.length} módulos. Agregando 6 y 7…`,
  );

  await crearModulo(curso.id, maxOrder + 1, MOD6_TITLE, mod6Lessons, examen6);
  await crearModulo(curso.id, maxOrder + 2, MOD7_TITLE, mod7Lessons, examen7);

  // Suma al estimado EXISTENTE el tiempo de las lecciones nuevas (no recalcula
  // desde cero, para no perder el estimado original del curso).
  const nuevosMin = [...mod6Lessons, ...mod7Lessons].reduce(
    (s, l) => s + l.durationMin,
    0,
  );
  const horas = (curso.estimatedHours ?? 0) + Math.round(nuevosMin / 60);
  await prisma.course.update({
    where: { id: curso.id },
    data: { estimatedHours: horas },
  });

  console.log(`✅ Módulos 6 y 7 agregados. Horas estimadas del curso: ${horas} h.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
