import fs from 'fs'
import { MANIFEST_PATH } from './constants'
import { getSystemJavaHome } from './utils'

let instance: Manager | null = null

export interface IManifest {
  jrePath: {
    [key: string]: string
  }
  currentVersion: string
}

export class Manager {
  manifest = MANIFEST_PATH
  data: IManifest = {
    jrePath: {},
    currentVersion: '',
  }

  static async getInstance(): Promise<Manager> {
    if (!instance) {
      const systemJavaHome = await getSystemJavaHome()
      instance = new Manager(systemJavaHome)
    }
    return instance
  }

  constructor(systemJavaHome: string) {
    if (fs.existsSync(this.manifest)) {
      this.data = JSON.parse(
        fs.readFileSync(this.manifest, { encoding: 'utf-8' })
      )
    }
    if (systemJavaHome) {
      this.set('system', systemJavaHome)
      if (!this.getCurrentVersion()) {
        this.setCurrentVersion('system')
      }
    }
  }

  set(version: string, javaHome: string): Manager {
    this.data.jrePath[version] = javaHome
    return this
  }

  get(version: string): string | undefined {
    return this.data.jrePath[version]
  }

  save() {
    fs.writeFileSync(this.manifest, JSON.stringify(this.data))
  }

  setCurrentVersion(version: string): Manager {
    this.data.currentVersion = version
    return this
  }

  getCurrentVersion(): string {
    return this.data.currentVersion
  }

  getVersions(): string[] {
    return Object.keys(this.data.jrePath)
  }
}
