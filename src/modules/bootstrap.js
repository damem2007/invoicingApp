import { state as S } from './store.js'
import { providers as P } from './catalog.js'
import { render } from '../ui/render.js'

export async function bootLedgerly() {
  try {
    const [clientResponse, invoiceResponse, profileResponse, integrationResponse] = await Promise.all([fetch('/api/clients'), fetch('/api/invoices'), fetch('/api/business-profile'), fetch('/api/integrations')])
    const clients = await clientResponse.json()
    const invoices = await invoiceResponse.json()
    const profile = await profileResponse.json()
    const integrationRecords = await integrationResponse.json()
    S.clientNames = clients.map(client => client.name)
    S.clientIds = clients.map(client => client.id)
    S.clientDetails = clients.map(client => ({ e: client.email, p: client.phone || '', a: client.address || '' }))
    S.invoices = invoices.map(invoice => ({ id: invoice.number, c: Math.max(0, clients.findIndex(client => client.id === invoice.client_id)), a: Number(invoice.amount), due: invoice.due_date || '', s: invoice.status, rec: false, cur: invoice.currency || 'USD', n: invoice.payment_instructions || '' }))
    S.businessProfiles = profile.name ? [{ n: profile.name, a: profile.address || '', e: profile.email || '', p: profile.phone || '' }] : [{ n: 'Your business', a: '', e: '', p: '' }]
    const connected = Object.fromEntries(integrationRecords.map(record => [record.provider, { on: record.status === 'connected', acct: record.account_label || '' }]))
    S.integrations = Object.fromEntries(Object.keys(P).map(provider => [provider, connected[provider] || { on: false, acct: '' }]))
  } catch (error) {
    console.error('Ledgerly API bootstrap failed', error)
  }
  render()
}
