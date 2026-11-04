
import type { ApiTicket } from './services/api'
import './TicketDetails.css'

type TicketDetailsProps = {
  ticket: ApiTicket
  onClose: () => void
}

function TicketDetails({ ticket, onClose }: TicketDetailsProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const categoryLabels: Record<string, string> = {
    HARDWARE: 'Hardware',
    SOFTWARE: 'Software',
    NETWORK: 'Network',
    ACCESS: 'Account & Access',
    EMAIL: 'Email',
    OTHER: 'Other',
  }

  const priorityLabels: Record<string, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    CRITICAL: 'Critical',
  }

  const statusLabels: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    PENDING: 'Pending',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  }

  return (
    <div className="ticket-details-overlay" onClick={onClose}>
      <section
        className="ticket-details-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ticket-details-header">
          <div>
            <span className="ticket-details-eyebrow">TICKET DETAILS</span>
            <h2>{ticket.title}</h2>
            <p>Ticket #{ticket.id}</p>
          </div>

          <button
            type="button"
            className="ticket-details-close"
            onClick={onClose}
            aria-label="Close ticket details"
          >
            ×
          </button>
        </header>

        <div className="ticket-details-badges">
          <span className={`priority priority-${ticket.priority.toLowerCase()}`}>
            {priorityLabels[ticket.priority] ?? ticket.priority} Priority
          </span>

          <span
            className={`status status-${ticket.status.toLowerCase().replace('_', '-')}`}
          >
            {statusLabels[ticket.status] ?? ticket.status}
          </span>
        </div>

        <div className="ticket-details-section">
          <h3>Description</h3>
          <p className="ticket-details-description">
            {ticket.description || 'No description provided.'}
          </p>
        </div>

        <div className="ticket-details-section">
          <h3>Ticket information</h3>

          <div className="ticket-details-grid">
            <div>
              <span>Requester</span>
              <strong>{ticket.requester_name || 'Not available'}</strong>
            </div>

            <div>
              <span>Category</span>
              <strong>
                {categoryLabels[ticket.category] ?? ticket.category}
              </strong>
            </div>

            <div>
              <span>Assigned technician</span>
              <strong>{ticket.assigned_to_name || 'Unassigned'}</strong>
            </div>

            <div>
              <span>Priority</span>
              <strong>
                {priorityLabels[ticket.priority] ?? ticket.priority}
              </strong>
            </div>

            <div>
              <span>Created</span>
              <strong>{formatDate(ticket.created_at)}</strong>
            </div>

            <div>
              <span>Last updated</span>
              <strong>{formatDate(ticket.updated_at)}</strong>
            </div>
          </div>
        </div>

        <footer className="ticket-details-footer">
          <button type="button" onClick={onClose}>
            Close details
          </button>
        </footer>
      </section>
    </div>
  )
}

export default TicketDetails
