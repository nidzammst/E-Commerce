const express = require('express')
const router = express.Router()
const {
	createUser,
	loginUserCtrl,
	loginAdmin,
	updateaUser,
	getAllUser,
	getaUser,
	deleteaUser,
	blockUser,
	unBlockUser,
	handleRefeshToken,
	logout,
	updatePassword,
	forgotPasswordToken,
	resetPassword,
	getWishlist,
	saveAddress,
	userCart,
	getUserCart,
	emptyCart,
	applyCoupon,
	createOrder,
	getOrders,
	updateOrderStatus
} = require('../controller/userCtrl')
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware')

router.post('/register', createUser)
router.post('/login', loginUserCtrl)
router.post('/admin-login', loginAdmin)
router.post('/forgot-password-token', forgotPasswordToken)
router.post('/cart', authMiddleware, userCart)
router.post('/cart/cash-order', authMiddleware, createOrder)
router.put('/reset-password/:token', resetPassword)
router.put('/password', authMiddleware, updatePassword)
router.put('/:id', authMiddleware, updateaUser)
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser)
router.put('/unblock-user/:id', authMiddleware, isAdmin, unBlockUser)
router.put('/order/update-order/:id', authMiddleware, isAdmin, updateOrderStatus)
router.put('/edit-user', authMiddleware, saveAddress)
router.get('/all-users', getAllUser)
router.get('/:id', getaUser)
router.get('/refresh', handleRefeshToken)
router.get('/logout', logout)
router.get('/edit-user', authMiddleware, isAdmin, getaUser)
router.get('/wishlist', authMiddleware, getWishlist)
router.get('/get-orders', authMiddleware, getOrders)
router.get('/cart', authMiddleware, getUserCart)
router.get('/cart/applycoupon', authMiddleware, applyCoupon)
router.delete('/empty-cart', authMiddleware, emptyCart)
router.delete('/:id', deleteaUser)

module.exports = router