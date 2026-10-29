import { state as S } from '../modules/store.js'
import { $ } from '../modules/selectors.js'
import { render, toast } from '../ui/render.js'

export const editClient = x => { S.ce = x; S.activeModal = 'clientEdit'; render() }

export const saveClientEdit = async () => {
  const x = S.ce, body = { name: $('#ecn').value.trim(), email: $('#ece').value.trim(), phone: $('#ecp').value.trim(), address: $('#eca').value }, id = S.clientIds?.[x]
  if (!body.name || !body.email) return
  if (id) { const response = await fetch(`/api/clients/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!response.ok) return toast('Unable to update client') }
  S.clientNames[x] = body.name; S.clientDetails[x] = { e: body.email, p: body.phone, a: body.address }; S.activeModal = null
  toast(body.name + ' updated')
}

export const addC = async () => {
  const body = { name: $("#cn").value.trim(), email: $("#ce").value.trim(), phone: $("#cp").value, address: $("#ca").value }
  if (!body.name || !body.email) return toast('Client name and email are required.')
  try {
    const response = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const client = await response.json()
    if (!response.ok) throw new Error(client.error || 'Unable to save client')
    S.clientNames.push(client.name); S.clientDetails.push({ e: client.email, p: client.phone || '', a: client.address || '' }); S.clientIds.push(client.id)
    if (S.invoiceEditor) S.invoiceEditor.c = S.clientNames.length - 1
    S.activeModal = null; toast(client.name + " added")
  } catch (error) { toast(error.message) }
}
