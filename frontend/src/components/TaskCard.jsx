const TaskCard = ({ task, onEdit, onDelete, onToggle }) => {
  const isCompleted = task.status === 'completed';

  return (
    <div className={`task-card ${isCompleted ? 'completed' : ''}`}>
      <div className="task-header">
        <h3 className={`task-title ${isCompleted ? 'done' : ''}`}>{task.title}</h3>
        <span className={`neo-badge ${isCompleted ? 'neo-badge-completed' : 'neo-badge-pending'}`}>
          {task.status}
        </span>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-actions">
        <button className="neo-btn neo-btn-success" onClick={() => onToggle(task._id)}>
          {isCompleted ? 'Undo' : 'Done'}
        </button>
        <button className="neo-btn neo-btn-secondary" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="neo-btn neo-btn-danger" onClick={() => onDelete(task._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
