const express = require('express')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')
const { blogImgResize, uploadPhoto } = require('../middlewares/uploadImages')
const router = express.Router()
const {
	createBlog,
	updateBlog,
	getBlog,
	getAllBlogs,
	deleteBlog,
	likeBlog,
	uploadImages
} = require('../controller/blogCtrl')

router.post('/', authMiddleware, isAdmin, createBlog)
router.put('/likes', authMiddleware, likeBlog)
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 2), blogImgResize, uploadImages)
router.put('/:id', authMiddleware, isAdmin, updateBlog)
router.get('/:id', getBlog)
router.get('/', getAllBlogs)
router.delete('/:id', authMiddleware, isAdmin, deleteBlog)

module.exports = router