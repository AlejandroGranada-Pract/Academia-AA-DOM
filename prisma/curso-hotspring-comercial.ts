import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  h, p, list, info, tip, warn, video, table, pdf, DRIVE,
  moduloFundamentos, type Modulo,
} from "./seed-assets/hotspring-contenido";

// Crea (o REEMPLAZA) el curso "HotSpring — Comercial" como BORRADOR.
// Fuente: paquete de capacitación HotSpring (Ambiente Azul, jul-2026).

const CURSO_TITLE = "HotSpring — Comercial";
const cs = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: cs,
    ...(/localhost|127\.0\.0\.1/.test(cs) ? {} : { ssl: { rejectUnauthorized: false } }),
  }),
});

const VIDEO_HIGHLIFE = "https://vimeo.com/742019990/b48b7a7ef7";
const VIDEO_FILTRACION = "https://www.youtube.com/watch?v=aV1p8XBp3No";

function modulos(): Modulo[] {
  return [
    // ===== MÓDULO 1 — Fundamentos (reutilizable) =====
    moduloFundamentos(),

    // ===== MÓDULO 2 — Colecciones y modelos =====
    {
      title: "Colecciones y modelos",
      lecciones: [
        {
          title: "Colección Highlife (Superior)",
          durationMin: 7,
          blocks: [
            p("Es la colección para el cliente que espera lo mejor. Diseño arquitectónico moderno, casco de acrílico con refuerzo ABS y el sistema de hidroterapia más completo —encabezado por el exclusivo jet Moto-Massage DX—. Es la colección más vendida y ofrece ocho modelos, del Grandee de 7 puestos al compacto Jetsetter de 3."),
            table(
              ["Modelo", "Asientos", "Jets", "Ideal para"],
              [
                ["Grandee", "7", "49", "Familias grandes / uso social"],
                ["Envoy", "5", "55", "Máxima hidroterapia (más jets de la colección)"],
                ["Aria", "5", "42", "Uso familiar equilibrado"],
                ["Vanguard", "6", "42", "Grupos, con asiento para recostarse"],
                ["Sovereign", "5", "32", "Espacios medios"],
                ["Prodigy", "6", "28", "Capacidad alta en menor tamaño"],
                ["Jetsetter LX", "3", "30", "Parejas / espacios reducidos (premium)"],
                ["Jetsetter", "3", "22", "Parejas / espacios reducidos"],
              ],
            ),
            info("Varios modelos incluyen asiento para recostarse (lounge), donde se ubica el Moto-Massage DX para masaje de espalda completo."),
            video("https://vimeo.com/839911429/3306d12de4"),
            info("Resumen del video (oficial, en inglés): “¿Por qué la colección Highlife?” — muestra el diseño arquitectónico, la mejor hidroterapia y el Moto-Massage DX que definen la gama superior."),
          ],
        },
        {
          title: "Colección Limelight (Mejor)",
          durationMin: 6,
          blocks: [
            p("Para el cliente al que le importa mucho el diseño. Estilo contemporáneo, líneas limpias, iluminación única y gabinete Everwood de madera sintética. Seis modelos, para cuatro a siete usuarios."),
            table(
              ["Modelo", "Asientos", "Jets", "Ideal para"],
              [
                ["Prism", "7", "73", "El más completo: máxima capacidad e hidroterapia"],
                ["Pulse", "7", "49", "Uso social, asientos abiertos"],
                ["Flair", "6", "43", "Familiar, con asiento para recostarse"],
                ["Flash", "7", "41", "Grupos, asientos abiertos"],
                ["Strobe", "4", "23", "Espacios medios, con lounge"],
                ["Beam", "4", "19", "Compacto para cuatro"],
              ],
            ),
            video("https://vimeo.com/839913099/59e7f96120"),
            info("Resumen del video (oficial, en inglés): “¿Por qué elegir un Limelight?” — resalta el estilo contemporáneo, la iluminación y el gabinete Everwood de la gama intermedia."),
          ],
        },
        {
          title: "Colección Hot Spot (Bueno)",
          durationMin: 6,
          blocks: [
            p("Estilo, rendimiento y fiabilidad al precio más accesible dentro de la calidad HotSpring. Gabinete Everwood, ideal para entrar a la marca cuidando el presupuesto. Seis modelos."),
            table(
              ["Modelo", "Asientos", "Jets", "Ideal para"],
              [
                ["Relay", "6", "40", "Uso familiar/social con lounge"],
                ["Rhythm", "7", "40", "Grupos, asientos abiertos"],
                ["Propel", "5", "24", "Familiar, con silla doble para recostarse"],
                ["Stride", "3", "20", "Espacios reducidos, con lounge"],
                ["SX", "3", "18", "Compacto"],
                ["TX", "2", "11", "El más pequeño, uso individual/pareja"],
              ],
            ),
            video("https://vimeo.com/840642515/32256e3e65"),
            info("Resumen del video (oficial, en inglés): “¿Por qué elegir un Hot Spot?” — la calidad y la hidroterapia HotSpring al precio más accesible; ideal para entrar a la marca."),
          ],
        },
        {
          title: "Colección Freeflow y baño frío Vigor",
          durationMin: 6,
          blocks: [
            h("Freeflow (entrada / plug-and-play)"),
            p("La puerta de entrada a HotSpring. Construcción rotomoldeada (una sola pieza, muy resistente) y conexión plug-and-play a 110V: no requiere obra eléctrica mayor, ideal para quien empieza, espacios rentados o con limitaciones de acceso. Modelos: Mini, Azure, Aptos, Monterey, Excursion."),
            h("Baño frío Vigor"),
            p("Un baño frío (cold plunge) para recuperación y terapia de frío, con la misma ingeniería y calidad de la colección Highlife. Un puesto; 224 × 107 × 74 cm; 425 litros. Se vende como complemento del spa o como producto de bienestar independiente."),
            tip("Cómo usarlo con el cliente: no memorices los números como un loro; aprende a navegar la tabla frente al cliente. Primero el tamaño (¿cuántos se bañan normalmente?), luego el espacio disponible, y ya reduces a dos o tres modelos."),
            h("Puntos clave"),
            list([
              "Highlife 8 modelos, Limelight 6, Hot Spot 6, Freeflow 5, Vigor 1.",
              "Más asientos y jets → más capacidad y variedad de masaje, pero también más espacio y consumo.",
              "El Envoy (55) y el Prism (73) son los de más jets de sus colecciones.",
              "Freeflow = 110V plug-and-play; el resto varía según su versión eléctrica.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Colecciones y modelos",
        description: "Modelos, asientos y a quién apunta cada colección.",
        timeLimitMin: 10,
        questions: [
          { question: "¿Cuántos asientos tiene el Grandee y a qué colección pertenece?", type: "MULTIPLE_CHOICE", options: ["5, Limelight", "7, Highlife", "6, Hot Spot", "3, Freeflow"], correctAnswer: 1, explanation: "Grandee: 7 asientos, colección Highlife." },
          { question: "Cliente con poco espacio y sin instalación eléctrica dedicada: ¿qué colección explorar?", type: "MULTIPLE_CHOICE", options: ["Highlife", "Freeflow", "Limelight", "Vigor"], correctAnswer: 1, explanation: "Freeflow es plug-and-play a 110V." },
          { question: "¿Qué modelo tiene más jets en Highlife y cuál en Limelight?", type: "MULTIPLE_CHOICE", options: ["Grandee y Pulse", "Envoy (55) y Prism (73)", "Aria y Flair", "Jetsetter y Beam"], correctAnswer: 1, explanation: "Envoy 55 jets · Prism 73 jets." },
          { question: "¿Qué preguntas haces primero para reducir opciones dentro de una colección?", type: "MULTIPLE_CHOICE", options: ["El color favorito", "Cuántas personas y cuánto espacio disponible", "La marca del carro", "Nada, muestras todo"], correctAnswer: 1, explanation: "Personas + espacio reducen rápido a 2-3 modelos." },
        ],
      },
    },

    // ===== MÓDULO 3 — Hidroterapia =====
    {
      title: "Hidroterapia (el gran diferenciador)",
      lecciones: [
        {
          title: "Qué es la hidroterapia y por qué es nuestro mejor argumento",
          durationMin: 8,
          blocks: [
            p("La hidroterapia es el corazón de la propuesta de valor de HotSpring y probablemente el argumento más poderoso para diferenciarte de la competencia. La diferencia no está en “tener muchos jets”, sino en dónde y cómo están puestos. Los jets están ubicados con precisión para tratar los grupos musculares que más tensión acumulan: cuello, hombros, espalda, pantorrillas y pies. Cada asiento ofrece un masaje distinto: el usuario cambia de asiento y cambia de experiencia."),
            p("Un dato clave: en muchos modelos la potencia se puede dirigir y ajustar (sistemas SmartJet y Comfort Control), y las bombas de jets WaveMaster solo se activan cuando el usuario enciende los jets, lo que suma eficiencia."),
            video(VIDEO_HIGHLIFE),
            info("Resumen del video (Introducción Highlife, en inglés): recorre la experiencia Highlife —diseño, hidroterapia y el jet Moto-Massage DX—. Puntos clave en español: masaje diferenciado por asiento, ubicación precisa de los jets y el Moto-Massage DX exclusivo de Highlife."),
            tip("Cómo usarlo con el cliente: cuando se siente en el spa del showroom, guíalo. “Este asiento trabaja la espalda alta, este otro las pantorrillas.” El objetivo es que sienta el masaje diferenciado, no que memorice nombres."),
            video("https://vimeo.com/840642989/b0683b92b3"),
            info("Resumen del video (oficial, en inglés): “¿Por qué menos jets?” — explica que lo que importa es la ubicación y la potencia bien dirigida, no la cantidad de jets. Justo el argumento de esta lección."),
          ],
        },
        {
          title: "Los jets de la colección Highlife",
          durationMin: 7,
          blocks: [
            p("La mayor variedad: ocho clases de jets que crean masajes diferenciados."),
            list([
              "Moto-Massage DX — el jet estrella y exclusivo de Highlife. Diseño patentado que lanza dos corrientes de agua que recorren la espalda de arriba a abajo, un masaje único. En modelos de bomba dual: Envoy, Grandee, Aria y Vanguard.",
              "Footstream — el jet más grande de la colección; corriente amplia y potente para pies y piernas.",
              "SoothingStream — masaje pulsante para músculos superiores de la espalda y hombros.",
              "Hidromasaje Rotary — remolino vigorizante para músculos superiores e inferiores de la espalda.",
              "Directional — corriente potente y ajustable para masaje profundo donde el usuario lo necesite.",
              "HydroStream — corriente vigorosa y ajustable para espalda baja y cadera.",
              "Precision y Precision Rotary — jets compactos que trabajan en grupo para cuello, hombros, manos, muñecas y codos.",
            ]),
            video("https://vimeo.com/839911168/ed78339154"),
            info("Resumen del video (oficial, en inglés): “¿Por qué el Moto-Massage?” — muestra en acción el jet estrella de Highlife: dos corrientes que recorren la espalda de arriba a abajo. Tu mejor demostración del diferencial premium."),
          ],
        },
        {
          title: "Los jets de Limelight y Hot Spot",
          durationMin: 6,
          blocks: [
            list([
              "Limelight: carátulas de acero inoxidable cepillado con cuerpos Harbor Grey. Tres familias —XL (los más grandes y potentes), Estándar (masaje relajante) y Precision (compactos en grupo)—, cada una en Direccional, Rotary Sencillo y Dual Rotary. La mayoría ajustables al frente.",
              "Hot Spot: cuerpos gris charcoal con carátulas de acero inoxidable. Seis tipos: Moto-Massage (solo en SX y TX), Directional, Directional XL, Rotary, Rotary XL y Precision. Relay y Rhythm tienen 40 jets, incluidos jets para los reposapiés.",
            ]),
            tip("Adapta el discurso a la colección: en Highlife el Moto-Massage DX es la joya de la corona; en Limelight, el estilo de las carátulas y los jets XL; en Hot Spot, hidroterapia HotSpring de verdad aun con precio de entrada."),
            h("Puntos clave"),
            list([
              "El diferenciador no es la cantidad de jets, sino su ubicación precisa por grupo muscular.",
              "Moto-Massage DX = exclusivo de Highlife. Es tu argumento estrella premium.",
              "Cada asiento ofrece un masaje distinto; el usuario personaliza su experiencia.",
              "SmartJet y Comfort Control permiten dirigir y ajustar la potencia.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Hidroterapia",
        description: "El diferenciador de HotSpring y los jets por colección.",
        timeLimitMin: 10,
        questions: [
          { question: "¿Cuál es el verdadero diferenciador de la hidroterapia HotSpring?", type: "MULTIPLE_CHOICE", options: ["Tener muchos jets", "La ubicación precisa de los jets por grupo muscular", "El color de las carátulas", "El tamaño del casco"], correctAnswer: 1, explanation: "No es la cantidad, sino dónde y cómo están puestos los jets." },
          { question: "¿Qué jet es exclusivo de Highlife y qué hace?", type: "MULTIPLE_CHOICE", options: ["Footstream: masajea los pies", "Moto-Massage DX: dos corrientes que recorren la espalda de arriba a abajo", "Precision: cuello y manos", "Rotary: remolino"], correctAnswer: 1, explanation: "El Moto-Massage DX es el jet estrella, exclusivo de Highlife." },
          { question: "¿En qué modelos de Hot Spot aparece el jet Moto-Massage?", type: "MULTIPLE_CHOICE", options: ["Relay y Rhythm", "SX y TX", "Propel y Stride", "En todos"], correctAnswer: 1, explanation: "En Hot Spot, el Moto-Massage está solo en SX y TX." },
          { question: "¿Para qué sirven SmartJet y Comfort Control?", type: "MULTIPLE_CHOICE", options: ["Cambiar la música", "Dirigir y ajustar la potencia/intensidad del masaje", "Encender la luz", "Filtrar el agua"], correctAnswer: 1, explanation: "Permiten centralizar, dirigir y ajustar la presión del masaje." },
        ],
      },
    },

    // ===== MÓDULO 4 — Eficiencia energética =====
    {
      title: "Eficiencia energética = ahorro",
      lecciones: [
        {
          title: "El sistema Energy Smart",
          durationMin: 6,
          blocks: [
            p("Los spas HotSpring están diseñados para ser los más eficientes del mercado; cada modelo está certificado por la Comisión de Energía de California (CEC) y por la norma APSP 14. Recortar aislamiento es fácil para un fabricante, pero quien paga la cuenta de la luz es el cliente. HotSpring hace lo contrario: su eficiencia nace del sistema Energy Smart, que combina aislamiento, bomba(s) de jets, bomba de circulación SilentFlo 5000, calentador No-Fault, modo ahorro y cubierta térmica."),
            info("Por qué importa en la venta: el cliente premium valora no llevarse sorpresas en la factura. La eficiencia es tranquilidad y un diferencial real frente a marcas que ahorran en aislamiento."),
            video(VIDEO_FILTRACION),
            info("Resumen del video (Filtración 100% sin desviación, en inglés): explica que toda el agua pasa por el filtro antes de volver al spa → agua más limpia y filtros que duran más. Se profundiza en el Curso de Postventa."),
            video("https://vimeo.com/843355683/e92cd30c7a"),
            info("Resumen del video (oficial, en inglés): “¿Por qué nuestro sistema de eficiencia energética?” — resume cómo el aislamiento, la bomba de circulación y la cubierta mantienen el spa caliente con bajo consumo. Refuerza el argumento del ahorro."),
          ],
        },
        {
          title: "Aislamiento por colección y el argumento FiberCor",
          durationMin: 8,
          blocks: [
            h("Aislamiento por colección"),
            list([
              "Highlife: varias capas de espuma de poliuretano de distintas densidades (soporte estructural, aislamiento del casco, retención de temperatura) + base de ABS de alta resistencia que impide insectos y humedad.",
              "Limelight y Hot Spot: aislamiento FiberCor a 32 kg/m³ — cuatro veces más denso que la espuma de 8 kg/m³ de muchos spas. Reutilizable y con 25% de material reciclado.",
            ]),
            h("El argumento FiberCor (para Limelight y Hot Spot)"),
            p("FiberCor es un aislamiento nuevo en la industria, un material similar a la lana que no está hecho a base de petróleo. Por su empaque suelto se aísla con mayor densidad (4× la espuma típica) y se dispersa de forma uniforme, llenando vacíos, y cumple los requisitos CEC. Ventaja de servicio: como no se endurece, si hay una fuga el agua se filtra hacia abajo, se aspira, se accede a la reparación y se rellena a mano → reparaciones simples y económicas."),
            warn("Uso interno: el guión FiberCor del fabricante es material confidencial (no se distribuye como descarga). Usa este argumento solo cuando el cliente ya esté decidido por Limelight o Hot Spot."),
          ],
        },
        {
          title: "Los demás componentes Energy Smart",
          durationMin: 6,
          blocks: [
            list([
              "Bomba de circulación SilentFlo 5000: filtra y circula el agua 24 h de forma silenciosa (más de 19.000 L/día) con un consumo inferior al de una bombilla de 40 W. ~80% de esa energía se transfiere al agua como calor → menos trabajo del calentador.",
              "Calentador No-Fault: elimina casi todos los fallos por químicos del agua (que muchas veces no cubre la garantía). Resiste la corrosión, dura más y maximiza la transferencia de calor.",
              "Modo ahorro de energía: desactiva la calefacción en horas pico de tarifa; se programan dos periodos de hasta 6 horas.",
              "Bombas de jets WaveMaster: solo se activan cuando los jets están en uso.",
              "Cubierta con aislamiento térmico WeatherPro: a la medida, con junta hermética en la bisagra para que no se escape el calor.",
            ]),
            h("Puntos clave"),
            list([
              "Todos los modelos están certificados CEC y APSP 14.",
              "Highlife = espuma multicapa + base ABS; Limelight/Hot Spot = FiberCor (4× más denso, 25% reciclado).",
              "SilentFlo 5000 consume menos que una bombilla de 40 W y ~80% se vuelve calor.",
              "Eficiencia = menor costo de propiedad = tranquilidad para el cliente.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Eficiencia energética",
        description: "Energy Smart, aislamiento y componentes.",
        timeLimitMin: 10,
        questions: [
          { question: "¿Qué certificaciones de eficiencia tienen los spas HotSpring?", type: "MULTIPLE_CHOICE", options: ["ISO 9001", "CEC de California y APSP 14", "FDA", "RETIE"], correctAnswer: 1, explanation: "Certificados CEC (California) y APSP 14." },
          { question: "¿Qué colecciones usan aislamiento FiberCor?", type: "MULTIPLE_CHOICE", options: ["Highlife y Vigor", "Limelight y Hot Spot", "Freeflow", "Todas"], correctAnswer: 1, explanation: "FiberCor está en Limelight y Hot Spot." },
          { question: "¿Cuánto consume la bomba de circulación SilentFlo 5000?", type: "MULTIPLE_CHOICE", options: ["Como un aire acondicionado", "Menos que una bombilla de 40 W", "1 kW por hora", "No consume"], correctAnswer: 1, explanation: "Menos que una bombilla de 40 W; ~80% se vuelve calor." },
          { question: "Una ventaja de reparación del FiberCor es…", type: "TRUE_FALSE", options: ["Verdadero: no se endurece, el agua se filtra, se aspira y se rellena a mano", "Falso"], correctAnswer: 0, explanation: "Al no endurecerse, la reparación es simple y económica." },
        ],
      },
    },

    // ===== MÓDULO 5 — Experiencia sensorial =====
    {
      title: "Experiencia sensorial",
      lecciones: [
        {
          title: "El spa apela a los sentidos",
          durationMin: 5,
          blocks: [
            p("Los spas HotSpring crean un entorno calmante y envolvente con iluminación de colores, cascadas de agua y sonido. Para Ambiente Azul esto es clave: conectamos agua–bienestar–emoción, y estos elementos son los que hacen que el cliente se enamore del spa en el showroom."),
          ],
        },
        {
          title: "Iluminación, cascadas y audio por colección",
          durationMin: 7,
          blocks: [
            h("Iluminación y cascadas"),
            list([
              "Highlife — Luminescence (4 zonas): iluminación acuática (y de los jets Moto-Massage), barra superior, reposacabezas e iluminación BellaFontana. Control de color por zona + cascada BellaFontana (tres arcos de agua retroiluminados).",
              "Limelight — Raio: múltiples puntos de luz en tres tamaños, seis colores, brillo y ciclo de color, barras LED en las esquinas. Cascada Vidro retroiluminada.",
              "Hot Spot: puntos LED interiores multicolor; iluminación exterior en Relay, Rhythm, Propel y Stride; cascada de agua en Rhythm, Relay y Propel (en Hot Spot la cascada NO es iluminada).",
            ]),
            h("Audio inalámbrico"),
            p("Sistema de audio Bluetooth: opción para Highlife, Limelight y Hot Spot (de fábrica en Relay, Rhythm y Propel de Hot Spot). Muestra título y artista en el panel y admite subwoofer opcional para mejor calidad (no disponible en Jetsetter LX ni Jetsetter)."),
            video("https://vimeo.com/840643638/c324d5a25b"),
            info("Resumen del video (oficial, en inglés): “¿Por qué la luz del logo Hot Spring?” — muestra cómo la iluminación exterior del logo y del spa crean ambiente. Un detalle sensorial que enamora en la demostración nocturna."),
            tip("La experiencia sensorial se demuestra, no se explica. En el showroom, enciende la iluminación, activa la cascada, pon música. Deja que el cliente imagine su noche: la luz, el sonido del agua, la música. Ese momento vende más que cualquier ficha."),
            h("Puntos clave"),
            list([
              "Highlife = Luminescence 4 zonas + BellaFontana; Limelight = Raio + Vidro; Hot Spot = LED + cascada no iluminada.",
              "Audio Bluetooth en las tres colecciones (de fábrica en algunos Hot Spot); subwoofer opcional.",
              "La venta sensorial se vive en el showroom.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Experiencia sensorial",
        description: "Luz, agua y sonido por colección.",
        timeLimitMin: 8,
        questions: [
          { question: "¿Cómo se llama el sistema de iluminación de Highlife y cuántas zonas tiene?", type: "MULTIPLE_CHOICE", options: ["Raio, 3 zonas", "Luminescence, 4 zonas", "Vidro, 2 zonas", "BellaFontana, 6 zonas"], correctAnswer: 1, explanation: "Luminescence, 4 zonas (+ cascada BellaFontana)." },
          { question: "¿La cascada de Hot Spot es iluminada?", type: "TRUE_FALSE", options: ["Verdadero", "Falso"], correctAnswer: 1, explanation: "En Hot Spot la cascada NO es iluminada." },
          { question: "¿En qué modelos NO está disponible el subwoofer?", type: "MULTIPLE_CHOICE", options: ["Grandee y Envoy", "Jetsetter LX y Jetsetter", "Prism y Pulse", "Relay y Rhythm"], correctAnswer: 1, explanation: "No disponible en Jetsetter LX ni Jetsetter." },
        ],
      },
    },

    // ===== MÓDULO 6 — Bienestar y baño frío Vigor =====
    {
      title: "Bienestar y baño frío Vigor",
      lecciones: [
        {
          title: "El baño frío Vigor y la ciencia del frío",
          durationMin: 7,
          blocks: [
            p("Vigor es el baño frío (cold plunge) de HotSpring, con la misma ingeniería y calidad de la colección Highlife. La inmersión en agua fría revitaliza el cuerpo, agudiza la concentración y mejora el estado de ánimo. Incorporado a una rutina de bienestar, mejora la energía, refuerza el sistema inmune y desarrolla resiliencia."),
            p("La exposición regular al frío mejora la resistencia al estrés (entrena al sistema nervioso a mantener la calma bajo presión, reduciendo con el tiempo la ansiedad de base). Para deportistas y personas activas, reduce dolores musculares e inflamación —baja la temperatura de los tejidos y disminuye las citoquinas proinflamatorias— para una recuperación más rápida."),
          ],
        },
        {
          title: "Terapia de contraste (calor + frío): la venta cruzada",
          durationMin: 7,
          blocks: [
            p("Aquí está la oportunidad comercial más potente. La terapia de contraste alterna agua caliente y fría para estimular la circulación: el calor dilata los vasos y relaja los músculos; el frío los contrae y libera norepinefrina (mayor enfoque); alternar abre y cierra los vasos repetidamente, acelerando la circulación."),
            info("Protocolo recomendado: fase caliente 3–5 min → fase fría 30–60 seg → repetir 3–4 ciclos, terminando siempre en frío. Ejemplo: 4 min en el spa → 45 seg en el plunge → repetir 3 veces."),
            tip("El spa relaja; el Vigor energiza. Juntos crean un ritual de recuperación diario que transforma el patio en un retiro de bienestar. Cuando un cliente compra un spa, plantéale el Vigor: no es “otro producto”, es completar la experiencia."),
            h("Puntos clave"),
            list([
              "Vigor: recuperación, energía, ánimo, inmunidad, resiliencia.",
              "Terapia de contraste: 3–5 min calor / 30–60 seg frío, 3–4 ciclos, terminar en frío.",
              "El Vigor es la venta cruzada natural de cualquier spa.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Bienestar y Vigor",
        description: "Beneficios del frío y terapia de contraste.",
        timeLimitMin: 8,
        questions: [
          { question: "Menciona un beneficio del baño frío.", type: "MULTIPLE_CHOICE", options: ["Reduce inflamación y dolor muscular / mejora concentración e inmunidad", "Broncea la piel", "Reemplaza el ejercicio", "Cura enfermedades"], correctAnswer: 0, explanation: "Recuperación, menos inflamación, más enfoque, inmunidad y resiliencia." },
          { question: "El protocolo básico de terapia de contraste es…", type: "MULTIPLE_CHOICE", options: ["Solo frío 10 min", "3–5 min calor / 30–60 seg frío, 3–4 ciclos, terminar en frío", "Solo calor 30 min", "1 hora alternando sin orden"], correctAnswer: 1, explanation: "Ciclos calor→frío, terminando en frío." },
          { question: "En el discurso de venta, el spa y el Vigor se complementan porque…", type: "MULTIPLE_CHOICE", options: ["Son lo mismo", "El spa relaja y el Vigor energiza; juntos son un ritual de recuperación", "El Vigor reemplaza al spa", "No se relacionan"], correctAnswer: 1, explanation: "Venta cruzada natural: relajación + energía." },
        ],
      },
    },

    // ===== MÓDULO 7 — Requisitos de instalación =====
    {
      title: "Requisitos de instalación",
      lecciones: [
        {
          title: "Los dos mundos eléctricos (clave para Colombia)",
          durationMin: 7,
          blocks: [
            p("Existen dos tipos de instalación muy distintos, y confundirlos genera problemas:"),
            list([
              "Plug-and-play (110/115V): circuito dedicado de 15–20 A con protección GFCI. Instalación sencilla, sin obra eléctrica mayor. Aplica a: Jetsetter, Prism (convertible), Hot Spot (Pace, Stride, SX, TX) y toda la línea Freeflow.",
              "Instalación fija (230V, disyuntor de 50 A): requiere electricista autorizado, subpanel con disyuntores GFCI (incluido con el spa), cableado de cobre y acometida de cuatro hilos. Es un proyecto de instalación. Aplica a: Highlife premium, Limelight y los Hot Spot Relay y Rhythm.",
            ]),
            warn("Nuestra red en Colombia es 110/220 V a 60 Hz. Para los datos eléctricos exactos de cada modelo usa siempre las guías de preinstalación (60 Hz), no la guía de producto (que es 50 Hz)."),
          ],
        },
        {
          title: "Suelo, acceso, entrega y seguridad",
          durationMin: 7,
          blocks: [
            h("Preparación del suelo"),
            p("El spa va sobre una superficie nivelada y sólida. En exterior se requiere una losa de hormigón reforzado de al menos 4 pulgadas (10 cm). Modelos como Grandee y Envoy la exigen. No se permiten calzas ni apoyos improvisados: un spa lleno pesa mucho y debe quedar perfectamente nivelado. Los cimientos son responsabilidad del propietario y el asesor debe verificarlos antes de la entrega."),
            h("Acceso, permisos y seguridad"),
            list([
              "Acceso para la entrega: mide el spa en posición vertical y verifica que quepa por puertas, pasillos y accesos. A veces se requiere grúa.",
              "Permisos: muchas ciudades exigen permiso para el circuito eléctrico.",
              "Seguridad: se recomienda barrera para evitar el acceso de niños menores de 5 años. Deja acceso libre al compartimiento del equipo y nunca permitas que el agua entre al subpanel o a la toma.",
            ]),
            warn("⚠️ Extraer o desactivar el disyuntor GFCI anula la garantía."),
            p("Guías de preinstalación oficiales (60 Hz) — descárgalas para revisar los requisitos eléctricos, de suelo y de acceso de cada colección:"),
            pdf(DRIVE.preHighlife, "Preinstalación Highlife (español, 60 Hz)"),
            pdf(DRIVE.preLimelight, "Preinstalación Limelight (español, 60 Hz)"),
            pdf(DRIVE.preHotSpot, "Preinstalación Hot Spot (español, 60 Hz)"),
            pdf(DRIVE.preFreeflow, "Preinstalación Freeflow (60 Hz)"),
            tip("Antes de cerrar, haz una mini-lista del sitio: ¿base de hormigón nivelada?, ¿punto eléctrico adecuado (110 V o 230 V según el modelo)?, ¿cabe por el acceso?, ¿espacio para el elevador de cubierta? Anticiparlo evita clientes molestos y sobrecostos."),
            h("Puntos clave"),
            list([
              "Plug-and-play (110 V, 15–20 A) vs instalación fija (230 V, 50 A). Freeflow y Hot Spot pequeños = plug-and-play; premium = proyecto.",
              "Base de hormigón reforzado ≥ 10 cm, nivelada.",
              "Verificar acceso, permisos y barrera de seguridad para niños.",
              "Quitar el GFCI anula la garantía. Datos eléctricos: usar guías 60 Hz.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Requisitos de instalación",
        description: "Eléctrico, suelo, acceso y seguridad.",
        timeLimitMin: 10,
        questions: [
          { question: "¿Qué colección es siempre plug-and-play?", type: "MULTIPLE_CHOICE", options: ["Highlife", "Freeflow", "Limelight", "Ninguna"], correctAnswer: 1, explanation: "Toda la línea Freeflow es plug-and-play a 110V." },
          { question: "¿Qué base se requiere para instalación en exterior?", type: "MULTIPLE_CHOICE", options: ["Tierra apisonada", "Losa de hormigón reforzado de al menos 10 cm, nivelada", "Baldosa suelta", "No requiere base"], correctAnswer: 1, explanation: "Losa reforzada ≥ 10 cm, perfectamente nivelada." },
          { question: "¿Qué acción anula la garantía en la instalación eléctrica?", type: "MULTIPLE_CHOICE", options: ["Usar 110V", "Extraer o desactivar el disyuntor GFCI", "Poner el spa en exterior", "Usar cubierta"], correctAnswer: 1, explanation: "Quitar/desactivar el GFCI anula la garantía." },
          { question: "Para los datos eléctricos exactos se usan las guías de 60 Hz, no la guía de producto 50 Hz.", type: "TRUE_FALSE", options: ["Verdadero", "Falso"], correctAnswer: 0, explanation: "La red en Colombia es 60 Hz; los eléctricos van por las guías de preinstalación 60 Hz." },
        ],
      },
    },

    // ===== MÓDULO 8 — Cómo elegir el spa correcto =====
    {
      title: "Cómo elegir el spa correcto",
      lecciones: [
        {
          title: "Las cinco preguntas de calificación",
          durationMin: 6,
          blocks: [
            p("Antes de mostrar modelos, califica al cliente con cinco preguntas:"),
            list([
              "¿Quién lo usará y con qué frecuencia? (define capacidad y gama)",
              "¿Busca relajación ligera o hidroterapia real? (define colección y jets)",
              "¿Lo usará todo el año o solo en meses cálidos? (define aislamiento/eficiencia)",
              "¿Cuánto tiempo quiere dedicarle al cuidado del agua? (define sistema de agua)",
              "¿Necesitará servicio técnico local? (aquí ganamos: somos representante autorizado)",
            ]),
          ],
        },
        {
          title: "Perfilar, recomendar y venta cruzada",
          durationMin: 7,
          blocks: [
            p("Con las respuestas cruza cuatro variables: espacio disponible, número de personas, presupuesto y uso (bienestar / terapia / social). Eso te lleva a una colección y a dos o tres modelos."),
            list([
              "Señales de modelo permanente (230 V): uso diario como rutina, clima frío / todo el año, hidroterapia real y recuperación, inversión de largo plazo.",
              "Señales de plug-and-play (Freeflow): primer spa, uso ocasional, espacio o instalación limitados, presupuesto ajustado.",
            ]),
            h("Venta cruzada Ambiente Azul ↔ DOM"),
            p("Un proyecto de spa muchas veces viene con un proyecto de espacio: terraza, zona húmeda, acabados. Ahí Ambiente Azul y DOM Design se complementan —enchapes, porcelanatos y piedra para la terraza y la zona del spa—. Y dentro de AA, el mismo cliente puede necesitar piscina, sauna o turco. Detecta esas oportunidades y conéctalas."),
            tip("No abrumes con el catálogo completo. Califica, reduce a dos o tres opciones y haz una recomendación clara. El cliente premium valora al asesor que le simplifica la decisión."),
            h("Puntos clave"),
            list([
              "Cinco preguntas → colección; cuatro variables (espacio, personas, presupuesto, uso) → modelo.",
              "Uso diario / clima frío / hidroterapia real / largo plazo → permanente. Primer spa / ocasional / limitaciones → Freeflow.",
              "Venta cruzada con DOM y con otras líneas de AA (piscina, sauna, turco).",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Cómo elegir el spa",
        description: "Calificar al cliente y recomendar.",
        timeLimitMin: 8,
        questions: [
          { question: "¿Cuál NO es una de las cinco preguntas de calificación?", type: "MULTIPLE_CHOICE", options: ["¿Quién lo usará y con qué frecuencia?", "¿De qué color es su casa?", "¿Relajación ligera o hidroterapia real?", "¿Necesitará servicio técnico local?"], correctAnswer: 1, explanation: "El color de la casa no califica; las cinco son uso, tipo de terapia, estacionalidad, mantenimiento y servicio." },
          { question: "Una señal de que el cliente necesita un modelo permanente (230V) es…", type: "MULTIPLE_CHOICE", options: ["Primer spa y uso ocasional", "Uso diario, clima frío, hidroterapia real, largo plazo", "Presupuesto ajustado", "Espacio muy limitado"], correctAnswer: 1, explanation: "Uso intensivo y de largo plazo apunta a un permanente." },
          { question: "¿Con qué marca hermana se hace venta cruzada en acabados?", type: "MULTIPLE_CHOICE", options: ["DOM Design", "Un proveedor externo", "Otra marca de spas", "Ninguna"], correctAnswer: 0, explanation: "DOM Design (enchapes, porcelanatos, piedra) para la terraza/zona del spa." },
        ],
      },
    },

    // ===== MÓDULO 9 — Argumentos, objeciones y ventajas =====
    {
      title: "Argumentos, objeciones y ventajas",
      lecciones: [
        {
          title: "Las cinco ventajas HotSpring",
          durationMin: 6,
          blocks: [
            list([
              "Masaje superior: más de 40 años perfeccionando el masaje con agua caliente.",
              "Cuidado del agua simplificado: tecnologías que reducen mucho el tiempo de mantenimiento (Curso de Postventa).",
              "Eficiencia energética: Energy Smart mantiene el spa caliente y listo controlando los costos.",
              "Confianza de marca: “The Brand You Can Trust” — calidad y servicio respaldados por décadas.",
              "Experiencias reales: testimonios de propietarios satisfechos que validan la propuesta.",
            ]),
            video("https://vimeo.com/839910898/df2c47f72b"),
            info("Resumen del video (oficial, en inglés): “¿Por qué la sal FreshWater?” — explica el cuidado del agua salina: agua más suave, sin olor y con menos mantenimiento. Apoya la ventaja del “cuidado del agua simplificado”."),
          ],
        },
        {
          title: "Manejo de objeciones y la postventa como argumento",
          durationMin: 7,
          blocks: [
            h("Objeciones frecuentes"),
            table(
              ["Objeción del cliente", "Cómo responder"],
              [
                ["“Está caro / lo veo más barato en internet”", "Lleva la conversación al respaldo: representante exclusivo, repuestos originales, servicio técnico propio y garantía. Comprar barato sin respaldo sale caro."],
                ["“¿Cuánto me va a costar la luz / el mantenimiento?”", "Energy Smart + cuidado del agua simplificado: el costo de propiedad es bajo y predecible."],
                ["“¿Y si tiene una fuga? Oí que los full-foam son difíciles de reparar”", "Ventaja del FiberCor (Limelight/Hot Spot): no es espuma, no se endurece; el agua se filtra, se aspira, se accede y se rellena a mano. (Solo saca el tema si el cliente lo trae.)"],
              ],
            ),
            p("La postventa como argumento: un distribuidor autorizado entiende de instalación, sistemas de agua y da soporte de por vida. Las grandes superficies venden productos; nosotros acompañamos la experiencia de propiedad. Garantía, repuestos y servicio propio son parte del valor que se paga — y un argumento de venta, no un costo."),
            video("https://vimeo.com/840652178/84cfbaf95a"),
            info("Resumen del video (oficial, en inglés): “¿Por qué vale la pena un Hot Spring?” — justifica la inversión frente al precio. Úsalo para la objeción “está caro”."),
            video("https://vimeo.com/840643386/da7607b21c"),
            info("Resumen del video (oficial, en inglés): “¿Por qué tu distribuidor local?” — el valor del respaldo autorizado (servicio, repuestos, garantía). Ideal para la objeción de comprar por internet."),
            warn("Regla de oro: nunca denigres a la competencia. Diferénciate por valor, no por atacar."),
            h("Puntos clave"),
            list([
              "Cinco ventajas: masaje, agua fácil, eficiencia, confianza, testimonios.",
              "Objeción de precio → respaldo. Objeción de fuga → FiberCor. Objeción de costo → Energy Smart.",
              "La postventa/servicio propio es argumento de venta.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Argumentos y objeciones",
        description: "Ventajas y manejo de objeciones.",
        timeLimitMin: 8,
        questions: [
          { question: "¿Cuál es una de las cinco ventajas HotSpring?", type: "MULTIPLE_CHOICE", options: ["El precio más bajo del mercado", "Masaje superior / eficiencia / confianza de marca", "Envío gratis siempre", "Garantía ilimitada"], correctAnswer: 1, explanation: "Masaje, agua simplificada, eficiencia, confianza y testimonios." },
          { question: "¿Cómo respondes a la objeción de precio frente a una compra por internet?", type: "MULTIPLE_CHOICE", options: ["Bajando el precio", "Con el respaldo: representante exclusivo, repuestos, servicio y garantía", "Ignorando al cliente", "Denigrando la otra opción"], correctAnswer: 1, explanation: "El respaldo local es el diferencial; comprar sin soporte sale caro." },
          { question: "¿Cuál es la regla de oro con la competencia?", type: "MULTIPLE_CHOICE", options: ["Atacarla siempre", "No denigrarla; diferenciarse por valor", "Copiar sus precios", "Hablar mal de ella al cliente"], correctAnswer: 1, explanation: "Diferénciate por valor, nunca denigrando." },
        ],
      },
    },

    // ===== MÓDULO 10 — Seguridad de uso =====
    {
      title: "Seguridad de uso del spa",
      lecciones: [
        {
          title: "Seguridad de uso del spa (orientación al cliente)",
          durationMin: 7,
          blocks: [
            p("Parte de una buena venta y entrega es enseñarle al cliente a usar el spa con seguridad. Estas son recomendaciones generales de uso; los límites exactos y las advertencias del modelo específico están en el manual del equipo — remítete siempre a él."),
            h("Temperatura y tiempo"),
            list([
              "Temperatura del agua: el máximo recomendado por la industria para adultos sanos es 40 °C (104 °F). Para niños y uso prolongado, más baja.",
              "Tiempo de inmersión: sesiones de 15–20 minutos. Salir de inmediato si aparece mareo, somnolencia o malestar.",
              "Hidratarse antes y después; el calor del agua deshidrata.",
            ]),
            h("Quién debe tener precaución"),
            list([
              "Embarazo: consultar al médico antes de usar; el agua muy caliente puede ser riesgosa.",
              "Condiciones médicas (corazón, presión, diabetes, circulación): consultar al médico antes de usar.",
              "Niños: supervisión permanente, nunca solos, con temperatura más baja y menos tiempo.",
              "Nunca usar el spa bajo efectos de alcohol o medicamentos que den sueño.",
            ]),
            h("Seguridad física"),
            list([
              "Entrar y salir con cuidado (superficies húmedas): usar pasamanos o escalones.",
              "Mantener la cubierta puesta y con seguro cuando el spa no se usa: previene accesos de niños y accidentes.",
              "Nunca manipular la caja de control ni el sistema eléctrico con el spa energizado.",
            ]),
            tip("Cómo usarlo con el cliente: en la entrega, dedícale 5 minutos a repasar estos puntos. Un cliente que usa bien el spa disfruta más, tiene menos incidentes y menos quejas."),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Seguridad de uso",
        description: "Recomendaciones de uso seguro del spa.",
        timeLimitMin: 6,
        questions: [
          { question: "¿Cuál es la temperatura máxima del agua recomendada por la industria para adultos sanos?", type: "MULTIPLE_CHOICE", options: ["45 °C", "40 °C (104 °F)", "50 °C", "No hay límite"], correctAnswer: 1, explanation: "El máximo recomendado es 40 °C (104 °F); más baja para niños y uso prolongado." },
          { question: "Una persona embarazada o con una condición médica debe…", type: "MULTIPLE_CHOICE", options: ["Usarlo sin restricción", "Consultar al médico antes de usar el spa", "Subir la temperatura", "Usarlo solo de noche"], correctAnswer: 1, explanation: "Embarazo y condiciones médicas: consultar al médico antes de usar." },
          { question: "Cuando el spa no se usa, la cubierta debe quedar puesta y con seguro.", type: "TRUE_FALSE", options: ["Verdadero", "Falso"], correctAnswer: 0, explanation: "Previene el acceso de niños y accidentes, además de conservar el calor." },
        ],
      },
    },

    // ===== MÓDULO 11 — Evaluación y certificación =====
    {
      title: "Evaluación y certificación",
      lecciones: [
        {
          title: "Cómo funciona la certificación",
          durationMin: 4,
          blocks: [
            p("El examen final integra los módulos anteriores. Al aprobarlo con la nota mínima obtienes un certificado descargable que te habilita como asesor comercial certificado en spas HotSpring."),
            info("Se recomienda recertificar una vez al año o cada vez que cambie el portafolio (nuevos modelos, cambios de colección)."),
            tip("Consejo: si fallas una pregunta, vuelve al módulo correspondiente, repásalo y reintenta. El objetivo es que domines el producto para asesorar con seguridad."),
          ],
        },
      ],
      examen: {
        title: "Examen final — Comercial HotSpring",
        description: "Integra todos los módulos. Aprueba para certificarte.",
        timeLimitMin: 25,
        questions: [
          { question: "Los tres elementos terapéuticos del spa son…", type: "MULTIPLE_CHOICE", options: ["Calor, flotación e hidroterapia", "Sal, ozono y UV", "Luz, sonido y aroma", "Cloro, filtro y bomba"], correctAnswer: 0, explanation: "Calor + flotación + hidroterapia." },
          { question: "Orden correcto de gama (menor a mayor):", type: "MULTIPLE_CHOICE", options: ["Hot Spot → Limelight → Highlife", "Highlife → Limelight → Hot Spot", "Limelight → Highlife → Hot Spot", "Freeflow → Highlife → Vigor"], correctAnswer: 0, explanation: "Bueno → Mejor → Superior." },
          { question: "El jet exclusivo de Highlife es…", type: "MULTIPLE_CHOICE", options: ["Footstream", "Moto-Massage DX", "Precision", "HydroStream"], correctAnswer: 1, explanation: "Moto-Massage DX, exclusivo de Highlife." },
          { question: "¿Qué colecciones usan aislamiento FiberCor?", type: "MULTIPLE_CHOICE", options: ["Highlife y Vigor", "Limelight y Hot Spot", "Solo Freeflow", "Todas"], correctAnswer: 1, explanation: "Limelight y Hot Spot." },
          { question: "Cliente sin instalación eléctrica dedicada y primer spa: recomiendas…", type: "MULTIPLE_CHOICE", options: ["Grandee", "Freeflow", "Prism", "Envoy"], correctAnswer: 1, explanation: "Freeflow, plug-and-play 110V." },
          { question: "Base requerida en exterior:", type: "MULTIPLE_CHOICE", options: ["Losa de hormigón reforzado ≥ 10 cm, nivelada", "Césped", "Arena", "Ninguna"], correctAnswer: 0, explanation: "Losa reforzada ≥ 10 cm." },
          { question: "Quitar el disyuntor GFCI…", type: "MULTIPLE_CHOICE", options: ["Ahorra energía", "Anula la garantía", "Mejora el masaje", "No pasa nada"], correctAnswer: 1, explanation: "Anula la garantía." },
          { question: "Protocolo de terapia de contraste:", type: "MULTIPLE_CHOICE", options: ["3–5 min calor / 30–60 seg frío, 3–4 ciclos, terminar en frío", "Solo frío 20 min", "Solo calor 1 hora", "Sin orden"], correctAnswer: 0, explanation: "Ciclos calor→frío terminando en frío." },
          { question: "Ante la objeción de precio frente a internet, respondes con…", type: "MULTIPLE_CHOICE", options: ["Un descuento", "El respaldo: exclusivo, repuestos, servicio, garantía", "Atacar la otra opción", "Nada"], correctAnswer: 1, explanation: "El respaldo local es el diferencial." },
          { question: "El Vigor se vende principalmente como…", type: "MULTIPLE_CHOICE", options: ["Reemplazo del spa", "Venta cruzada / complemento del spa (terapia de contraste)", "Piscina", "Filtro"], correctAnswer: 1, explanation: "Complemento del spa: el ritual calor + frío." },
          { question: "Regla de oro con la competencia:", type: "TRUE_FALSE", options: ["No denigrarla; diferenciarse por valor", "Atacarla siempre"], correctAnswer: 0, explanation: "Diferénciate por valor." },
          { question: "La bomba SilentFlo 5000 consume…", type: "MULTIPLE_CHOICE", options: ["Menos que una bombilla de 40 W", "Como una nevera", "1 kW/h", "Nada"], correctAnswer: 0, explanation: "Menos que una bombilla de 40 W." },
        ],
      },
    },
  ];
}

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" }, orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!admin) throw new Error("No hay un SUPER_ADMIN para asignar como autor.");

  const previo = await prisma.course.findFirst({ where: { title: CURSO_TITLE }, select: { id: true } });
  if (previo) { await prisma.course.delete({ where: { id: previo.id } }); console.log("♻️  Curso anterior eliminado; se recrea."); }

  const mods = modulos();
  const totalMin = mods.reduce((s, m) => s + m.lecciones.reduce((x, l) => x + l.durationMin, 0), 0);

  await prisma.course.create({
    data: {
      title: CURSO_TITLE,
      description: "Capacitación comercial en spas HotSpring: portafolio (Highlife, Limelight, Hot Spot, Freeflow y baño frío Vigor), hidroterapia, eficiencia, instalación, cómo elegir el spa correcto y manejo de objeciones. Para el equipo comercial de Ambiente Azul.",
      category: "PRODUCTO",
      company: "AMBIENTE_AZUL",
      status: "DRAFT",
      estimatedHours: Math.max(1, Math.round(totalMin / 60)),
      passingScore: 80,
      requiredAreas: [],
      createdBy: admin.id,
      modules: {
        create: mods.map((m, mi) => ({
          title: m.title,
          order: mi + 1,
          lessons: { create: m.lecciones.map((l, li) => ({ title: l.title, type: "MIXED", order: li + 1, durationMin: l.durationMin, content: { blocks: l.blocks } as object })) },
          exams: m.examen.questions.length
            ? { create: [{ title: m.examen.title, description: m.examen.description, passingScore: 80, maxAttempts: 3, timeLimitMin: m.examen.timeLimitMin, order: m.lecciones.length + 1, questions: { create: m.examen.questions.map((q, qi) => ({ question: q.question, type: q.type, options: q.options, correctAnswer: q.correctAnswer, points: 1, explanation: q.explanation, order: qi + 1 })) } }] }
            : undefined,
        })),
      },
    },
  });

  const lecciones = mods.reduce((s, m) => s + m.lecciones.length, 0);
  console.log(`✅ Curso "${CURSO_TITLE}" creado como BORRADOR — ${mods.length} módulos, ${lecciones} lecciones, ${totalMin} min.`);
}

main().catch((e) => { console.error("❌ Error:", e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
