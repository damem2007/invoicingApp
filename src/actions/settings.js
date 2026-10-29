import { state as S } from '../modules/store.js'
import { currencySigns as SYM, currencyNames as CN } from '../modules/catalog.js'
import { $ } from '../modules/selectors.js'
import { toast } from '../ui/render.js'

export const saveBiz = async () => {
  const business = {
    name: $("#bn").value.trim(),
    address: $("#ba").value,
    email: $("#be").value,
    phone: $("#bp").value,
  }
  if (!business.name) return

  try {
    const response = await fetch('/api/business-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(business),
    })
    const savedBusiness = await response.json()
    if (!response.ok) throw new Error(savedBusiness.error || 'Unable to save business profile')

    const localBusiness = {
      n: savedBusiness.name,
      a: savedBusiness.address || '',
      e: savedBusiness.email || '',
      p: savedBusiness.phone || '',
    }
    if (S.businessProfiles.length) S.businessProfiles[0] = localBusiness
    else S.businessProfiles.push(localBusiness)
    if (S.invoiceEditor) S.invoiceEditor.b = 0
    S.activeModal = null
    toast(localBusiness.n + " saved")
  } catch (error) {
    toast(error.message)
  }
}

export const addCur = () => {
  const k = $("#xc").value.trim().toUpperCase(), s = $("#xs").value.trim(), e = m => ($("#xe").textContent = m)
  if (!/^[A-Z]{3}$/.test(k)) return e("Use the 3-letter ISO code, for example GBP or JPY.")
  if (SYM[k]) return e(k + " is already in your list.")
  if (!s) return e("Enter the currency sign, for example £ or ¥.")
  SYM[k] = s; CN[k] = $("#xn").value.trim(); S.activeModal = null; toast(k + " added")
}

export const delCur = k => { delete SYM[k]; toast(k + " removed") }
