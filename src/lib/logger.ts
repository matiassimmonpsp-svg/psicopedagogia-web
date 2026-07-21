// ============================================================
// Logger centralizado con niveles configurables
// ============================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function getConfiguredLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase()
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel as LogLevel
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

const configuredLevel = getConfiguredLevel()

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[configuredLevel]
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString()
  const ctx = context ? ` ${JSON.stringify(context)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`
}

function sanitizeError(err: unknown): string {
  if (err instanceof Error) {
    // En producción, ocultar detalles internos de DB
    if (process.env.NODE_ENV === 'production') {
      const msg = err.message
      if (msg.includes('prisma') || msg.includes('query') || msg.includes('column') || msg.includes('table')) {
        return 'Error interno de base de datos'
      }
    }
    return err.message
  }
  return String(err)
}

function log(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return

  // Sanitizar errores en context
  const sanitized = context ? { ...context } : undefined
  if (sanitized && 'error' in sanitized) {
    sanitized.error = sanitizeError(sanitized.error)
  }

  const formatted = formatMessage(level, message, sanitized)
  if (level === 'error') {
    console.error(formatted)
  } else if (level === 'warn') {
    console.warn(formatted)
  } else {
    console.log(formatted)
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
}
