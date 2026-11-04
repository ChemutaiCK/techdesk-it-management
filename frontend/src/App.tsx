
import { useEffect, useState } from 'react'
import Login from './Login'
import { getTickets, getTicket, type ApiTicket, type LoginResponse } from './services/api'
import './App.css'
import CreateTicket from './CreateTicket'
import TicketDetails from './TicketDetails'

type TicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Pending'
  | 'Resolved'
  | 'Closed'

type Priority = 'Critical' | 'High' | 'Medium' | 'Low'

type Ticket = {
  id: string
  databaseId: number
  title: string
  requester: string
  category: string
  priority: Priority
  status: TicketStatus
}

function mapApiTicket(ticket: ApiTicket): Ticket {
  const priorityMap: Record<ApiTicket['priority'], Priority> = {
    CRITICAL: 'Critical',
    HIGH: 'High',
    MEDIUM: 'Medium',
    LOW: 'Low',
  }

  const statusMap: Record<ApiTicket['status'], TicketStatus> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  }

  return {
    id: `TK-${ticket.ticket_number.slice(0, 8).toUpperCase()}`,
    title: ticket.title,
    requester: ticket.requester_name,
    category: ticket.category,
    priority: priorityMap[ticket.priority],
    status: statusMap[ticket.status],
  }
}

const navigation = [
  { label: 'Overview', icon: '◫' },
  { label: 'Tickets', icon: '▤' },
  { label: 'Assets', icon: '▣' },
  { label: 'Maintenance', icon: '⚙' },
  { label: 'Reports', icon: '▥' },
]

