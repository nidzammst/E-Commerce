const express = require('express')
const router = express.Router()
const {
	createProduct,
	getaProduct,
	getAllProducts,
	updateProduct,
	deleteProduct,
	addToWishlist,
	rating,
	uploadImages,
	deleteImages
} = require('../controller/productCtrl')

const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware')
const { uploadPhoto, productImgResize } = require('../middlewares/uploadImages')

router.post('/create-product', authMiddleware, isAdmin, createProduct)
router.put('/upload', authMiddleware, isAdmin, uploadPhoto.array('images', 10), productImgResize, uploadImages)
router.get('/:id', getaProduct)
router.put('/wishlist', authMiddleware, addToWishlist)
router.put('/rating', authMiddleware, rating)
router.put('/:id', authMiddleware, isAdmin, updateProduct)
router.delete('/:id',  authMiddleware, isAdmin, deleteProduct)
router.delete('/delete-image/:id',  authMiddleware, isAdmin, deleteImages)
router.get('/', getAllProducts)

module.exports = router