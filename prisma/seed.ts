import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ──── 1. Limpiar datos existentes (orden inverso a creación) ────
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
  await prisma.discountCode.deleteMany()

  // Passwords que cumplen las reglas de validación (8+ chars, uppercase, lowercase, digit)
  const hash = await bcrypt.hash('Demo1234', 10)
  const testHash = await bcrypt.hash('Test1234', 10)

  // ──── 2. Usuarios de prueba ────
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

  await prisma.user.create({
    data: {
      name: 'Diego Meneses',
      email: 'd.menesesp@live.com',
      passwordHash: testHash,
      role: 'user',
    }
  })

  // ──── 3. Cursos (Prekínder a 8° Básico) ────
  await prisma.course.createMany({
    data: [
      { name: 'Prekínder', slug: 'prekinder', sortOrder: 1 },
      { name: 'Kínder', slug: 'kinder', sortOrder: 2 },
      { name: '1° Básico', slug: '1-basico', sortOrder: 3 },
      { name: '2° Básico', slug: '2-basico', sortOrder: 4 },
      { name: '3° Básico', slug: '3-basico', sortOrder: 5 },
      { name: '4° Básico', slug: '4-basico', sortOrder: 6 },
      { name: '5° Básico', slug: '5-basico', sortOrder: 7 },
      { name: '6° Básico', slug: '6-basico', sortOrder: 8 },
      { name: '7° Básico', slug: '7-basico', sortOrder: 9 },
      { name: '8° Básico', slug: '8-basico', sortOrder: 10 },
    ],
  })
  const courses = await prisma.course.findMany({ orderBy: { sortOrder: 'asc' } })

  // ──── 4. Áreas principales ────
  await prisma.area.createMany({
    data: [
      { name: 'Lectoescritura', slug: 'lectoescritura', sortOrder: 1 },
      { name: 'Pensamiento Lógico Matemático', slug: 'pensamiento-logico-matematico', sortOrder: 2 },
      { name: 'Habilidades Cognitivas', slug: 'habilidades-cognitivas', sortOrder: 3 },
    ],
  })
  const areas = await prisma.area.findMany({ orderBy: { sortOrder: 'asc' } })

  // ──── 5. Subáreas ────
  const subareaData = [
    { areaSlug: 'lectoescritura', name: 'Conciencia Fonológica', slug: 'conciencia-fonologica' },
    { areaSlug: 'lectoescritura', name: 'Conciencia Semántica', slug: 'conciencia-semantica' },
    { areaSlug: 'lectoescritura', name: 'Conciencia Sintáctica', slug: 'conciencia-sintactica' },
    { areaSlug: 'lectoescritura', name: 'Decodificación Lectora', slug: 'decodificacion-lectora' },
    { areaSlug: 'lectoescritura', name: 'Fluidez Lectora', slug: 'fluidez-lectora' },
    { areaSlug: 'lectoescritura', name: 'Comprensión Lectora', slug: 'comprension-lectora' },
    { areaSlug: 'lectoescritura', name: 'Producción Escrita', slug: 'produccion-escrita' },
    { areaSlug: 'lectoescritura', name: 'Grafomotricidad', slug: 'grafomotricidad' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Nociones Pre-numéricas', slug: 'nociones-pre-numericas' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Numeración y Conteo', slug: 'numeracion-conteo' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Sistema de Numeración Decimal', slug: 'sistema-numeracion-decimal' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Cálculo y Operatoria', slug: 'calculo-operatoria' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Razonamiento Matemático', slug: 'razonamiento-matematico' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Resolución de Problemas', slug: 'resolucion-problemas' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Pensamiento Espacial y Geométrico', slug: 'pensamiento-espacial-geometrico' },
    { areaSlug: 'pensamiento-logico-matematico', name: 'Medición y Datos', slug: 'medicion-datos' },
    { areaSlug: 'habilidades-cognitivas', name: 'Atención', slug: 'atencion' },
    { areaSlug: 'habilidades-cognitivas', name: 'Percepción Visual', slug: 'percepcion-visual' },
    { areaSlug: 'habilidades-cognitivas', name: 'Percepción Auditiva', slug: 'percepcion-auditiva' },
    { areaSlug: 'habilidades-cognitivas', name: 'Memoria Sensorial', slug: 'memoria-sensorial' },
    { areaSlug: 'habilidades-cognitivas', name: 'Procesamiento Visual', slug: 'procesamiento-visual' },
    { areaSlug: 'habilidades-cognitivas', name: 'Procesamiento Auditivo', slug: 'procesamiento-auditivo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Memoria de Trabajo', slug: 'memoria-de-trabajo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Razonamiento Inductivo', slug: 'razonamiento-inductivo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Razonamiento Deductivo', slug: 'razonamiento-deductivo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Pensamiento Crítico', slug: 'pensamiento-critico' },
    { areaSlug: 'habilidades-cognitivas', name: 'Metacognición', slug: 'metacognicion' },
    { areaSlug: 'habilidades-cognitivas', name: 'Control Inhibitorio', slug: 'control-inhibitorio' },
    { areaSlug: 'habilidades-cognitivas', name: 'Flexibilidad Cognitiva', slug: 'flexibilidad-cognitiva' },
    { areaSlug: 'habilidades-cognitivas', name: 'Planificación', slug: 'planificacion' },
    { areaSlug: 'habilidades-cognitivas', name: 'Organización', slug: 'organizacion' },
    { areaSlug: 'habilidades-cognitivas', name: 'Monitoreo', slug: 'monitoreo' },
    { areaSlug: 'habilidades-cognitivas', name: 'Iniciación de Tareas', slug: 'iniciacion-tareas' },
  ]

  const areaMap = new Map(areas.map(a => [a.slug, a.id]))
  await prisma.subarea.createMany({
    data: subareaData.map(s => ({
      areaId: areaMap.get(s.areaSlug)!,
      name: s.name,
      slug: s.slug,
    })),
  })
  const subareas = await prisma.subarea.findMany()

  // ──── 6. Tags (etiquetas) ────
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

  // ──── 7. Recursos de evaluación y material educativo ────
  const resourcesData = [
    { title: 'Evaluación de Conciencia Fonológica - Prekínder', desc: 'Instrumento diseñado para evaluar el desarrollo de la conciencia fonológica en estudiantes de Prekínder (4-5 años). Incluye actividades de identificación de sonidos iniciales, rimas, segmentación silábica y manipulación de fonemas. Ideal para detectar tempranamente dificultades en la base de la lectoescritura. Contiene 15 ítems con instrucciones para el evaluador y hoja de registro de resultados.', course: 'prekinder', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-fonologica', 'discriminacion-auditiva'] },
    { title: 'Prueba de Vocabulario Pasivo - Prekínder', desc: 'Evaluación del vocabulario receptivo en niños de 4 a 5 años. Presenta 20 láminas con imágenes para que el niño identifique la palabra mencionada por el evaluador. Evalúa sustantivos, verbos y conceptos espaciales básicos. Incluye protocolo de aplicación, hoja de registro y tabla de puntuaciones normalizadas para el nivel Prekínder.', course: 'prekinder', area: 'lectoescritura', free: false, price: 5990, tags: ['vocabulario', 'conciencia-semantica'] },
    { title: 'Test de Discriminación Auditiva', desc: 'Evalúa la capacidad de diferenciar sonidos del habla en niveles iniciales. Compuesto por 12 pares de palabras con diferencias fonéticas mínimas (pares mínimos). Permite identificar dificultades de discriminación auditiva que pueden afectar el desarrollo fonológico y la adquisición de la lectoescritura. Incluye guía de aplicación y análisis de resultados.', course: 'prekinder', area: 'lectoescritura', free: true, price: 0, tags: ['discriminacion-auditiva', 'conciencia-fonologica'] },
    { title: 'Evaluación de Nociones Numéricas Básicas', desc: 'Evalúa las nociones pre-numéricas fundamentales en educación inicial: clasificación de objetos por atributos, seriación por tamaño y longitud, correspondencia uno a uno y conservación de cantidad. Incluye material manipulable recortable y hoja de registro. Ideal para diagnóstico inicial en Prekínder.', course: 'prekinder', area: 'pensamiento-logico-matematico', free: true, price: 0, tags: ['numeracion', 'razonamiento-matematico'] },
    { title: 'Test de Razonamiento Lógico Preoperacional', desc: 'Instrumento basado en la teoría de Piaget para evaluar el pensamiento preoperacional en niños de 4 a 6 años. Evalúa funciones cognitivas como clasificación jerárquica, seriación múltiple, correspondencia término a término y pensamiento analógico. Incluye 18 ítems con material concreto y hoja de registro.', course: 'prekinder', area: 'pensamiento-logico-matematico', free: false, price: 4990, tags: ['razonamiento-matematico', 'categorizacion'] },
    { title: 'Evaluación de Percepción Visual - Nivel Inicial', desc: 'Evalúa habilidades perceptivas visuales básicas en niños de 4 a 6 años: discriminación figura-fondo, constancia perceptual, cierre visual y posición en el espacio. Incluye 20 láminas a color con actividades progresivas. Fundamental para detectar dificultades que pueden afectar la lectoescritura y el aprendizaje matemático.', course: 'prekinder', area: 'habilidades-cognitivas', subarea: 'percepcion-visual', free: true, price: 0, tags: ['percepcion-visual', 'atencion'] },
    { title: 'Test de Atención Selectiva Infantil', desc: 'Instrumento para medir la capacidad de atención sostenida y selectiva en niños de 4 a 7 años. Presenta tareas de búsqueda visual con distractores, cancelación de figuras y pruebas de velocidad de procesamiento. Incluye normas por rango etario y recomendaciones para la intervención.', course: 'prekinder', area: 'habilidades-cognitivas', subarea: 'atencion', free: false, price: 5990, tags: ['atencion', 'inhibicion'] },
    { title: 'Evaluación de Fluidez Lectora Inicial', desc: 'Mide velocidad, precisión y prosodia en lectura de primer año básico. Incluye tres textos progresivos (nivel inicial, intermedio y avanzado) con registro de palabras por minuto, errores y expresión lectora. Incluye tabla de puntos de corte y recomendaciones pedagógicas según el nivel lector obtenido.', course: '1-basico', area: 'lectoescritura', free: false, price: 5990, tags: ['fluidez-lectora', 'comprension-lectora'] },
    { title: 'Prueba de Comprensión Lectora - 1° Básico', desc: 'Evaluación de comprensión literal e inferencial para estudiantes de primer año básico. Contiene 3 textos breves (narrativo, informativo y descriptivo) con preguntas de selección múltiple y respuesta abierta. Evalúa identificación de personajes, secuencia de eventos, causa-efecto e inferencias simples.', course: '1-basico', area: 'lectoescritura', free: true, price: 0, tags: ['comprension-lectora', 'vocabulario'] },
    { title: 'Test de Grafomotricidad y Escritura', desc: 'Evalúa habilidades grafomotoras y producción escrita inicial en estudiantes de 1° básico. Incluye ejercicios de trazos, copia de formas, escritura de letras y palabras, y producción de oraciones simples. Permite identificar dificultades en la coordinación visomotora y la calidad grafomotora que afectan la escritura legible.', course: '1-basico', area: 'lectoescritura', free: false, price: 4990, tags: ['grafomotricidad', 'conciencia-fonologica'] },
    { title: 'Evaluación de Conciencia Fonológica - 1° Básico', desc: 'Versión avanzada para evaluar segmentación y manipulación fonémica en estudiantes de primer año básico. Incluye tareas de aislar fonemas, contar fonemas, segmentar palabras en fonemas, omitir y agregar fonemas para formar nuevas palabras. Instrumento clave para identificar riesgo de dificultades lectoras.', course: '1-basico', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-fonologica', 'discriminacion-auditiva'] },
    { title: 'Evaluación de Cálculo y Numeración - 1° Básico', desc: 'Evalúa las competencias numéricas fundamentales de primer año básico: conteo hasta 100, lectura y escritura de números, comparación de cantidades, adición y sustracción simples, y resolución de problemas cotidianos. Incluye 25 ítems con apoyo visual y tabla de rendimiento esperado.', course: '1-basico', area: 'pensamiento-logico-matematico', free: false, price: 5990, tags: ['numeracion', 'razonamiento-matematico'] },
    { title: 'Test de Resolución de Problemas Simples', desc: 'Mide la capacidad de resolver problemas aditivos elementales en estudiantes de 1° básico. Incluye problemas de cambio, combinación, comparación e igualación con números hasta 20. Evalúa comprensión del enunciado, selección de operación y precisión en el cálculo. Incluye pauta de corrección y análisis de errores.', course: '1-basico', area: 'pensamiento-logico-matematico', free: true, price: 0, tags: ['resolucion-de-problemas', 'razonamiento-matematico'] },
    { title: 'Evaluación de Funciones Ejecutivas - 1° Básico', desc: 'Instrumento comprehensivo para evaluar funciones ejecutivas básicas en estudiantes de 1° básico: control inhibitorio, memoria de trabajo y flexibilidad cognitiva. Incluye actividades lúdicas y pauta de observación conductual.', course: '1-basico', area: 'habilidades-cognitivas', subarea: 'control-inhibitorio', free: false, price: 7990, tags: ['funciones-ejecutivas', 'memoria-de-trabajo', 'inhibicion'] },
    { title: 'Test de Memoria de Trabajo Verbal', desc: 'Instrumento para medir la capacidad de retención y manipulación de información verbal en estudiantes de 1° a 4° básico. Incluye tareas de dígitos directos e inversos, span de palabras y span de oraciones. Evalúa el bucle fonológico y el ejecutivo central. Incluye normas por edad y recomendaciones de intervención.', course: '1-basico', area: 'habilidades-cognitivas', subarea: 'memoria-de-trabajo', free: false, price: 5990, tags: ['memoria-de-trabajo', 'atencion'] },
    { title: 'Evaluación de Planificación y Organización', desc: 'Mide la capacidad de planificar y organizar tareas simples en estudiantes de 1° a 3° básico. Incluye actividades de secuenciación de pasos, organización de materiales, estimación de tiempo y seguimiento de instrucciones complejas.', course: '1-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: true, price: 0, tags: ['planificacion', 'organizacion'] },
    { title: 'Evaluación de Comprensión Lectora - 2° Básico', desc: 'Texto narrativo con preguntas literales e inferenciales para segundo año básico. Incluye un cuento breve seguido de preguntas de identificación de personajes, espacio y tiempo, secuencia narrativa, causa-efecto, inferencia y opinión personal.', course: '2-basico', area: 'lectoescritura', free: true, price: 0, tags: ['comprension-lectora', 'fluidez-lectora'] },
    { title: 'Prueba de Producción de Textos Narrativos', desc: 'Evalúa la capacidad de producir narraciones con estructura coherente en estudiantes de 2° a 4° básico. Solicita la escritura de un cuento a partir de una imagen estimulante. Evalúa estructura narrativa, cohesión, coherencia, vocabulario y aspectos formales de la escritura.', course: '2-basico', area: 'lectoescritura', free: false, price: 4990, tags: ['grafomotricidad', 'organizacion'] },
    { title: 'Evaluación de Razonamiento Matemático - 2° Básico', desc: 'Problemas de adición, sustracción y comparación para segundo año básico. Incluye 20 problemas matemáticos progresivos que evalúan comprensión de enunciados, selección de estrategias de resolución, cálculo escrito y verificación de resultados.', course: '2-basico', area: 'pensamiento-logico-matematico', free: false, price: 5990, tags: ['razonamiento-matematico', 'resolucion-de-problemas'] },
    { title: 'Test de Seriación y Patrones', desc: 'Evalúa la capacidad de identificar, continuar y crear secuencias lógicas y patrones en estudiantes de 2° a 4° básico. Incluye patrones gráficos, numéricos y mixtos con progresión creciente de dificultad.', course: '2-basico', area: 'pensamiento-logico-matematico', free: true, price: 0, tags: ['secuencia-temporal', 'categorizacion'] },
    { title: 'Evaluación de Flexibilidad Cognitiva', desc: 'Instrumento para medir la capacidad de cambiar entre reglas, perspectivas y estrategias en estudiantes de 3° a 6° básico. Fundamental para evaluar funciones ejecutivas superiores.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'flexibilidad-cognitiva', free: false, price: 6990, tags: ['flexibilidad-cognitiva', 'funciones-ejecutivas'] },
    { title: 'Test de Atención Sostenida', desc: 'Evaluación de la capacidad de mantener la atención en una tarea continua durante un período prolongado en estudiantes de 3° a 6° básico. Incluye tareas de cancelación visual con estímulos distractores.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'atencion', free: true, price: 0, tags: ['atencion', 'inhibicion'] },
    { title: 'Evaluación de Memoria de Trabajo Visoespacial', desc: 'Mide la capacidad de retener y manipular información visual y espacial en estudiantes de 3° a 6° básico. Incluye tareas de matrices, patrones visuales, memoria de localización espacial y span visoespacial.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'memoria-de-trabajo', free: false, price: 5990, tags: ['memoria-de-trabajo', 'percepcion-visual'] },
    { title: 'Evaluación de Conciencia Fonológica - Kínder', desc: 'Evalúa habilidades fonológicas básicas en estudiantes de Kínder: rimas, segmentación silábica, identificación de sonidos iniciales y finales. Incluye 25 ítems con apoyo visual a todo color.', course: 'kinder', area: 'lectoescritura', free: false, price: 4990, tags: ['conciencia-fonologica', 'discriminacion-auditiva'] },
    { title: 'Prueba de Habilidades Pre-Lectoras', desc: 'Evalúa los prerequisitos para la lectura en niños de Kínder: conocimiento del alfabeto, conciencia fonológica, vocabulario visual y comprensión oral.', course: 'kinder', area: 'lectoescritura', free: true, price: 0, tags: ['vocabulario'] },
    { title: 'Evaluación de Nociones Matemáticas Básicas', desc: 'Evalúa conceptos matemáticos fundamentales en Kínder: clasificación, seriación, correspondencia uno a uno, conteo oral y reconocimiento de números del 1 al 20.', course: 'kinder', area: 'pensamiento-logico-matematico', free: false, price: 4990, tags: ['razonamiento-matematico', 'categorizacion'] },
    { title: 'Test de Atención y Memoria Visual', desc: 'Evalúa atención sostenida, memoria visual a corto plazo y discriminación visual en niños de Kínder a 1° básico.', course: 'kinder', area: 'habilidades-cognitivas', subarea: 'memoria-de-trabajo', free: false, price: 5990, tags: ['memoria-de-trabajo', 'atencion'] },
    { title: 'Evaluación de Lectura Comprensiva - 4° Básico', desc: 'Textos expositivos y narrativos con preguntas de análisis para cuarto año básico. Evalúa habilidades de localización de información, inferencia, interpretación y reflexión.', course: '4-basico', area: 'lectoescritura', free: false, price: 5990, tags: ['comprension-lectora', 'vocabulario'] },
    { title: 'Prueba de Conciencia Semántica', desc: 'Evalúa relaciones semánticas en estudiantes de 4° a 6° básico: sinónimos, antónimos, categorías semánticas, campo semántico, definiciones y uso contextual del vocabulario.', course: '4-basico', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-semantica', 'categorizacion'] },
    { title: 'Evaluación de Resolución de Problemas Complejos', desc: 'Problemas de pasos múltiples con operaciones combinadas para cuarto año básico. Incluye 15 problemas que requieren planificación y selección de estrategias múltiples.', course: '4-basico', area: 'pensamiento-logico-matematico', free: false, price: 6990, tags: ['resolucion-de-problemas', 'razonamiento-matematico'] },
    { title: 'Evaluación de Control Inhibitorio', desc: 'Mide la capacidad de suprimir respuestas automáticas y controlar impulsos en estudiantes de 5° a 8° básico. Incluye tareas de tipo Stroop, tareas Go/No-Go y pruebas de interferencia.', course: '5-basico', area: 'habilidades-cognitivas', subarea: 'control-inhibitorio', free: false, price: 6990, tags: ['inhibicion', 'funciones-ejecutivas'] },
    { title: 'Test de Razonamiento Abstracto', desc: 'Evalúa la capacidad de razonar con conceptos abstractos, identificar analogías y establecer relaciones lógicas en estudiantes de 5° a 8° básico.', course: '5-basico', area: 'habilidades-cognitivas', subarea: 'razonamiento-inductivo', free: true, price: 0, tags: ['flexibilidad-cognitiva', 'categorizacion'] },
    { title: 'Evaluación de Funciones Ejecutivas Avanzadas', desc: 'Evalúa funciones ejecutivas superiores en estudiantes de 6° a 8° básico: planificación compleja, organización estratégica, monitoreo y flexibilidad cognitiva avanzada.', course: '6-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: false, price: 8990, tags: ['funciones-ejecutivas', 'planificacion', 'organizacion'] },
    { title: 'Prueba de Comprensión Lectora Crítica', desc: 'Evalúa la capacidad de análisis crítico y reflexión sobre textos en estudiantes de 6° a 8° básico. Incluye textos argumentativos y puntos de vista contrapuestos.', course: '6-basico', area: 'lectoescritura', free: false, price: 5990, tags: ['comprension-lectora', 'vocabulario'] },
    { title: 'Evaluación de Razonamiento Matemático Avanzado', desc: 'Problemas con fracciones, decimales, razonamiento proporcional y pensamiento algebraico inicial para estudiantes de 7° a 8° básico.', course: '7-basico', area: 'pensamiento-logico-matematico', free: false, price: 6990, tags: ['razonamiento-matematico', 'resolucion-de-problemas'] },
    { title: 'Evaluación Integral de Funciones Cognitivas - 8° Básico', desc: 'Batería completa de funciones ejecutivas y habilidades cognitivas superiores para estudiantes de 8° básico. Evalúa memoria de trabajo, planificación, organización, flexibilidad cognitiva, control inhibitorio, razonamiento abstracto y metacognición.', course: '8-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: false, price: 9990, tags: ['funciones-ejecutivas', 'memoria-de-trabajo', 'planificacion', 'flexibilidad-cognitiva'] },
    { title: 'Fichas de Apoyo: Conciencia Fonológica', desc: 'Set de 20 fichas imprimibles a todo color para reforzar la conciencia fonológica en el aula o en casa.', course: '1-basico', area: 'lectoescritura', free: true, price: 0, tags: ['conciencia-fonologica', 'discriminacion-auditiva'], type: 'educational' },
    { title: 'Cuadernillo de Grafomotricidad', desc: 'Ejercicios progresivos de trazos y coordinación visomotora para estudiantes de Prekínder a 1° básico.', course: 'prekinder', area: 'lectoescritura', free: false, price: 3990, tags: ['grafomotricidad'], type: 'educational' },
    { title: 'Juego de Tarjetas: Razonamiento Matemático', desc: 'Set de 40 tarjetas recortables a color con problemas matemáticos para trabajo en grupos o estaciones de aprendizaje.', course: '2-basico', area: 'pensamiento-logico-matematico', free: false, price: 4990, tags: ['razonamiento-matematico', 'resolucion-de-problemas'], type: 'educational' },
    { title: 'Guía de Estrategias para Funciones Ejecutivas', desc: 'Manual completo para docentes con más de 25 actividades prácticas para estimular las funciones ejecutivas en el aula regular.', course: '3-basico', area: 'habilidades-cognitivas', subarea: 'planificacion', free: true, price: 0, tags: ['funciones-ejecutivas', 'planificacion'], type: 'educational' },
  ]

  const courseMap = new Map(courses.map(c => [c.slug, c.id]))
  const subareaMap = new Map(subareas.map(s => [s.slug, s.id]))

  await prisma.resource.createMany({
    data: resourcesData.map(r => ({
      title: r.title,
      description: r.desc,
      filePath: `/pdfs/${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`,
      previewPath: `/previews/placeholder.svg`,
      resourceType: 'type' in r ? (r as { type: string }).type : 'evaluation',
      isFree: r.free,
      priceClp: r.price || null,
      courseId: courseMap.get(r.course)!,
      areaId: areaMap.get(r.area)!,
      subareaId: r.subarea ? subareaMap.get(r.subarea) || null : null,
      downloadsCount: Math.floor(Math.random() * 200),
    })),
  })
  const allResources = await prisma.resource.findMany()
  const resourceMap = new Map(allResources.map(r => [r.title, r.id]))

  const allTags = await prisma.tag.findMany()
  const tagMap = new Map(allTags.map(t => [t.slug, t.id]))

  const resourceTagData: Array<{ resourceId: string; tagId: number }> = []
  for (const r of resourcesData) {
    const resourceId = resourceMap.get(r.title)
    if (!resourceId) continue
    for (const tagSlug of r.tags) {
      const tagId = tagMap.get(tagSlug)
      if (tagId) resourceTagData.push({ resourceId, tagId })
    }
  }
  await prisma.resourceTag.createMany({ data: resourceTagData, skipDuplicates: true })

  // ──── 8. Códigos de descuento de ejemplo ────
  await prisma.discountCode.createMany({
    data: [
      { code: 'BIENVENIDO10', discountPct: 10, maxUses: 100, expiresAt: new Date('2026-12-31') },
      { code: 'PSICOPED50', discountPct: 50, maxUses: 10, expiresAt: new Date('2026-08-31') },
    ]
  })

  // ──── 9. Posts de Instagram de ejemplo ────
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
