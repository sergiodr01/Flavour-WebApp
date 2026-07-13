const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const IngredientController = require('../controllers/IngredientController');

const router = express.Router();

router.get('/', authMiddleware, IngredientController.listAll);

module.exports = router;
