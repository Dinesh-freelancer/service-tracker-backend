const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(authorize('Admin', 'Owner'));

router.get('/', todoController.getAllTodos);
router.get('/:id', todoController.getTodoById);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/completed', todoController.deleteCompletedTodos);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
