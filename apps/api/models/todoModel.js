const pool = require('../db');

// Create a new Todo
async function createTodo(data) {
    const { Title, Description, RelatedJobNumber, Priority, Category, Status, DueDate } = data;

    // Explicitly handle empty string or undefined for DueDate
    const parsedDueDate = DueDate && DueDate.trim() !== '' ? DueDate : null;

    const [result] = await pool.query(
        `INSERT INTO todos (Title, Description, RelatedJobNumber, Priority, Category, Status, DueDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [Title, Description || null, RelatedJobNumber || null, Priority || 'Medium', Category || 'Other', Status || 'Pending', parsedDueDate]
    );
    return result.insertId;
}

// Create a Subtask
async function createSubtask(todoId, subtask) {
    const { Title, IsCompleted, DueDate, Status } = subtask;

    const parsedDueDate = DueDate && DueDate.trim() !== '' ? DueDate : null;

    const [result] = await pool.query(
        `INSERT INTO subtasks (TodoId, Title, IsCompleted, DueDate, Status)
         VALUES (?, ?, ?, ?, ?)`,
        [todoId, Title, IsCompleted ? 1 : 0, parsedDueDate, Status || 'Pending']
    );
    return result.insertId;
}

// Get all Todos (can be filtered by status)
async function getAllTodos(filters = {}) {
    let query = `
        SELECT t.*,
               (SELECT COUNT(*) FROM subtasks s WHERE s.TodoId = t.Id) as TotalSubtasks,
               (SELECT COUNT(*) FROM subtasks s WHERE s.TodoId = t.Id AND s.IsCompleted = 1) as CompletedSubtasks
        FROM todos t
        WHERE 1=1
    `;
    let params = [];

    if (filters.status) {
        if (filters.status === 'Completed') {
            query += ` AND t.Status = 'Completed'`;
        } else {
            query += ` AND t.Status != 'Completed'`;
        }
    }

    query += ` ORDER BY t.Priority DESC, t.DueDate ASC, t.CreatedAt DESC`;

    const [todos] = await pool.query(query, params);

    if (todos.length === 0) return [];

    const todoIds = todos.map(t => t.Id);

    // Fetch all subtasks for these todos
    const [subtasks] = await pool.query(
        `SELECT * FROM subtasks WHERE TodoId IN (?)`,
        [todoIds]
    );

    // Group subtasks by TodoId
    todos.forEach(todo => {
        todo.Subtasks = subtasks.filter(s => s.TodoId === todo.Id);
    });

    return todos;
}

// Get a single Todo by ID
async function getTodoById(id) {
    const [todos] = await pool.query(`SELECT * FROM todos WHERE Id = ?`, [id]);
    if (todos.length === 0) return null;

    const todo = todos[0];
    const [subtasks] = await pool.query(`SELECT * FROM subtasks WHERE TodoId = ?`, [id]);
    todo.Subtasks = subtasks;

    return todo;
}

// Update a Todo
async function updateTodo(id, data) {
    const { Title, Description, RelatedJobNumber, Priority, Category, Status, DueDate } = data;

    const parsedDueDate = DueDate && DueDate.trim() !== '' ? DueDate : null;

    await pool.query(
        `UPDATE todos
         SET Title = ?, Description = ?, RelatedJobNumber = ?, Priority = ?, Category = ?, Status = ?, DueDate = ?
         WHERE Id = ?`,
        [Title, Description || null, RelatedJobNumber || null, Priority, Category, Status, parsedDueDate, id]
    );
}

// Delete a Todo
async function deleteTodo(id) {
    await pool.query(`DELETE FROM todos WHERE Id = ?`, [id]);
}

// Delete all completed Todos
async function deleteCompletedTodos() {
    await pool.query(`DELETE FROM todos WHERE Status = 'Completed'`);
}

// Update Subtask
async function updateSubtask(id, data) {
    const { Title, IsCompleted, DueDate, Status } = data;
    const parsedDueDate = DueDate && DueDate.trim() !== '' ? DueDate : null;

    await pool.query(
        `UPDATE subtasks
         SET Title = ?, IsCompleted = ?, DueDate = ?, Status = ?
         WHERE Id = ?`,
        [Title, IsCompleted ? 1 : 0, parsedDueDate, Status || 'Pending', id]
    );
}

// Delete Subtask
async function deleteSubtask(id) {
    await pool.query(`DELETE FROM subtasks WHERE Id = ?`, [id]);
}

module.exports = {
    createTodo,
    createSubtask,
    getAllTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
    deleteCompletedTodos,
    updateSubtask,
    deleteSubtask
};
