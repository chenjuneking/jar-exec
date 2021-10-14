#!/usr/bin/env node

import { install } from './index'

async function main() {
  const args = process.argv.splice(process.execArgv.length + 2)
  const command = args[0]

  switch (command) {
    case 'install': {
      const version = args[1]
      if (version && /\d+/.test(version)) {
        console.log(`[Info] jar-exec: openjdk${version} installing...`)
        const result = await install(Number(version), {
          type: 'jre',
          allow_system_java: false,
        })
        if (result === 1) {
          console.log(
            `[Info] jar-exec: openjdk v${version} has been installed!`
          )
        }
      }
      break
    }
    default: {
      console.error(`[Error] jar-exec: invalid command "${command}"`)
      break
    }
  }
}

main()
