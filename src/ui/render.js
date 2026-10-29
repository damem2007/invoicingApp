import { state as S } from '../modules/store.js'
import { $ } from '../modules/selectors.js'
import { shell } from './layout.js'
import { overview } from '../pages/overview.js'
import { invoices } from '../pages/invoices.js'
import { clients } from '../pages/clients.js'
import { payments } from '../pages/payments.js'
import { integrations } from '../pages/integrations.js'
import { settings } from '../pages/settings.js'
import { editor } from '../pages/editor.js'
import { prevP } from '../pages/preview.js'
import { service } from '../pages/service.js'
import { wizView } from '../modals/integrationWizard.js'
import { modal } from '../modals/index.js'

export const go = (r, t) => { S.currentRoute = r; if (t) S.activeInvoiceTab = t; S.searchQuery = ""; S.openMenuIndex = 0; S.invoiceEditor = null; render(); scrollTo(0, 0) }
export const toast = (m, u) => { S.toast = { m, u }; render(); clearTimeout(S.tt); S.tt = setTimeout(() => { S.toast = null; render() }, 5000) }

export function render() {
  const pg = { overview, invoices, clients, payments, integrations, settings, new: editor, preview: prevP, svc: service }[S.currentRoute]()
  $("#root").innerHTML = shell(pg) + (S.integrationWizard ? wizView() : "") + (S.activeModal ? modal() : "") + (S.toast ? `<div class="toast" role="status">${S.toast.m}${S.toast.u ? `<button onclick="S.toast.u()">Undo</button>` : ""}</div>` : "")
}
