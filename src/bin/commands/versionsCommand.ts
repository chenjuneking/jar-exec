import { versions } from '../../index'
import { Manager } from '../../manager'
import { println } from '../../stdout'

export async function versionsCommand(): Promise<void> {
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
}
