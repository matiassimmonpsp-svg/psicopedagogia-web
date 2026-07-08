import { spawn, execSync } from 'child_process'
import { resolve } from 'path'

const PROJECT_DIR = resolve(import.meta.dirname, '..')
const PORT = 3000

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/api/catalog`)
      if (res.ok) return true
    } catch {}
    await new Promise(r => setTimeout(r, 1000))
  }
  throw new Error('Server did not start')
}

async function main() {
  console.log('Running seed...')
  execSync('npx tsx prisma/seed.ts', { cwd: PROJECT_DIR, stdio: 'inherit', shell: 'cmd' })

  console.log('Starting server...')
  const server = spawn('cmd', ['/c', 'npx', 'next', 'dev', '-p', String(PORT)], {
    cwd: PROJECT_DIR,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })
  server.stderr.on('data', d => process.stderr.write(d))

  let serverOutput = ''
  server.stdout.on('data', d => { serverOutput += d.toString() })

  try {
    await waitForServer()
    console.log('Server ready, running API tests...')

    const result = execSync('npx vitest run tests/api.test.ts --testTimeout=30000', {
      cwd: PROJECT_DIR,
      stdio: 'inherit',
      env: { ...process.env, PORT: String(PORT) },
      shell: 'cmd',
    })
  } finally {
    console.log('Stopping server...')
    server.kill('SIGTERM')
    await new Promise(r => setTimeout(r, 2000))
  }

  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
