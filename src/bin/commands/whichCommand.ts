import { which } from '../../index'
import { println } from '../../stdout'

export async function whichCommand(): Promise<void> {
  const javaPath = await which()
  println(javaPath)
}
