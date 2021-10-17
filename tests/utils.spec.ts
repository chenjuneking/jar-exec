import os from 'os'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import {
  download,
  extractTarGz,
  extractZip,
  genChecksum,
  getExecutable,
  getJavaCommand,
  getJavaPath,
  makeDir,
  move,
  verify,
} from '../src/utils'
import { MANIFEST_PATH, NJAR_HOME_DIR } from '../src/constants'

const BINARY_LINK =
  'https://github.com/AdoptOpenJDK/openjdk16-binaries/releases/download/jdk-16.0.1%2B9/OpenJDK16U-jre_x64_linux_hotspot_16.0.1_9.tar.gz'
const CHECKSUM_LINK =
  'https://github.com/AdoptOpenJDK/openjdk16-binaries/releases/download/jdk-16.0.1%2B9/OpenJDK16U-jre_x64_linux_hotspot_16.0.1_9.tar.gz.sha256.txt'
const DIR = path.join(__dirname, './tmp/a/b')
const TEST_TIMEOUT = 3 * 60 * 1000

describe('Test utils.ts', () => {
  beforeAll(() => {
    fs.mkdirSync(NJAR_HOME_DIR)
    fs.writeFileSync(
      MANIFEST_PATH,
      JSON.stringify({
        jrePath: {
          '16': path.join(__dirname, 'tmp/extract/tar'),
        },
        currentVersion: '16',
      })
    )
  })

  afterAll(() => {
    execSync(`rm -rf ${NJAR_HOME_DIR}`)
    execSync(`rm -rf ${path.join(__dirname, './tmp')}`)
  })

  test('#getExecutable()', () => {
    const platform = os.platform()
    const result = getExecutable()
    if (platform === 'darwin') {
      expect(result).toEqual('bin/java')
    }
    if (platform === 'win32') {
      expect(result).toEqual('bin/java.exe')
    }
    if (platform === 'linux') {
      expect(result).toEqual('bin/java')
    }
  })

  test('#makeDir()', async () => {
    expect(fs.existsSync(DIR)).toBe(false)
    const result = await makeDir(DIR)
    expect(result).not.toBeUndefined()
    expect(fs.existsSync(DIR)).toBe(true)
  })

  test(
    '#download()',
    async () => {
      const binaryFile = path.join(DIR, path.basename(BINARY_LINK))
      const result1 = await download(BINARY_LINK, binaryFile)
      expect(result1).toBe(true)

      const shaTextFile = path.join(DIR, path.basename(CHECKSUM_LINK))
      const result2 = await download(CHECKSUM_LINK, shaTextFile)
      expect(result2).toBe(true)
    },
    TEST_TIMEOUT
  )

  test('#genChecksum()', async () => {
    const binaryFile = `${DIR}/${path.basename(BINARY_LINK)}`
    expect(fs.existsSync(binaryFile)).toBe(true)
    const result = await genChecksum(binaryFile)
    expect(result).toBeTruthy()
  })

  test('#verify()', async () => {
    const binaryFile = `${DIR}/${path.basename(BINARY_LINK)}`
    const shaTextFile = `${DIR}/${path.basename(CHECKSUM_LINK)}`
    const shaText = await fs.readFileSync(shaTextFile, 'utf-8').split(' ')[0]
    expect(shaText).toBeTruthy()
    const result = await verify(binaryFile, shaText)
    expect(result).toBe(true)
  })

  test('#move()', async () => {
    // move
    const binaryFile = `${DIR}/${path.basename(BINARY_LINK)}`
    const shaTextFile = `${DIR}/${path.basename(CHECKSUM_LINK)}`
    const destDir = path.join(__dirname, 'tmp')

    const newBanaryFile = await move(binaryFile, destDir)
    expect(newBanaryFile).toEqual(
      path.join(__dirname, 'tmp', path.basename(BINARY_LINK))
    )
    expect(fs.existsSync(newBanaryFile)).toBe(true)
    expect(fs.existsSync(binaryFile)).toBe(false)

    const newShaTextFile = await move(shaTextFile, destDir)
    expect(newShaTextFile).toEqual(
      path.join(__dirname, 'tmp', path.basename(CHECKSUM_LINK))
    )
    expect(fs.existsSync(newShaTextFile)).toBe(true)
    expect(fs.existsSync(shaTextFile)).toBe(false)
  })

  test(
    '#extractTarGz()',
    async () => {
      const binaryFile = path.join(__dirname, 'tmp', path.basename(BINARY_LINK))
      // create extract dist dir
      const dist = path.join(__dirname, 'tmp/extract/tar')
      expect(fs.existsSync(dist)).toBe(false)
      await makeDir(dist)
      expect(fs.existsSync(dist)).toBe(true)
      // tar file
      const result = await extractTarGz(binaryFile, dist)
      expect(result).toBe(true)
    },
    TEST_TIMEOUT
  )

  test(
    '#extractZip()',
    async () => {
      // copy a tmp zip file
      const zipFile = path.join(__dirname, './fixtures/foo.zip')
      const tmpZipFile = path.join(__dirname, './fixtures/foo.tmp.zip')
      fs.copyFileSync(zipFile, tmpZipFile)
      // create dist dir
      const dist = path.join(__dirname, './tmp/extract/zip')
      expect(fs.existsSync(dist)).toBe(false)
      await makeDir(dist)
      expect(fs.existsSync(dist)).toBe(true)
      // unzip file
      const result = await extractZip(tmpZipFile, dist)
      expect(result).toEqual(true)
    },
    TEST_TIMEOUT
  )

  test('#getJavaPath()', async () => {
    const platform = os.platform()
    const result = await getJavaPath()
    if (platform === 'darwin') {
      expect(result).toContain('Contents/Home/bin/java')
    }
    if (platform === 'win32') {
      expect(result).toContain('bin/java.exe')
    }
    if (platform === 'linux') {
      expect(result).toContain('bin/java')
    }
  })

  test('#getJavaCommand()', async () => {
    const command = await getJavaCommand()
    expect(command).toEqual('java')
  })
})
