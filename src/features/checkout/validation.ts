import type { CheckoutContact } from '../../hooks/useCheckout'
import { validatePhone } from '../../lib/phone'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ContactErrors {
  recipientEmail?: string
  recipientName?: string
  recipientPhone?: string
  verification?: string
}

export function contactErrors(
  contact: CheckoutContact,
  verified: boolean,
): ContactErrors {
  const errors: ContactErrors = {}
  if (!contact.recipientName.trim()) errors.recipientName = 'Enter the name for this delivery.'
  const phoneError = validatePhone(contact.recipientPhone, { required: true })
  if (phoneError) errors.recipientPhone = phoneError

  const email = contact.recipientEmail.trim()
  if (!email) errors.recipientEmail = 'Enter your email address.'
  else if (!EMAIL_PATTERN.test(email)) errors.recipientEmail = 'Enter a valid email address.'

  if (!verified && !errors.recipientEmail) {
    errors.verification = 'Verify your email with the code we send you.'
  }
  return errors
}
