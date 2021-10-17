import { execSync } from 'child_process'
import fs from 'fs'
import { NJAR_HOME_DIR } from '../src/constants'
import { Manager } from '../src/manager'

describe('Test manager.ts', () => {
  beforeAll(() => {
    fs.mkdirSync(NJAR_HOME_DIR)
  })

  afterAll(async () => {
    execSync(`rm -rf ${NJAR_HOME_DIR}`)
  })

  test('#set() & #get', async () => {
    const manager = await Manager.getInstance()
    expect(manager.get('8')).toBeUndefined()
    manager.set('8', 'a/b/c')
    expect(manager.get('8')).toEqual('a/b/c')
  })

  test('#save()', async () => {
    const manager = await Manager.getInstance()
    expect(fs.existsSync(manager.manifest)).toBe(false)
    manager.set('9', 'foo/bar').save()
    expect(fs.existsSync(manager.manifest)).toBe(true)
  })

  test('#setCurrentVersion()', async () => {
    const manager = await Manager.getInstance()
    expect(manager.getCurrentVersion()).toEqual('system')
    manager.setCurrentVersion('8')
    expect(manager.getCurrentVersion()).toEqual('8')
  })

  test('#getVersions()', async () => {
    const manager = await Manager.getInstance()
    const versions = manager.getVersions()
    expect(versions).toEqual(['8', '9', 'system'])
  })
})
