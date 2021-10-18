import { execute, executeWithCP } from '../../index'
import { println } from '../../stdout'

export async function execCommand(...args: string[]): Promise<void> {
  if (args[0] === '-cp') {
    const [classPaths, className, ...argv] = args.slice(1)
    try {
      const result = await executeWithCP(classPaths, className, argv)
      println(result)
    } catch (err: any) {
      println(err)
    }
  } else {
    const [jarPath, ...argv] = args
    try {
      const result = await execute(jarPath, argv)
      println(result)
    } catch (err: any) {
      println(err)
    }
  }
}
