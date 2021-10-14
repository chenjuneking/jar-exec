import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import fetch, { Response } from 'node-fetch'
import {
  download,
  move,
  systemJavaExists,
  verify,
  extract,
  getJavaCommand,
} from './utils'
import { DOWNLOAD_TMP_DIR } from './constants'

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

  const tmpDir = path.join(__dirname, DOWNLOAD_TMP_DIR)

  // fetch the json
  const response: Response = await fetch(url)
  if (response.status !== 200) {
    console.error(`Failure to fetch ${url}, ${response.statusText}`)
    return 0
  }
  const json = await response.json()
  // get binary link & SHA text link from the downloaded json
  const binaryUrl = json.binaries[0]['binary_link']
  const shaTextUrl = json.binaries[0]['checksum_link']

  // download binary file
  const binaryFile = await download(binaryUrl, tmpDir)

  // download SHA text file
  const shaTextFile = await download(shaTextUrl, tmpDir)

  // verify the binary file
  const shaText = fs.readFileSync(shaTextFile, 'utf-8').split(' ')[0]
  if (!(await verify(binaryFile, shaText))) {
    console.error(`File and checksum don\'t match`)
    return 0
  }

  // move the binary file to  /dist/jre folder
  const newFile = await move(binaryFile)

  // extract the binary file
  await extract(newFile as string)

  return 1
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
    output.on('close', (code) => {
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
    output.on('close', (code) => {
      resolve(result)
    })
  })
}
