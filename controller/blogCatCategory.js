const BCategory = require('../models/blogCatModel')
const asyncHandler = require('express-async-handler')
const validateMongodbId = require('../utils/validateMongodbId')

const createCategory = asyncHandler(async (req, res) => {
	try {
		const newCategory = await BCategory.create(req.body)
		res.json(newCategory)
	}
	catch (error) {
		throw new Error (error)
	}
})

const updateCategory = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const updatedCategory = await BCategory.findByIdAndUpdate(id, req.body, { new : true })
		res.json(updatedCategory)
	}
	catch (error) {
		throw new Error (error)
	}
})

const deleteCategory = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const deletedCategory = await BCategory.findByIdAndDelete(id)
		res.json(deletedCategory)
	}
	catch (error) {
		throw new Error (error)
	}
})

const getCategory = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const getaCategory = await BCategory.findById(id)
		res.json(getaCategory)
	}
	catch (error) {
		throw new Error (error)
	}
})

const getAllCategory = asyncHandler(async (req, res) => {
	try {
		const getAllCategory = await BCategory.find()
		res.json(getAllCategory)
	}
	catch (error) {
		throw new Error (error)
	}
})

module.exports = {
	createCategory,
	updateCategory,
	deleteCategory,
	getCategory,
	getAllCategory
}