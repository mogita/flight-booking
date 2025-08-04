import { VALIDATION } from '../constants'

export const validateEmail = (email: string): boolean => {
  return VALIDATION.EMAIL_REGEX.test(email)
}

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true // Phone is optional
  return VALIDATION.PHONE_REGEX.test(phone)
}

export const validateName = (name: string): boolean => {
  return name.length >= VALIDATION.MIN_NAME_LENGTH && 
         name.length <= VALIDATION.MAX_NAME_LENGTH
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}
