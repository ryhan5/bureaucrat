'use client';
import { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'other',
    notifications: {
      email: true,
      web: true
    }
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState({
    status: 'all',
    category: 'all',
    showCompleted: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Subscribe to push notifications here if needed
        }
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          dueDate: selectedDate,
          status: 'pending'
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchTasks();
        setNewTask({
          title: '',
          description: '',
          priority: 'medium',
          category: 'other',
          notifications: {
            email: true,
            web: true
          }
        });
      }
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: taskId,
          status
        }),
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: taskId }),
      });

      if (response.ok) {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter.status !== 'all' && task.status !== filter.status) return false;
    if (filter.category !== 'all' && task.category !== filter.category) return false;
    if (!filter.showCompleted && task.status === 'completed') return false;
    return true;
  }).sort((a, b) => {
    // Sort by priority first
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Then by due date
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-rose-700 bg-rose-50 border border-rose-200';
      case 'high': return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'medium': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'low': return 'text-blue-700 bg-blue-50 border border-blue-200';
      default: return 'text-slate-700 bg-slate-50 border border-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'in-progress': return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'pending': return 'text-blue-700 bg-blue-50 border border-blue-200';
      default: return 'text-slate-700 bg-slate-50 border border-slate-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'meeting': return 'text-purple-700 bg-purple-50 border border-purple-200';
      case 'document': return 'text-cyan-700 bg-cyan-50 border border-cyan-200';
      case 'event': return 'text-pink-700 bg-pink-50 border border-pink-200';
      case 'personal': return 'text-indigo-700 bg-indigo-50 border border-indigo-200';
      default: return 'text-slate-700 bg-slate-50 border border-slate-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'meeting': return '👥';
      case 'document': return '📄';
      case 'event': return '📅';
      case 'personal': return '👤';
      default: return '📌';
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Task Management</h1>
        <p className="text-slate-600 mb-8">Organize and track your bureaucratic tasks efficiently</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 mb-6">
              <form onSubmit={addTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 placeholder-slate-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    placeholder="Enter task description..."
                    className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 placeholder-slate-400 resize-none h-24 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-2">
                      Category
                    </label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full px-4 py-3 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 transition-colors"
                    >
                      <option value="meeting">Meeting</option>
                      <option value="document">Document</option>
                      <option value="event">Event</option>
                      <option value="personal">Personal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-blue-800 mb-2">
                      Due Date
                    </label>
                    <div className="px-4 py-3 bg-white border-2 border-blue-100 rounded-xl text-slate-800">
                      {formatDate(selectedDate)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-800 mb-2">
                      Notifications
                    </label>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={newTask.notifications.email}
                          onChange={(e) => setNewTask({
                            ...newTask,
                            notifications: { ...newTask.notifications, email: e.target.checked }
                          })}
                          className="rounded text-blue-500 focus:ring-blue-400"
                        />
                        <span className="text-sm text-slate-700">Email</span>
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={newTask.notifications.web}
                          onChange={(e) => setNewTask({
                            ...newTask,
                            notifications: { ...newTask.notifications, web: e.target.checked }
                          })}
                          className="rounded text-blue-500 focus:ring-blue-400"
                        />
                        <span className="text-sm text-slate-700">Web</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding Task...' : 'Add Task'}
                </button>
              </form>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <select
                  value={filter.status}
                  onChange={(e) => setFilter({...filter, status: e.target.value})}
                  className="px-4 py-2 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 text-sm transition-colors"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={filter.category}
                  onChange={(e) => setFilter({...filter, category: e.target.value})}
                  className="px-4 py-2 bg-white border-2 border-blue-100 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 text-sm transition-colors"
                >
                  <option value="all">All Categories</option>
                  <option value="meeting">Meetings</option>
                  <option value="document">Documents</option>
                  <option value="event">Events</option>
                  <option value="personal">Personal</option>
                  <option value="other">Other</option>
                </select>

                <label className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-blue-100 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={filter.showCompleted}
                    onChange={(e) => setFilter({...filter, showCompleted: e.target.checked})}
                    className="rounded text-blue-500 focus:ring-blue-400"
                  />
                  <span className="text-sm text-slate-700">Show Completed</span>
                </label>
              </div>

              <div className="space-y-4">
                {filteredTasks.map(task => (
                  <div
                    key={task._id}
                    className="bg-white rounded-xl shadow-md border border-slate-200 p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getCategoryColor(task.category)}`}>
                            {getCategoryIcon(task.category)} {task.category.charAt(0).toUpperCase() + task.category.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">{task.title}</h3>
                        <p className="text-slate-600 mb-2">{task.description}</p>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className={`px-3 py-1 rounded-lg font-medium ${getStatusColor(task.status)}`}>
                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-blue-700 bg-blue-50 border border-blue-200">
                            Due: {formatDate(task.dueDate)}
                          </span>
                          {task.notifications.web && (
                            <span className="px-3 py-1 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200">
                              Web Notifications
                            </span>
                          )}
                          {task.notifications.email && (
                            <span className="px-3 py-1 rounded-lg text-purple-700 bg-purple-50 border border-purple-200">
                              Email Notifications
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                          className="px-3 py-1 bg-white border-2 border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-slate-800 text-sm transition-colors"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">Calendar</h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full border-2 border-blue-100 rounded-xl shadow-md"
              />
              <style jsx global>{`
                .react-calendar {
                  border: none;
                  font-family: inherit;
                  background: transparent;
                }
                .react-calendar__tile {
                  padding: 0.75rem;
                  border-radius: 0.5rem;
                  font-size: 1rem;
                  font-weight: 500;
                  color: #1e40af;
                }
                .react-calendar__month-view__weekdays {
                  font-weight: 600;
                  font-size: 0.875rem;
                  color: #3b82f6;
                  text-transform: uppercase;
                  margin-bottom: 0.5rem;
                }
                .react-calendar__month-view__days__day--weekend {
                  color: #ef4444;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                  color: #94a3b8;
                }
                .react-calendar__tile--now {
                  background: #dbeafe;
                  border-radius: 0.5rem;
                  font-weight: 600;
                }
                .react-calendar__tile--active {
                  background: #2563eb !important;
                  border-radius: 0.5rem;
                  color: white !important;
                  font-weight: 600;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                  background-color: #bfdbfe;
                  border-radius: 0.5rem;
                  color: #1e40af;
                }
                .react-calendar__navigation {
                  margin-bottom: 1rem;
                }
                .react-calendar__navigation button {
                  font-size: 1rem;
                  font-weight: 600;
                  color: #1e40af;
                  padding: 0.5rem;
                  border-radius: 0.5rem;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                  background-color: #dbeafe;
                }
                .react-calendar__navigation button[disabled] {
                  background-color: transparent;
                  color: #94a3b8;
                }
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}