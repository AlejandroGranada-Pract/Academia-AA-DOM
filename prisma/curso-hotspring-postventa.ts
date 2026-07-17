import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  h, p, list, info, tip, warn, video, table, pdf, DRIVE,
  moduloFundamentos, type Modulo,
} from "./seed-assets/hotspring-contenido";

// Crea (o REEMPLAZA) el curso "HotSpring — Postventa" como BORRADOR.
// Fuente: paquete de capacitación HotSpring (Ambiente Azul, jul-2026).

const CURSO_TITLE = "HotSpring — Postventa";
const cs = process.env.DATABASE_URL!;
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: cs,
    ...(/localhost|127\.0\.0\.1/.test(cs) ? {} : { ssl: { rejectUnauthorized: false } }),
  }),
});

const VIDEO_FILTRACION = "https://www.youtube.com/watch?v=aV1p8XBp3No";
const VIDEO_SALINO = "https://www.youtube.com/watch?v=4g2Vmu1uSdw";

// Videos how-to oficiales del canal "Hot Spring Spas" (verificados vía oEmbed).
// Están en inglés → cada uno lleva su ficha-resumen en español debajo.
const YT = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const HOWTO = {
  quimicos: YT("0FFBSLjqe1w"),   // How to Add Chemicals to Your Hot Tub
  triX: YT("7Z_-ybIDMqw"),       // How to Clean Your Hot Spring Spas Tri-X Filter
  filtro: YT("I9D8o9Rc05g"),     // How to Clean Your Hot Spring Hot Tub Filter
  coverCradle: YT("SEdymZetBy0"),// CoverCradle
  coverCradle2: YT("GaSXMzPzE60"),// CoverCradle II
  upRite: YT("DFj3g9F7mZU"),     // UpRite
  liftNGlide: YT("mkASnfkbvA0"), // Lift 'N Glide
  numeroSerie: YT("azIBrAjZJNI"),// How to Find the Serial Number
};

