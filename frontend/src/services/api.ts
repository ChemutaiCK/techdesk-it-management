
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
