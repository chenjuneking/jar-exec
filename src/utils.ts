import fs, { readdirSync } from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import fetch, { RequestInit, Response } from 'node-fetch'
import AbortController from 'abort-controller'
import findJavaHome from 'find-java-home'
import yauzl from 'yauzl'
import tar from 'tar'
import internal from 'stream'
import {
  DOWNLOAD_ABORT_TIMEOUT,
  JAR_EXEC_VERSIONS_DIR,
  MAX_DOWNLOAD_RECURSIVE,
} from './constants'
import { withProgress } from './progress'
import { Manager } from './manager'
import { println } from './stdout'

export function getExecutable(): string {
  const platform = os.platform()
  return platform === 'win32' ? 'bin/java.exe' : 'bin/java'
}

export async function getSystemJavaHome(): Promise<string> {
  return new Promise((resolve) => {
    findJavaHome({ allowJre: true }, (err: Error, home: string) => {
      resolve(err ? '' : home)
    })
  })
}

export async function systemJavaExists(): Promise<boolean> {
  return (await getSystemJavaHome()) !== ''
}

export async function makeDir(dir: string): Promise<string | undefined> {
  try {
    await fs.promises.access(dir)
    return dir
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return await fs.promises.mkdir(dir, { recursive: true })
    } else {
      return undefined
    }
  }
}

export async function download(
  url: string,
  destFile: string
): Promise<boolean> {
  const destDir = path.dirname(destFile)
  const result = await makeDir(destDir)
  if (!result) {
    println(
      `[Error] njar: fail to download ${url}, create directory ${destDir} failure`
    )
    return false
  }

  return makeDownload(url, destFile, 0)
}

function makeDownload(
  url: string,
  destFile: string,
  tryCount: number
): Promise<boolean> {
  const basename = path.basename(url)
  const retry = tryCount < MAX_DOWNLOAD_RECURSIVE
  let controller: AbortController
  let timeout: NodeJS.Timeout
  let options: RequestInit | undefined = undefined

  if (retry) {
    controller = new AbortController()
    timeout = setTimeout(() => controller.abort(), DOWNLOAD_ABORT_TIMEOUT)
    options = { signal: controller.signal }
  }

  return new Promise((resolve) => {
    fetch(url, options)
      .then(
        (res: Response) => {
          withProgress(res, `download ${basename}`)
          res.body
            ?.pipe(fs.createWriteStream(destFile))
            .on('finish', () => resolve(true))
        },
        (err: any) => {
          if (err.name === 'AbortError' && retry) {
            println(`[Info] njar: download ${basename}`)
            return resolve(makeDownload(url, destFile, tryCount + 1))
          }
          println(`[Error] njar: fail to download ${basename}, ${err.message}`)
          resolve(false)
        }
      )
      .finally(() => {
        if (timeout) clearTimeout(timeout)
      })
  })
}

export function genChecksum(file: any) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err: any, data: any) => {
      if (err) reject(err)
      resolve(crypto.createHash('sha256').update(data).digest('hex'))
    })
  })
}

export async function verify(
  binaryFile: any,
  shaText: string
): Promise<boolean> {
  try {
    const checksum = await genChecksum(binaryFile)
    return checksum === shaText
  } catch (err: any) {
    println(`[Error] njar: verify failure, ${err.message}`)
    return false
  }
}

export function move(file: string, destDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = file.split(path.sep).slice(-1)[0]
    const newFile = path.join(destDir, fileName)
    fs.copyFile(file, newFile, (err: any) => {
      if (err) reject(err)
      fs.unlink(file, (err: any) => {
        if (err) reject(err)
        resolve(newFile)
      })
    })
  })
}

export function extractTarGz(file: string, dist: string): Promise<boolean> {
  return new Promise((resolve) => {
    tar
      .x({ file, cwd: dist })
      .then(() => {
        resolve(true)
      })
      .catch((err: any) => {
        println(
          `[Error] njar: extract file '${path.basename(file)}' failure, ${
            err.message
          }`
        )
        resolve(false)
      })
  })
}

export function extractZip(file: string, dist: string): Promise<boolean> {
  return new Promise((resolve) => {
    yauzl.open(
      file,
      { lazyEntries: true },
      (err: any, zipfile?: yauzl.ZipFile) => {
        if (err) {
          println(
            `[Error] njar: extract file '${path.basename(file)}' failure, ${
              err.message
            }`
          )
          return resolve(false)
        }
        zipfile?.readEntry()
        zipfile?.on('entry', (entry: yauzl.Entry) => {
          const entryPath = path.join(dist, entry.fileName)
          if (/\/$/.test(entry.fileName)) {
            fs.mkdir(entryPath, { recursive: true }, (err: any) => {
              if (err && err.code !== 'EEXIST') {
                println(
                  `[Error] njar: extract file '${path.basename(
                    file
                  )}' failure, ${err.message}`
                )
                return resolve(false)
              }
              zipfile.readEntry()
            })
          } else {
            zipfile.openReadStream(
              entry,
              (err?: Error, readStream?: internal.Readable) => {
                if (err) {
                  println(
                    `[Error] njar: extract file '${path.basename(
                      file
                    )}' failure, ${err.message}`
                  )
                  return resolve(false)
                }
                readStream?.on('end', () => {
                  zipfile.readEntry()
                })
                readStream?.pipe(fs.createWriteStream(entryPath))
              }
            )
          }
        })
        zipfile?.once('close', () => {
          resolve(true)
        })
      }
    )
  })
}

export async function extract(file: string, version: string) {
  const dist = getExtractDir(version)
  await makeDir(dist)
  if (path.extname(file) === '.zip') {
    await extractZip(file, dist)
  } else {
    await extractTarGz(file, dist)
  }
  return dist
}

export async function getJavaPath(): Promise<string> {
  const manager = await Manager.getInstance()
  const currentVersion = manager.getCurrentVersion()
  const javaHome = manager.get(currentVersion)
  if (!javaHome) {
    println(
      `[Error] njar: JRE not found! If JRE has beed installed, please specify a JRE version by using 'njar use [version]' command. Otherwise, please install a JRE version by using 'njar install [version]' command`
    )
    return ''
  }

  if (currentVersion === 'system') {
    return path.resolve(javaHome, getExecutable())
  } else {
    let files = readdirSync(javaHome)
    files = files.filter((name: string) => !name.startsWith('._'))
    if (files.length > 1) {
      println(`[Error] njar: JRE installation failed! Please install again`)
      return ''
    }
    return path.join(
      javaHome,
      files[0],
      os.platform() === 'darwin' ? 'Contents/Home' : '',
      getExecutable()
    )
  }
}

export async function getJavaCommand(): Promise<string> {
  if (await systemJavaExists()) {
    return 'java'
  }
  const javaPath = await getJavaPath()
  if (!javaPath) {
    println(
      `[Error] njar: unable to find locally-installed java or system-wide java`
    )
    return ''
  }
  return javaPath
}

export function getExtractDir(version: string): string {
  return path.join(JAR_EXEC_VERSIONS_DIR, version)
}
