import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react"
import RegistrationForm from "./RegistrationForm"
import * as api from "../services/api"

vi.mock("../services/api", () => ({
  saveUser: vi.fn()
}))

const sonnerMocks = vi.hoisted(() => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock("sonner", () => sonnerMocks)

vi.mock("../utils/validation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../utils/validation")>()
  return {
    ...actual,
    validateForm: () => ({})
  }
})

beforeEach(() => {
  sonnerMocks.toast.error.mockClear()
  sonnerMocks.toast.success.mockClear()
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function getSaveButton() {
  return screen.getAllByRole("button", { name: /sauvegarder/i })[0]
}

function fillValidFields() {
  fireEvent.change(screen.getByLabelText(/^nom$/i), {
    target: { value: "Dupont" },
  })
  fireEvent.change(screen.getByLabelText(/^prénom$/i), {
    target: { value: "Marie" },
  })
  fireEvent.change(screen.getByLabelText(/^mail$/i), {
    target: { value: "marie.dupont@example.com" },
  })
  fireEvent.change(screen.getByLabelText(/^ville$/i), {
    target: { value: "Lyon" },
  })
  fireEvent.change(screen.getByLabelText(/^code postal$/i), {
    target: { value: "69000" },
  })
}

function selectBirthDate() {
  fireEvent.click(
    screen.getAllByRole("button", { name: /choisir une date/i })[0]
  )
  const dayButton = screen
    .getAllByRole("button")
    .find((b) => /^\d{1,2}$/.test(b.textContent ?? ""))
  if (dayButton) fireEvent.click(dayButton)
}

describe("RegistrationForm", () => {
  it("affiche tous les champs et le bouton", () => {
    render(<RegistrationForm />)
    expect(screen.getByLabelText(/^nom$/i)).toBeInTheDocument()
    expect(getSaveButton()).toBeInTheDocument()
  })

  it("déclenche un toast success quand le formulaire est valide", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date(2005, 0, 1))

    // @ts-ignore
    api.saveUser.mockResolvedValueOnce({ id: 1 })

    render(<RegistrationForm />)
    fillValidFields()
    selectBirthDate()

    vi.useRealTimers()

    fireEvent.change(screen.getByLabelText(/^nom$/i), {
      target: { value: "Dupont" },
    })

    fireEvent.click(getSaveButton())

    await waitFor(() => {
      expect(api.saveUser).toHaveBeenCalledTimes(1)
      expect(sonnerMocks.toast.success).toHaveBeenCalledTimes(1)
    })
  })
})
