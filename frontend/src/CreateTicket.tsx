
import { useState, type FormEvent } from 'react'
import {
  createTicket,
  type ApiTicket,
  type CreateTicketPayload,
} from './services/api'
import './CreateTicket.css'

type CreateTicketProps = {
  token: string
  onClose: () => void
  onCreated: (ticket: ApiTicket) => void
}

function CreateTicket({
  token,
  onClose,
  onCreated,
}: CreateTicketProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] =
    useState<CreateTicketPayload['category']>('OTHER')
  const [priority, setPriority] =
    useState<CreateTicketPayload['priority']>('MEDIUM')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const ticket = await createTicket(token, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      })

      onCreated(ticket)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create ticket.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ticket-modal-overlay" onClick={onClose}>
      <div
        className="ticket-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ticket-modal-header">
          <div>
            <h2>Create a ticket</h2>
            <p>Submit an IT support request.</p>
          </div>

          <button
            type="button"
            className="ticket-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="ticket-form-group">
            <label htmlFor="ticket-title">Ticket title</label>
            <input
              id="ticket-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Laptop not connecting to Wi-Fi"
              maxLength={200}
              required
            />
          </div>

          <div className="ticket-form-group">
            <label htmlFor="ticket-description">Description</label>
            <textarea
              id="ticket-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue and any steps already tried..."
              rows={5}
              required
            />
          </div>

          <div className="ticket-form-row">
            <div className="ticket-form-group">
              <label htmlFor="ticket-category">Category</label>
              <select
                id="ticket-category"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as CreateTicketPayload['category'],
                  )
                }
              >
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="NETWORK">Network</option>
                <option value="ACCESS">Account & Access</option>
                <option value="EMAIL">Email</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="ticket-form-group">
              <label htmlFor="ticket-priority">Priority</label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(
                    event.target.value as CreateTicketPayload['priority'],
                  )
                }
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="ticket-form-error">
              {error}
            </div>
          )}

          <div className="ticket-form-actions">
            <button
              type="button"
              className="ticket-cancel-button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="ticket-submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTicket
