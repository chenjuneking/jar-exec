#!/usr/bin/env node

import { println } from '../stdout'
import { execCommand } from './commands/execCommand'
import { helpCommand } from './commands/helpCommand'
import { installCommand } from './commands/installCommand'
import { useCommand } from './commands/useCommand'
import { versionsCommand } from './commands/versionsCommand'
import { whichCommand } from './commands/whichCommand'

async function main() {
  const args = process.argv.splice(process.execArgv.length + 2)
  switch (args[0]) {
    case 'install': {
      installCommand(args[1])
      break
    }
    case 'use': {
      useCommand(args[1])
      break
    }
    case 'which': {
      whichCommand()
      break
    }
    case 'versions': {
      versionsCommand()
      break
    }
    case 'exec': {
      execCommand(...args.slice(1))
      break
    }
    case '-h':
    case '--help': {
      return helpCommand()
    }
    default: {
      println(`[Error] njar: invalid command '${args[0]}'`)
      break
    }
  }
}

main()
