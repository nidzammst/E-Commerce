const express = require('express')
const router = express.Router()
const {
	createColor,
	updateColor,
	deleteColor,
	getColor,
	getAllColor
} = require('../controller/colorCtrl')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')

router.post('/', authMiddleware, isAdmin, createColor)
router.put('/:id', authMiddleware, isAdmin, updateColor)
router.delete('/:id', authMiddleware, isAdmin, deleteColor)
router.get('/:id', getColor)
router.get('/', getAllColor)

module.exports = router