import { today as T, stepFrequency as stepF } from './date.js'

export const nextOn = (i, f) => { const b = i.iss || i.due; let k = 1; while (stepF(b, f, k) <= T) k++; return stepF(b, f, k) }
export const hdates = v => v.hist ? [...Array(v.n).keys()].map(k => stepF(v.start, v.f, k)) : []
export const svFrom = v => { let k = v.hist ? v.n : 0; const b = v.hist ? v.start : T; while (stepF(b, v.f, k) < T) k++; return stepF(b, v.f, k) }
