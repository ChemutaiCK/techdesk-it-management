
import { useEffect, useState } from 'react'
import type { ApiTicket, Technician } from './services/api'
import './TicketDetails.css'
import {
  assignTicket,
  getTechnicians,
  updateTicketStatus,
} from './services/api'

type TicketDetailsProps = {
  ticket: ApiTicket
  token: string
  isAdmin: boolean
  onClose: () => void
  onTicketUpdated: (updatedTicket: ApiTicket) => void
}

function TicketDetails({
  ticket,
  token,
  isAdmin,
  onClose,
  onTicketUpdated,
}: TicketDetailsProps) {
  const [newStatus, setNewStatus] = useState<ApiTicket['status']>(
    ticket.status,
  )
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [technicians, setTechnicians] = useState<Technician[]>([])
const [selectedTechnician, setSelectedTechnician] = useState(
  ticket.assigned_to ? String(ticket.assigned_to) : '',
)
const [assigning, setAssigning] = useState(false)
const [assignmentError, setAssignmentError] = useState('')
useEffect(() => {
  if (!isAdmin) return

  const loadTechnicians = async () => {
    try {
      const data = await getTechnicians(token)
      setTechnicians(data)
    } catch (error) {
      setAssignmentError(
        error instanceof Error
          ? error.message
          : 'Unable to load technicians.',
      )
    }
  }

  loadTechnicians()
}, [isAdmin, token])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }
    const handleStatusUpdate = async () => {
    if (newStatus === ticket.status) return

    setUpdating(true)
    setUpdateError('')

    try {
      const updatedTicket = await updateTicketStatus(
        token,
        ticket.id,
        newStatus,
      )

      onTicketUpdated(updatedTicket)
    } catch (error) {
      setUpdateError(
        error instanceof Error
          ? error.message
          : 'Unable to update ticket status.',
      )
    } finally {
      setUpdating(false)
    }
  }

    const handleAssignment = async () => {
    const technicianId = selectedTechnician
      ? Number(selectedTechnician)
      : null

    setAssigning(true)
    setAssignmentError('')

    try {
      const updatedTicket = await assignTicket(
        token,
        ticket.id,
        technicianId,
      )

      onTicketUpdated(updatedTicket)
    } catch (error) {
      setAssignmentError(
        error instanceof Error
          ? error.message
          : 'Unable to assign technician.',
      )
    } finally {
      setAssigning(false)
    }
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

        {isAdmin && (
  <div className="ticket-details-section">
    <h3>Assign technician</h3>

    <select
      value={selectedTechnician}
      onChange={(event) =>
        setSelectedTechnician(event.target.value)
      }
      disabled={assigning}
    >
      <option value="">Unassigned</option>

      {technicians.map((technician) => (
        <option
          key={technician.id}
          value={String(technician.id)}
        >
          {technician.first_name || technician.last_name
            ? `${technician.first_name} ${technician.last_name}`.trim()
            : technician.username}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={handleAssignment}
      disabled={
        assigning ||
        selectedTechnician ===
          (ticket.assigned_to ? String(ticket.assigned_to) : '')
      }
    >
      {assigning ? 'Assigning...' : 'Save Assignment'}
    </button>

    {assignmentError && (
      <p className="ticket-details-error">{assignmentError}</p>
    )}
  </div>
)}

          <div className="ticket-details-section">
            <h3>Update ticket status</h3>

            <select
              value={newStatus}
              onChange={(event) =>
                setNewStatus(event.target.value as ApiTicket['status'])
              }
              disabled={updating}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === ticket.status}
            >
              {updating ? 'Updating...' : 'Save Status'}
            </button>

            {updateError && (
              <p className="ticket-details-error">{updateError}</p>
            )}
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
