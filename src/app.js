import { state as S } from './modules/store.js'
import { today as T, addDays as addD } from './modules/date.js'
import { $ } from './modules/selectors.js'
import { nextOn } from './modules/recurrence.js'
import { bootLedgerly } from './modules/bootstrap.js'
import { go, render } from './ui/render.js'
import { tbl } from './pages/invoices.js'
import { upd } from './pages/editor.js'
import { newInv, save, send, markPaid, downloadInvoice, downloadPreviewPdf, dup, del, savePast } from './actions/invoices.js'
import { wiz, disc, wnext } from './actions/integrations.js'
import { runRec, svNew, svNext, saveRec, saveChg, mrs } from './actions/recurring.js'
import { addC, editClient, saveClientEdit } from './actions/clients.js'
import { recPay } from './actions/payments.js'
import { saveBiz, addCur, delCur } from './actions/settings.js'

let started = false

export function startApp() {
  if (started) return
  started = true

// Inline onclick/onchange handlers in the rendered markup resolve names on window.
Object.assign(window, {
  S, $, T, addD, nextOn, tbl, upd, mrs,
  go, render, newInv, save, send, markPaid, downloadInvoice, downloadPreviewPdf, dup, del, savePast,
  wiz, disc, wnext,
  runRec, svNew, svNext, saveRec, saveChg,
  addC, editClient, saveClientEdit,
  recPay,
  saveBiz, addCur, delCur,
})

bootLedgerly()
}

startApp()
