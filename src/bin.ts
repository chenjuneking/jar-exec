#!/usr/bin/env node

import { VERSION_REGEX } from './constants'
import { install, use, versions, which } from './index'
import { Manager } from './manager'
import { println } from './stdout'

async function main() {
  const args = process.argv.splice(process.execArgv.length + 2)
  const command = args[0]

  switch (command) {
    case 'install': {
      const version = args[1]
      if (version && VERSION_REGEX.test(version)) {
        console.log(`[Info] njar: openjdk${version} installing`)
        const result = await install(Number(version), {
          type: 'jre',
          allow_system_java: false,
        })
        if (result === 1) {
          println(`[Info] njar: openjdk v${version} has been installed!`)
        }
      } else {
        println(`[Info] njar: invalid openjdk version ${version}`)
      }
      break
    }
    case 'use': {
      const version = args[1]
      if (version && VERSION_REGEX.test(version)) {
        const installedVersions = await versions()
        if (!installedVersions.includes(version)) {
          return console.log(
            `[Info] njar: openjdk${version} has not been installed yet.`
          )
        }
        await use(version)
        println(
          `[Info] njar: switch to ${
            version === 'system' ? 'system java' : 'openjdk' + version
          }`
        )
      } else {
        println(`[Info] njar: invalid openjdk version ${version}`)
      }
      break
    }
    case 'which': {
      const javaPath = await which()
      println(javaPath)
      break
    }
    case 'versions': {
      const manager = await Manager.getInstance()
      const list = await versions()
      if (list.length > 0) {
        list.forEach((version: string) => {
          println(
            `${version}${
              version === manager.getCurrentVersion() ? ' (*current)' : ''
            }`
          )
        })
      } else {
        println(`[Info] njar: no openjdk installed.`)
      }
      break
    }
    case '-h':
    case '--help': {
      println('Usage: njar <command> [<args>]')
      println('')
      println('Some useful njar commands are:')
      println('  install       Install a JDK version')
      println('  use           Set the JDK version')
      println('  versions      List all JDK versions available to njar')
      println('  which         Display the full path to an executable')
      println('  -h, --help    Show help information')
      break
    }
    default: {
      println(`[Error] njar: invalid command '${command}'`)
      break
    }
  }
}

main()
