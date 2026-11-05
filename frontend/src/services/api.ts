
const API_BASE_URL = '/api'

export type LoginResponse = {
  token: string
  user: {
    id: number
    username: string
    first_name: string
    last_name: string
    email: string
    is_staff: boolean
  }
}

export type ApiTicket = {
  id: number
  ticket_number: string
  title: string
  description: string
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED'
  requester: number
  requester_name: string
  assigned_to: number | null
  assigned_to_name: string | null
  created_at: string
  updated_at: string
}

export type CreateTicketPayload = {
  title: string
  description: string
  category: 'HARDWARE' | 'SOFTWARE' | 'NETWORK' | 'ACCESS' | 'EMAIL' | 'OTHER'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/accounts/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : Object.values(data).flat().join(' '),
    )
  }

  return data as LoginResponse
}

export async function getTickets(token: string): Promise<ApiTicket[]> {
  const response = await fetch(`${API_BASE_URL}/tickets/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Unable to load tickets (${response.status}).`)
  }

  return response.json() as Promise<ApiTicket[]>
}

export async function createTicket(
  token: string,
  payload: CreateTicketPayload,
): Promise<ApiTicket> {
  const response = await fetch(`${API_BASE_URL}/tickets/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : Object.values(data).flat().join(' '),
    )
  }

  return data as ApiTicket
}

export async function getTicket(
  token: string,
  ticketId: number,
): Promise<ApiTicket> {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : 'Unable to load ticket details.',
    )
  }

  return data as ApiTicket
}

export async function updateTicketStatus(
  token: string,
  ticketId: number,
  status: ApiTicket['status'],
): Promise<ApiTicket> {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : 'Unable to update ticket status.',
    )
  }

  return data as ApiTicket
}

export type Technician = {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
}

export async function getTechnicians(
  token: string,
): Promise<Technician[]> {
  const response = await fetch(
    `${API_BASE_URL}/accounts/technicians/`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : 'Unable to load technicians.',
    )
  }

  return data as Technician[]
}

export async function assignTicket(
  token: string,
  ticketId: number,
  technicianId: number | null,
): Promise<ApiTicket> {
  const response = await fetch(
    `${API_BASE_URL}/tickets/${ticketId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        assigned_to: technicianId,
      }),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : 'Unable to assign ticket.',
    )
  }

  return data as ApiTicket
}

export type CurrentUser = {
  id: number
  username: string
  is_admin: boolean
}

export async function getCurrentUser(
  token: string,
): Promise<CurrentUser> {
  const response = await fetch(`${API_BASE_URL}/accounts/me/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : 'Unable to load user details.',
    )
  }

  return data as CurrentUser
}