import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

const sonnerMocks = vi.hoisted(() => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: vi.fn(() => null),
}))

vi.mock("sonner", () => sonnerMocks)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('App', () => {
  it('affiche le formulaire et la liste des inscrits', () => {
    render(<App />)
    expect(screen.getByText(/formulaire d'inscription/i)).toBeInTheDocument()
    expect(screen.getByText(/inscrits/i)).toBeInTheDocument()
  })
})
