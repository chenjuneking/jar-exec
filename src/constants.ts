import path from 'path'
import os from 'os'

export const NJAR_HOME_DIR = path.join(os.homedir(), '.njar')
export const DOWNLOAD_TMP_DIR = path.join(NJAR_HOME_DIR, 'downloads')
export const NJAR_VERSIONS_DIR = path.join(NJAR_HOME_DIR, 'versions')
export const MANIFEST_PATH = path.join(NJAR_HOME_DIR, 'manifest.json')
export const DOWNLOAD_ABORT_TIMEOUT = 3000
export const MAX_DOWNLOAD_RECURSIVE = 20
export const VERSION_REGEX = /^(\d+|system)$/
