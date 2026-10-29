import { state as S } from '../modules/store.js'

export const businessModal = () => {
  const b = S.be >= 0 ? S.businessProfiles[S.be] : { n: "", a: "", e: "", p: "" }
  return `<div class="ov c"><div class="md"><h2>${S.be >= 0 ? "Edit business" : "New business"}</h2><label class="fl">Business name</label><input id="bn" value="${b.n}"><label class="fl">Address</label><textarea id="ba">${b.a}</textarea><label class="fl">Email</label><input id="be" value="${b.e}"><label class="fl">Phone</label><input id="bp" value="${b.p}"><div class="row b" style="margin-top:18px"><button class="btn s" onclick="S.activeModal=null;render()">Cancel</button><button class="btn" onclick="saveBiz()">Save business</button></div></div></div>`
}
