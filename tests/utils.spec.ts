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
  systemJavaExists,
  verify,
} from '../src/utils'
import { DEFAULT_REGISTRY } from '../src/constants'

const isMock = !!process.env.MOCK
const isCI = !!process.env.CI
const registry = isMock ? 'http://localhost:8080' : DEFAULT_REGISTRY

describe.skip('Test utils.ts', () => {
  const BINARY_LINK = `${registry}/v2/info/releases/download/jdk8u302-b08/OpenJDK8U-jre_x64_mac_hotspot_8u302b08.tar.gz`
  const CHECKSUM_LINK = `${registry}/v2/info/releases/download/jdk8u302-b08/OpenJDK8U-jre_x64_mac_hotspot_8u302b08.tar.gz.sha256.txt`
  const DIR = path.join(__dirname, './tmp/a/b')

  // options = {
  //   openjdk_impl: 'hotspot',
  //   release: 'latest',
  //   type: 'jre',
  //   allow_system_java: true,
  //   arch: 'x64'
  // }

  beforeAll(() => {
    execSync(`rm -rf ${path.join(__dirname, './tmp')}`)
  })

  test('#systemJavaExists()', async () => {
    const result = await systemJavaExists()
    expect(result).toEqual(!isCI)
  })

  test('#getExecutable()', () => {
    const platform = os.platform()
    const result = getExecutable()
    if (platform === 'darwin') {
      expect(result).toEqual('Contents/Home/bin/java')
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

  test('#download()', async () => {
    const result1 = await download(BINARY_LINK, DIR)
    expect(result1).toEqual(`${DIR}/${path.basename(BINARY_LINK)}`)
    const result2 = await download(CHECKSUM_LINK, DIR)
    expect(result2).toEqual(`${DIR}/${path.basename(CHECKSUM_LINK)}`)
  }, 50000)

  test('#genChecksum()', async () => {
    const binaryFile = `${DIR}/${path.basename(BINARY_LINK)}`
    expect(fs.existsSync(binaryFile)).toBe(true)
    const result = await genChecksum(binaryFile)
    expect(result).toBeTruthy()
  })

  test('#verify()', async () => {
    const binaryFile = `${DIR}/${path.basename(BINARY_LINK)}`
    const shaFile = `${DIR}/${path.basename(CHECKSUM_LINK)}`
    const shaText = await fs.readFileSync(shaFile, 'utf-8').split(' ')[0]
    expect(shaText).toBeTruthy()
    const result = await verify(binaryFile, shaText)
    expect(result).toBe(true)
  })

  test('#move() & extractTarGz()', async () => {
    // move
    const binaryFile = `${DIR}/${path.basename(BINARY_LINK)}`
    const destDir = path.join(__dirname, './tmp')
    const newFile = await move(binaryFile, destDir)
    expect(typeof newFile).toEqual('string')
    expect(fs.existsSync(newFile as string)).toBe(true)
    // create extract dist dir
    const dist = path.join(__dirname, './tmp/a/b/extract/tar')
    expect(fs.existsSync(dist)).toBe(false)
    await makeDir(dist)
    expect(fs.existsSync(dist)).toBe(true)
    // tar file
    const result = await extractTarGz(newFile as string, dist)
    expect(typeof result).toEqual('string')
  })

  test('#extractZip()', async () => {
    // copy a tmp zip file
    const zipFile = path.join(__dirname, './fixtures/foo.zip')
    const tmpZipFile = path.join(__dirname, './fixtures/foo.tmp.zip')
    // create dist dir
    fs.copyFileSync(zipFile, tmpZipFile)
    const dist = path.join(__dirname, './tmp/a/b/extract/zip')
    expect(fs.existsSync(dist)).toBe(false)
    await makeDir(dist)
    expect(fs.existsSync(dist)).toBe(true)
    // unzip file
    const result = await extractZip(tmpZipFile, dist)
    expect(typeof result).toEqual('string')
    expect(fs.existsSync(tmpZipFile)).toBe(false)
  })

  test('#getJavaPath()', () => {
    const platform = os.platform()
    const result = getJavaPath()
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
