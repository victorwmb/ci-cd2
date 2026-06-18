import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import UserList from './UserList'
import * as api from '../services/api'

vi.mock('../services/api', () => ({
  getUsers: vi.fn(),
  deleteUser: vi.fn(),
  loginAdmin: vi.fn(),
  setAuthToken: vi.fn()
}))

const user1 = {
  id: 1,
  lastName: 'Dupont',
  firstName: 'Marie',
  email: 'marie@example.com',
  birthDate: '2000-01-15',
  city: 'Lyon',
  postalCode: '69000',
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

describe('UserList', () => {
  it('affiche un message quand la liste est vide', async () => {
    // @ts-ignore
    api.getUsers.mockResolvedValueOnce([])
    render(<UserList />)
    await waitFor(() => {
      expect(screen.getByText(/aucun inscrit/i)).toBeInTheDocument()
    })
  })

  it('affiche les utilisateurs quand il y en a', async () => {
    // @ts-ignore
    api.getUsers.mockResolvedValueOnce([user1])
    render(<UserList />)
    await waitFor(() => {
      expect(screen.getByText(/marie dupont/i)).toBeInTheDocument()
      expect(screen.getByText(/marie@example\.com/i)).toBeInTheDocument()
    })
  })
})
