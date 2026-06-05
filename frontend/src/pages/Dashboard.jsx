import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from '../api/tasks';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Logo from '../components/Logo';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getTasks({
        page,
        limit: 6,
        status: statusFilter,
        search: search.trim() || undefined,
      });
      setTasks(data.data.tasks);
      setPagination(data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchTasks(1), 300);
    return () => clearTimeout(debounce);
  }, [fetchTasks]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdd = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
      } else {
        await createTask(formData);
      }
      setModalOpen(false);
      fetchTasks(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleTask(id);
      fetchTasks(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(id);
      const newPage = tasks.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      fetchTasks(newPage);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="page-container">
      <header className="dashboard-header">
        <Logo size="sm" className="dashboard-logo" />
        <div className="dashboard-user">
          <span className="user-greeting">Hey, {user?.name}!</span>
          <button className="neo-btn neo-btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <div className="toolbar-group flex-1">
            <label className="neo-label" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              className="neo-input"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="toolbar-group">
            <label className="neo-label" htmlFor="filter">
              Filter
            </label>
            <select
              id="filter"
              className="neo-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="toolbar-group">
            <label className="neo-label">&nbsp;</label>
            <button className="neo-btn neo-btn-primary" onClick={handleAdd}>
              + Add Task
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-spinner">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <Logo size="md" showText={false} className="empty-state-logo" />
            <h3>No tasks found</h3>
            <p>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Create your first task to get started!'}
            </p>
            {!search && statusFilter === 'all' && (
              <button className="neo-btn neo-btn-primary" style={{ marginTop: '1rem' }} onClick={handleAdd}>
                + Add Task
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="task-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="neo-btn neo-btn-ghost"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => fetchTasks(pagination.page - 1)}
                >
                  Prev
                </button>
                <span className="page-info">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
                </span>
                <button
                  className="neo-btn neo-btn-ghost"
                  disabled={!pagination.hasNextPage}
                  onClick={() => fetchTasks(pagination.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        task={editingTask}
        saving={saving}
      />
    </div>
  );
};

export default Dashboard;
