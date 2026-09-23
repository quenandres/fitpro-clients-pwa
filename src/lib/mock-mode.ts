import type { UsuarioGateway } from '@/lib/gateway/schemas'

export const MOCK_MODE_STORAGE_KEY = 'fitpro-mock-mode'

export function isMockMode(): boolean {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(MOCK_MODE_STORAGE_KEY) === '1'
}

export function setMockMode(enabled: boolean): void {
  if (typeof localStorage === 'undefined') return
  if (enabled) {
    localStorage.setItem(MOCK_MODE_STORAGE_KEY, '1')
  } else {
    localStorage.removeItem(MOCK_MODE_STORAGE_KEY)
  }
}

export const DEMO_CLIENT_USER: UsuarioGateway = {
  id: 'demo-client-valentina',
  email: 'valentina.ruiz@demo.gymapp',
  role: 'client',
  full_name: 'Valentina Ruiz',
}
