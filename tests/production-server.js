import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const vite = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const build = spawn(process.execPath, [vite, 'build'], { stdio: 'inherit', windowsHide: true })
let preview
build.on('exit', (code) => {
  if (code) process.exit(code)
  preview = spawn(process.execPath, [vite, 'preview', '--host', '127.0.0.1', '--port', '4174', '--strictPort'], { stdio: 'inherit', windowsHide: true })
  preview.on('exit', (status) => process.exit(status || 0))
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { build.kill(); preview?.kill(); process.exit(0) })
