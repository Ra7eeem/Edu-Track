import { ApiUser, Grade, JoinRequestStatus, Role } from "@/shared/types/api"

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: ApiUser
}

export interface RegisterStudentPayload {
  name: string
  email: string
  password: string
  phone: string
  grade: Grade
  groupId: string
}

export interface RegisterStudentResponse {
  token: string
  user: ApiUser
  joinRequest: {
    groupId: string
    groupName: string
    status: JoinRequestStatus
    message: string
  }
}

export interface PublicGroup {
  _id: string
  name: string
  grades: string[]
}

export type AuthActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
  message?: string
}

