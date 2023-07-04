import os from 'os'
import { MAC_FLAG, WIN_FLAG } from './constants'

export const env = os.platform()
export const isWin = env === WIN_FLAG
export const isMac = env === MAC_FLAG
