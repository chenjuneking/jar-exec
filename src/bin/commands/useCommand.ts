import { use, versions } from '../../index'
import { VERSION_REGEX } from '../../constants'
import { println } from '../../stdout'

export async function useCommand(version: string): Promise<void> {
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
}
