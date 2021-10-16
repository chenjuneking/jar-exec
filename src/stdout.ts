import readline from 'readline'

export function println(message: string): void {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  console.log(message)
}

export function print(message: string): void {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  process.stdout.write(message)
}
