import fs, { readdirSync } from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import fetch from 'node-fetch'
import findJavaHome from 'find-java-home'
import yauzl from 'yauzl'
import tar from 'tar'
import internal from 'stream'
import { JRE_PATH } from './constants'

export function getExecutable(): string {
  const platform = os.platform()
  switch (platform) {
    case 'darwin':
      return 'Contents/Home/bin/java'
    case 'win32':
      return 'bin/java.exe'
    default:
      return 'bin/java'
  }
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

export async function download(url: string, destDir: string): Promise<string> {
  const result = await makeDir(destDir)
  if (!result) {
    console.error(`Fail to download ${url}, make directory ${destDir} failure`)
    return ''
  }
  try {
    const response = await fetch(url)
    const destFile = path.join(destDir, path.basename(url))
    return new Promise((resolve) => {
      response.body
        ?.pipe(fs.createWriteStream(destFile))
        .on('finish', () => resolve(destFile))
    })
  } catch (err: any) {
    console.error(`Fail to download ${url}, ${err.message}`)
    return ''
  }
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
    // const content = fs.readFileSync(shaTextFile, 'utf-8')
    const checksum = await genChecksum(binaryFile)
    // return checksum === content.split('  ')[0]
    return checksum === shaText
  } catch (err: any) {
    console.error(`Verify failure, ${err.message}`)
    return false
  }
}

export function move(file: string, destDir?: string) {
  return new Promise((resolve, reject) => {
    const fileName = file.split(path.sep).slice(-1)[0]
    const newFile = path.join(destDir || __dirname, fileName)
    fs.copyFile(file, newFile, (err: any) => {
      if (err) reject(err)
      fs.unlink(file, (err: any) => {
        if (err) reject(err)
        resolve(newFile)
      })
    })
  })
}

export function extractTarGz(file: string, dist: string) {
  return tar.x({ file, cwd: dist }).then(() => {
    return new Promise((resolve, reject) => {
      fs.unlink(file, (err: any) => {
        if (err) reject(err)
        resolve(dist)
      })
    })
  })
}

export function extractZip(file: string, dist: string) {
  return new Promise((resolve, reject) => {
    yauzl.open(
      file,
      { lazyEntries: true },
      (err: any, zipfile?: yauzl.ZipFile) => {
        if (err) reject(err)
        zipfile?.readEntry()
        zipfile?.on('entry', (entry: yauzl.Entry) => {
          const entryPath = path.join(dist, entry.fileName)
          if (/\/$/.test(entry.fileName)) {
            fs.mkdir(entryPath, { recursive: true }, (err: any) => {
              if (err && err.code !== 'EEXIST') reject(err)
              zipfile.readEntry()
            })
          } else {
            zipfile.openReadStream(
              entry,
              (err?: Error, readStream?: internal.Readable) => {
                if (err) reject(err)
                readStream?.on('end', () => {
                  zipfile.readEntry()
                })
                readStream?.pipe(fs.createWriteStream(entryPath))
              }
            )
          }
        })
        zipfile?.once('close', () => {
          fs.unlink(file, (err: any) => {
            if (err) reject(err)
            resolve(dist)
          })
        })
      }
    )
  })
}

export async function extract(file: string) {
  const dist = path.join(path.dirname(__dirname), JRE_PATH)
  await makeDir(dist)
  if (path.extname(dist) === '.zip') {
    await extractZip(file, dist)
  } else {
    await extractTarGz(file, dist)
  }
}

export function getJavaPath(): string {
  const srcPath = path.join(path.resolve(__dirname), '../', JRE_PATH)
  let files = readdirSync(srcPath)
  files = files.filter((name: string) => !name.startsWith('._'))
  if (files.length > 1) {
    console.error('JRE installation failed! Please install the package again.')
    return ''
  }
  return path.join(srcPath, files[0], getExecutable())
}

export async function getJavaCommand(): Promise<string> {
  if (await systemJavaExists()) {
    return 'java'
  }
  const javaPath = getJavaPath()
  if (!javaPath) {
    console.error('Unable to find locally-installed java or system-wide java')
    return ''
  }
  return javaPath
}
