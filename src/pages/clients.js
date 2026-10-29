import { state as S } from "../modules/store.js";
import { formatMoney } from "../modules/format.js";
import { hdr } from "../ui/layout.js";

export function clients() {
  return (
    hdr(
      "Clients",
      S.clientNames.length + (S.clientNames.length === 1 ? " saved client" : " saved clients"),
      `<button class="btn" onclick="S.activeModal='client';render()">+ New client</button>`,
    ) +
    `<div class="card tbw"><table><tr><th>Client</th><th>Contact</th><th>Invoices</th><th class="r">Total billed</th><th></th></tr>${S.clientNames
      .map((n, x) => {
        const l = S.invoices.filter((i) => i.c === x);
        return `<tr><td><b>${n}</b></td><td class="mut">${[S.clientDetails[x].e, S.clientDetails[x].p].filter(Boolean).join(" · ") || "—"}</td><td>${l.length}</td><td class="r">${formatMoney(l.reduce((a, i) => a + i.a, 0))}</td><td class="r"><button class="btn s sm" onclick="editClient(${x})">Edit</button> <button class="btn s sm" onclick="S.pc=${x};S.activeModal='past';render()">Add past invoice</button> <button class="btn sm" onclick="svNew(${x})">Recurring service</button></td></tr>`;
      })
      .join("")}</table></div>`
  );
}
