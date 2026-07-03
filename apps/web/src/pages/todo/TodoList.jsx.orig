import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Circle, ChevronDown, ChevronUp, Calendar, AlertCircle, X, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [completedTodos, setCompletedTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [relatedJobNumber, setRelatedJobNumber] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('Service Request');
    const [status, setStatus] = useState('Pending');
    const [dueDate, setDueDate] = useState('');
    const [subtasks, setSubtasks] = useState([]);

    // Job Search State
    const [jobSearch, setJobSearch] = useState('');
    const [jobResults, setJobResults] = useState([]);
    const [isSearchingJobs, setIsSearchingJobs] = useState(false);
    const [showJobDropdown, setShowJobDropdown] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || '';
    const token = localStorage.getItem('token');

    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    const categories = ['Service Request', 'Billing and Payment', 'Administrative', 'Customer Communication', 'Sales and Leads', 'Other'];
    const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

    const getPriorityColor = (p) => {
        switch (p) {
            case 'Urgent': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            case 'High': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
            case 'Medium': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
            case 'Low': return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
            default: return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
        }
    };

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const activeRes = await fetch(`${apiUrl}/todos?status=Active`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!activeRes.ok) throw new Error('Failed to fetch active todos');
            const activeData = await activeRes.json();
            setTodos(activeData.data || []);

            const compRes = await fetch(`${apiUrl}/todos?status=Completed`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!compRes.ok) throw new Error('Failed to fetch completed todos');
            const compData = await compRes.json();
            setCompletedTodos(compData.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Error loading tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    // Job Search Debounce
    useEffect(() => {
        const fetchJobs = async () => {
            if (!jobSearch) {
                setJobResults([]);
                return;
            }
            setIsSearchingJobs(true);
            try {
                const res = await fetch(`${apiUrl}/jobs?limit=10&search=${encodeURIComponent(jobSearch)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setJobResults(data.data || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsSearchingJobs(false);
            }
        };

        const timeoutId = setTimeout(fetchJobs, 300);
        return () => clearTimeout(timeoutId);
    }, [jobSearch, token, apiUrl]);

    const handleSaveTodo = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error('Title is required');
            return;
        }

        const payload = {
            Title: title,
            Description: description,
            RelatedJobNumber: relatedJobNumber,
            Priority: priority,
            Category: category,
            Status: status,
            DueDate: dueDate || null,
            Subtasks: subtasks
        };

        try {
            const url = editingTodo ? `${apiUrl}/todos/${editingTodo.Id}` : `${apiUrl}/todos`;
            const method = editingTodo ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save task');

            toast.success(editingTodo ? 'Task updated' : 'Task created');
            closeModal();
            fetchTodos();
        } catch (error) {
            console.error(error);
            toast.error('Error saving task');
        }
    };

    const handleDeleteTodo = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`${apiUrl}/todos/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete task');
            toast.success('Task deleted');
            fetchTodos();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting task');
        }
    };

    const handleDeleteAllCompleted = async () => {
        if (!window.confirm('Are you sure you want to delete ALL completed tasks?')) return;
        try {
            const res = await fetch(`${apiUrl}/todos/completed`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to delete completed tasks');
            toast.success('Completed tasks deleted');
            fetchTodos();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting tasks');
        }
    };

    const handleStatusToggle = async (todo) => {
        const newStatus = todo.Status === 'Completed' ? 'Pending' : 'Completed';
        try {
            const payload = { ...todo, Status: newStatus };
            // Ensure we format date for update if present
            if (payload.DueDate) {
                payload.DueDate = format(new Date(payload.DueDate), "yyyy-MM-dd'T'HH:mm");
            }
            const res = await fetch(`${apiUrl}/todos/${todo.Id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed to update status');
            fetchTodos();
        } catch (error) {
            console.error(error);
            toast.error('Error updating status');
        }
    };

    const openModal = async (todo = null) => {
        setEditingTodo(todo);
        if (todo) {
            try {
                // Fetch full details to get Subtasks
                const res = await fetch(`${apiUrl}/todos/${todo.Id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                const fullTodo = data.data;

                setTitle(fullTodo.Title);
                setDescription(fullTodo.Description || '');
                setRelatedJobNumber(fullTodo.RelatedJobNumber || '');
                setPriority(fullTodo.Priority);
                setCategory(fullTodo.Category);
                setStatus(fullTodo.Status);
                if (fullTodo.DueDate) {
                    setDueDate(format(new Date(fullTodo.DueDate), "yyyy-MM-dd'T'HH:mm"));
                } else {
                    setDueDate('');
                }
                setSubtasks(fullTodo.Subtasks || []);
                setJobSearch(fullTodo.RelatedJobNumber || '');
            } catch (err) {
                console.error(err);
                toast.error("Failed to load task details");
                return;
            }
        } else {
            setTitle('');
            setDescription('');
            setRelatedJobNumber('');
            setPriority('Medium');
            setCategory('Other');
            setStatus('Pending');
            setDueDate('');
            setSubtasks([]);
            setJobSearch('');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTodo(null);
    };

    const addSubtask = () => {
        setSubtasks([...subtasks, { Title: '', IsCompleted: 0, DueDate: '', Status: 'Pending' }]);
    };

    const updateSubtask = (index, field, value) => {
        const newSubtasks = [...subtasks];
        newSubtasks[index][field] = value;
        setSubtasks(newSubtasks);
    };

    const removeSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const renderTodoCard = (todo) => (
        <div key={todo.Id} className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border \${todo.Status === 'Completed' ? 'border-slate-200 dark:border-slate-700 opacity-75' : 'border-slate-200 dark:border-slate-700'} flex gap-4 transition-all hover:shadow-md`}>
            <button onClick={() => handleStatusToggle(todo)} className="mt-1 flex-shrink-0 text-slate-400 hover:text-green-500 transition-colors">
                {todo.Status === 'Completed' ? <CheckCircle className="text-green-500" size={24} /> : <Circle size={24} />}
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-medium text-lg \${todo.Status === 'Completed' ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {todo.Title}
                    </h3>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={() => openModal(todo)} className="text-slate-400 hover:text-blue-500"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteTodo(todo.Id)} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                </div>
                {todo.Description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">{todo.Description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-md font-medium \${getPriorityColor(todo.Priority)}`}>
                        {todo.Priority}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {todo.Category}
                    </span>
                    {todo.RelatedJobNumber && (
                        <span className="text-xs px-2 py-1 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                            Job: {todo.RelatedJobNumber}
                        </span>
                    )}
                    {todo.DueDate && (
                        <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 \${new Date(todo.DueDate) < new Date() && todo.Status !== 'Completed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                            <Calendar size={12} />
                            {format(new Date(todo.DueDate), 'MMM d, yyyy')}
                        </span>
                    )}
                    {todo.TotalSubtasks > 0 && (
                        <span className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {todo.CompletedSubtasks}/{todo.TotalSubtasks} Subtasks
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">To Do List</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage tasks and service request follow-ups</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={18} />
                    Add Task
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="space-y-6">
                    {/* Active Todos */}
                    <div className="space-y-3">
                        {todos.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <AlertCircle size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No active tasks</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            todos.map(renderTodoCard)
                        )}
                    </div>

                    {/* Completed Section */}
                    {completedTodos.length > 0 && (
                        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <button
                                    onClick={() => setShowCompleted(!showCompleted)}
                                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    {showCompleted ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    Completed Tasks ({completedTodos.length})
                                </button>
                                {showCompleted && (
                                    <button
                                        onClick={handleDeleteAllCompleted}
                                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Delete All Completed
                                    </button>
                                )}
                            </div>

                            {showCompleted && (
                                <div className="space-y-3 opacity-80">
                                    {completedTodos.map(renderTodoCard)}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                {editingTodo ? 'Edit Task' : 'New Task'}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveTodo} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="What needs to be done?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Add details..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                                        <input
                                            type="datetime-local"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Related Service Request (Optional)</label>
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={jobSearch}
                                            onChange={(e) => {
                                                setJobSearch(e.target.value);
                                                setShowJobDropdown(true);
                                                if (e.target.value !== relatedJobNumber) {
                                                    setRelatedJobNumber(e.target.value); // Allow free text if not in dropdown
                                                }
                                            }}
                                            onFocus={() => setShowJobDropdown(true)}
                                            className="w-full pl-9 rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Search by Job # or Customer..."
                                        />
                                    </div>

                                    {showJobDropdown && (jobResults.length > 0 || isSearchingJobs) && (
                                        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                            {isSearchingJobs ? (
                                                <div className="p-3 text-sm text-slate-500 text-center">Searching...</div>
                                            ) : (
                                                jobResults.map(job => (
                                                    <div
                                                        key={job.JobNumber}
                                                        onClick={() => {
                                                            setRelatedJobNumber(job.JobNumber);
                                                            setJobSearch(job.JobNumber);
                                                            setShowJobDropdown(false);
                                                        }}
                                                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
                                                    >
                                                        <div className="font-medium text-slate-900 dark:text-white text-sm">{job.JobNumber}</div>
                                                        <div className="text-xs text-slate-500">{job.CustomerName || job.PrimaryContact} - {job.PumpModel || job.AssetType}</div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subtasks Section */}
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium text-slate-900 dark:text-white">Subtasks</h3>
                                    <button
                                        type="button"
                                        onClick={addSubtask}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add Subtask
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {subtasks.map((st, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={st.IsCompleted === 1 || st.IsCompleted === true || st.Status === 'Completed'}
                                                onChange={(e) => {
                                                    updateSubtask(index, 'IsCompleted', e.target.checked);
                                                    updateSubtask(index, 'Status', e.target.checked ? 'Completed' : 'Pending');
                                                }}
                                                className="mt-1 sm:mt-0 w-4 h-4 text-blue-600 rounded border-slate-300"
                                            />
                                            <input
                                                type="text"
                                                value={st.Title}
                                                onChange={(e) => updateSubtask(index, 'Title', e.target.value)}
                                                className="flex-1 min-w-0 bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:ring-0 px-0 py-1 text-sm dark:text-white"
                                                placeholder="Subtask title"
                                                required
                                            />
                                            <input
                                                type="datetime-local"
                                                value={st.DueDate ? format(new Date(st.DueDate), "yyyy-MM-dd'T'HH:mm") : ''}
                                                onChange={(e) => updateSubtask(index, 'DueDate', e.target.value)}
                                                className="w-full sm:w-auto text-xs rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSubtask(index)}
                                                className="text-slate-400 hover:text-red-500 p-1"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {subtasks.length === 0 && (
                                        <div className="text-sm text-slate-500 text-center py-2 italic">
                                            No subtasks added
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 shadow-sm"
                                >
                                    {editingTodo ? 'Update Task' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodoList;
