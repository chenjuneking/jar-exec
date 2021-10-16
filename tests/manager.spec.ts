import { execSync } from 'child_process'
import fs from 'fs'
import { Manager } from '../src/manager'

describe('Test manager.ts', () => {
  afterAll(() => {
    const manager = Manager.getInstance()
    if (fs.existsSync(manager.manifest)) {
      execSync(`rm ${manager.manifest}`)
    }
  })

  test('#set() & #get', () => {
    const manager = Manager.getInstance()
    expect(manager.get('8')).toBeUndefined()
    manager.set('8', 'a/b/c')
    expect(manager.get('8')).toEqual('a/b/c')
  })

  test('#save()', () => {
    const manager = Manager.getInstance()
    expect(fs.existsSync(manager.manifest)).toBe(false)
    manager.set('9', 'foo/bar').save()
    expect(fs.existsSync(manager.manifest)).toBe(true)
  })

  test('#setCurrentVersion()', () => {
    const manager = Manager.getInstance()
    expect(manager.currentVersion).toEqual('')
    manager.setCurrentVersion('8')
    expect(manager.currentVersion).toEqual('8')
  })

  test('#getVersions()', () => {
    const manager = Manager.getInstance()
    const versions = manager.getVersions()
    expect(versions).toEqual(['8', '9'])
  })
})
