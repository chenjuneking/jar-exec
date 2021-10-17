import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import {
  download,
  systemJavaExists,
  verify,
  extract,
  getJavaCommand,
  getJavaPath,
  request,
} from './utils'
import { DOWNLOAD_TMP_DIR } from './constants'
import { Manager } from './manager'
import { println } from './stdout'

/**
 * Install a specify version of openjdk
 * @param version {number} the version of openjdk
 * @param options {object} the request options
 * @returns
 */
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

  // the basic url
  let url = `https://api.adoptopenjdk.net/v2/info/releases/openjdk${version}?`

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

  // fetch openjdk information
  const json = await request(url, 0)
  if (!json) return 0

  // get binary link & SHA text link from the downloaded json
  const binaryUrl = json.binaries[0]['binary_link']
  const shaTextUrl = json.binaries[0]['checksum_link']

  const binaryFile = path.join(DOWNLOAD_TMP_DIR, path.basename(binaryUrl))
  const shaTextFile = path.join(DOWNLOAD_TMP_DIR, path.basename(shaTextUrl))
  if (!fs.existsSync(binaryFile) || !fs.existsSync(shaTextFile)) {
    // download files if not exists
    if (
      !(await download(binaryUrl, binaryFile)) ||
      !(await download(shaTextUrl, shaTextFile))
    ) {
      return 0
    }
  } else {
    println(`[Info] njar: openjdk${version} binary file exists.`)
  }

  // verify the binary file
  println(`[Info] njar: verifying`)
  const shaText = fs.readFileSync(shaTextFile, 'utf-8').split(' ')[0]
  if (!(await verify(binaryFile, shaText))) {
    println(
      `[Error] njar: file and checksum don\'t match, please install again.`
    )
    return 0
  }

  // extract the binary file
  println(`[Info] njar: extract`)
  const jreDir = await extract(binaryFile, String(version))

  // save the downloaded jre path
  const manager = await Manager.getInstance()
  manager.set(String(version), jreDir).save()

  return 1
}

/**
 * Get current java path
 * @returns {string} the java path
 */
export async function which(): Promise<string> {
  return await getJavaPath()
}

/**
 * Use a specify jdk version
 * @param version {string|number} the specify jdk version
 */
export async function use(version: string | number): Promise<void> {
  const manager = await Manager.getInstance()
  manager.setCurrentVersion(String(version)).save()
}

/**
 * List the installed versions
 * @returns {string[]} Array of the install jdk versions
 */
export async function versions(): Promise<string[]> {
  const manager = await Manager.getInstance()
  return manager.getVersions()
}

/**
 * Execute the jar
 * @param jarPath {string} path to the jar file which should be executed
 * @param args {string[]} optional arguments that will be appended while executing
 * @returns {string} the result string
 * Usage:
 *    const result = await executeJar(
 *      path.join(__dirname, './example/Math/Math.jar'),
 *      ['add', '21', '32']
 *    )
 */
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
    output.on('close', () => {
      resolve(result)
    })
  })
}

/**
 * Execute the class with -cp
 * @param className {string} Java classname to execute
 * @param classPaths {string} optional the classpath
 * @param args {string[]} optional arguments that will be appended while executing
 * @returns {string} the result string
 * Usage:
 *    const result = await executeClassWithCP(
 *      'App.Main',
 *      path.join(__dirname, './example/Math'),
 *      ['add', '21', '32']
 *    )
 */
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
    output.on('close', () => {
      resolve(result)
    })
  })
}
