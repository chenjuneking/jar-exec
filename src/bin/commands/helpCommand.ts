import { println } from '../../stdout'

export async function helpCommand(): Promise<void> {
  println('Usage: njar <command> [<args>]')
  println('')
  println('Some useful njar commands are:')
  println('  install       Install a JDK version')
  println('  use           Set the JDK version')
  println('  versions      List all JDK versions available to njar')
  println('  which         Display the full path to an executable')
  println('  exec          Running java application')
  println('  -h, --help    Show help information')
}
