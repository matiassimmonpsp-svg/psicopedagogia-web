import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.download.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.resourceTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.resource.deleteMany()
  await prisma.subarea.deleteMany()
  await prisma.area.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()
  await prisma.socialPost.deleteMany()

  const hash = await bcrypt.hash('demo123', 10)

  // Users
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@psicopedagogia.cl',
      passwordHash: hash,
      role: 'admin',
    }
  })

  await prisma.user.create({
    data: {
      name: 'María González',
      email: 'maria@example.com',
      passwordHash: hash,
      role: 'user',
    }
  })

  // Courses (Prekínder to 8° Básico)
  const courseNames = [
    { name: 'Prekínder', slug: 'prekinder', order: 1 },
    { name: 'Kínder', slug: 'kinder', order: 2 },
    { name: '1° Básico', slug: '1-basico', order: 3 },
    { name: '2° Básico', slug: '2-basico', order: 4 },
    { name: '3° Básico', slug: '3-basico', order: 5 },
    { name: '4° Básico', slug: '4-basico', order: 6 },
    { name: '5° Básico', slug: '5-basico', order: 7 },
    { name: '6° Básico', slug: '6-basico', order: 8 },
    { name: '7° Básico', slug: '7-basico', order: 9 },
    { name: '8° Básico', slug: '8-basico', order: 10 },
  ]

  const courses: any[] = []
  for (const c of courseNames) {
    courses.push(await prisma.course.create({ data: { name: c.name, slug: c.slug, sortOrder: c.order } }))
  }

  // Areas
  const areaData = [
    { name: 'Lectoescritura', slug: 'lectoescritura', order: 1 },
    { name: 'Pensamiento Lógico Matemático', slug: 'pensamiento-logico-matematico', order: 2 },
    { name: 'Habilidades Cognitivas', slug: 'habilidades-cognitivas', order: 3 },
  ]

  const areas: any[] = []
  for (const a of areaData) {
    areas.push(await prisma.area.create({ data: { name: a.name, slug: a.slug, sortOrder: a.order } }))
  }

  // Subareas
  const subareaData = [
    // Lectoescritura
    { areaSlug: 'lectoescritura', name: 'Conciencia Fonológica', slug: 'conciencia-fonologica' },
    { areaSlug: 'lectoescritura', name: 'Conciencia Semántica', slug: 'conciencia-semantica' },
    { areaSlug: 'lectoescritura', name: 'Conciencia Sintáctica', slug: 'conciencia-sintactica' },
    { areaSlug: 'lectoescritura', name: 'Decodificación Lectora', slug: 'decodificacion-lectora' },
    { areaSlug: 'lectoescritura', name: 'Fluidez Lectora', slug: 'fluidez-lectora' },
    { areaSlug: 'lectoescritura', name: 'Comprensión Lectora', slug: 'comprension-lectora' },
    { areaSlug: 'lectoescritura', name: 'Producción Escrita', slug: 'produccion-escrita' },
    { areaSlug: 'lectoescritura', name: 'Grafomotricidad', slug: 'grafomotricidad' },
    // Pensamiento Lógico Matemático
    { areaSlug: 'pensamiento-logico-matematico', name: 'Nociones Pre-numéricas', slug: 'nociones-pre-numericas' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Numeración y Conteo', slug: 'numeracion-conteo' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Sistema de Numeración Decimal', slug: 'sistema-numeracion-decimal' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Cálculo y Operatoria', slug: 'calculo-operatoria' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Razonamiento Matemático', slug: 'razonamiento-matematico' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Resolución de Problemas', slug: 'resolucion-problemas' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Pensamiento Espacial y Geométrico', slug: 'pensamiento-espacial-geometrico' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Medición y Datos', slug: 'medicion-datos' },
    // Habilidades Cognitivas - Base
    { areaSlug: 'habilidades-cognitivas', name: 'Atención', slug: 'atencion' },
    { areaSlug: 'habilidades-cognitivas', name: 'Percepción Visual', slug: 'percepcion-visual' },
    { areaSlug: 'habilidades-cognitivas', name: 'Percepción Auditiva', slug: 'percepcion-auditiva' },
    { areaSlug: 'habilidades-cognitivas', name: 'Memoria Sensorial', slug: 'memoria-sensorial' },
    { areaSlug: 'habilidades-cognitivas', name: 'Procesamiento Visual', slug: 'procesamiento-visual' },
    { areaSlug: 'habilidades-cognitivas', name: 'Procesamiento Auditivo', slug: 'procesamiento-auditivo' },
    // Habilidades Cognitivas - Superiores
    { areaSlug: 'habilidades-cognitivas', name: 'Memoria de Trabajo', slug: 'memoria-de-trabajo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Razonamiento Inductivo', slug: 'razonamiento-inductivo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Razonamiento Deductivo', slug: 'razonamiento-deductivo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Pensamiento Crítico', slug: 'pensamiento-critico' },
    { areaSlug: 'habilidades-cognitivas', name: 'Metacognición', slug: 'metacognicion' },
    // Habilidades Cognitivas - Funciones Ejecutivas
    { areaSlug: 'habilidades-cognitivas', name: 'Control Inhibitorio', slug: 'control-inhibitorio' },
    { areaSlug: 'habilidades-cognitivas', name: 'Flexibilidad Cognitiva', slug: 'flexibilidad-cognitiva' },
    { areaSlug: 'habilidades-cognitivas', name: 'Planificación', slug: 'planificacion' },
    { areaSlug: 'habilidades-cognitivas', name: 'Organización', slug: 'organizacion' },
    { areaSlug: 'habilidades-cognitivas', name: 'Monitoreo', slug: 'monitoreo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Iniciación de Tareas', slug: 'iniciacion-tareas' },
  ]

  const subareas: any[] = []
  for (const s of subareaData) {
    subareas.push(await prisma.subarea.create({
      data: {
        areaId: areas.find(a => a.slug === s.areaSlug)!.id,
        name: s.name,
        slug: s.slug,
      }
    }))
  }

  // Tags
  const tagNames = [
    'memoria-de-trabajo', 'atencion', 'conciencia-fonologica', 'comprension-lectora',
    'razonamiento-matematico', 'numeracion', 'resolucion-de-problemas', 'grafomotricidad',
    'vocabulario', 'fluidez-lectora', 'funciones-ejecutivas', 'planificacion',
    'flexibilidad-cognitiva', 'inhibicion', 'percepcion-visual', 'discriminacion-auditiva',
    'conciencia-semantica', 'categorizacion', 'secuencia-temporal', 'organizacion'
  ]

  const tags = await Promise.all(
    tagNames.map(name =>
      prisma.tag.create({ data: { name: name.replace(/-/g, ' '), slug: name } })
    )
  )

  const tag = (slug: string) => tags.find(t => t.slug === slug)!

  // Helper to create resources
  const resourcesData = [
    // Prekínder - Lectoescritura
    { title: 'Evaluación de Conciencia Fonológica - Prekínder', desc: 'Instrumento diseñado para evaluar el desarrollo de la conciencia fonológica en estudiantes de Prekínder (4-5 años). Incluye actividades de identificación de sonidos iniciales, rimas, segmentación silábica y manipulación de fonemas. Ideal para detectar tempranamente dificultades en la base de la lectoescritura. Contiene 15 ítems con instrucciones para el evaluador y hoja de registro de resultados.', course: 'prekinder', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-fonologica', 'discriminacion-auditiva'] },
    { title: 'Prueba de Vocabulario Pasivo - Prekínder', desc: 'Evaluación del vocabulario receptivo en niños de 4 a 5 años. Presenta 20 láminas con imágenes para que el niño identifique la palabra mencionada por el evaluador. Evalúa sustantivos, verbos y conceptos espaciales básicos. Incluye protocolo de aplicación, hoja de registro y tabla de puntuaciones normalizadas para el nivel Prekínder.', course: 'prekinder', area: 'lectoescritura', free: false, price: 5990, tags: ['vocabulario', 'conciencia-semantica'] },
    { title: 'Test de Discriminación Auditiva', desc: 'Evalúa la capacidad de diferenciar sonidos del habla en niveles iniciales. Compuesto por 12 pares de palabras con diferencias fonéticas mínimas (pares mínimos). Permite identificar dificultades de discriminación auditiva que pueden afectar el desarrollo fonológico y la adquisición de la lectoescritura. Incluye guía de aplicación y análisis de resultados.', course: 'prekinder', area: 'lectoescritura', free: true, price: 0, tags: ['discriminacion-auditiva', 'conciencia-fonologica'] },

    // Prekínder - Pensamiento Lógico Matemático
    { title: 'Evaluación de Nociones Numéricas Básicas', desc: 'Evalúa las nociones pre-numéricas fundamentales en educación inicial: clasificación de objetos por atributos, seriación por tamaño y longitud, correspondencia uno a uno y conservación de cantidad. Incluye material manipulable recortable y hoja de registro. Ideal para diagnóstico inicial en Prekínder.', course: 'prekinder', area: 'pensamiento-logico-matematico', free: true, price: 0, tags: ['numeracion', 'razonamiento-matematico'] },
    { title: 'Test de Razonamiento Lógico Preoperacional', desc: 'Instrumento basado en la teoría de Piaget para evaluar el pensamiento preoperacional en niños de 4 a 6 años. Evalúa funciones cognitivas como clasificación jerárquica, seriación múltiple, correspondencia término a término y pensamiento analógico. Incluye 18 ítems con material concreto y hoja de registro.', course: 'prekinder', area: 'pensamiento-logico-matematico', free: false, price: 4990, tags: ['razonamiento-matematico', 'categorizacion'] },

    // Prekínder - Habilidades Cognitivas
    { title: 'Evaluación de Percepción Visual - Nivel Inicial', desc: 'Evalúa habilidades perceptivas visuales básicas en niños de 4 a 6 años: discriminación figura-fondo, constancia perceptual, cierre visual y posición en el espacio. Incluye 20 láminas a color con actividades progresivas. Fundamental para detectar dificultades que pueden afectar la lectoescritura y el aprendizaje matemático.', course: 'prekinder', area: 'habilidades-cognitivas', subarea: 'percepcion-visual', free: true, price: 0, tags: ['percepcion-visual', 'atencion'] },
    { title: 'Test de Atención Selectiva Infantil', desc: 'Instrumento para medir la capacidad de atención sostenida y selectiva en niños de 4 a 7 años. Presenta tareas de búsqueda visual con distractores, cancelación de figuras y pruebas de velocidad de procesamiento. Incluye normas por rango etario y recomendaciones para la intervención.', course: 'prekinder', area: 'habilidades-cognitivas', subarea: 'atencion', free: false, price: 5990, tags: ['atencion', 'inhibicion'] },

    // 1° Básico - Lectoescritura
    { title: 'Evaluación de Fluidez Lectora Inicial', desc: 'Mide velocidad, precisión y prosodia en lectura de primer año básico. Incluye tres textos progresivos (nivel inicial, intermedio y avanzado) con registro de palabras por minuto, errores y expresión lectora. Incluye tabla de puntos de corte y recomendaciones pedagógicas según el nivel lector obtenido.', course: '1-basico', area: 'lectoescritura', free: false, price: 5990, tags: ['fluidez-lectora', 'comprension-lectora'] },
    { title: 'Prueba de Comprensión Lectora - 1° Básico', desc: 'Evaluación de comprensión literal e inferencial para estudiantes de primer año básico. Contiene 3 textos breves (narrativo, informativo y descriptivo) con preguntas de selección múltiple y respuesta abierta. Evalúa identificación de personajes, secuencia de eventos, causa-efecto e inferencias simples.', course: '1-basico', area: 'lectoescritura', free: true, price: 0, tags: ['comprension-lectora', 'vocabulario'] },
    { title: 'Test de Grafomotricidad y Escritura', desc: 'Evalúa habilidades grafomotoras y producción escrita inicial en estudiantes de 1° básico. Incluye ejercicios de trazos, copia de formas, escritura de letras y palabras, y producción de oraciones simples. Permite identificar dificultades en la coordinación visomotora y la calidad grafomotora que afectan la escritura legible.', course: '1-basico', area: 'lectoescritura', free: false, price: 4990, tags: ['grafomotricidad', 'conciencia-fonologica'] },
    { title: 'Evaluación de Conciencia Fonológica - 1° Básico', desc: 'Versión avanzada para evaluar segmentación y manipulación fonémica en estudiantes de primer año básico. Incluye tareas de aislar fonemas, contar fonemas, segmentar palabras en fonemas, omitir y agregar fonemas para formar nuevas palabras. Instrumento clave para identificar riesgo de dificultades lectoras.', course: '1-basico', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-fonologica', 'discriminacion-auditiva'] },

    // 1° Básico - Pensamiento Lógico Matemático
    { title: 'Evaluación de Cálculo y Numeración - 1° Básico', desc: 'Evalúa las competencias numéricas fundamentales de primer año básico: conteo hasta 100, lectura y escritura de números, comparación de cantidades, adición y sustracción simples, y resolución de problemas cotidianos. Incluye 25 ítems con apoyo visual y tabla de rendimiento esperado.', course: '1-basico', area: 'pensamiento-logico-matematico', free: false, price: 5990, tags: ['numeracion', 'razonamiento-matematico'] },
    { title: 'Test de Resolución de Problemas Simples', desc: 'Mide la capacidad de resolver problemas aditivos elementales en estudiantes de 1° básico. Incluye problemas de cambio, combinación, comparación e igualación con números hasta 20. Evalúa comprensión del enunciado, selección de operación y precisión en el cálculo. Incluye pauta de corrección y análisis de errores.', course: '1-basico', area: 'pensamiento-logico-matematico', free: true, price: 0, tags: ['resolucion-de-problemas', 'razonamiento-matematico'] },

    // 1° Básico - Habilidades Cognitivas
    { title: 'Evaluación de Funciones Ejecutivas - 1° Básico', desc: 'Instrumento comprehensivo para evaluar funciones ejecutivas básicas en estudiantes de 1° básico: control inhibitorio (capacidad de suprimir respuestas automáticas), memoria de trabajo (retención y manipulación de información) y flexibilidad cognitiva (cambio entre reglas y perspectivas). Incluye actividades lúdicas y pauta de observación conductual.', course: '1-basico', area: 'habilidades-cognitivas', subarea: 'control-inhibitorio', free: false, price: 7990, tags: ['funciones-ejecutivas', 'memoria-de-trabajo', 'inhibicion'] },
    { title: 'Test de Memoria de Trabajo Verbal', desc: 'Instrumento para medir la capacidad de retención y manipulación de información verbal en estudiantes de 1° a 4° básico. Incluye tareas de dígitos directos e inversos, span de palabras y span de oraciones. Evalúa el bucle fonológico y el ejecutivo central. Incluye normas por edad y recomendaciones de intervención.', course: '1-basico', area: 'habilidades-cognitivas', subarea: 'memoria-de-trabajo', free: false, price: 5990, tags: ['memoria-de-trabajo', 'atencion'] },
    { title: 'Evaluación de Planificación y Organización', desc: 'Mide la capacidad de planificar y organizar tareas simples en estudiantes de 1° a 3° básico. Incluye actividades de secuenciación de pasos, organización de materiales, estimación de tiempo y seguimiento de instrucciones complejas. Instrumento ideal para evaluar funciones ejecutivas en el contexto del aula regular.', course: '1-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: true, price: 0, tags: ['planificacion', 'organizacion'] },

    // 2° Básico - Lectoescritura
    { title: 'Evaluación de Comprensión Lectora - 2° Básico', desc: 'Texto narrativo con preguntas literales e inferenciales para segundo año básico. Incluye un cuento breve seguido de preguntas de identificación de personajes, espacio y tiempo, secuencia narrativa, causa-efecto, inferencia y opinión personal. Evalúa también vocabulario en contexto.', course: '2-basico', area: 'lectoescritura', free: true, price: 0, tags: ['comprension-lectora', 'fluidez-lectora'] },
    { title: 'Prueba de Producción de Textos Narrativos', desc: 'Evalúa la capacidad de producir narraciones con estructura coherente en estudiantes de 2° a 4° básico. Solicita la escritura de un cuento a partir de una imagen estimulante. Evalúa estructura narrativa (inicio, desarrollo, final), cohesión, coherencia, vocabulario y aspectos formales de la escritura. Incluye rúbrica de evaluación.', course: '2-basico', area: 'lectoescritura', free: false, price: 4990, tags: ['grafomotricidad', 'organizacion'] },

    // 2° Básico - Pensamiento Lógico Matemático
    { title: 'Evaluación de Razonamiento Matemático - 2° Básico', desc: 'Problemas de adición, sustracción y comparación para segundo año básico. Incluye 20 problemas matemáticos progresivos que evalúan comprensión de enunciados, selección de estrategias de resolución, cálculo escrito y verificación de resultados. Incluye pauta de corrección detallada con análisis de errores frecuentes.', course: '2-basico', area: 'pensamiento-logico-matematico', free: false, price: 5990, tags: ['razonamiento-matematico', 'resolucion-de-problemas'] },
    { title: 'Test de Seriación y Patrones', desc: 'Evalúa la capacidad de identificar, continuar y crear secuencias lógicas y patrones en estudiantes de 2° a 4° básico. Incluye patrones gráficos, numéricos y mixtos con progresión creciente de dificultad. Evalúa pensamiento lógico, razonamiento inductivo y capacidad de abstracción.', course: '2-basico', area: 'pensamiento-logico-matematico', free: true, price: 0, tags: ['secuencia-temporal', 'categorizacion'] },

    // 3° Básico - Habilidades Cognitivas
    { title: 'Evaluación de Flexibilidad Cognitiva', desc: 'Instrumento para medir la capacidad de cambiar entre reglas, perspectivas y estrategias en estudiantes de 3° a 6° básico. Incluye tareas de clasificación múltiple, cambios de criterio, generación de alternativas y resolución de problemas desde múltiples perspectivas. Fundamental para evaluar funciones ejecutivas superiores.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'flexibilidad-cognitiva', free: false, price: 6990, tags: ['flexibilidad-cognitiva', 'funciones-ejecutivas'] },
    { title: 'Test de Atención Sostenida', desc: 'Evaluación de la capacidad de mantener la atención en una tarea continua durante un período prolongado en estudiantes de 3° a 6° básico. Incluye tareas de cancelación visual con estímulos distractores y registro de aciertos, omisiones y falsas alarmas. Incluye índices de atención sostenida y control de impulsos.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'atencion', free: true, price: 0, tags: ['atencion', 'inhibicion'] },
    { title: 'Evaluación de Memoria de Trabajo Visoespacial', desc: 'Mide la capacidad de retener y manipular información visual y espacial en estudiantes de 3° a 6° básico. Incluye tareas de matrices, patrones visuales, memoria de localización espacial y span visoespacial. Evalúa el componente visoespacial de la memoria de trabajo, fundamental para el aprendizaje matemático y la lectura.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'memoria-de-trabajo', free: false, price: 5990, tags: ['memoria-de-trabajo', 'percepcion-visual'] },

    // 4° Básico - Lectoescritura
    { title: 'Evaluación de Lectura Comprensiva - 4° Básico', desc: 'Textos expositivos y narrativos con preguntas de análisis para cuarto año básico. Incluye dos textos de diferente tipología (expositivo-científico y narrativo-literario) con preguntas de comprensión literal, inferencial, crítica y vocabulario contextual. Evalúa habilidades de localización de información, inferencia, interpretación y reflexión.', course: '4-basico', area: 'lectoescritura', free: false, price: 5990, tags: ['comprension-lectora', 'vocabulario'] },
    { title: 'Prueba de Conciencia Semántica', desc: 'Evalúa relaciones semánticas en estudiantes de 4° a 6° básico: sinónimos, antónimos, categorías semánticas, campo semántico, definiciones y uso contextual del vocabulario. Incluye 30 ítems con progresión de dificultad. Permite identificar dificultades en la organización del léxico mental que afectan la comprensión lectora y la producción escrita.', course: '4-basico', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-semantica', 'categorizacion'] },

    // 4° Básico - Pensamiento Lógico Matemático
    { title: 'Evaluación de Resolución de Problemas Complejos', desc: 'Problemas de pasos múltiples con operaciones combinadas para cuarto año básico. Incluye 15 problemas que requieren planificación, selección de estrategias múltiples, ejecución de varios pasos y verificación de resultados. Evalúa pensamiento matemático avanzado, razonamiento lógico y capacidad de abstracción.', course: '4-basico', area: 'pensamiento-logico-matematico', free: false, price: 6990, tags: ['resolucion-de-problemas', 'razonamiento-matematico'] },

    // 5° Básico - Habilidades Cognitivas
    { title: 'Evaluación de Control Inhibitorio', desc: 'Mide la capacidad de suprimir respuestas automáticas y controlar impulsos en estudiantes de 5° a 8° básico. Incluye tareas de tipo Stroop, tareas Go/No-Go y pruebas de interferencia. Evalúa el componente de inhibición de las funciones ejecutivas, fundamental para la autorregulación del comportamiento y el aprendizaje.', course: '5-basico', area: 'habilidades-cognitivas', subarea: 'control-inhibitorio', free: false, price: 6990, tags: ['inhibicion', 'funciones-ejecutivas'] },
    { title: 'Test de Razonamiento Abstracto', desc: 'Evalúa la capacidad de razonar con conceptos abstractos, identificar analogías y establecer relaciones lógicas en estudiantes de 5° a 8° básico. Incluye matrices progresivas, analogías verbales y figurativas, clasificación abstracta y razonamiento deductivo. Instrumento ideal para evaluar inteligencia fluida y pensamiento crítico.', course: '5-basico', area: 'habilidades-cognitivas', subarea: 'razonamiento-inductivo', free: true, price: 0, tags: ['flexibilidad-cognitiva', 'categorizacion'] },

    // 6° Básico
    { title: 'Evaluación de Funciones Ejecutivas Avanzadas', desc: 'Evalúa funciones ejecutivas superiores en estudiantes de 6° a 8° básico: planificación compleja, organización estratégica, monitoreo de la propia ejecución y flexibilidad cognitiva avanzada. Incluye tareas de resolución de problemas complejos, organización de proyectos y autoevaluación. Incluye perfil ejecutivo individual y recomendaciones.', course: '6-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: false, price: 8990, tags: ['funciones-ejecutivas', 'planificacion', 'organizacion'] },
    { title: 'Prueba de Comprensión Lectora Crítica', desc: 'Evalúa la capacidad de análisis crítico y reflexión sobre textos en estudiantes de 6° a 8° básico. Incluye textos argumentativos y puntos de vista contrapuestos. Evalúa identificación de sesgos, evaluación de argumentos, distinción entre hecho y opinión, y formulación de juicios fundamentados con evidencia textual.', course: '6-basico', area: 'lectoescritura', free: false, price: 5990, tags: ['comprension-lectora', 'vocabulario'] },

    // 7° Básico
    { title: 'Evaluación de Razonamiento Matemático Avanzado', desc: 'Problemas con fracciones, decimales, razonamiento proporcional y pensamiento algebraico inicial para estudiantes de 7° básico a 8° básico. Incluye problemas contextualizados de la vida real que requieren aplicar múltiples conceptos matemáticos, modelar situaciones y justificar razonamientos. Incluye rúbrica de evaluación.', course: '7-basico', area: 'pensamiento-logico-matematico', free: false, price: 6990, tags: ['razonamiento-matematico', 'resolucion-de-problemas'] },

    // 8° Básico
    { title: 'Evaluación Integral de Funciones Cognitivas - 8° Básico', desc: 'Batería completa de funciones ejecutivas y habilidades cognitivas superiores para estudiantes de 8° básico. Evalúa memoria de trabajo, planificación, organización, flexibilidad cognitiva, control inhibitorio, razonamiento abstracto y metacognición. Incluye 8 subtest con puntuaciones estandarizadas y perfil cognitivo individual detallado.', course: '8-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: false, price: 9990, tags: ['funciones-ejecutivas', 'memoria-de-trabajo', 'planificacion', 'flexibilidad-cognitiva'] },

    // Material educativo complementario
    { title: 'Fichas de Apoyo: Conciencia Fonológica', desc: 'Set de 20 fichas imprimibles a todo color para reforzar la conciencia fonológica en el aula o en casa. Incluye actividades de rimas, segmentación silábica, identificación de fonemas iniciales y finales, omisión y síntesis. Cada ficha incluye instrucciones para el mediador y sugerencias de adaptación según el nivel del estudiante.', course: '1-basico', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-fonologica', 'discriminacion-auditiva'], type: 'educational' },
    { title: 'Cuadernillo de Grafomotricidad', desc: 'Ejercicios progresivos de trazos y coordinación visomotora para estudiantes de Prekínder a 1° básico. Incluye más de 30 páginas con actividades de trazos rectos, curvos, mixtos, figuras geométricas, dibujo libre y copia de modelos. Ideal para desarrollar las habilidades motoras finas necesarias para la escritura.', course: 'prekinder', area: 'lectoescritura', free: false, price: 3990, tags: ['grafomotricidad'], type: 'educational' },
    { title: 'Juego de Tarjetas: Razonamiento Matemático', desc: 'Set de 40 tarjetas recortables a color con problemas matemáticos para trabajo en grupos o estaciones de aprendizaje. Incluye problemas de adición, sustracción, patrones, secuencias y clasificación. Cada tarjeta tiene un nivel de dificultad (básico, intermedio, avanzado) y sugerencias para el docente.', course: '2-basico', area: 'pensamiento-logico-matematico', free: false, price: 4990, tags: ['razonamiento-matematico', 'resolucion-de-problemas'], type: 'educational' },
    { title: 'Guía de Estrategias para Funciones Ejecutivas', desc: 'Manual completo para docentes con más de 25 actividades prácticas para estimular las funciones ejecutivas en el aula regular. Incluye estrategias para trabajar control inhibitorio, memoria de trabajo, flexibilidad cognitiva, planificación y organización. Cada actividad incluye objetivos, materiales, procedimiento y adaptaciones por nivel.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: true, price: 0, tags: ['funciones-ejecutivas', 'planificacion'], type: 'educational' },
  ]

  for (const r of resourcesData) {
    const course = courses.find(c => c.slug === r.course)!
    const area = areas.find(a => a.slug === r.area)!
    const subarea = r.subarea ? subareas.find(s => s.slug === r.subarea) : undefined

    const resource = await prisma.resource.create({
      data: {
        title: r.title,
        description: r.desc,
        filePath: `/pdfs/${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
        previewPath: `/previews/placeholder.svg`,
        resourceType: (r as any).type || 'evaluation',
        isFree: r.free,
        priceClp: r.price || null,
        courseId: course.id,
        areaId: area.id,
        subareaId: subarea?.id || null,
        downloadsCount: Math.floor(Math.random() * 200),
      }
    })

    for (const tagSlug of r.tags) {
      try {
        await prisma.resourceTag.create({
          data: { resourceId: resource.id, tagId: tag(tagSlug)!.id || 0 }
        })
      } catch {
        // skip duplicates
      }
    }
  }

  // Social posts (mock)
  await prisma.socialPost.createMany({
    data: [
      { instagramPostId: '1', mediaUrl: '/social/post1.svg', caption: 'Tip educativo: ¿Cómo estimular la conciencia fonológica en casa? 🧠📚', permalink: '#', postedAt: new Date('2026-07-01') },
      { instagramPostId: '2', mediaUrl: '/social/post2.svg', caption: 'Nuevo instrumento de evaluación disponible en nuestra plataforma ✅', permalink: '#', postedAt: new Date('2026-06-28') },
      { instagramPostId: '3', mediaUrl: '/social/post3.svg', caption: 'Colores y formas: actividad para desarrollar habilidades cognitivas de base ✏️', permalink: '#', postedAt: new Date('2026-06-25') },
      { instagramPostId: '4', mediaUrl: '/social/post4.svg', caption: 'Webinar gratuito: Evaluación de funciones ejecutivas en el aula 🎓', permalink: '#', postedAt: new Date('2026-06-20') },
    ]
  })

  console.log('✅ Seed completado exitosamente')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
