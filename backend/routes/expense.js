const express = require('express');
const router = express.Router();

const { createExpense, getExpenses, deleteExpense } = require('../controllers/expenseController');
// const { createExpenseValidator, expenseIdValidator } = require('../validators/expenseValidators');
const {createExpenseValidator, expenseIdValidator, paginationValidator} = require('../validators/expenseValidator')
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware');

// Every route below requires a valid JWT.
router.use(authMiddleware);
router.post('/', createExpenseValidator, validate, createExpense);
// router.get('/', getExpenses);
router.get('/', paginationValidator, validate, getExpenses);
router.delete('/:id', expenseIdValidator, validate, deleteExpense);

module.exports = router;