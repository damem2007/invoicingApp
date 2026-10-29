import { state as S } from '../modules/store.js'

export const newClientModal = () => `<div class="ov c"><div class="md"><h2>New client</h2><label class="fl">Name</label><input id="cn"><label class="fl">Email</label><input id="ce"><label class="fl">Phone</label><input id="cp"><label class="fl">Address</label><textarea id="ca"></textarea><div class="row b" style="margin-top:18px"><button class="btn s" onclick="S.activeModal=null;render()">Cancel</button><button class="btn" onclick="addC()">Save client</button></div></div></div>`

export function clientEditModal() {
  const x = S.ce, b = S.clientDetails[x] || {}
  return `<div class="ov c"><div class="md"><h2>Edit client</h2><label class="fl">Name</label><input id="ecn" value="${S.clientNames[x] || ''}"><label class="fl">Email</label><input id="ece" value="${b.e || ''}"><label class="fl">Phone</label><input id="ecp" value="${b.p || ''}"><label class="fl">Address</label><textarea id="eca">${b.a || ''}</textarea><div class="row b" style="margin-top:18px"><button class="btn s" onclick="S.activeModal=null;render()">Cancel</button><button class="btn" onclick="saveClientEdit()">Save changes</button></div></div></div>`
}
