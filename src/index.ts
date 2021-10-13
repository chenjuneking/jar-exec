import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import fetch from 'node-fetch'
import { DEFAULT_REGISTRY } from './constants'
import {
  download,
  move,
  systemJavaExists,
  verify,
  extract,
  getJavaCommand,
} from './utils'

export async function install(version = 8, options: any = {}): Promise<number> {
  const {
    openjdk_impl = 'hotspot',
    release = 'latest',
    type = 'jre',
    allow_system_java = true,
  }: any = options
  options = { ...options, openjdk_impl, release, type, allow_system_java }

  if (options.allow_system_java === true) {
    if (await systemJavaExists()) return 0
  }

  const registry = options.registry || DEFAULT_REGISTRY

  let url = `${registry}/v2/info/releases/openjdk${version}?`

  if (!options.os) {
    switch (process.platform) {
      case 'aix':
        options.os = 'aix'
        break
      case 'darwin':
        options.os = 'mac'
        break
      case 'linux':
        options.os = 'linux'
        break
      case 'sunos':
        options.os = 'solaris'
        break
      case 'win32':
        options.os = 'windows'
        break
      default:
        return Promise.reject(new Error('Unsupported operating system'))
    }
  }

  if (!options.arch) {
    if (/^ppc64|s390x|x32|x64$/g.test(process.arch)) {
      options.arch = process.arch
    } else if (process.arch === 'ia32') {
      options.arch = 'x32'
    } else if (options.os === 'mac') {
      options.arch = 'x64'
    } else {
      return Promise.reject(new Error('Unsupported architecture'))
    }
  }

  Object.keys(options).forEach((key) => {
    url += key + '=' + options[key] + '&'
  })

  const tmpDir = path.join(__dirname, 'jre-key')

  // https://api.adoptopenjdk.net/v2/info/releases/openjdk8?type=jre&allow_system_java=false&openjdk_impl=hotspot&release=latest&os=mac&arch=x64&
  console.info(`Fetching ${url}`)
  const response: { json: () => any; status: number; statusText: string } =
    await fetch(url)
  if (response.status !== 200) {
    console.error(`Failure to fetch ${url}, ${response.statusText}`)
    return 0
  }
  const json = await response.json()
  const binaryUrl = json.binaries[0]['binary_link']
  const shaTextUrl = json.binaries[0]['checksum_link']

  console.info(`Download ${binaryUrl}`)
  const binaryFile = await download(binaryUrl, tmpDir)

  console.info(`Download ${shaTextUrl}`)
  const shaTextFile = await download(shaTextUrl, tmpDir)

  console.info(`Verify...`)
  const shaText = fs.readFileSync(shaTextFile, 'utf-8').split(' ')[0]
  if (!(await verify(binaryFile, shaText))) {
    console.error(`File and checksum don\'t match`)
    return 0
  }

  console.info(`Moving...`)
  const newFile = await move(binaryFile)

  console.info(`Extract...`)
  await extract(newFile as string)

  return 1
}

export async function executeJar(
  jarPath: string,
  args: string[] = []
): Promise<string> {
  const javaCommand = await getJavaCommand()
  return new Promise((resolve, reject) => {
    const output = spawn(javaCommand, ['-jar', jarPath, ...args])
    let result = ''
    output.stdout.on('data', (data) => {
      result += data.toString()
    })
    output.stderr.on('data', (data) => {
      reject(data.toString())
    })
    output.on('close', (code) => {
      resolve(result)
    })
  })
}

export async function executeClassWithCP(
  className: string,
  classPaths = '',
  args: string[] = []
): Promise<string> {
  const javaCommand = await getJavaCommand()
  return new Promise((resolve, reject) => {
    const output = spawn(javaCommand, ['-cp', classPaths, className, ...args], {
      shell: true,
    })
    let result = ''
    output.stdout.on('data', (data) => {
      result += data.toString()
    })
    output.stderr.on('data', (data) => {
      reject(data.toString())
    })
    output.on('close', (code) => {
      resolve(result)
    })
  })
}
