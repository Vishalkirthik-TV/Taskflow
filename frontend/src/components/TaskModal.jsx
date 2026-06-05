import { useState, useEffect } from 'react';
import { validateTaskTitle, validateTaskDescription } from '../utils/validation';

const TaskModal = ({ isOpen, onClose, onSave, task, saving }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setStatus(task?.status || 'pending');
      setErrors({});
    }
  }, [isOpen, task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const titleError = validateTaskTitle(title);
    const descError = validateTaskDescription(description);
    if (titleError) newErrors.title = titleError;
    if (descError) newErrors.description = descError;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    onSave({ title: title.trim(), description: description.trim(), status });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="neo-label" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              className={`neo-input ${errors.title ? 'error' : ''}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={100}
            />
            {errors.title && <p className="neo-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="neo-label" htmlFor="task-desc">
              Description
            </label>
            <textarea
              id="task-desc"
              className={`neo-input ${errors.description ? 'error' : ''}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details (optional)"
              rows={4}
              maxLength={500}
              style={{ resize: 'vertical' }}
            />
            {errors.description && <p className="neo-error">{errors.description}</p>}
          </div>

          <div className="form-group">
            <label className="neo-label" htmlFor="task-status">
              Status
            </label>
            <select
              id="task-status"
              className="neo-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="neo-btn neo-btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="neo-btn neo-btn-primary" disabled={saving}>
              {saving ? 'Saving...' : task ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
