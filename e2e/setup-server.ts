import execa, { ExecaChildProcess } from 'execa'
import { getRandomPort, waitForPort } from 'get-port-please'

export type ServerContext = {
  serverProcess: ExecaChildProcess
  url: (val: string) => string
}
export async function startServer(): Promise<ServerContext> {
  const host = '127.0.0.1'
  const port = await getRandomPort(host)

  // console.log('building...')
  // await execa('pnpm', ['--filter=example', 'build'], {
  //   stdio: 'inherit',
  //   env: {
  //     ...process.env,
  //     _PORT: String(port),
  //     PORT: String(port),
  //     HOST: host
  //   }
  // })
  // console.log('build finished!')

  const serverProcess = execa(
    'pnpm',
    ['--filter=example', 'dev', '--port', String(port), '--host', host],
    { stdio: 'inherit', env: { ...process.env } }
  )

  await waitForPort(port, { retries: 32, host })

  return {
    serverProcess,
    url: (val: string) => `http://${host}:${port}${val}`
  }
}
