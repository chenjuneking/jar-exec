import path from 'path'
import { execSync } from 'child_process'
import {
  executeClassWithCP,
  executeJar,
  install,
  use,
  versions,
  which,
} from '../src'
import { NJAR_HOME_DIR } from '../src/constants'
import { Manager } from '../src/manager'

const TEST_TIMEOUT = 600000

describe('Test index.ts', () => {
  afterAll(() => {
    execSync(`rm -rf ${NJAR_HOME_DIR}`)
  })

  test(
    '#install() - it should return 0 if system java exists',
    async () => {
      const result = await install(16, {
        type: 'jre',
        allow_system_java: true,
      })
      expect(result).toEqual(0)
    },
    TEST_TIMEOUT
  )

  test(
    '#install() - it should return 1 whatever system java exists',
    async () => {
      const result = await install(16, {
        type: 'jre',
        allow_system_java: false,
      })
      expect(result).toEqual(1)
    },
    TEST_TIMEOUT
  )

  test('#versions()', async () => {
    const list = await versions()
    expect(list).toEqual(['16', 'system'])
  })

  test('#which()', async () => {
    const javaPath = await which()
    expect(javaPath).toContain('/bin/java')
  })

  test('#use()', async () => {
    await use('16')
    const manager = await Manager.getInstance()
    expect(manager.getCurrentVersion()).toEqual('16')
  })

  test('#executeJar()', async () => {
    const jarPath = path.join(__dirname, './fixtures/example/Math/Math.jar')
    const args = ['add', '21', '32']
    const result = await executeJar(jarPath, args)
    expect(result).toEqual('53')
  })

  test('#executeClassWithCP()', async () => {
    const className = 'App.Main'
    const classPaths = path.join(__dirname, './fixtures/example/Math')
    const args = ['add', '21', '32']
    const result = await executeClassWithCP(className, classPaths, args)
    expect(result).toEqual('53')
  })

  test('JBCrypt#hashpw() and JBCrypt#checkpw()', async () => {
    const jarPath = path.join(
      __dirname,
      './fixtures/example/JBCrypt/JBCrypt.jar'
    )
    const hashed = await executeJar(jarPath, ['hashpw', 'foobar'])
    expect(hashed.startsWith('$')).toBe(true)

    const r1 = await executeJar(jarPath, ['checkpw', '123456', hashed])
    expect(r1).toBe('false')

    const r2 = await executeJar(jarPath, ['checkpw', 'foobar', hashed])
    expect(r2).toBe('true')
  })
})
