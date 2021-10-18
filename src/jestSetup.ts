import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { NJAR_HOME_DIR } from './constants'

if (existsSync(NJAR_HOME_DIR)) {
  execSync(`rm -rf ${NJAR_HOME_DIR}`)
}
