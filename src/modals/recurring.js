import { state as S } from '../modules/store.js'
import { formatDate as D, stepFrequency as stepF } from '../modules/date.js'
import { formatMoney } from '../modules/format.js'
import { isMail } from '../modules/selectors.js'
import { nextOn } from '../modules/recurrence.js'

export const makeRecurringModal = () => {
  const i = S.invoices.find(x => x.id === S.mr), n = nextOn(i, "Monthly")
  return `<div class="ov c"><div class="md"><h2>Make ${i.id} recurring</h2><p class="mut" style="margin:6px 0 0">${S.clientNames[i.c].split(" (")[0]} is billed ${formatMoney(i.a)} each time. Future invoices copy this one.</p><label class="fl">Amount for new invoices</label><input id="ma" type="number" min="0" step="0.01" value="${i.a}"><div class="mut" style="font-size:12px">${i.id} keeps its ${formatMoney(i.a)} in your history.</div><label class="fl">Frequency</label><select id="mf" onchange="$('#mrd').value=nextOn(S.invoices.find(x=>x.id===S.mr),this.value);mrs()">${["Weekly", "Biweekly", "Monthly", "Quarterly", "Yearly"].map(f => `<option ${f === "Monthly" ? "selected" : ""}>${f}</option>`).join("")}</select><label class="fl">First new invoice on</label><input type="date" id="mrd" value="${n}" onchange="mrs()"><div class="tg"><input type="checkbox" id="mau"><label for="mau">Send automatically${isMail() ? "" : " (needs an email account)"}</label></div><p id="mrp" class="ok" style="margin:10px 0 0">Next 3 invoices: ${[0, 1, 2].map(k => D(stepF(n, "Monthly", k))).join(", ")}</p><div id="mre" class="err"></div><div class="row b" style="margin-top:18px"><button class="btn s" onclick="S.activeModal=null;render()">Not now</button><button class="btn" onclick="saveRec()">Create schedule</button></div></div></div>`
}

export const changePriceModal = () => {
  const r = S.recurringServices[S.cr]
  return `<div class="ov c"><div class="md"><h2>Change price</h2><p class="mut" style="margin:6px 0 0">Invoices already issued keep their amounts. Only invoices created from the effective date use the new price.</p><label class="fl">New amount (currently ${formatMoney(r.a)})</label><input id="ca2" type="number" min="0" step="0.01"><label class="fl">Effective from</label><input id="cf" type="date" value="${r.next}"><div id="ce2" class="err"></div><div class="row b" style="margin-top:18px"><button class="btn s" onclick="S.activeModal=null;render()">Cancel</button><button class="btn" onclick="saveChg()">Apply price change</button></div></div></div>`
}