function App() {
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem('techdesk_token'),
  )

  const [currentUser, setCurrentUser] = useState<LoginResponse['user'] | null>(
    () => {
      const savedUser = sessionStorage.getItem('techdesk_user')

      if (!savedUser) return null

      try {
        return JSON.parse(savedUser) as LoginResponse['user']
      } catch {
        sessionStorage.removeItem('techdesk_user')
        sessionStorage.removeItem('techdesk_token')
        return null
      }
    },
  )

  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [ticketsLoading, setTicketsLoading] = useState(false)
  const [ticketsError, setTicketsError] = useState('')
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null)
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false)
  const [ticketDetailsError, setTicketDetailsError] = useState('')

  function handleLogin(data: LoginResponse) {
    sessionStorage.setItem('techdesk_token', data.token)
    sessionStorage.setItem('techdesk_user', JSON.stringify(data.user))
    setToken(data.token)
    setCurrentUser(data.user)
  }

  function handleLogout() {
    sessionStorage.removeItem('techdesk_token')
    sessionStorage.removeItem('techdesk_user')
    setToken(null)
    setCurrentUser(null)
    setTickets([])
    setActivePage('Overview')
    setSearch('')
  }

  useEffect(() => {
    if (!token) {
      setTickets([])
      setTicketsError('')
      setTicketsLoading(false)
      return
    }

    let cancelled = false

    async function loadTickets() {
      setTicketsLoading(true)
      setTicketsError('')

      try {
        const data = await getTickets(token!)

        if (!cancelled) {
          setTickets(data.map(mapApiTicket))
        }
      } catch (error) {
        if (!cancelled) {
          setTicketsError(
            error instanceof Error
              ? error.message
              : 'Unable to load tickets.',
          )
        }
      } finally {
        if (!cancelled) {
          setTicketsLoading(false)
        }
      }
    }

    void loadTickets()

    return () => {
      cancelled = true
    }
  }, [token])

  const visibleTickets = tickets.filter((ticket) =>
    [
      ticket.id,
      ticket.title,
      ticket.requester,
      ticket.category,
      ticket.status,
      ticket.priority,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const openTickets = tickets.filter(
    (ticket) => ticket.status === 'Open',
  ).length

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === 'In Progress',
  ).length

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === 'Resolved' || ticket.status === 'Closed',
  ).length

  if (!token || !currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault()
            setActivePage('Overview')
          }}
        >
          <span className="brand-mark">T</span>
          <span className="brand-name">
            Tech<span>Desk</span>
            <small>IT SERVICE MANAGEMENT</small>
          </span>
        </a>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="main-navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-item ${activePage === item.label ? 'active' : ''}`}
              key={item.label}
              onClick={() => setActivePage(item.label)}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.label === 'Tickets' && (
                <span className="nav-count">{openTickets}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-help">
          <div className="help-icon">?</div>
          <strong>Need a hand?</strong>
          <p>Find your way around TechDesk.</p>
          <button onClick={() => window.alert('Help centre coming soon.')}>
            Visit help centre <span>→</span>
          </button>
        </div>

        <div className="profile">
          <div className="avatar">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>
              {[currentUser.first_name, currentUser.last_name]
                .filter(Boolean)
                .join(' ') || currentUser.username}
            </strong>
            <span>
              {currentUser.is_staff ? 'System Administrator' : 'Team Member'}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search tickets, assets..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tickets"
              />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => window.alert('You are all caught up!')}
            >
              ♧<span />
            </button>

            <div className="topbar-avatar">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                TUESDAY, OCTOBER 21, 2026
              </div>

              <h1>
                {activePage === 'Overview'
                  ? `Good morning, ${currentUser.first_name || currentUser.username}`
                  : activePage}
                <span className="wave">✳</span>
              </h1>

              <p className="page-subtitle">
                Here&apos;s what&apos;s happening across your IT workspace today.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                setActivePage('Tickets')
                setShowCreateTicket(true)
              }}
             >
              <span>＋</span> Create ticket
            </button>
          </section>

          {activePage === 'Overview' || activePage === 'Tickets' ? (
            <>
              <section className="stats-grid" aria-label="Ticket statistics">
                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Open tickets</span>
                    <span className="stat-icon icon-open">▤</span>
                  </div>
                  <div className="stat-value">{openTickets}</div>
                  <div className="stat-footer">
                    <span className="status-dot dot-orange" />
                    Awaiting support
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">In progress</span>
                    <span className="stat-icon icon-progress">◷</span>
                  </div>
                  <div className="stat-value">{inProgressTickets}</div>
                  <div className="stat-footer">
                    <span className="status-dot dot-blue" />
                    Being worked on
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Resolved tickets</span>
                    <span className="stat-icon icon-resolved">✓</span>
                  </div>
                  <div className="stat-value">{resolvedTickets}</div>
                  <div className="stat-footer">
                    <span className="status-dot dot-green" />
                    Successfully completed
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-top">
                    <span className="stat-label">Tracked assets</span>
                    <span className="stat-icon icon-assets">▣</span>
                  </div>
                  <div className="stat-value">128</div>
                  <div className="stat-footer">
                    <span className="status-dot dot-blue" />
                    Across your organisation
                  </div>
                </article>
              </section>

              <section className="dashboard-grid">
                <article className="panel tickets-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        {activePage === 'Tickets' ? 'All tickets' : 'Recent tickets'}
                      </h2>
                      <p>Track and manage your support requests.</p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setActivePage('Tickets')}
                    >
                      View all <span>→</span>
                    </button>
                  </div>

                  <div className="table-toolbar">
                    <span>
                      <span className="live-dot" /> Live ticket overview
                    </span>

                    <button
                      className="filter-button"
                      onClick={() => setSearch('Open')}
                    >
                      Filter open <span>⌄</span>
                    </button>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Requester</th>
                          <th>Priority</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ticketsLoading ? (
                          <tr>
                            <td colSpan={4} className="empty-state">
                              Loading tickets...
                            </td>
                          </tr>
                        ) : ticketsError ? (
                          <tr>
                            <td colSpan={4} className="empty-state">
                              {ticketsError}
                            </td>
                          </tr>
                        ) : visibleTickets.length > 0 ? (
                          visibleTickets.map((ticket) => (
                            <tr
                                key={ticket.id}
                                className="clickable-ticket-row"
                                onClick={async () => {
                                          if (!token) return

                                          setSelectedTicket(null)
                                          setTicketDetailsError('')
                                          setTicketDetailsLoading(true)

                                          try {
                                            const fullTicket = await getTicket(token, Number(ticket.id.replace('TK-', '')))
                                            setSelectedTicket(fullTicket)
                                          } catch (error) {
                                            setTicketDetailsError(
                                              error instanceof Error
                                                ? error.message
                                                : 'Unable to load ticket details.',
                                            )
                                          } finally {
                                            setTicketDetailsLoading(false)
                                          }
                                        }}
                              >
                              <td>
                                <div className="ticket-title">{ticket.title}</div>
                                <div className="ticket-id">{ticket.id}</div>
                              </td>

                              <td>
                                <div className="requester-name">
                                  {ticket.requester}
                                </div>
                                <div className="requester-department">
                                  {ticket.category}
                                </div>
                              </td>

                              <td>
                                <span
                                  className={`priority priority-${ticket.priority.toLowerCase()}`}
                                >
                                  <span /> {ticket.priority}
                                </span>
                              </td>

                              <td>
                                <span
                                  className={`status status-${ticket.status.toLowerCase().replace(' ', '-')}`}
                                >
                                  {ticket.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="empty-state">
                              {tickets.length === 0
                                ? 'No tickets have been created yet.'
                                : 'No tickets match your search.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-footer">
                    Showing {visibleTickets.length} of {tickets.length} tickets
                  </div>
                </article>

                <aside className="right-column">
                  <article className="panel asset-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Asset overview</h2>
                        <p>Your IT inventory at a glance.</p>
                      </div>
                      <span className="panel-heading-icon">▣</span>
                    </div>

                    <div className="asset-total">
                      <strong>128</strong>
                      <span>Registered assets</span>
                    </div>

                    <div className="asset-bar" aria-label="Asset distribution">
                      <span className="asset-bar-active" />
                      <span className="asset-bar-maintenance" />
                      <span className="asset-bar-retired" />
                    </div>

                    <div className="asset-legend">
                      <div>
                        <span className="legend-dot dot-teal" />
                        <span>Active</span>
                        <strong>106</strong>
                      </div>
                      <div>
                        <span className="legend-dot dot-orange" />
                        <span>Maintenance</span>
                        <strong>14</strong>
                      </div>
                      <div>
                        <span className="legend-dot dot-grey" />
                        <span>Retired</span>
                        <strong>8</strong>
                      </div>
                    </div>

                    <button
                      className="asset-link"
                      onClick={() => setActivePage('Assets')}
                    >
                      Explore assets <span>→</span>
                    </button>
                  </article>

                  <article className="insight-card">
                    <div className="insight-icon">✦</div>
                    <div className="insight-label">WORKSPACE INSIGHT</div>
                    <h3>Keep your team moving.</h3>
                    <p>
                      Stay on top of open requests and keep your organisation&apos;s
                      technology running smoothly.
                    </p>
                    <button onClick={() => setActivePage('Reports')}>
                      Explore reports <span>→</span>
                    </button>
                    <div className="insight-decoration">✳</div>
                  </article>
                </aside>
              </section>
            </>
          ) : (
            <section className="panel placeholder-panel">
              <div className="placeholder-icon">◫</div>
              <h2>{activePage} workspace</h2>
              <p>
                This section is part of the TechDesk roadmap. We&apos;ll build it
                out in upcoming milestones.
              </p>
              <button
                className="primary-button"
                onClick={() => setActivePage('Overview')}
              >
                Back to overview
              </button>
            </section>
          )}

          <footer className="page-footer">
            <span>© 2026 TechDesk</span>
            <span>IT operations, made clearer.</span>
            <span>
              System status <span className="footer-status-dot" /> Operational
            </span>
          </footer>
        </div>


        {showCreateTicket && token && (
            <CreateTicket
              token={token}
              onClose={() => setShowCreateTicket(false)}
              onCreated={(newTicket) => {
                setTickets((currentTickets) => [
                  mapApiTicket(newTicket),
                  ...currentTickets,
                ])
                setShowCreateTicket(false)
              }}
            />
          )}
            {selectedTicket && (
              <TicketDetails
                ticket={tickets.find(
                  (ticket) => ticket.id === selectedTicket.id
                ) ? selectedTicket : selectedTicket}
                onClose={() => setSelectedTicket(null)}
              />
            )}
      </main>
    </div>
  )
}

export default App
