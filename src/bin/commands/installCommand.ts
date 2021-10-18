import { install } from '../../index'
import { VERSION_REGEX } from '../../constants'
import { println } from '../../stdout'

export async function installCommand(version: string): Promise<void> {
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
}
