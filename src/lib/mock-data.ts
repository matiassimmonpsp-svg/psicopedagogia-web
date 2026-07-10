import type { Course, Area, Subarea, Tag, Resource, SocialPost } from './interfaces'

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
    downloadsCount: 0,
    isActive: true,
    courseName: course.name, areaName: area.name, subareaName: subarea?.name,
    tags,
  }
}

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
  { id: 1, areaId: 1, name: 'Conciencia Fonológica', slug: 'conciencia-fonologica' },
  { id: 2, areaId: 1, name: 'Conciencia Semántica', slug: 'conciencia-semantica' },
  { id: 3, areaId: 1, name: 'Conciencia Sintáctica', slug: 'conciencia-sintactica' },
  { id: 4, areaId: 1, name: 'Decodificación Lectora', slug: 'decodificacion-lectora' },
  { id: 5, areaId: 1, name: 'Fluidez Lectora', slug: 'fluidez-lectora' },
  { id: 6, areaId: 1, name: 'Comprensión Lectora', slug: 'comprension-lectora' },
  { id: 7, areaId: 1, name: 'Producción Escrita', slug: 'produccion-escrita' },
  { id: 8, areaId: 1, name: 'Grafomotricidad', slug: 'grafomotricidad' },
  { id: 9, areaId: 2, name: 'Nociones Pre-numéricas', slug: 'nociones-pre-numericas' },
  { id: 10, areaId: 2, name: 'Numeración y Conteo', slug: 'numeracion-conteo' },
  { id: 11, areaId: 2, name: 'Sistema de Numeración Decimal', slug: 'sistema-numeracion-decimal' },
  { id: 12, areaId: 2, name: 'Cálculo y Operatoria', slug: 'calculo-operatoria' },
  { id: 13, areaId: 2, name: 'Razonamiento Matemático', slug: 'razonamiento-matematico' },
  { id: 14, areaId: 2, name: 'Resolución de Problemas', slug: 'resolucion-problemas' },
  { id: 15, areaId: 2, name: 'Pensamiento Espacial y Geométrico', slug: 'pensamiento-espacial-geometrico' },
  { id: 16, areaId: 2, name: 'Medición y Datos', slug: 'medicion-datos' },
  { id: 17, areaId: 3, name: 'Atención', slug: 'atencion' },
  { id: 18, areaId: 3, name: 'Percepción Visual', slug: 'percepcion-visual' },
  { id: 19, areaId: 3, name: 'Percepción Auditiva', slug: 'percepcion-auditiva' },
  { id: 20, areaId: 3, name: 'Memoria Sensorial', slug: 'memoria-sensorial' },
  { id: 21, areaId: 3, name: 'Procesamiento Visual', slug: 'procesamiento-visual' },
  { id: 22, areaId: 3, name: 'Procesamiento Auditivo', slug: 'procesamiento-auditivo' },
  { id: 23, areaId: 3, name: 'Memoria de Trabajo', slug: 'memoria-de-trabajo' },
  { id: 24, areaId: 3, name: 'Razonamiento Inductivo', slug: 'razonamiento-inductivo' },
  { id: 25, areaId: 3, name: 'Razonamiento Deductivo', slug: 'razonamiento-deductivo' },
  { id: 26, areaId: 3, name: 'Pensamiento Crítico', slug: 'pensamiento-critico' },
  { id: 27, areaId: 3, name: 'Metacognición', slug: 'metacognicion' },
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

