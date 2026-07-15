const todoModel = require('../models/todoModel');
const { AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER } = require('../utils/constants');

// Check Role
function canAccessTodos(role) {
    return role === AUTH_ROLE_ADMIN || role === AUTH_ROLE_OWNER;
}

exports.getAllTodos = async (req, res) => {
    try {
        if (!canAccessTodos(req.user.Role)) {
            return res.status(403).json({ error: 'Unauthorized access to Todos' });
        }
        const { status } = req.query; // 'Completed' or 'Active'
        const todos = await todoModel.getAllTodos({ status });
        res.json({ data: todos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
};

exports.getTodoById = async (req, res) => {
    try {
        if (!canAccessTodos(req.user.Role)) {
            return res.status(403).json({ error: 'Unauthorized access to Todos' });
        }
        const todo = await todoModel.getTodoById(req.params.id);
        if (!todo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json({ data: todo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch todo' });
    }
};

exports.createTodo = async (req, res) => {
    try {
        if (!canAccessTodos(req.user.Role)) {
            return res.status(403).json({ error: 'Unauthorized access to Todos' });
        }
        const { Subtasks, ...todoData } = req.body;

        if (!todoData.Title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const todoId = await todoModel.createTodo(todoData);

        if (Subtasks && Array.isArray(Subtasks)) {
            for (const subtask of Subtasks) {
                if (subtask.Title) {
                    await todoModel.createSubtask(todoId, subtask);
                }
            }
        }

        res.status(201).json({ message: 'Todo created successfully', id: todoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
};

exports.updateTodo = async (req, res) => {
    try {
        if (!canAccessTodos(req.user.Role)) {
            return res.status(403).json({ error: 'Unauthorized access to Todos' });
        }
        const todoId = req.params.id;
        const { Subtasks, ...todoData } = req.body;

        if (!todoData.Title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const existingTodo = await todoModel.getTodoById(todoId);
        if (!existingTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        await todoModel.updateTodo(todoId, todoData);

        // Handle Subtasks Sync
        if (Subtasks && Array.isArray(Subtasks)) {
            const existingSubtasks = existingTodo.Subtasks || [];
            const existingIds = existingSubtasks.map(s => s.Id);

            for (const subtask of Subtasks) {
                if (subtask.Id && existingIds.includes(subtask.Id)) {
                    // Update existing
                    await todoModel.updateSubtask(subtask.Id, subtask);
                } else if (subtask.Title) {
                    // Create new
                    await todoModel.createSubtask(todoId, subtask);
                }
            }

            // Delete removed subtasks
            const updatedIds = Subtasks.filter(s => s.Id).map(s => s.Id);
            const toDelete = existingIds.filter(id => !updatedIds.includes(id));
            for (const id of toDelete) {
                await todoModel.deleteSubtask(id);
            }
        }

        res.json({ message: 'Todo updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
};

exports.deleteTodo = async (req, res) => {
    try {
        if (!canAccessTodos(req.user.Role)) {
            return res.status(403).json({ error: 'Unauthorized access to Todos' });
        }
        await todoModel.deleteTodo(req.params.id);
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
};

exports.deleteCompletedTodos = async (req, res) => {
    try {
        if (!canAccessTodos(req.user.Role)) {
            return res.status(403).json({ error: 'Unauthorized access to Todos' });
        }
        await todoModel.deleteCompletedTodos();
        res.json({ message: 'Completed Todos deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete completed todos' });
    }
};
