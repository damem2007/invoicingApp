import { state as S } from '../modules/store.js'
import { providers as P } from '../modules/catalog.js'
import { integrationSteps, integrationStepLabels } from '../modules/integrationFlows.js'
import { ib } from '../ui/layout.js'

function wizBody() {
  const w = S.integrationWizard, k = integrationSteps[w.p][w.i], n = P[w.p][0]
  const tg = (t, c) => `<div class="tg"><input type="checkbox" id="t${t.length}" ${c ? "checked" : ""}><label for="t${t.length}">${t}</label></div>`
  if (k === "connect") return `<h2>Connect ${n}</h2><p class="mut">You will sign in with ${n}. Ledgerly asks only for what it needs:</p><p>${w.p === "qb" ? "• Read and write invoices, customers and items<br>• Read payments" : "• Send email on your behalf<br>• Nothing else. Ledgerly never reads your inbox."}</p>`
  if (k === "keys") return `<h2>Add your Stripe key</h2><p class="mut">Find it in Stripe under Developers, API keys. It is stored encrypted and never shown again.</p><label class="fl">Secret key</label><input id="key" placeholder="sk_test_…" autocomplete="off">${w.err ? `<div class="err">${w.err}</div>` : ""}`
  if (k === "mail") return `<h2>Email defaults</h2><label class="fl">From name</label><input value="Harbour Lane Studio"><label class="fl">Message</label><textarea style="min-height:110px">Hi {{client}}, invoice {{invoice_number}} for {{amount}} is due {{due_date}}. Pay online: {{payment_link}}</textarea>${tg("Attach the invoice as a PDF", 1)}${tg("Send me a copy (BCC)", 0)}${tg("Remind clients 3 days before and after the due date", 1)}`
  if (k === "pay") return `<h2>Payment links</h2>${tg("Add a pay-online link to every invoice", 1)}<label class="fl">Webhook endpoint. Paste this in Stripe so paid invoices update automatically.</label><code>https://app.ledgerly.example/api/webhooks/stripe</code>`
  if (k === "map") return `<h2>Choose what to sync</h2><label class="fl">Direction</label><select><option>Push invoices, pull payments</option><option>Push invoices only</option><option>Pull payments only</option></select>${tg("Match clients by email", 1)}${tg("Map line items to QuickBooks products", 1)}${tg("Map tax names to tax codes", 1)}`
  if (k === "test" || k === "sync") return `<h2>${k === "sync" ? "Run your first sync" : "Send a test"}</h2><p class="mut">${k === "sync" ? "We will push 4 invoices and check for payments." : w.p === "stripe" ? "We will create a test payment link and confirm Stripe replies." : "We will email a sample invoice to yourself."}</p>`
  return `<div style="text-align:center;padding:30px 0"><div class="ib" style="background:var(--ok);margin:0 auto 14px;width:56px;height:56px;font-size:26px">✓</div><h2>${n} is ready</h2><p class="mut">${w.p === "qb" ? "4 invoices synced." : w.p === "stripe" ? "Invoices will now include a pay-online link." : "Create & send now uses this account."}</p></div>`
}

export function wizView() {
  const w = S.integrationWizard, f = integrationSteps[w.p], k = f[w.i], lab = { connect: "Continue with " + P[w.p][0], keys: "Verify key", test: "Send test", sync: "Run sync", done: "Finish" }[k] || "Continue"
  return `<div class="ov" onclick="if(event.target===this){S.integrationWizard=null;render()}"><div class="dr" role="dialog" aria-label="Set up ${P[w.p][0]}"><div class="row">${ib(w.p)}<div><b>${P[w.p][0]}</b><div class="mut" style="font-size:13px">Step ${w.i + 1} of ${f.length}: ${integrationStepLabels[k]}</div></div></div><div class="stp">${f.map((_, x) => `<div class="${x <= w.i ? "a" : ""}"></div>`).join("")}</div><div style="flex:1;margin-top:14px">${wizBody()}</div><div class="row b" style="margin-top:20px"><button class="btn s" ${w.i && k !== "done" ? "" : "disabled"} onclick="S.integrationWizard.i--;render()">Back</button><button class="btn" ${w.busy ? "disabled" : ""} onclick="wnext()">${w.busy ? `<span class="spin"></span>Working…` : lab}</button></div></div></div>`
}
