const Blog = require("../models/blogModel")
const User = require("../models/userModel")
const asyncHandler = require('express-async-handler')
const validateMongodbId = require('../utils/validateMongodbId')
const cloudinaryUploadImg = require('../utils/cloudinary')
const fs = require('fs')

const createBlog = asyncHandler(async (req, res) => {
	try {
		const newBlog = await Blog.create(req.body)
		res.json(newBlog)
	}
	catch (error) {
		throw new Error (error)
	}
})

const updateBlog = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)

	try {
		const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
			new: true
		})
		res.json(updateBlog)
	}
	catch (error) {
		throw new Error (error)
	}
})

const getBlog = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)

	try {
		const blog = await Blog.findByIdAndUpdate(id, {
			$inc: { numViews: 1 },
		},
		{ new: true })
		.populate("likes")
		.populate("dislikes")
		res.json(blog)
	}
	catch (error) {
		throw new Error (error)
	}
})

const getAllBlogs = asyncHandler(async (req, res) => {
	try {
		const getBlogs = await Blog.find()
		res.json(getBlogs)
	}
	catch (error) {
		throw new Error (error)
	}
})

const deleteBlog = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)

	try {
		const deleteBlog = await Blog.findByIdAndDelete(id)
		res.json(deleteBlog)
	}
	catch (error) {
		throw new Error (error)
	}
})

const likeBlog = asyncHandler(async (req, res) => {
	const { blogId } = req.body
	validateMongodbId(blogId)
	const blog = await Blog.findById(blogId)
	const loginUsrId = req?.user?._id

	const isLiked = blog?.isLiked
	const alreadyDisliked = blog?.dislikes?.find((userId) => userId?.toString()) === loginUsrId?.toString()
	if(alreadyDisliked) {
		const blog = await Blog.findByIdAndUpdate(blogId, {
			$pull: {dislikes: loginUsrId},
			isDisliked: false
		}, {
			new: true
		})
		res.json(blog)
	} if(isLiked) {
		const blog = await Blog.findByIdAndUpdate(blogId, {
			$pull: { likes: loginUsrId },
			isLiked: false
		}, {
			new: true
		})
		res.json(blog)
	} else {
		const blog = await Blog.findByIdAndUpdate(blogId, {
			$push: { likes: loginUsrId },
			isLiked: true
		}, {
			new: true
		})
		res.json(blog)
	}
	res.end()
})

const uploadImages = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const uploader = (path) => cloudinaryUploadImg(path, 'images')
		const urls = []
		const files = req.files
		for(const file of files) {
			const { path } = file
			console.log("path: ", path)
			const newpath = await uploader(path)
			console.log("newpath: ", newpath)
			urls.push(newpath)
			fs.unlinkSync(path)
		}
		const findBlog = await Blog.findByIdAndUpdate(id, {
			images: urls.map(file => {
				return file
			})
		}, { new: true })
		res.json(findBlog)
	}
	catch (error) {
		throw new Error (error)
	}
})

module.exports = {
	createBlog,
	updateBlog,
	getBlog,
	getAllBlogs,
	deleteBlog,
	likeBlog,
	uploadImages
}