/**
 * Auth feature — local types.
 *
 * LoginResponse / RegisterStudentResponse live in @/shared/types/api to keep
 * them available server-side (server actions, auth.ts) without circular imports.
 * Re-export them here so feature code imports from one place.
 */
export type {
  LoginResponse,
  RegisterStudentResponse,
} from "@/shared/types/api"

// ─── Feature-local types ──────────────────────────────────────────────────────

import { Grade } from "@/shared/types/api"

export interface LoginCredentials {
  email:    string
  password: string
}

export interface RegisterStudentPayload {
  name:     string
  email:    string
  password: string
  phone:    string
  grade:    Grade
  groupId:  string
}

export interface PublicGroup {
  _id:    string
  name:   string
  grades: string[]
}

export type AuthActionState = {
  error?:        string
  fieldErrors?:  Record<string, string[]>
  success?:      boolean
  message?:      string
}