export const allResources: Resource[] = [
  // Prekínder
  makeResource('r01', 'Evaluación de Conciencia Fonológica - Prekínder', 'Instrumento diseñado para evaluar el desarrollo de la conciencia fonológica en estudiantes de Prekínder (4-5 años). Incluye actividades de identificación de sonidos iniciales, rimas, segmentación silábica y manipulación de fonemas.', 'prekinder', 'lectoescritura', true, null, ['conciencia fonológica', 'discriminación auditiva']),
  makeResource('r02', 'Prueba de Vocabulario Pasivo - Prekínder', 'Evaluación del vocabulario receptivo en niños de 4 a 5 años. Presenta 20 láminas con imágenes para que el niño identifique la palabra mencionada por el evaluador.', 'prekinder', 'lectoescritura', false, 5990, ['vocabulario', 'conciencia semántica']),
  makeResource('r03', 'Test de Discriminación Auditiva', 'Evalúa la capacidad de diferenciar sonidos del habla en niveles iniciales. Compuesto por 12 pares de palabras con diferencias fonéticas mínimas.', 'prekinder', 'lectoescritura', true, null, ['discriminación auditiva', 'conciencia fonológica']),
  makeResource('r04', 'Evaluación de Nociones Numéricas Básicas', 'Evalúa las nociones pre-numéricas fundamentales en educación inicial.', 'prekinder', 'pensamiento-logico-matematico', true, null, ['numeración', 'razonamiento matemático']),
  makeResource('r05', 'Test de Razonamiento Lógico Preoperacional', 'Instrumento basado en la teoría de Piaget para evaluar el pensamiento preoperacional en niños de 4 a 6 años.', 'prekinder', 'pensamiento-logico-matematico', false, 4990, ['razonamiento matemático', 'categorización']),
  makeResource('r06', 'Evaluación de Percepción Visual - Nivel Inicial', 'Evalúa habilidades perceptivas visuales básicas en niños de 4 a 6 años.', 'prekinder', 'habilidades-cognitivas', true, null, ['percepción visual', 'atención'], 'evaluation', 'percepcion-visual'),
  makeResource('r07', 'Test de Atención Selectiva Infantil', 'Instrumento para medir la capacidad de atención sostenida y selectiva en niños de 4 a 7 años.', 'prekinder', 'habilidades-cognitivas', false, 5990, ['atención', 'inhibición'], 'evaluation', 'atencion'),
  // 1° Básico
  makeResource('r08', 'Evaluación de Fluidez Lectora Inicial', 'Mide velocidad, precisión y prosodia en lectura de primer año básico.', '1-basico', 'lectoescritura', false, 5990, ['fluidez lectora', 'comprensión lectora']),
  makeResource('r09', 'Prueba de Comprensión Lectora - 1° Básico', 'Evaluación de comprensión literal e inferencial para estudiantes de primer año básico.', '1-basico', 'lectoescritura', true, null, ['comprensión lectora', 'vocabulario']),
  makeResource('r10', 'Test de Grafomotricidad y Escritura', 'Evalúa habilidades grafomotoras y producción escrita inicial en estudiantes de 1° básico.', '1-basico', 'lectoescritura', false, 4990, ['grafomotricidad', 'conciencia fonológica']),
  makeResource('r11', 'Evaluación de Conciencia Fonológica - 1° Básico', 'Versión avanzada para evaluar segmentación y manipulación fonémica en estudiantes de primer año básico.', '1-basico', 'lectoescritura', true, null, ['conciencia fonológica', 'discriminación auditiva']),
  makeResource('r12', 'Evaluación de Cálculo y Numeración - 1° Básico', 'Evalúa las competencias numéricas fundamentales de primer año básico.', '1-basico', 'pensamiento-logico-matematico', false, 5990, ['numeración', 'razonamiento matemático']),
  makeResource('r13', 'Test de Resolución de Problemas Simples', 'Mide la capacidad de resolver problemas aditivos elementales en estudiantes de 1° básico.', '1-basico', 'pensamiento-logico-matematico', true, null, ['resolución de problemas', 'razonamiento matemático']),
  makeResource('r14', 'Evaluación de Funciones Ejecutivas - 1° Básico', 'Instrumento comprehensivo para evaluar funciones ejecutivas básicas en estudiantes de 1° básico.', '1-basico', 'habilidades-cognitivas', false, 7990, ['funciones ejecutivas', 'memoria de trabajo', 'inhibición'], 'evaluation', 'control-inhibitorio'),
  makeResource('r15', 'Test de Memoria de Trabajo Verbal', 'Instrumento para medir la capacidad de retención y manipulación de información verbal.', '1-basico', 'habilidades-cognitivas', false, 5990, ['memoria de trabajo', 'atención'], 'evaluation', 'memoria-de-trabajo'),
  makeResource('r16', 'Evaluación de Planificación y Organización', 'Mide la capacidad de planificar y organizar tareas simples en estudiantes de 1° a 3° básico.', '1-basico', 'habilidades-cognitivas', true, null, ['planificación', 'organización'], 'evaluation', 'planificacion'),
  // 2° Básico
  makeResource('r17', 'Evaluación de Comprensión Lectora - 2° Básico', 'Texto narrativo con preguntas literales e inferenciales para segundo año básico.', '2-basico', 'lectoescritura', true, null, ['comprensión lectora', 'fluidez lectora']),
  makeResource('r18', 'Prueba de Producción de Textos Narrativos', 'Evalúa la capacidad de producir narraciones con estructura coherente en estudiantes de 2° a 4° básico.', '2-basico', 'lectoescritura', false, 4990, ['grafomotricidad', 'organización']),
  makeResource('r19', 'Evaluación de Razonamiento Matemático - 2° Básico', 'Problemas de adición, sustracción y comparación para segundo año básico.', '2-basico', 'pensamiento-logico-matematico', false, 5990, ['razonamiento matemático', 'resolución de problemas']),
  makeResource('r20', 'Test de Seriación y Patrones', 'Evalúa la capacidad de identificar, continuar y crear secuencias lógicas y patrones.', '2-basico', 'pensamiento-logico-matematico', true, null, ['secuencia temporal', 'categorización']),
  // 3° Básico
  makeResource('r21', 'Evaluación de Flexibilidad Cognitiva', 'Instrumento para medir la capacidad de cambiar entre reglas, perspectivas y estrategias.', '3-basico', 'habilidades-cognitivas', false, 6990, ['flexibilidad cognitiva', 'funciones ejecutivas'], 'evaluation', 'flexibilidad-cognitiva'),
  makeResource('r22', 'Test de Atención Sostenida', 'Evaluación de la capacidad de mantener la atención en una tarea continua.', '3-basico', 'habilidades-cognitivas', true, null, ['atención', 'inhibición'], 'evaluation', 'atencion'),
  makeResource('r23', 'Evaluación de Memoria de Trabajo Visoespacial', 'Mide la capacidad de retener y manipular información visual y espacial.', '3-basico', 'habilidades-cognitivas', false, 5990, ['memoria de trabajo', 'percepción visual'], 'evaluation', 'memoria-de-trabajo'),
  // 4° Básico
  makeResource('r24', 'Evaluación de Lectura Comprensiva - 4° Básico', 'Textos expositivos y narrativos con preguntas de análisis para cuarto año básico.', '4-basico', 'lectoescritura', false, 5990, ['comprensión lectora', 'vocabulario']),
  makeResource('r25', 'Prueba de Conciencia Semántica', 'Evalúa relaciones semánticas en estudiantes de 4° a 6° básico.', '4-basico', 'lectoescritura', true, null, ['conciencia semántica', 'categorización']),
  makeResource('r26', 'Evaluación de Resolución de Problemas Complejos', 'Problemas de pasos múltiples con operaciones combinadas para cuarto año básico.', '4-basico', 'pensamiento-logico-matematico', false, 6990, ['resolución de problemas', 'razonamiento matemático']),
  // 5° Básico
  makeResource('r27', 'Evaluación de Control Inhibitorio', 'Mide la capacidad de suprimir respuestas automáticas y controlar impulsos.', '5-basico', 'habilidades-cognitivas', false, 6990, ['inhibición', 'funciones ejecutivas'], 'evaluation', 'control-inhibitorio'),
  makeResource('r28', 'Test de Razonamiento Abstracto', 'Evalúa la capacidad de razonar con conceptos abstractos e identificar analogías.', '5-basico', 'habilidades-cognitivas', true, null, ['flexibilidad cognitiva', 'categorización'], 'evaluation', 'razonamiento-inductivo'),
  // 6° Básico
  makeResource('r29', 'Evaluación de Funciones Ejecutivas Avanzadas', 'Evalúa funciones ejecutivas superiores en estudiantes de 6° a 8° básico.', '6-basico', 'habilidades-cognitivas', false, 8990, ['funciones ejecutivas', 'planificación', 'organización'], 'evaluation', 'planificacion'),
  makeResource('r30', 'Prueba de Comprensión Lectora Crítica', 'Evalúa la capacidad de análisis crítico y reflexión sobre textos.', '6-basico', 'lectoescritura', false, 5990, ['comprensión lectora', 'vocabulario']),
  // 7° Básico
  makeResource('r31', 'Evaluación de Razonamiento Matemático Avanzado', 'Problemas con fracciones, decimales, razonamiento proporcional y pensamiento algebraico inicial.', '7-basico', 'pensamiento-logico-matematico', false, 6990, ['razonamiento matemático', 'resolución de problemas']),
  // 8° Básico
  makeResource('r32', 'Evaluación Integral de Funciones Cognitivas - 8° Básico', 'Batería completa de funciones ejecutivas y habilidades cognitivas superiores.', '8-basico', 'habilidades-cognitivas', false, 9990, ['funciones ejecutivas', 'memoria de trabajo', 'planificación', 'flexibilidad cognitiva'], 'evaluation', 'planificacion'),
  // Material educativo
  makeResource('r33', 'Fichas de Apoyo: Conciencia Fonológica', 'Set de 20 fichas imprimibles a todo color para reforzar la conciencia fonológica.', '1-basico', 'lectoescritura', true, null, ['conciencia fonológica', 'discriminación auditiva'], 'educational'),
  makeResource('r34', 'Cuadernillo de Grafomotricidad', 'Ejercicios progresivos de trazos y coordinación visomotora para estudiantes de Prekínder a 1° básico.', 'prekinder', 'lectoescritura', false, 3990, ['grafomotricidad'], 'educational'),
  makeResource('r35', 'Juego de Tarjetas: Razonamiento Matemático', 'Set de 40 tarjetas recortables a color con problemas matemáticos.', '2-basico', 'pensamiento-logico-matematico', false, 4990, ['razonamiento matemático', 'resolución de problemas'], 'educational'),
  makeResource('r36', 'Guía de Estrategias para Funciones Ejecutivas', 'Manual completo para docentes con más de 25 actividades prácticas.', '3-basico', 'habilidades-cognitivas', true, null, ['funciones ejecutivas', 'planificación'], 'educational', 'planificacion'),
]

export const socialPosts: SocialPost[] = [
  { id: 1, mediaUrl: '/social/post1.svg', caption: '🧠 ¿Sabías que la conciencia fonológica es la base para la lectoescritura?', permalink: '#', postedAt: '2026-07-01' },
  { id: 2, mediaUrl: '/social/post2.svg', caption: '📢 Nuevo instrumento de evaluación disponible en nuestra plataforma.', permalink: '#', postedAt: '2026-06-28' },
  { id: 3, mediaUrl: '/social/post3.svg', caption: '✏️ Hoy trabajamos percepción visual con figuras y colores.', permalink: '#', postedAt: '2026-06-25' },
  { id: 4, mediaUrl: '/social/post4.svg', caption: '📅 No te pierdas nuestro próximo webinar.', permalink: '#', postedAt: '2026-06-20' },
]

// Helper functions
export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find(c => c.slug === slug)
}
