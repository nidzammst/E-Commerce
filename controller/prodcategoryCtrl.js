const PCategory = require('../models/prodcategoryModel')
const asyncHandler = require('express-async-handler')
const validateMongodbId = require('../utils/validateMongodbId')

const createCategory = asyncHandler(async (req, res) => {
	try {
		const newCategory = await PCategory.create(req.body)
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
		const updatedCategory = await PCategory.findByIdAndUpdate(id, req.body, { new : true })
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
		const deletedCategory = await PCategory.findByIdAndDelete(id)
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
		const getaCategory = await PCategory.findById(id)
		res.json(getaCategory)
	}
	catch (error) {
		throw new Error (error)
	}
})

const getAllCategory = asyncHandler(async (req, res) => {
	try {
		const getAllCategory = await PCategory.find()
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