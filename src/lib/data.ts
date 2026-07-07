export interface Course {
  id: number
  name: string
  slug: string
  sortOrder: number
}

export interface Area {
  id: number
  name: string
  slug: string
  sortOrder: number
}

export interface Subarea {
  id: number
  areaId: number
  name: string
  slug: string
}

export interface Resource {
  id: string
  title: string
  description: string
  filePath: string
  previewPath: string
  resourceType: 'evaluation' | 'educational'
  isFree: boolean
  priceClp: number | null
  promoFreeUntil?: string | null
  courseId: number
  areaId: number
  subareaId: number | null
  downloadsCount: number
  isActive?: boolean
  courseName?: string
  areaName?: string
  subareaName?: string
  tags: string[]
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface SocialPost {
  id: number
  mediaUrl: string
  caption: string
  permalink: string
  postedAt: string
}

// --- Mock Data ---

export const courses: Course[] = [
  { id: 1, name: 'Prekínder', slug: 'prekinder', sortOrder: 1 },
  { id: 2, name: 'Kínder', slug: 'kinder', sortOrder: 2 },
  { id: 3, name: '1° Básico', slug: '1-basico', sortOrder: 3 },
  { id: 4, name: '2° Básico', slug: '2-basico', sortOrder: 4 },
  { id: 5, name: '3° Básico', slug: '3-basico', sortOrder: 5 },
  { id: 6, name: '4° Básico', slug: '4-basico', sortOrder: 6 },
  { id: 7, name: '5° Básico', slug: '5-basico', sortOrder: 7 },
  { id: 8, name: '6° Básico', slug: '6-basico', sortOrder: 8 },
  { id: 9, name: '7° Básico', slug: '7-basico', sortOrder: 9 },
  { id: 10, name: '8° Básico', slug: '8-basico', sortOrder: 10 },
]

export const areas: Area[] = [
  { id: 1, name: 'Lectoescritura', slug: 'lectoescritura', sortOrder: 1 },
  { id: 2, name: 'Pensamiento Lógico Matemático', slug: 'pensamiento-logico-matematico', sortOrder: 2 },
  { id: 3, name: 'Habilidades Cognitivas', slug: 'habilidades-cognitivas', sortOrder: 3 },
]

export const subareas: Subarea[] = [
  // Lectoescritura
  { id: 1, areaId: 1, name: 'Conciencia Fonológica', slug: 'conciencia-fonologica' },
  { id: 2, areaId: 1, name: 'Conciencia Semántica', slug: 'conciencia-semantica' },
  { id: 3, areaId: 1, name: 'Conciencia Sintáctica', slug: 'conciencia-sintactica' },
  { id: 4, areaId: 1, name: 'Decodificación Lectora', slug: 'decodificacion-lectora' },
  { id: 5, areaId: 1, name: 'Fluidez Lectora', slug: 'fluidez-lectora' },
  { id: 6, areaId: 1, name: 'Comprensión Lectora', slug: 'comprension-lectora' },
  { id: 7, areaId: 1, name: 'Producción Escrita', slug: 'produccion-escrita' },
  { id: 8, areaId: 1, name: 'Grafomotricidad', slug: 'grafomotricidad' },
  // Pensamiento Lógico Matemático
  { id: 9, areaId: 2, name: 'Nociones Pre-numéricas', slug: 'nociones-pre-numericas' },
  { id: 10, areaId: 2, name: 'Numeración y Conteo', slug: 'numeracion-conteo' },
  { id: 11, areaId: 2, name: 'Sistema de Numeración Decimal', slug: 'sistema-numeracion-decimal' },
  { id: 12, areaId: 2, name: 'Cálculo y Operatoria', slug: 'calculo-operatoria' },
  { id: 13, areaId: 2, name: 'Razonamiento Matemático', slug: 'razonamiento-matematico' },
  { id: 14, areaId: 2, name: 'Resolución de Problemas', slug: 'resolucion-problemas' },
  { id: 15, areaId: 2, name: 'Pensamiento Espacial y Geométrico', slug: 'pensamiento-espacial-geometrico' },
  { id: 16, areaId: 2, name: 'Medición y Datos', slug: 'medicion-datos' },
  // Habilidades Cognitivas - Base
  { id: 17, areaId: 3, name: 'Atención', slug: 'atencion' },
  { id: 18, areaId: 3, name: 'Percepción Visual', slug: 'percepcion-visual' },
  { id: 19, areaId: 3, name: 'Percepción Auditiva', slug: 'percepcion-auditiva' },
  { id: 20, areaId: 3, name: 'Memoria Sensorial', slug: 'memoria-sensorial' },
  { id: 21, areaId: 3, name: 'Procesamiento Visual', slug: 'procesamiento-visual' },
  { id: 22, areaId: 3, name: 'Procesamiento Auditivo', slug: 'procesamiento-auditivo' },
  // Habilidades Cognitivas - Superiores
  { id: 23, areaId: 3, name: 'Memoria de Trabajo', slug: 'memoria-de-trabajo' },
  { id: 24, areaId: 3, name: 'Razonamiento Inductivo', slug: 'razonamiento-inductivo' },
  { id: 25, areaId: 3, name: 'Razonamiento Deductivo', slug: 'razonamiento-deductivo' },
  { id: 26, areaId: 3, name: 'Pensamiento Crítico', slug: 'pensamiento-critico' },
  { id: 27, areaId: 3, name: 'Metacognición', slug: 'metacognicion' },
  // Habilidades Cognitivas - Funciones Ejecutivas
  { id: 28, areaId: 3, name: 'Control Inhibitorio', slug: 'control-inhibitorio' },
  { id: 29, areaId: 3, name: 'Flexibilidad Cognitiva', slug: 'flexibilidad-cognitiva' },
  { id: 30, areaId: 3, name: 'Planificación', slug: 'planificacion' },
  { id: 31, areaId: 3, name: 'Organización', slug: 'organizacion' },
  { id: 32, areaId: 3, name: 'Monitoreo', slug: 'monitoreo' },
  { id: 33, areaId: 3, name: 'Iniciación de Tareas', slug: 'iniciacion-tareas' },
]

export const allTags: Tag[] = [
  { id: 1, name: 'memoria de trabajo', slug: 'memoria-de-trabajo' },
  { id: 2, name: 'atención', slug: 'atencion' },
  { id: 3, name: 'conciencia fonológica', slug: 'conciencia-fonologica' },
  { id: 4, name: 'comprensión lectora', slug: 'comprension-lectora' },
  { id: 5, name: 'razonamiento matemático', slug: 'razonamiento-matematico' },
  { id: 6, name: 'numeración', slug: 'numeracion' },
  { id: 7, name: 'resolución de problemas', slug: 'resolucion-de-problemas' },
  { id: 8, name: 'grafomotricidad', slug: 'grafomotricidad' },
  { id: 9, name: 'vocabulario', slug: 'vocabulario' },
  { id: 10, name: 'fluidez lectora', slug: 'fluidez-lectora' },
  { id: 11, name: 'funciones ejecutivas', slug: 'funciones-ejecutivas' },
  { id: 12, name: 'planificación', slug: 'planificacion' },
  { id: 13, name: 'flexibilidad cognitiva', slug: 'flexibilidad-cognitiva' },
  { id: 14, name: 'inhibición', slug: 'inhibicion' },
  { id: 15, name: 'percepción visual', slug: 'percepcion-visual' },
  { id: 16, name: 'discriminación auditiva', slug: 'discriminacion-auditiva' },
  { id: 17, name: 'conciencia semántica', slug: 'conciencia-semantica' },
  { id: 18, name: 'categorización', slug: 'categorizacion' },
  { id: 19, name: 'secuencia temporal', slug: 'secuencia-temporal' },
  { id: 20, name: 'organización', slug: 'organizacion' },
]

function makeResource(
  id: string, title: string, desc: string, courseSlug: string, areaSlug: string,
  free: boolean, price: number | null, tags: string[],
  type: 'evaluation' | 'educational' = 'evaluation', subareaSlug?: string
): Resource {
  const course = courses.find(c => c.slug === courseSlug)!
  const area = areas.find(a => a.slug === areaSlug)!
  const subarea = subareaSlug ? subareas.find(s => s.slug === subareaSlug) : undefined
  return {
    id, title, description: desc,
    filePath: `/pdfs/${id}.pdf`,
    previewPath: '/previews/placeholder.svg',
    resourceType: type, isFree: free, priceClp: price, promoFreeUntil: null,
    courseId: course.id, areaId: area.id, subareaId: subarea?.id ?? null,
    downloadsCount: Math.floor(Math.random() * 200),
    isActive: true,
    courseName: course.name, areaName: area.name, subareaName: subarea?.name,
    tags,
  }
}

export const allResources: Resource[] = [
  // Prekínder
  makeResource('r01', 'Evaluación de Conciencia Fonológica - Prekínder', 'Instrumento diseñado para evaluar el desarrollo de la conciencia fonológica en estudiantes de Prekínder (4-5 años). Incluye actividades de identificación de sonidos iniciales, rimas, segmentación silábica y manipulación de fonemas. Ideal para detectar tempranamente dificultades en la base de la lectoescritura. Contiene 15 ítems con instrucciones para el evaluador y hoja de registro de resultados.', 'prekinder', 'lectoescritura', true, null, ['conciencia fonológica', 'discriminación auditiva']),
  makeResource('r02', 'Prueba de Vocabulario Pasivo - Prekínder', 'Evaluación del vocabulario receptivo en niños de 4 a 5 años. Presenta 20 láminas con imágenes para que el niño identifique la palabra mencionada por el evaluador. Evalúa sustantivos, verbos y conceptos espaciales básicos. Incluye protocolo de aplicación, hoja de registro y tabla de puntuaciones normalizadas para el nivel Prekínder.', 'prekinder', 'lectoescritura', false, 5990, ['vocabulario', 'conciencia semántica']),
  makeResource('r03', 'Test de Discriminación Auditiva', 'Evalúa la capacidad de diferenciar sonidos del habla en niveles iniciales. Compuesto por 12 pares de palabras con diferencias fonéticas mínimas (pares mínimos). Permite identificar dificultades de discriminación auditiva que pueden afectar el desarrollo fonológico y la adquisición de la lectoescritura. Incluye guía de aplicación y análisis de resultados.', 'prekinder', 'lectoescritura', true, null, ['discriminación auditiva', 'conciencia fonológica']),
  makeResource('r04', 'Evaluación de Nociones Numéricas Básicas', 'Evalúa las nociones pre-numéricas fundamentales en educación inicial: clasificación de objetos por atributos, seriación por tamaño y longitud, correspondencia uno a uno y conservación de cantidad. Incluye material manipulable recortable y hoja de registro. Ideal para diagnóstico inicial en Prekínder.', 'prekinder', 'pensamiento-logico-matematico', true, null, ['numeración', 'razonamiento matemático']),
  makeResource('r05', 'Test de Razonamiento Lógico Preoperacional', 'Instrumento basado en la teoría de Piaget para evaluar el pensamiento preoperacional en niños de 4 a 6 años. Evalúa funciones cognitivas como clasificación jerárquica, seriación múltiple, correspondencia término a término y pensamiento analógico. Incluye 18 ítems con material concreto y hoja de registro.', 'prekinder', 'pensamiento-logico-matematico', false, 4990, ['razonamiento matemático', 'categorización']),
  makeResource('r06', 'Evaluación de Percepción Visual - Nivel Inicial', 'Evalúa habilidades perceptivas visuales básicas en niños de 4 a 6 años: discriminación figura-fondo, constancia perceptual, cierre visual y posición en el espacio. Incluye 20 láminas a color con actividades progresivas. Fundamental para detectar dificultades que pueden afectar la lectoescritura y el aprendizaje matemático.', 'prekinder', 'habilidades-cognitivas', true, null, ['percepción visual', 'atención'], 'evaluation', 'percepcion-visual'),
  makeResource('r07', 'Test de Atención Selectiva Infantil', 'Instrumento para medir la capacidad de atención sostenida y selectiva en niños de 4 a 7 años. Presenta tareas de búsqueda visual con distractores, cancelación de figuras y pruebas de velocidad de procesamiento. Incluye normas por rango etario y recomendaciones para la intervención.', 'prekinder', 'habilidades-cognitivas', false, 5990, ['atención', 'inhibición'], 'evaluation', 'atencion'),

  // 1° Básico
  makeResource('r08', 'Evaluación de Fluidez Lectora Inicial', 'Mide velocidad, precisión y prosodia en lectura de primer año básico. Incluye tres textos progresivos (nivel inicial, intermedio y avanzado) con registro de palabras por minuto, errores y expresión lectora. Incluye tabla de puntos de corte y recomendaciones pedagógicas según el nivel lector obtenido.', '1-basico', 'lectoescritura', false, 5990, ['fluidez lectora', 'comprensión lectora']),
  makeResource('r09', 'Prueba de Comprensión Lectora - 1° Básico', 'Evaluación de comprensión literal e inferencial para estudiantes de primer año básico. Contiene 3 textos breves (narrativo, informativo y descriptivo) con preguntas de selección múltiple y respuesta abierta. Evalúa identificación de personajes, secuencia de eventos, causa-efecto e inferencias simples.', '1-basico', 'lectoescritura', true, null, ['comprensión lectora', 'vocabulario']),
  makeResource('r10', 'Test de Grafomotricidad y Escritura', 'Evalúa habilidades grafomotoras y producción escrita inicial en estudiantes de 1° básico. Incluye ejercicios de trazos, copia de formas, escritura de letras y palabras, y producción de oraciones simples. Permite identificar dificultades en la coordinación visomotora y la calidad grafomotora que afectan la escritura legible.', '1-basico', 'lectoescritura', false, 4990, ['grafomotricidad', 'conciencia fonológica']),
  makeResource('r11', 'Evaluación de Conciencia Fonológica - 1° Básico', 'Versión avanzada para evaluar segmentación y manipulación fonémica en estudiantes de primer año básico. Incluye tareas de aislar fonemas, contar fonemas, segmentar palabras en fonemas, omitir y agregar fonemas para formar nuevas palabras. Instrumento clave para identificar riesgo de dificultades lectoras.', '1-basico', 'lectoescritura', true, null, ['conciencia fonológica', 'discriminación auditiva']),
  makeResource('r12', 'Evaluación de Cálculo y Numeración - 1° Básico', 'Evalúa las competencias numéricas fundamentales de primer año básico: conteo hasta 100, lectura y escritura de números, comparación de cantidades, adición y sustracción simples, y resolución de problemas cotidianos. Incluye 25 ítems con apoyo visual y tabla de rendimiento esperado.', '1-basico', 'pensamiento-logico-matematico', false, 5990, ['numeración', 'razonamiento matemático']),
  makeResource('r13', 'Test de Resolución de Problemas Simples', 'Mide la capacidad de resolver problemas aditivos elementales en estudiantes de 1° básico. Incluye problemas de cambio, combinación, comparación e igualación con números hasta 20. Evalúa comprensión del enunciado, selección de operación y precisión en el cálculo. Incluye pauta de corrección y análisis de errores.', '1-basico', 'pensamiento-logico-matematico', true, null, ['resolución de problemas', 'razonamiento matemático']),
  makeResource('r14', 'Evaluación de Funciones Ejecutivas - 1° Básico', 'Instrumento comprehensivo para evaluar funciones ejecutivas básicas en estudiantes de 1° básico: control inhibitorio (capacidad de suprimir respuestas automáticas), memoria de trabajo (retención y manipulación de información) y flexibilidad cognitiva (cambio entre reglas y perspectivas). Incluye actividades lúdicas y pauta de observación conductual.', '1-basico', 'habilidades-cognitivas', false, 7990, ['funciones ejecutivas', 'memoria de trabajo', 'inhibición'], 'evaluation', 'control-inhibitorio'),
  makeResource('r15', 'Test de Memoria de Trabajo Verbal', 'Instrumento para medir la capacidad de retención y manipulación de información verbal en estudiantes de 1° a 4° básico. Incluye tareas de dígitos directos e inversos, span de palabras y span de oraciones. Evalúa el bucle fonológico y el ejecutivo central. Incluye normas por edad y recomendaciones de intervención.', '1-basico', 'habilidades-cognitivas', false, 5990, ['memoria de trabajo', 'atención'], 'evaluation', 'memoria-de-trabajo'),
  makeResource('r16', 'Evaluación de Planificación y Organización', 'Mide la capacidad de planificar y organizar tareas simples en estudiantes de 1° a 3° básico. Incluye actividades de secuenciación de pasos, organización de materiales, estimación de tiempo y seguimiento de instrucciones complejas. Instrumento ideal para evaluar funciones ejecutivas en el contexto del aula regular.', '1-basico', 'habilidades-cognitivas', true, null, ['planificación', 'organización'], 'evaluation', 'planificacion'),

  // 2° Básico
  makeResource('r17', 'Evaluación de Comprensión Lectora - 2° Básico', 'Texto narrativo con preguntas literales e inferenciales para segundo año básico. Incluye un cuento breve seguido de preguntas de identificación de personajes, espacio y tiempo, secuencia narrativa, causa-efecto, inferencia y opinión personal. Evalúa también vocabulario en contexto.', '2-basico', 'lectoescritura', true, null, ['comprensión lectora', 'fluidez lectora']),
  makeResource('r18', 'Prueba de Producción de Textos Narrativos', 'Evalúa la capacidad de producir narraciones con estructura coherente en estudiantes de 2° a 4° básico. Solicita la escritura de un cuento a partir de una imagen estimulante. Evalúa estructura narrativa (inicio, desarrollo, final), cohesión, coherencia, vocabulario y aspectos formales de la escritura. Incluye rúbrica de evaluación.', '2-basico', 'lectoescritura', false, 4990, ['grafomotricidad', 'organización']),
  makeResource('r19', 'Evaluación de Razonamiento Matemático - 2° Básico', 'Problemas de adición, sustracción y comparación para segundo año básico. Incluye 20 problemas matemáticos progresivos que evalúan comprensión de enunciados, selección de estrategias de resolución, cálculo escrito y verificación de resultados. Incluye pauta de corrección detallada con análisis de errores frecuentes.', '2-basico', 'pensamiento-logico-matematico', false, 5990, ['razonamiento matemático', 'resolución de problemas']),
  makeResource('r20', 'Test de Seriación y Patrones', 'Evalúa la capacidad de identificar, continuar y crear secuencias lógicas y patrones en estudiantes de 2° a 4° básico. Incluye patrones gráficos, numéricos y mixtos con progresión creciente de dificultad. Evalúa pensamiento lógico, razonamiento inductivo y capacidad de abstracción.', '2-basico', 'pensamiento-logico-matematico', true, null, ['secuencia temporal', 'categorización']),

  // 3° Básico
  makeResource('r21', 'Evaluación de Flexibilidad Cognitiva', 'Instrumento para medir la capacidad de cambiar entre reglas, perspectivas y estrategias en estudiantes de 3° a 6° básico. Incluye tareas de clasificación múltiple, cambios de criterio, generación de alternativas y resolución de problemas desde múltiples perspectivas. Fundamental para evaluar funciones ejecutivas superiores.', '3-basico', 'habilidades-cognitivas', false, 6990, ['flexibilidad cognitiva', 'funciones ejecutivas'], 'evaluation', 'flexibilidad-cognitiva'),
  makeResource('r22', 'Test de Atención Sostenida', 'Evaluación de la capacidad de mantener la atención en una tarea continua durante un período prolongado en estudiantes de 3° a 6° básico. Incluye tareas de cancelación visual con estímulos distractores y registro de aciertos, omisiones y falsas alarmas. Incluye índices de atención sostenida y control de impulsos.', '3-basico', 'habilidades-cognitivas', true, null, ['atención', 'inhibición'], 'evaluation', 'atencion'),
  makeResource('r23', 'Evaluación de Memoria de Trabajo Visoespacial', 'Mide la capacidad de retener y manipular información visual y espacial en estudiantes de 3° a 6° básico. Incluye tareas de matrices, patrones visuales, memoria de localización espacial y span visoespacial. Evalúa el componente visoespacial de la memoria de trabajo, fundamental para el aprendizaje matemático y la lectura.', '3-basico', 'habilidades-cognitivas', false, 5990, ['memoria de trabajo', 'percepción visual'], 'evaluation', 'memoria-de-trabajo'),

  // 4° Básico
  makeResource('r24', 'Evaluación de Lectura Comprensiva - 4° Básico', 'Textos expositivos y narrativos con preguntas de análisis para cuarto año básico. Incluye dos textos de diferente tipología (expositivo-científico y narrativo-literario) con preguntas de comprensión literal, inferencial, crítica y vocabulario contextual. Evalúa habilidades de localización de información, inferencia, interpretación y reflexión.', '4-basico', 'lectoescritura', false, 5990, ['comprensión lectora', 'vocabulario']),
  makeResource('r25', 'Prueba de Conciencia Semántica', 'Evalúa relaciones semánticas en estudiantes de 4° a 6° básico: sinónimos, antónimos, categorías semánticas, campo semántico, definiciones y uso contextual del vocabulario. Incluye 30 ítems con progresión de dificultad. Permite identificar dificultades en la organización del léxico mental que afectan la comprensión lectora y la producción escrita.', '4-basico', 'lectoescritura', true, null, ['conciencia semántica', 'categorización']),
  makeResource('r26', 'Evaluación de Resolución de Problemas Complejos', 'Problemas de pasos múltiples con operaciones combinadas para cuarto año básico. Incluye 15 problemas que requieren planificación, selección de estrategias múltiples, ejecución de varios pasos y verificación de resultados. Evalúa pensamiento matemático avanzado, razonamiento lógico y capacidad de abstracción.', '4-basico', 'pensamiento-logico-matematico', false, 6990, ['resolución de problemas', 'razonamiento matemático']),

  // 5° Básico
  makeResource('r27', 'Evaluación de Control Inhibitorio', 'Mide la capacidad de suprimir respuestas automáticas y controlar impulsos en estudiantes de 5° a 8° básico. Incluye tareas de tipo Stroop, tareas Go/No-Go y pruebas de interferencia. Evalúa el componente de inhibición de las funciones ejecutivas, fundamental para la autorregulación del comportamiento y el aprendizaje.', '5-basico', 'habilidades-cognitivas', false, 6990, ['inhibición', 'funciones ejecutivas'], 'evaluation', 'control-inhibitorio'),
  makeResource('r28', 'Test de Razonamiento Abstracto', 'Evalúa la capacidad de razonar con conceptos abstractos, identificar analogías y establecer relaciones lógicas en estudiantes de 5° a 8° básico. Incluye matrices progresivas, analogías verbales y figurativas, clasificación abstracta y razonamiento deductivo. Instrumento ideal para evaluar inteligencia fluida y pensamiento crítico.', '5-basico', 'habilidades-cognitivas', true, null, ['flexibilidad cognitiva', 'categorización'], 'evaluation', 'razonamiento-inductivo'),

  // 6° Básico
  makeResource('r29', 'Evaluación de Funciones Ejecutivas Avanzadas', 'Evalúa funciones ejecutivas superiores en estudiantes de 6° a 8° básico: planificación compleja, organización estratégica, monitoreo de la propia ejecución y flexibilidad cognitiva avanzada. Incluye tareas de resolución de problemas complejos, organización de proyectos y autoevaluación. Incluye perfil ejecutivo individual y recomendaciones.', '6-basico', 'habilidades-cognitivas', false, 8990, ['funciones ejecutivas', 'planificación', 'organización'], 'evaluation', 'planificacion'),
  makeResource('r30', 'Prueba de Comprensión Lectora Crítica', 'Evalúa la capacidad de análisis crítico y reflexión sobre textos en estudiantes de 6° a 8° básico. Incluye textos argumentativos y puntos de vista contrapuestos. Evalúa identificación de sesgos, evaluación de argumentos, distinción entre hecho y opinión, y formulación de juicios fundamentados con evidencia textual.', '6-basico', 'lectoescritura', false, 5990, ['comprensión lectora', 'vocabulario']),

  // 7° Básico
  makeResource('r31', 'Evaluación de Razonamiento Matemático Avanzado', 'Problemas con fracciones, decimales, razonamiento proporcional y pensamiento algebraico inicial para estudiantes de 7° básico a 8° básico. Incluye problemas contextualizados de la vida real que requieren aplicar múltiples conceptos matemáticos, modelar situaciones y justificar razonamientos. Incluye rúbrica de evaluación.', '7-basico', 'pensamiento-logico-matematico', false, 6990, ['razonamiento matemático', 'resolución de problemas']),

  // 8° Básico
  makeResource('r32', 'Evaluación Integral de Funciones Cognitivas - 8° Básico', 'Batería completa de funciones ejecutivas y habilidades cognitivas superiores para estudiantes de 8° básico. Evalúa memoria de trabajo, planificación, organización, flexibilidad cognitiva, control inhibitorio, razonamiento abstracto y metacognición. Incluye 8 subtest con puntuaciones estandarizadas y perfil cognitivo individual detallado.', '8-basico', 'habilidades-cognitivas', false, 9990, ['funciones ejecutivas', 'memoria de trabajo', 'planificación', 'flexibilidad cognitiva'], 'evaluation', 'planificacion'),

  // Material educativo
  makeResource('r33', 'Fichas de Apoyo: Conciencia Fonológica', 'Set de 20 fichas imprimibles a todo color para reforzar la conciencia fonológica en el aula o en casa. Incluye actividades de rimas, segmentación silábica, identificación de fonemas iniciales y finales, omisión y síntesis. Cada ficha incluye instrucciones para el mediador y sugerencias de adaptación según el nivel del estudiante.', '1-basico', 'lectoescritura', true, null, ['conciencia fonológica', 'discriminación auditiva'], 'educational'),
  makeResource('r34', 'Cuadernillo de Grafomotricidad', 'Ejercicios progresivos de trazos y coordinación visomotora para estudiantes de Prekínder a 1° básico. Incluye más de 30 páginas con actividades de trazos rectos, curvos, mixtos, figuras geométricas, dibujo libre y copia de modelos. Ideal para desarrollar las habilidades motoras finas necesarias para la escritura.', 'prekinder', 'lectoescritura', false, 3990, ['grafomotricidad'], 'educational'),
  makeResource('r35', 'Juego de Tarjetas: Razonamiento Matemático', 'Set de 40 tarjetas recortables a color con problemas matemáticos para trabajo en grupos o estaciones de aprendizaje. Incluye problemas de adición, sustracción, patrones, secuencias y clasificación. Cada tarjeta tiene un nivel de dificultad (básico, intermedio, avanzado) y sugerencias para el docente.', '2-basico', 'pensamiento-logico-matematico', false, 4990, ['razonamiento matemático', 'resolución de problemas'], 'educational'),
  makeResource('r36', 'Guía de Estrategias para Funciones Ejecutivas', 'Manual completo para docentes con más de 25 actividades prácticas para estimular las funciones ejecutivas en el aula regular. Incluye estrategias para trabajar control inhibitorio, memoria de trabajo, flexibilidad cognitiva, planificación y organización. Cada actividad incluye objetivos, materiales, procedimiento y adaptaciones por nivel.', '3-basico', 'habilidades-cognitivas', true, null, ['funciones ejecutivas', 'planificación'], 'educational', 'planificacion'),
]

export const socialPosts: SocialPost[] = [
  { id: 1, mediaUrl: '/social/post1.svg', caption: '🧠 ¿Sabías que la conciencia fonológica es la base para la lectoescritura? Te compartimos actividades para trabajarla en aula. #Psicopedagogía #EducaciónChile', permalink: '#', postedAt: '2026-07-01' },
  { id: 2, mediaUrl: '/social/post2.svg', caption: '📢 Nuevo instrumento de evaluación disponible en nuestra plataforma. Ideal para evaluar funciones ejecutivas en 1° básico. #Evaluación #Neurodiversidad', permalink: '#', postedAt: '2026-06-28' },
  { id: 3, mediaUrl: '/social/post3.svg', caption: '✏️ Hoy trabajamos percepción visual con figuras y colores. Actividad recomendada para habilidades cognitivas de base en niveles iniciales. #Aula #Recursos', permalink: '#', postedAt: '2026-06-25' },
  { id: 4, mediaUrl: '/social/post4.svg', caption: '📅 No te pierdas nuestro próximo webinar: "Estrategias para evaluar funciones ejecutivas en el aula". Link en bio. #Webinar #FormaciónDocente', permalink: '#', postedAt: '2026-06-20' },
]

// Helper functions
export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find(c => c.slug === slug)
}

export function getResourcesByCourse(courseSlug: string): Resource[] {
  const course = getCourseBySlug(courseSlug)
  if (!course) return []
  return allResources.filter(r => r.courseId === course.id && r.isActive !== false)
}

export function getResourcesByCourseAndArea(courseSlug: string, areaSlug: string): Resource[] {
  const course = getCourseBySlug(courseSlug)
  const area = areas.find(a => a.slug === areaSlug)
  if (!course || !area) return []
  return allResources.filter(r => r.courseId === course.id && r.areaId === area.id && r.isActive !== false)
}

export function searchResources(query: string): { results: Resource[]; suggestions: Resource[] } {
  const q = query.toLowerCase().trim()
  if (!q) return { results: [], suggestions: [] }

  const results = allResources.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.tags.some(t => t.includes(q))
  )

  const resultTagSet = new Set(results.flatMap(r => r.tags))
  const resultIds = new Set(results.map(r => r.id))
  const suggestions = allResources.filter(r =>
    !resultIds.has(r.id) &&
    r.tags.some(t => resultTagSet.has(t))
  ).slice(0, 8)

  return { results, suggestions }
}