function modulos(): Modulo[] {
  return [
    // ===== MÓDULO 0 — Fundamentos (reutilizado del Curso Comercial) =====
    moduloFundamentos(),

    // ===== MÓDULO 1 — Cómo funciona el spa por dentro =====
    {
      title: "Cómo funciona el spa por dentro",
      lecciones: [
        {
          title: "Los cuatro sistemas del spa",
          durationMin: 7,
          blocks: [
            p("Un spa HotSpring funciona con cuatro sistemas que trabajan juntos. Entenderlos te permite diagnosticar, mantener y recomendar con criterio."),
            list([
              "Circulación y filtración: la bomba de circulación SilentFlo 5000 mueve el agua las 24 horas de forma silenciosa (más de 19.000 litros/día) y la hace pasar por los filtros. Agua limpia y temperatura estable con muy poco consumo.",
              "Calentamiento: el calentador No-Fault mantiene la temperatura; resiste la corrosión y evita fallos por químicos del agua.",
              "Hidroterapia: las bombas de jets WaveMaster dan potencia a los jets solo cuando se usan.",
              "Retención de calor: la cubierta térmica WeatherPro conserva el calor y baja el consumo.",
            ]),
          ],
        },
        {
          title: "Filtración 100% sin desviación (Highlife)",
          durationMin: 6,
          blocks: [
            p("En muchas marcas parte del agua vuelve a la bomba sin pasar por el filtro (desviación). La colección Highlife garantiza que cada gota pase por el filtro antes de volver al spa: cada bomba de jets tiene dos entradas bajo las columnas del filtro."),
            p("Esto significa agua más limpia, filtros que duran más (rotándolos como los neumáticos de un carro, duran de 3 a 5 años) y entradas más seguras. Es un argumento técnico fuerte cuando el cliente pregunta por qué el agua se mantiene tan limpia."),
            video(VIDEO_FILTRACION),
            info("Resumen del video (en inglés): muestra cómo el 100% del agua pasa por el filtro (sin desviación) → agua más limpia y filtros de mayor duración."),
          ],
        },
        {
          title: "Los controles IQ 2020",
          durationMin: 5,
          blocks: [
            p("Cada colección tiene su panel de control IQ 2020:"),
            list([
              "Highlife: panel táctil LCD a todo color (temperatura, luces, música, autolimpieza, modelo/firmware).",
              "Limelight: panel LCD a color (jets, luces, opciones, temperatura hasta 41 °C, memoria de configuraciones).",
              "Hot Spot: panel LCD monocromático de 76 mm (el más grande del segmento), botones grandes de jets y luces.",
            ]),
            h("Puntos clave"),
            list([
              "SilentFlo 5000 = circulación/filtración 24/7 y bajo consumo.",
              "No-Fault = calentador anticorrosión, sin fallos por químicos.",
              "Filtración 100% sin desviación (Highlife) = agua más limpia y filtros que duran 3–5 años.",
              "Cada colección tiene su panel IQ 2020.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Cómo funciona el spa",
        description: "Sistemas internos, filtración y controles.",
        timeLimitMin: 8,
        questions: [
          { question: "¿Qué hace la bomba SilentFlo 5000?", type: "MULTIPLE_CHOICE", options: ["Calienta el agua", "Circula y filtra el agua 24/7 con bajo consumo", "Genera cloro", "Controla las luces"], correctAnswer: 1, explanation: "Circula y filtra el agua las 24 h con muy bajo consumo." },
          { question: "¿Qué significa “filtración 100% sin desviación”?", type: "MULTIPLE_CHOICE", options: ["Que no usa filtro", "Que toda el agua pasa por el filtro antes de volver al spa", "Que el agua no se mueve", "Que filtra solo de noche"], correctAnswer: 1, explanation: "Cada gota pasa por el filtro (Highlife), sin desviación." },
          { question: "¿Cuánto duran los filtros Tri-X si se rotan bien?", type: "MULTIPLE_CHOICE", options: ["1 mes", "6 meses", "De 3 a 5 años", "10 años"], correctAnswer: 2, explanation: "Con buena rotación, de 3 a 5 años." },
        ],
      },
    },

    // ===== MÓDULO 2 — Cuidado del agua =====
    {
      title: "Cuidado del agua",
      lecciones: [
        {
          title: "Sistema Salino FreshWater (FWSS)",
          durationMin: 8,
          blocks: [
            p("El corazón del cuidado del agua. Un cartucho con electrodos de titanio trabaja con la sal disuelta para generar cloro y mantener el agua cristalina, sin químicos adicionales. El agua queda de tacto natural, sin olor y dura más tiempo."),
            list([
              "El cartucho desechable dura cuatro meses, no requiere mantenimiento, y se cambia desde la barra superior en menos de un minuto (sin desconectar cables). La pantalla avisa cuándo cambiarlo.",
              "Los cartuchos de repuesto se venden en pack de 3 = un año de cuidado del agua.",
              "Highlife trae el sistema salino de serie.",
              "Limelight y Hot Spot vienen “preparados” y requieren el kit de inicio (cartucho + bolsa de 4,5 kg de sal + controlador + tiras de prueba de 5 vías).",
              "Compatibilidad: el sistema salino es compatible con Highlife 2018+ y con Limelight.",
            ]),
            video(VIDEO_SALINO),
            info("Resumen del video (en inglés): explica el sistema salino FreshWater — cómo el cartucho genera cloro a partir de la sal y cómo se reemplaza en menos de un minuto."),
          ],
        },
        {
          title: "FreshWater IQ (monitoreo inteligente)",
          durationMin: 6,
          blocks: [
            p("Disponible en Highlife y Limelight. Combina el sistema salino con un Sensor de Monitoreo Inteligente (SMI) que analiza el agua cada hora (cloro, sal, pH) y da recomendaciones claras cuando hay que ajustar."),
            warn("No es automático: el usuario hace los ajustes; el sistema solo mide y recomienda. El SMI solo funciona si el sistema salino está operativo."),
            p("Kit de instalación: ref. 80201."),
          ],
        },
        {
          title: "Ozono FreshWater III y filtros Tri-X",
          durationMin: 6,
          blocks: [
            list([
              "Ozono FreshWater III: alternativa/opción en Limelight y Hot Spot. Usa celdas de descarga Corona para generar ozono. Importante: NO es compatible con el sistema salino ni con el SMI.",
              "Filtros Tri-X: cartuchos de gran área de filtración (6 m² cada uno). Se lavan con manguera o en el lavavajillas SIN jabón ni ciclo de secado. Durables; con rotación duran años.",
            ]),
            video(HOWTO.triX),
            info("Resumen del video (oficial, en inglés): cómo retirar y limpiar el filtro Tri-X — enjuagar con manguera (o lavavajillas sin jabón), dejar secar al aire y rotarlo para que dure más."),
            video(HOWTO.filtro),
            info("Resumen del video (oficial, en inglés): limpieza del filtro estándar del spa — retirar, enjuagar los pliegues con agua a presión y volver a colocar. Recuérdale al cliente hacerlo con la frecuencia del calendario de mantenimiento."),
          ],
        },
        {
          title: "Reglas de compatibilidad (memorizar)",
          durationMin: 6,
          blocks: [
            table(
              ["Sistema", "Highlife", "Limelight", "Hot Spot"],
              [
                ["Sistema Salino FreshWater", "De serie (2018+)", "Sí (kit inicio)", "Preparado (ozono es lo típico)"],
                ["FreshWater IQ (SMI)", "Sí", "Sí", "No"],
                ["Ozono FreshWater III", "—", "Opción", "Sí / opción"],
              ],
            ),
            warn("Regla clave: el ozono NO convive con el sistema salino ni con el SMI. Nunca ofrezcas ambos para el mismo spa."),
            h("Puntos clave"),
            list([
              "Sistema salino: cartucho 4 meses, pack de 3 = 1 año; Highlife de serie, Limelight/Hot Spot con kit.",
              "FreshWater IQ (SMI): solo Highlife y Limelight; mide y recomienda, no ajusta solo.",
              "Ozono: Limelight/Hot Spot; incompatible con salino y SMI.",
              "Filtros Tri-X: lavar sin jabón.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Cuidado del agua",
        description: "Salino, SMI, ozono y compatibilidad.",
        timeLimitMin: 10,
        questions: [
          { question: "¿Cuánto dura un cartucho del sistema salino y cómo se venden los repuestos?", type: "MULTIPLE_CHOICE", options: ["1 mes, individual", "4 meses; en pack de 3 = 1 año", "1 año, individual", "No se reemplaza"], correctAnswer: 1, explanation: "4 meses cada cartucho; pack de 3 cubre un año." },
          { question: "¿En qué colecciones está disponible FreshWater IQ (SMI)?", type: "MULTIPLE_CHOICE", options: ["Solo Highlife", "Highlife y Limelight", "Hot Spot y Freeflow", "Todas"], correctAnswer: 1, explanation: "SMI: Highlife y Limelight." },
          { question: "¿El ozono FreshWater III es compatible con el sistema salino?", type: "TRUE_FALSE", options: ["Verdadero", "Falso"], correctAnswer: 1, explanation: "No. El ozono no convive con el salino ni con el SMI." },
          { question: "¿Cómo se lavan los filtros Tri-X?", type: "MULTIPLE_CHOICE", options: ["Con jabón y agua caliente", "Con manguera o lavavajillas, sin jabón ni ciclo de secado", "Solo se reemplazan", "En la lavadora"], correctAnswer: 1, explanation: "Manguera o lavavajillas, sin jabón ni secado." },
        ],
      },
    },

    // ===== MÓDULO 3 — Dureza del agua y metales =====
    {
      title: "Dureza del agua y metales",
      lecciones: [
        {
          title: "Por qué importa la dureza",
          durationMin: 5,
          blocks: [
            p("Con el sistema salino, la dureza del agua debe mantenerse alrededor de 50 ppm para minimizar el sarro en los electrodos de titanio del cartucho (el sarro los daña y acorta su vida)."),
            info("Controlar la dureza no es opcional: protege el consumible más importante del sistema."),
          ],
        },
        {
          title: "Los productos y cuándo usarlos",
          durationMin: 6,
          blocks: [
            list([
              "Vanishing Act: eliminador de calcio para dureza entre 75 y 150 ppm.",
              "Vanishing Act XL: para spas grandes (más de 1500 litros).",
              "On-the-Go: ablandador portátil para zonas donde la dureza supera 150 ppm.",
              "Prefiltro Clean Screen: se conecta a la manguera al llenar el spa y elimina metales (cobre, hierro) y taninos, evitando manchas.",
            ]),
          ],
        },
        {
          title: "Adaptación al agua de Colombia",
          durationMin: 3,
          blocks: [
            warn("🔧 Contenido a completar por Ambiente Azul."),
            p("La dureza del agua varía por ciudad, así que la recomendación (Vanishing Act vs On-the-Go) depende de la zona. Ambiente Azul debe definir la guía local por ciudad/región."),
            h("Puntos clave"),
            list([
              "Meta: dureza ~50 ppm para proteger los electrodos.",
              "75–150 ppm → Vanishing Act (XL si >1500 L); >150 ppm → On-the-Go.",
              "Clean Screen al llenar → elimina metales y evita manchas.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Dureza y metales",
        description: "Niveles, productos y prefiltro.",
        timeLimitMin: 8,
        questions: [
          { question: "¿A qué nivel debe mantenerse la dureza con el sistema salino y por qué?", type: "MULTIPLE_CHOICE", options: ["~200 ppm, para más cloro", "~50 ppm, para minimizar sarro en los electrodos de titanio", "0 ppm", "No importa"], correctAnswer: 1, explanation: "~50 ppm protege los electrodos de titanio." },
          { question: "Si la dureza supera 150 ppm, ¿qué producto recomiendas?", type: "MULTIPLE_CHOICE", options: ["Vanishing Act", "On-the-Go", "Clean Screen solo", "Más sal"], correctAnswer: 1, explanation: "Por encima de 150 ppm: On-the-Go." },
          { question: "¿Para qué sirve el prefiltro Clean Screen?", type: "MULTIPLE_CHOICE", options: ["Calentar el agua", "Eliminar metales y taninos al llenar el spa", "Generar cloro", "Medir el pH"], correctAnswer: 1, explanation: "Elimina metales (cobre, hierro) y taninos al llenar → evita manchas." },
        ],
      },
    },

    // ===== MÓDULO 4 — Consumibles recurrentes =====
    {
      title: "Consumibles recurrentes (el corazón de la venta)",
      lecciones: [
        {
          title: "El catálogo de consumibles",
          durationMin: 6,
          blocks: [
            p("Estos son los productos que el cliente vuelve a comprar durante toda la vida del spa:"),
            list([
              "Cartuchos de sal FreshWater (4 meses / pack de 3 = 1 año). Solo se venden a través del distribuidor autorizado → oportunidad exclusiva de Ambiente Azul.",
              "Sal (bolsa de 4,5 kg) y tiras de prueba de 5 vías.",
              "Kit de inicio del sistema de monitoreo (ref. 80201).",
              "Filtros Tri-X (reemplazo cada 3–5 años).",
              "Productos de dureza (Vanishing Act / On-the-Go) y Clean Screen.",
            ]),
          ],
        },
        {
          title: "La regla de oro: “lo que la garantía NO cubre = venta”",
          durationMin: 5,
          blocks: [
            p("La garantía excluye los consumibles y accesorios: cartuchos de filtro y de sal, tapas de filtro, almohadas, seguros de cubierta, controlador de sal, cubiertas y accesorios."),
            tip("Eso no es un problema: es exactamente el catálogo de postventa. Todo lo que se desgasta o se consume es una venta recurrente que el cliente hará contigo."),
          ],
        },
        {
          title: "Anticiparse",
          durationMin: 5,
          blocks: [
            p("La pantalla del spa avisa cuándo cambiar el cartucho de sal o revisar el agua. El buen asesor de postventa no espera a que el cliente llame: lleva un registro de cada cliente (qué sistema tiene, cuándo compró el último cartucho) y le escribe antes de que se le venza."),
            info("Un cliente al que le llega el cartucho justo a tiempo es un cliente fiel."),
            h("Puntos clave"),
            list([
              "Consumibles clave: cartuchos de sal (pack de 3 = 1 año), sal, tiras, filtros Tri-X, productos de dureza.",
              "Los cartuchos de sal solo se venden por distribuidor autorizado.",
              "Lo excluido de garantía = catálogo de venta recurrente.",
              "Anticiparse (registro + recordatorios) fideliza.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Consumibles recurrentes",
        description: "Catálogo, garantía y anticipación.",
        timeLimitMin: 8,
        questions: [
          { question: "¿Cada cuánto se cambia el cartucho de sal y cómo se vende el repuesto?", type: "MULTIPLE_CHOICE", options: ["Cada año, individual", "4 meses; pack de 3 = 1 año", "Cada semana", "No se cambia"], correctAnswer: 1, explanation: "4 meses; el repuesto viene en pack de 3 (un año)." },
          { question: "¿Por qué “lo que la garantía no cubre” es una oportunidad?", type: "MULTIPLE_CHOICE", options: ["Porque no se vende", "Porque los consumibles y accesorios excluidos son el catálogo de venta recurrente", "Porque se regala", "No lo es"], correctAnswer: 1, explanation: "Lo excluido (desgaste/consumo) es justo la venta recurrente." },
          { question: "¿Cómo se anticipa el asesor a la necesidad del cliente?", type: "MULTIPLE_CHOICE", options: ["Esperando la llamada", "Llevando registro y enviando recordatorios antes del vencimiento", "Subiendo precios", "No se anticipa"], correctAnswer: 1, explanation: "Registro por cliente + recordatorios antes del vencimiento." },
        ],
      },
    },

    // ===== MÓDULO 5 — Cubiertas y elevadores =====
    {
      title: "Cubiertas y elevadores",
      lecciones: [
        {
          title: "La cubierta WeatherPro y de qué está hecha",
          durationMin: 7,
          blocks: [
            p("La cubierta es parte fundamental del sistema de retención de calor: hecha a la medida, con junta hermética a lo largo de la bisagra. Con el uso se desgasta y necesita reemplazo — una venta postventa importante. Combinarla con un elevador ayuda a asentarla bien y prolonga su vida."),
            h("De qué está hecha (para responderle al cliente con seguridad)"),
            list([
              "Forro exterior (poliéster): diseñado para vivir a la intemperie. Probado hasta 1.500 horas de resistencia UV, resistente al agrietamiento por frío hasta -32 °C, tratado contra el moho, retardante de llama (norma California 117) y formulado sin los ftalatos restringidos más comunes (DEHP, DBP, BBP, entre otros).",
              "Relleno (espuma EPS): núcleo de espuma que da firmeza y estructura a la cubierta y ayuda a conservar el calor del agua.",
            ]),
            info("Descripción lista para el cliente (WhatsApp): «Cubierta con forro exterior en poliéster para intemperie (resiste sol, frío y moho, retardante de llama) y relleno en espuma EPS que le da firmeza y ayuda a mantener el calor del agua.»"),
          ],
        },
        {
          title: "Cómo pedir una cubierta con el Cover Matrix",
          durationMin: 6,
          blocks: [
            p("El archivo Cover Matrix tiene el número de parte de cada cubierta por colección, modelo, año y color. Para pedir la correcta:"),
            list([
              "Identifica colección + modelo + año del spa del cliente.",
              "Busca la hoja correspondiente en el Excel.",
              "Escoge el color y la orientación (Front-to-Back o Side-to-Side).",
              "Toma el número: el que termina en C es la cubierta; el que termina en E es el encasement (funda exterior).",
              "Verifica si incluye hinge seal (sello de bisagra).",
            ]),
            pdf(DRIVE.coverMatrix, "Cover Matrix 2026 — números de parte de cubiertas (Excel)"),
            warn("El forro de cubierta de fabricación nacional (vinilcuero náutico) es un accesorio, no un reemplazo de esta cubierta. Ver Módulo 6."),
          ],
        },
        {
          title: "Elevadores de cubierta",
          durationMin: 5,
          blocks: [
            p("Recomienda según el espacio libre detrás del spa:"),
            table(
              ["Elevador", "Espacio libre detrás", "Perfil"],
              [
                ["CoverCradle / CoverCradle II", "61 cm", "El más cómodo (resortes a gas)"],
                ["Lift 'n Glide", "36 cm", "Económico, sube y desliza"],
                ["UpRite", "18 cm", "Para espacios muy ajustados; levanta por detrás"],
              ],
            ),
            h("Cómo se usa cada elevador (videos oficiales)"),
            info("Los siguientes videos son del canal oficial Hot Spring (en inglés). Resumen en español: todos muestran lo mismo — cómo abrir y cerrar la cubierta con ese elevador y cuánto espacio libre necesita detrás del spa. Úsalos para mostrarle al cliente qué tan fácil es y para elegir el modelo según su espacio."),
            video(HOWTO.coverCradle),
            info("CoverCradle — el más cómodo (resortes a gas). Requiere 61 cm libres detrás."),
            video(HOWTO.coverCradle2),
            info("CoverCradle II — versión de un solo resorte a gas. Requiere 61 cm libres detrás."),
            video(HOWTO.upRite),
            info("UpRite — levanta la cubierta por detrás; ideal para espacios muy ajustados (solo 18 cm)."),
            video(HOWTO.liftNGlide),
            info("Lift 'N Glide — económico, sube y desliza. Requiere 36 cm libres detrás."),
          ],
        },
        {
          title: "Domicilios de postventa (área metropolitana)",
          durationMin: 4,
          blocks: [
            p("Tarifas de domicilio para envíos de hasta 20 kg (cubiertas, consumibles y accesorios) en el área metropolitana:"),
            table(
              ["Zona", "Tarifa"],
              [
                ["Medellín y área metropolitana sur", "$20.000"],
                ["Área metropolitana norte", "$35.000"],
                ["Alto de Palmas y Llano Grande", "$40.000"],
              ],
            ),
            warn("Tarifas vigentes a la fecha; actualizar si cambian. Para envíos de más de 20 kg o fuera del área metropolitana, cotizar aparte (definir con Ambiente Azul)."),
            h("Puntos clave"),
            list([
              "Cubierta de fábrica = forro poliéster (1.500 h UV, anti-frío, anti-moho, retardante de llama, sin ftalatos restringidos) + relleno EPS.",
              "Cover Matrix: colección+modelo+año+color → número de parte (C = cubierta, E = encasement).",
              "Elevador según espacio: CoverCradle 61 cm, Lift 'n Glide 36 cm, UpRite 18 cm.",
              "Domicilios (hasta 20 kg): sur $20.000 · norte $35.000 · Alto de Palmas/Llano Grande $40.000.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Cubiertas y elevadores",
        description: "Materiales, Cover Matrix, elevadores y domicilios.",
        timeLimitMin: 10,
        questions: [
          { question: "¿De qué materiales está hecha la cubierta de fábrica?", type: "MULTIPLE_CHOICE", options: ["Madera y tela", "Forro exterior de poliéster + relleno de espuma EPS", "Vinilcuero náutico", "Plástico rígido"], correctAnswer: 1, explanation: "Forro poliéster para intemperie + núcleo de espuma EPS." },
          { question: "En el Cover Matrix, ¿qué diferencia hay entre un número que termina en C y uno en E?", type: "MULTIPLE_CHOICE", options: ["C = color, E = espesor", "C = cubierta, E = encasement (funda)", "Son iguales", "C = caro, E = económico"], correctAnswer: 1, explanation: "C = cubierta; E = encasement / funda exterior." },
          { question: "Un cliente tiene solo 20 cm libres detrás del spa. ¿Qué elevador recomiendas?", type: "MULTIPLE_CHOICE", options: ["CoverCradle (61 cm)", "Lift 'n Glide (36 cm)", "UpRite (18 cm)", "Ninguno"], correctAnswer: 2, explanation: "UpRite requiere solo 18 cm." },
          { question: "¿Cuál es la tarifa de domicilio para el área metropolitana norte (hasta 20 kg)?", type: "MULTIPLE_CHOICE", options: ["$20.000", "$35.000", "$40.000", "Gratis"], correctAnswer: 1, explanation: "Área metropolitana norte: $35.000." },
        ],
      },
    },

    // ===== MÓDULO 6 — Escalones y mejoras laterales =====
    {
      title: "Escalones y mejoras laterales",
      lecciones: [
        {
          title: "Escalones",
          durationMin: 4,
          blocks: [
            p("Todo spa debería tener al menos un punto de entrada seguro. Los escalones se coordinan por color con cada colección:"),
            list([
              "Highlife: escalones a juego con el diseño y las esquinas.",
              "Limelight y Hot Spot: escalones Everwood, a juego con el gabinete.",
              "Polímero: opción económica (Black, Sable, Teak, Grey, Espresso).",
            ]),
          ],
        },
        {
          title: "Mejoras laterales",
          durationMin: 5,
          blocks: [
            list([
              "Pasamanos: se desliza bajo el gabinete, da estabilidad al entrar/salir y trae luz LED a pilas.",
              "Portatoallas: en aluminio, mantiene las toallas a la mano.",
              "Sombrilla lateral: girable 360°, resistente al óxido, con base bajo el gabinete.",
              "Audio Bluetooth + subwoofer: para spas que no lo traen de fábrica.",
            ]),
            tip("Estos accesorios se venden mejor en el momento de la entrega o en la primera visita de mantenimiento, cuando el cliente ya disfruta el spa y valora comodidad y seguridad. Vende beneficios: seguridad al entrar (pasamanos, escalones), disfrute (audio, sombrilla)."),
          ],
        },
        {
          title: "Forro de cubierta nacional (vinilcuero náutico)",
          durationMin: 5,
          blocks: [
            p("Accesorio de fabricación nacional para la cubierta, hecho en vinilcuero grado náutico — el mismo material de la tapicería de yates y lanchas. Pensado para vivir a la intemperie: tratado para resistir el sol, la humedad y el moho, no absorbe agua y se limpia fácil pasándole un paño, por lo que mantiene su aspecto mejor que un forro común expuesto al exterior."),
            info("Descripción lista para el cliente: «El forro está hecho en vinilcuero grado náutico, el mismo tipo de material que se usa en la tapicería de yates y lanchas. Está tratado para resistir el sol, la humedad y el moho, no absorbe agua y se limpia fácil pasándole un paño.»"),
            warn("🔧 Ambiente Azul: confirmar el nombre exacto del accesorio en el catálogo, su precio y tiempo de fabricación. Es un accesorio, no un reemplazo de la cubierta de fábrica (que es de poliéster)."),
            h("Puntos clave"),
            list([
              "Escalones coordinados por colección + opción polímero.",
              "Pasamanos (seguridad + luz), portatoallas, sombrilla, audio.",
              "Forro de cubierta nacional en vinilcuero náutico (accesorio, no cubierta).",
              "Mejor momento de venta: entrega o primera visita.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Escalones y mejoras",
        description: "Accesorios de seguridad y comodidad.",
        timeLimitMin: 6,
        questions: [
          { question: "¿Qué accesorio recomiendas para dar seguridad al entrar y salir?", type: "MULTIPLE_CHOICE", options: ["Sombrilla", "Pasamanos y/o escalones", "Portatoallas", "Audio"], correctAnswer: 1, explanation: "Pasamanos y escalones dan un punto de entrada seguro." },
          { question: "¿Cuál es un buen momento para ofrecer las mejoras laterales?", type: "MULTIPLE_CHOICE", options: ["Nunca", "En la entrega o la primera visita de mantenimiento", "Solo por teléfono", "Al año de la compra"], correctAnswer: 1, explanation: "En la entrega o la primera visita, cuando el cliente ya disfruta el spa." },
        ],
      },
    },

    // ===== MÓDULO 7 — Diagnóstico y señales =====
    {
      title: "Diagnóstico y señales",
      lecciones: [
        {
          title: "Los 9 problemas comunes del agua",
          durationMin: 8,
          blocks: [
            table(
              ["Problema", "Causa probable", "Solución"],
              [
                ["Agua turbia", "Filtros sucios, materia orgánica, sanitización baja", "Limpiar filtros, aplicar shock, ajustar sanitizante"],
                ["Olor en el agua", "Materia orgánica o pH bajo", "Shock, ajustar pH"],
                ["Olor a cloro", "Cloramina elevada", "Shock (superclorar)"],
                ["Olor a humedad", "Bacterias o algas", "Sanitizar, revisar filtros"],
                ["Anillo de suciedad", "Aceites y tierra", "Limpiar línea de agua y filtros"],
                ["Algas", "pH alto o sanitizante bajo", "Ajustar pH, shock"],
                ["Irritación ocular", "pH o sanitizante desbalanceado", "Ajustar pH y sanitizante"],
                ["Irritación cutánea", "Agua insalubre o cloro libre > 5 ppm", "Equilibrar; esperar a que baje el cloro"],
                ["Manchas / minerales", "Alcalinidad/pH desbalanceado o metales", "Ajustar química; usar Clean Screen al rellenar"],
              ],
            ),
          ],
        },
        {
          title: "Las señales del spa",
          durationMin: 6,
          blocks: [
            list([
              "Luz del logotipo (Highlife): azul = enchufado; verde/turquesa = listo para usar; amarillo = requiere atención; rojo = modo protección.",
              "Luz del logotipo (Limelight): verde = listo; amarillo = seguro de usar, pero una función opcional requiere atención (salino, música…); rojo = contactar distribuidor; blanco = fallo de comunicación con la caja de control.",
              "Códigos de error: en el Vigor, F10/F11 = fallo de comunicación (llamar al servicio); E03 = fallo de flujo de agua (resetear); E20 = temperatura ambiente muy alta. Cada modelo tiene su set de códigos en su manual de servicio.",
            ]),
          ],
        },
        {
          title: "Cuándo resolver y cuándo escalar",
          durationMin: 5,
          blocks: [
            p("Resuelve tú lo que es cuidado del agua y limpieza (turbidez, olores, ajustes de química, limpieza de filtros)."),
            warn("Escala a servicio técnico ante: fallos de comunicación (F10/F11, luz blanca/roja), fugas, fallos de calentador o bomba, códigos E de error. NUNCA intentes reparar la caja de control: peligro de descarga y anula la garantía."),
            h("Puntos clave"),
            list([
              "9 problemas del agua con causa y solución.",
              "Luces del logotipo = diagnóstico rápido por color.",
              "Códigos F/E = escalar a servicio técnico.",
              "No abrir la caja de control.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Diagnóstico y señales",
        description: "Problemas del agua, luces y escalamiento.",
        timeLimitMin: 8,
        questions: [
          { question: "Agua turbia: una causa y su solución correcta es…", type: "MULTIPLE_CHOICE", options: ["Demasiada sal → añadir agua", "Filtros sucios/sanitización baja → limpiar filtros y aplicar shock", "pH perfecto → nada", "Ozono → apagarlo"], correctAnswer: 1, explanation: "Filtros sucios o sanitización baja: limpiar filtros + shock." },
          { question: "En Highlife, ¿qué indica la luz roja del logotipo?", type: "MULTIPLE_CHOICE", options: ["Listo para usar", "Solo enchufado", "Modo protección", "Música encendida"], correctAnswer: 2, explanation: "Rojo = modo protección." },
          { question: "¿Ante cuál situación se ESCALA a servicio técnico?", type: "MULTIPLE_CHOICE", options: ["Agua un poco turbia", "Filtro sucio", "Fuga, fallo de bomba/calentador o código E", "pH alto"], correctAnswer: 2, explanation: "Fugas, fallos de comunicación/hardware y códigos E → servicio técnico." },
        ],
      },
    },

    // ===== MÓDULO 8 — Calendario de mantenimiento =====
    {
      title: "Calendario de mantenimiento",
      lecciones: [
        {
          title: "La rutina",
          durationMin: 6,
          blocks: [
            warn("🔧 Ambiente Azul: afinar con la operación local."),
            table(
              ["Frecuencia", "Tareas"],
              [
                ["Diario", "Revisar que la cubierta quede bien puesta; verificar temperatura"],
                ["Semanal", "Probar el agua (tiras 5 vías); ajustar la salida del sistema salino si aplica; shock si hubo uso intenso"],
                ["Mensual", "Limpiar los filtros Tri-X; revisar el estado del cartucho de sal"],
                ["Trimestral", "Revisar dureza y metales; limpieza a fondo de la línea de agua"],
                ["Anual", "Cambio de agua (con salino puede llegar hasta 12 meses); cambio del filtro del Vigor"],
              ],
            ),
            video(HOWTO.quimicos),
            info("Resumen del video (oficial, en inglés): cómo y dónde añadir los químicos al spa — con la bomba de circulación encendida, dosificar según la prueba del agua y esperar antes de volver a usarlo. Es la base del ajuste semanal de la rutina."),
          ],
        },
        {
          title: "Cómo usarlo",
          durationMin: 4,
          blocks: [
            tip("Este calendario es un entregable de valor: úsalo como checklist descargable para el cliente en la entrega, y como guion para las visitas de mantenimiento. Un cliente con rutina clara tiene menos problemas y menos quejas."),
            h("Puntos clave"),
            list([
              "Rutina diaria/semanal/mensual/trimestral/anual.",
              "Con sistema salino, el cambio de agua puede espaciarse hasta 12 meses.",
              "El calendario es entregable de valor y guion de visita.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Calendario de mantenimiento",
        description: "Frecuencias de las tareas.",
        timeLimitMin: 6,
        questions: [
          { question: "¿Con qué frecuencia se limpian los filtros Tri-X?", type: "MULTIPLE_CHOICE", options: ["Diario", "Semanal", "Mensual", "Anual"], correctAnswer: 2, explanation: "Limpieza mensual de los filtros Tri-X." },
          { question: "¿Cada cuánto se cambia el filtro del Vigor?", type: "MULTIPLE_CHOICE", options: ["Cada mes", "Una vez al año", "Cada 5 años", "Nunca"], correctAnswer: 1, explanation: "El filtro del Vigor se cambia una vez al año." },
          { question: "Con sistema salino, ¿hasta cuánto se puede espaciar el cambio de agua?", type: "MULTIPLE_CHOICE", options: ["1 mes", "3 meses", "Hasta 12 meses", "No se cambia"], correctAnswer: 2, explanation: "Con salino, hasta 12 meses." },
        ],
      },
    },

    // ===== MÓDULO 9 — Garantía =====
    {
      title: "Garantía",
      lecciones: [
        {
          title: "Plazos por colección",
          durationMin: 7,
          blocks: [
            warn("🔧 Ambiente Azul: plazos declarados por el fabricante (versión 60 Hz). Confirmar los términos reales para Colombia antes de comunicarlos al cliente."),
            table(
              ["Cobertura", "Highlife", "Limelight", "Hot Spot", "Freeflow", "Vigor"],
              [
                ["Superficie del casco", "7 años", "5 años", "2 años", "5 años", "5 años"],
                ["No-fuga casco/estructura", "incl.", "5 años", "5 años", "5 años", "5 años"],
                ["Fontanería (fugas)", "5 años", "5 años", "2 años", "1 año", "3 años"],
                ["Componentes", "5 años", "5 años", "2 años", "1 año", "3 años"],
                ["Calentador / bomba de calor", "5 años", "5 años", "2 años", "incl.", "3 años"],
                ["Gabinete", "5 años", "5 años", "2 años", "2 años", "3 años"],
                ["Iluminación", "2 años", "3 años", "2 int / 1 ext", "incl.", "2 años"],
              ],
            ),
            p("Certificados de garantía oficiales por colección (60 Hz) — descárgalos para consultar los términos exactos:"),
            pdf(DRIVE.garHighlife, "Garantía Highlife (60 Hz)"),
            pdf(DRIVE.garLimelight, "Garantía Limelight (60 Hz)"),
            pdf(DRIVE.garHotSpot, "Garantía Hot Spot (60 Hz)"),
            pdf(DRIVE.garFreeflow, "Garantía Freeflow (60 Hz)"),
            pdf(DRIVE.garVigor, "Garantía Vigor Cold Plunge"),
          ],
        },
        {
          title: "Qué NO cubre (y por qué es una oportunidad)",
          durationMin: 5,
          blocks: [
            p("Están excluidos de garantía: cartuchos de filtro y de sal, tapas de filtro, almohadas, seguros de cubierta, controlador de sal, cubiertas y accesorios. Son piezas de desgaste o consumo → venta postventa."),
            warn("Además, extraer o desactivar el disyuntor GFCI anula la garantía."),
          ],
        },
        {
          title: "Condiciones y cómo tramitar un reclamo",
          durationMin: 5,
          blocks: [
            list([
              "La garantía aplica solo al comprador original, con el spa instalado en el país de compra y adquirido a un distribuidor autorizado.",
              "Se anula si el spa se traspasa a otro dueño o se reubica fuera del país.",
              "Para un reclamo: contactar al distribuidor donde se compró, con el número de serie del spa y la factura original.",
            ]),
            video(HOWTO.numeroSerie),
            info("Resumen del video (oficial, en inglés): dónde encontrar el número de serie del spa — normalmente en una etiqueta dentro del compartimiento del equipo, detrás del panel de acceso. Es el dato que se pide para cualquier reclamo de garantía o pedido de repuesto."),
            h("Puntos clave"),
            list([
              "Highlife tiene la mejor cobertura (casco 7 años); Freeflow y Hot Spot las más cortas.",
              "Consumibles y accesorios excluidos = venta postventa.",
              "Quitar el GFCI anula la garantía; aplica al comprador original en el país de compra.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Garantía",
        description: "Cobertura, exclusiones y reclamos.",
        timeLimitMin: 8,
        questions: [
          { question: "¿Cuál es la garantía de superficie del casco en Highlife y en Hot Spot?", type: "MULTIPLE_CHOICE", options: ["5 y 5 años", "7 y 2 años", "2 y 7 años", "10 y 3 años"], correctAnswer: 1, explanation: "Highlife 7 años; Hot Spot 2 años." },
          { question: "¿Cuál de estos está EXCLUIDO de la garantía?", type: "MULTIPLE_CHOICE", options: ["El casco", "La bomba", "Los cartuchos de filtro/sal y accesorios", "El calentador"], correctAnswer: 2, explanation: "Consumibles y accesorios están excluidos." },
          { question: "¿Qué se necesita para tramitar un reclamo?", type: "MULTIPLE_CHOICE", options: ["Solo una llamada", "Contactar al distribuidor con el número de serie y la factura original", "Ir a la fábrica", "Nada"], correctAnswer: 1, explanation: "Distribuidor + número de serie + factura original." },
        ],
      },
    },

    // ===== MÓDULO 10 — Vigor postventa =====
    {
      title: "Vigor postventa",
      lecciones: [
        {
          title: "Cuidado del agua del Vigor",
          durationMin: 5,
          blocks: [
            p("En la configuración inicial se equilibra la química (alcalinidad, pH y dureza) con los productos recomendados; luego el mantenimiento es sencillo y solo requiere cloro regular. El sistema de desinfección UV-C reduce la necesidad de exceso de cloro."),
            info("Como en agua fría hay menos bañistas y menos tiempo, el agua se mantiene limpia por más tiempo y los cambios de agua son menos frecuentes."),
          ],
        },
        {
          title: "El filtro y por qué NO lleva accesorios",
          durationMin: 5,
          blocks: [
            list([
              "Filtro: de poliéster (2,3 m²), de carga superior. Se enjuaga con manguera y se cambia una vez al año.",
              "Sin escalones: su altura de 74 cm es como la de una bañera estándar, así que los escalones son innecesarios y podrían ser un riesgo.",
              "Sin elevador: la cubierta pesa solo 2,7 kg.",
              "Nunca se le añaden sales de baño ni aceites esenciales: obstruyen la filtración.",
            ]),
          ],
        },
        {
          title: "Códigos de error del Vigor",
          durationMin: 4,
          blocks: [
            list([
              "F10/F11 = fallo de comunicación → llamar al servicio.",
              "E03 = fallo de flujo de agua → resetear.",
              "E20 = temperatura ambiente > 38 °C → esperar a que baje y resetear.",
              "E04–E44 → apagar 5 minutos y reintentar; si persiste, servicio técnico.",
            ]),
            h("Puntos clave"),
            list([
              "Cuidado del agua fría: equilibrio inicial + cloro regular; UV-C reduce cloro.",
              "Filtro: enjuagar con manguera, cambiar 1 vez al año.",
              "Vigor NO lleva escalones, ni elevador, ni sales/aceites.",
              "Conocer los códigos F/E del panel.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Vigor postventa",
        description: "Agua, filtro, accesorios y códigos.",
        timeLimitMin: 6,
        questions: [
          { question: "¿Cada cuánto se cambia el filtro del Vigor?", type: "MULTIPLE_CHOICE", options: ["Cada mes", "Una vez al año", "Cada 5 años", "Nunca"], correctAnswer: 1, explanation: "El filtro del Vigor se cambia una vez al año." },
          { question: "¿Por qué NO se recomiendan escalones ni sales de baño en el Vigor?", type: "MULTIPLE_CHOICE", options: ["Porque no caben", "Su altura tipo bañera hace innecesarios los escalones; las sales/aceites obstruyen la filtración", "Porque son caros", "Sí se recomiendan"], correctAnswer: 1, explanation: "Altura tipo bañera + cubierta liviana; sales/aceites tapan el filtro." },
          { question: "¿Qué indica el código E20?", type: "MULTIPLE_CHOICE", options: ["Fallo de comunicación", "Fallo de flujo", "Temperatura ambiente demasiado alta (>38 °C)", "Filtro sucio"], correctAnswer: 2, explanation: "E20 = temperatura ambiente > 38 °C." },
        ],
      },
    },

    // ===== MÓDULO 11 — Venta consultiva de postventa =====
    {
      title: "Venta consultiva de postventa",
      lecciones: [
        {
          title: "Cada contacto es una oportunidad",
          durationMin: 5,
          blocks: [
            p("El postventa no es solo resolver problemas: es acompañar y anticipar. Señales que abren una venta:"),
            list([
              "Cartucho de sal por vencer → ofrecer el pack de 3 (un año).",
              "Dureza alta → Vanishing Act / On-the-Go.",
              "Filtro viejo o rendimiento bajo → filtro Tri-X nuevo.",
              "Cubierta desgastada → cubierta nueva + elevador.",
              "Cliente entrando/saliendo con dificultad → pasamanos / escalones.",
              "Cliente deportista o interesado en recuperación → baño frío Vigor.",
            ]),
          ],
        },
        {
          title: "Escuchar, no empujar",
          durationMin: 4,
          blocks: [
            p("La venta consultiva parte de la necesidad del cliente, no del producto. Pregunta cómo ha estado el agua, cómo usa el spa, qué le gustaría mejorar. Recomienda lo que realmente le sirve."),
            tip("Un cliente bien asesorado vuelve; uno al que solo le empujan producto, no."),
            h("Puntos clave"),
            list([
              "Cada síntoma tiene un consumible/accesorio asociado.",
              "Anticiparse y escuchar fideliza y genera ingreso recurrente.",
              "La postventa es relación de largo plazo, no transacción.",
            ]),
          ],
        },
      ],
      examen: {
        title: "Evaluación — Venta consultiva",
        description: "Oportunidades y principio consultivo.",
        timeLimitMin: 6,
        questions: [
          { question: "Un cliente reporta dureza alta del agua. ¿Qué le ofreces?", type: "MULTIPLE_CHOICE", options: ["Más sal", "Vanishing Act u On-the-Go según el nivel", "Un filtro nuevo siempre", "Nada"], correctAnswer: 1, explanation: "Producto de dureza según el nivel (Vanishing Act / On-the-Go)." },
          { question: "¿Cuál es el principio de la venta consultiva?", type: "MULTIPLE_CHOICE", options: ["Empujar el producto más caro", "Partir de la necesidad real del cliente, no empujar producto", "Vender solo lo barato", "No recomendar nada"], correctAnswer: 1, explanation: "Se parte de la necesidad real del cliente." },
        ],
      },
    },

    // ===== MÓDULO 12 — Protocolo de atención y seguridad (pendiente AA) =====
    {
      title: "Protocolo de atención y seguridad",
      lecciones: [
        {
          title: "📋 Pendiente — lo completa Ambiente Azul",
          durationMin: 3,
          blocks: [
            warn("🔧 Este módulo está en preparación: lo completa Ambiente Azul con sus procesos internos."),
            p("Para terminar este módulo, la persona responsable debe reunir y entregar cada punto (texto libre; se redacta con lo que exista). Checklist:"),
            list([
              "☐ Flujo de atención postventa (respond.io / Odoo / intranet): cómo se recibe, registra y resuelve una solicitud.",
              "☐ Trazabilidad: cómo dejar registro de cada servicio y cada venta de consumible por cliente.",
              "☐ Gestión de repuestos y pedidos: lead times de importación, cómo cotizar un repuesto.",
              "☐ Manejo seguro de químicos: almacenamiento, fichas de seguridad, elementos de protección (EPP).",
              "☐ Escalamiento a servicio técnico: cuándo y cómo.",
            ]),
            info("Cuando tengas estos puntos, pásalos al responsable técnico y se cargan al curso. (El detalle de todos los pendientes HotSpring está en el checklist del proyecto.)"),
          ],
        },
      ],
      examen: { title: "", description: "", timeLimitMin: 10, questions: [] },
    },

    // ===== MÓDULO 13 — Evaluación y certificación =====
    {
      title: "Evaluación y certificación",
      lecciones: [
        {
          title: "Cómo funciona la certificación",
          durationMin: 4,
          blocks: [
            p("El examen final integra los módulos anteriores. Al aprobarlo con la nota mínima obtienes un certificado descargable que te habilita como asesor de postventa certificado en spas HotSpring."),
            info("Se recomienda recertificar al año o cuando cambien productos/sistemas."),
            warn("🔧 Ambiente Azul: definir la nota mínima y el número de intentos del examen final. Considerar añadir un caso práctico (diagnosticar el agua de un cliente ficticio y recomendar solución + consumibles)."),
          ],
        },
      ],
      examen: {
        title: "Examen final — Postventa HotSpring",
        description: "Integra todos los módulos. Aprueba para certificarte.",
        timeLimitMin: 25,
        questions: [
          { question: "¿Qué hace la bomba SilentFlo 5000?", type: "MULTIPLE_CHOICE", options: ["Calienta", "Circula y filtra el agua 24/7 con bajo consumo", "Genera ozono", "Nada"], correctAnswer: 1, explanation: "Circulación/filtración 24/7 de bajo consumo." },
          { question: "El cartucho del sistema salino dura…", type: "MULTIPLE_CHOICE", options: ["1 mes", "4 meses (pack de 3 = 1 año)", "1 año", "1 semana"], correctAnswer: 1, explanation: "4 meses; el repuesto viene en pack de 3." },
          { question: "El ozono FreshWater III es compatible con el sistema salino.", type: "TRUE_FALSE", options: ["Verdadero", "Falso"], correctAnswer: 1, explanation: "No conviven; tampoco con el SMI." },
          { question: "Meta de dureza con sistema salino:", type: "MULTIPLE_CHOICE", options: ["~50 ppm para proteger los electrodos", "~200 ppm", "0 ppm", "No importa"], correctAnswer: 0, explanation: "~50 ppm para minimizar sarro en los electrodos." },
          { question: "Dureza > 150 ppm → producto:", type: "MULTIPLE_CHOICE", options: ["Vanishing Act", "On-the-Go", "Más sal", "Clean Screen únicamente"], correctAnswer: 1, explanation: "Por encima de 150 ppm: On-the-Go." },
          { question: "En el Cover Matrix, el número que termina en C es…", type: "MULTIPLE_CHOICE", options: ["El color", "La cubierta", "El encasement", "El costo"], correctAnswer: 1, explanation: "C = cubierta; E = encasement." },
          { question: "Cliente con 20 cm libres detrás del spa → elevador:", type: "MULTIPLE_CHOICE", options: ["CoverCradle", "Lift 'n Glide", "UpRite (18 cm)", "Ninguno"], correctAnswer: 2, explanation: "UpRite requiere solo 18 cm." },
          { question: "La cubierta de fábrica está hecha de…", type: "MULTIPLE_CHOICE", options: ["Vinilcuero náutico", "Forro de poliéster + relleno EPS", "Madera", "Plástico rígido"], correctAnswer: 1, explanation: "Poliéster para intemperie + núcleo EPS." },
          { question: "Ante una fuga o un código E, el asesor debe…", type: "MULTIPLE_CHOICE", options: ["Abrir la caja de control", "Escalar a servicio técnico", "Ignorarlo", "Cambiar el agua"], correctAnswer: 1, explanation: "Fugas y códigos E → servicio técnico; no abrir la caja de control." },
          { question: "El filtro del Vigor se cambia…", type: "MULTIPLE_CHOICE", options: ["Cada mes", "Una vez al año", "Cada 5 años", "Nunca"], correctAnswer: 1, explanation: "Una vez al año." },
          { question: "Extraer o desactivar el disyuntor GFCI…", type: "TRUE_FALSE", options: ["Anula la garantía", "No pasa nada"], correctAnswer: 0, explanation: "Anula la garantía." },
          { question: "El principio de la venta consultiva de postventa es…", type: "MULTIPLE_CHOICE", options: ["Empujar el producto más caro", "Partir de la necesidad real del cliente", "Vender solo consumibles", "No recomendar"], correctAnswer: 1, explanation: "Se parte de la necesidad real del cliente." },
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
      description: "Capacitación de postventa en spas HotSpring: sistemas internos, cuidado del agua (salino, SMI, ozono), dureza y metales, consumibles recurrentes, cubiertas y elevadores, accesorios, diagnóstico, mantenimiento, garantía, baño frío Vigor y venta consultiva. Para el equipo de servicio y postventa de Ambiente Azul.",
      category: "TECNICO",
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
