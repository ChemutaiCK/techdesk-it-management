
import { useState } from 'react'
import './App.css'

type TicketStatus = 'Open' | 'In Progress' | 'Resolved'
type Priority = 'High' | 'Medium' | 'Low'

type Ticket = {
  id: string
  title: string
  requester: string
  department: string
  priority: Priority
  status: TicketStatus
}

const initialTickets: Ticket[] = [
  {
    id: 'TK-1048',
    title: 'Unable to connect to company VPN',
    requester: 'Grace Wanjiku',
    department: 'Finance',
    priority: 'High',
    status: 'Open',
  },
  {
    id: 'TK-1047',
    title: 'Laptop running slowly',
    requester: 'Brian Otieno',
    department: 'Human Resources',
    priority: 'Medium',
    status: 'In Progress',
  },
  {
    id: 'TK-1046',
    title: 'Access request for shared drive',
    requester: 'Mercy Njeri',
    department: 'Operations',
    priority: 'Low',
    status: 'Resolved',
  },
  {
    id: 'TK-1045',
    title: 'Printer not responding',
    requester: 'David Kiptoo',
    department: 'Administration',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: 'TK-1044',
    title: 'Email application configuration',
    requester: 'Faith Achieng',
    department: 'Marketing',
    priority: 'Low',
    status: 'In Progress',
  },
]

const navigation = [
  { label: 'Overview', icon: '◫' },
  { label: 'Tickets', icon: '▤' },
  { label: 'Assets', icon: '▣' },
  { label: 'Maintenance', icon: '⚙' },
  { label: 'Reports', icon: '▥' },
]

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [search, setSearch] = useState('')
  const [tickets, setTickets] = useState(initialTickets)

  const visibleTickets = tickets.filter((ticket) =>
    [
      ticket.id,
      ticket.title,
      ticket.requester,
      ticket.department,
      ticket.status,
      ticket.priority,
    ]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase()),
  )

  const openTickets = tickets.filter((ticket) => ticket.status === 'Open').length
  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === 'In Progress',
  ).length
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === 'Resolved',
  ).length

  function cycleStatus(id: string) {
    const statuses: TicketStatus[] = ['Open', 'In Progress', 'Resolved']

    setTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== id) return ticket

        const nextStatus =
          statuses[(statuses.indexOf(ticket.status) + 1) % statuses.length]

        return { ...ticket, status: nextStatus }
      }),
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={() => setActivePage('Overview')}>
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
          <div className="avatar">CK</div>
          <div className="profile-info">
            <strong>Cynthia Kirui</strong>
            <span>System Administrator</span>
          </div>
          <span className="profile-menu">···</span>
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
            <div className="topbar-avatar">CK</div>
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
                  ? 'Good morning, Cynthia'
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
                window.alert('Ticket creation form coming in the next step.')
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
                      <h2>{activePage === 'Tickets' ? 'All tickets' : 'Recent tickets'}</h2>
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
                        {visibleTickets.map((ticket) => (
                          <tr key={ticket.id}>
                            <td>
                              <div className="ticket-title">{ticket.title}</div>
                              <div className="ticket-id">{ticket.id}</div>
                            </td>
                            <td>
                              <div className="requester-name">
                                {ticket.requester}
                              </div>
                              <div className="requester-department">
                                {ticket.department}
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
                              <button
                                className={`status status-${ticket.status.toLowerCase().replace(' ', '-')}`}
                                title="Click to cycle ticket status"
                                onClick={() => cycleStatus(ticket.id)}
                              >
                                {ticket.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {visibleTickets.length === 0 && (
                          <tr>
                            <td colSpan={4} className="empty-state">
                              No tickets match your search.
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
      </main>
    </div>
  )
}

export default App
