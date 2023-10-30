const User = require('../models/userModel')
const Product = require('../models/productModel')
const Cart = require('../models/cartModel')
const Coupon = require('../models/couponModel')
const Order = require('../models/orderModel')
const asyncHandler = require('express-async-handler')
const { generatedToken } = require('../config/jwtToken')
const validateMongodbId = require('../utils/validateMongodbId')
const generatedRefreshToken = require('../config/refreshToken')
const sendEmail = require('./emailCtrl')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const uniqid = require('uniqid')

const createUser = asyncHandler(async (req, res) => {
	const email = req.body.email
	const findUser = await User.findOne({ email })
	if(!findUser) {
		// create a new user
		const newUser = await User.create(req.body)
		res.json(newUser)
	} else {
		throw new Error("User Already Exist")
	}
})

// Login a User
const loginUserCtrl = asyncHandler(async(req, res) => {
	const { email, password } = req.body
	// check if user exists or not
	const findUser = await User.findOne({ email })
	if(findUser && await findUser.isPasswordMatched(password)) {
		const refreshToken = await generatedRefreshToken(findUser?._id)
		const updateUser = await User.findByIdAndUpdate(findUser?.id, {
			refreshToken
		}, {
			new: true
		})
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: 72 * 60 * 60 * 1000
		})
		res.json({
			_id: findUser?._id,
			firstname: findUser?.firstname,
			lastname: findUser?.lastname,
			email: findUser?.email,
			mobile: findUser?.mobile,
			token: generatedToken(findUser?._id)
		})
	} else {
		throw new Error("Invalid Credentials")
	}
})

// Admin Login
const loginAdmin = asyncHandler(async(req, res) => {
	const { email, password } = req.body
	// check if user exists or not
	const findAdmin = await User.findOne({ email })
	if(findAdmin.role !== 'admin') throw new Error ("Not Authorized")
	if(findAdmin && await findAdmin.isPasswordMatched(password)) {
		const refreshToken = await generatedRefreshToken(findAdmin?._id)
		const updateUser = await User.findByIdAndUpdate(findAdmin?.id, {
			refreshToken
		}, {
			new: true
		})
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			maxAge: 72 * 60 * 60 * 1000
		})
		res.json({
			_id: findAdmin?._id,
			firstname: findAdmin?.firstname,
			lastname: findAdmin?.lastname,
			email: findAdmin?.email,
			mobile: findAdmin?.mobile,
			token: generatedToken(findAdmin?._id)
		})
	} else {
		throw new Error("Invalid Credentials")
	}
})

// Handle Refresh Token
const handleRefeshToken = asyncHandler(async (req, res) => {
	const cookie = req.cookies
	if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
	const refreshToken = cookie.refreshToken
	const user = await User.findOne({ refreshToken })
	if(!user) throw new Error("No Refresh Token present in db or not matched")
	jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
		if(err || user.id !== decoded.id) {
			throw new Error("There is something wrong with refresh token")
		}
		const accessToken = generatedToken(user?._id)
		res.json({ accessToken })
	})
})

// Logout Functionality
const logout = asyncHandler(async (req, res,) => {
	const cookie = req.cookies
	if(!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies")
	const refreshToken = cookie.refreshToken
	const user = await User.findOne({ refreshToken })
	if(!user) {
		res.clearCookie('refreshToken', {
			httpOnly: true,
			secure: true
		})
		return res.status(204).json({ message: "no user found" }) //forbidden
	}
	await User.findOneAndUpdate({refreshToken}, {
		refreshToken: ""
	})
	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: true
	})
	res.status(204) //forbidden
})

// Update a User
const updateaUser = asyncHandler(async (req, res) => {
	const { _id } = req.user
	validateMongodbId(_id)
	try {
		const updatedUser = await User.findByIdAndUpdate(_id, {
			firstname: req?.body?.firstname,
			lastname: req?.body?.lastname,
			email: req?.body?.email,
			mobile: req?.body?.mobile,
		},
		{ new: true })
		res.json(updatedUser)
	} catch (error) {
		throw new Error(error)
	}
})

// Save User Address
const saveAddress = asyncHandler(async (req, res, next) => {
	const { _id } = req.user
	validateMongodbId(_id)

	try {
		const updateUser = await User.findByIdAndUpdate(_id, {
			address: req?.body?.address
		}, { new: true })
		res.json(updatedUser)
	}
	catch (error) {
		throw new Error (error)
	}
})

// Get All Users
const getAllUser = asyncHandler(async (req, res) => {
	try {
		const getUser = await User.find()
		res.json(getUser)
	}
	catch(error) {
		throw new Error(error)
	}
})

// Get a Single User
const getaUser = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const getaUser = await User.findById(id)
		res.json({ getaUser })
	} catch(error) {
		throw new Error(error)
	}
})

// Delete a User
const deleteaUser = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const deleteaUser = await User.findByIdAndDelete(id)
		res.json({ deleteaUser })
	} catch (error) {
		throw new Error(error)
	}
})

const blockUser = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const block = await User.findByIdAndUpdate(id, {
			isBlocked: true
		}, {
			new: true
		})
		res.json({
			message: "User has been Blocked"
		})
	} catch (error) {
		throw new Error(error)
	}
})
const unBlockUser = asyncHandler(async (req, res) => {
	const { id } = req.params
	validateMongodbId(id)
	try {
		const unblock = await User.findByIdAndUpdate(id, {
			isBlocked: false
		}, {
			new: true
		})
		res.json({
			message: "User has been Unblocked"
		})
	} catch (error) {
		throw new Error(error)
	}
})

const updatePassword = asyncHandler(async (req, res) => {
	const { _id } = req.user
	const { password } = req.body
	validateMongodbId(_id)
	if(password) {
		const user = await User.findById(_id)
		user.password = password
		const updatePassword = await user.save()
		res.json(updatePassword)
	} else {
		res.json(user)
	}
})

const forgotPasswordToken = asyncHandler(async (req, res) => {
	const { email } = req.body
	const user = await User.findOne({ email })
	if(!user) throw new Error ("User Not Found with this email")
	try {
		const token = await user.createdPasswordResetToken()
		await user.save()
		const resetUrl = `Hi, Please follow this link to reset Your Password. This link is valid till 10 minutes from now <a href='http://localhost:5000/api/user/reset-password/${token}'>Click Here</a>`
		const data = {
			to: email,
			text: "Hey User",
			subject: "Forgot Password Link",
			html: resetUrl
		}
		sendEmail(data)
		res.json(token)
	}
	catch (error) {
		throw new Error (error)
	}
})

const resetPassword = asyncHandler(async (req, res) => {
	const { password } = req.body
	const { token } = req.params
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() }
	})
	if(!user) throw new Error ("Token expired, please try again later!")
	user.password = password
	user.passwordResetToken = undefined
	user.passwordResetExpires = undefined
	await user.save()
	res.json(user)
})

const getWishlist = asyncHandler(async (req, res) => {
	const { _id } = req.user
	validateMongodbId(_id)
	try {
		const findUser = await User.findById(_id).populate("wishlist")
		res.json(findUser)
	}
	catch (error) {
		throw new Error (error)
	}
})

const userCart = asyncHandler(async (req, res) => {
	const { cart } = req.body
	const { _id } = req.user
	validateMongodbId(_id)
	try {
		let products = []
		const user = await User.findById(_id)
		// check if user already have product in cart
		const alreadyExistCart = await Cart.findOne({ orderBy: user._id })
		if(alreadyExistCart) {
			alreadyExistCart.remove()
		}
		for(let i = 0; i < cart.length; i++) {
			let object = {}
			object.product = cart[i]._id
			object.count = cart[i].count
			object.color = cart[i].color
			let getPrice = await Product.findById(cart[i]._id).select("price").exec()
			object.price = getPrice.price
			products.push(object)
		}

		let cartTotal = 0
		for(let i = 0; i < products.length; i++) {
			cartTotal = cartTotal+products[i].price * products[i].count
		}
		let newCart = await new Cart({
			products,
			cartTotal,
			orderBy: user?._id
		}).save()
		res.json(newCart)
	}
	catch (error) {
		throw new Error (error)
	}
})

const getUserCart = asyncHandler(async (req, res) => {
	const { _id } = req.user
	validateMongodbId(_id)
	try {
		const cart = await Cart.findOne({ orderBy: _id }).populate("products.product")
		res.json(cart)
	}
	catch (error) {
		throw new Error (error)
	}
})

const emptyCart = asyncHandler(async (req, res) => {
	const { _id } = req.user
	validateMongodbId(_id)
	try {
		const user = await User.findOne({ _id })
		const cart = await Cart.findOneAndRemove({ orderBy: user._id })
		res.json(cart)
	}
	catch (error) {
		throw new Error (error)
	}
})

const applyCoupon = asyncHandler(async (req, res) => {
	const { coupon } = req.body
	const { _id } = req.user
	validateMongodbId(_id)
	const validCoupon = await Coupon.findOne({ name: coupon })
	if(validCoupon == null) {
		throw new Error ("Invalid Coupon")
	}
	const user = await User.findOne({ _id })
	let { products, cartTotal } = await Cart.findOne({ orderBy: user._id }).populate("products.product")
	let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount)/100).toFixed(2)
	await Cart.findOneAndUpdate({
		orderBy: user._id
	}, {
		totalAfterDiscount
	}, {
		new: true
	})
	res.json(totalAfterDiscount)
})

const createOrder = asyncHandler(async (req, res) => {
	const { cod, couponApplied } = req.body
	const { _id } = req.user
	validateMongodbId(_id)
	const user = await User.findById()
	try {
		if(!cod) throw new Error ("Create cash order failed")
		let userCart = await Cart.findOne({ orderBy: _id })
		let finalAmount = 0
		if(couponApplied && userCart.totalAfterDiscount) {
			finalAmount = userCart.totalAfterDiscount
		} else {
			finalAmount = userCart.cartTotal
		}

		let newOrder = await new Order({
			products: userCart.products,
			paymentIntent: {
				id: uniqid(),
				method: "COD",
				amount: finalAmount,
				status: "Cash On Delivery",
				created: Date.now(),
				currency: "usd"
			},
			orderBy: _id,
			orderStatus: "Cash On Delivery"
		}).save()
		console.log("ok")
		let update = userCart.products.map((item) => {
			return {
				updateOne: {
					filter: { _id: item.product._id },
					update: { $inc: {
						quantity: -item.count,
						sold: +item.count
					} }
				}
			}
		})
		const updated = await Product.bulkWrite(update, {})
		res.json({
			message: "success"
		})
	}
	catch (error) {
		throw new Error (error)
	}
})

const getOrders = asyncHandler(async (req, res) => {
	const { _id } = req.user
	validateMongodbId(_id)
	try {
		const userorders = await Order.findOne({ orderBy: _id }).populate("products.product").exec()
		res.json(userorders)
	}
	catch (error) {
		throw new Error (error)
	}
})

const updateOrderStatus = asyncHandler(async (req, res) => {
	const { status } = req.body
	const { id } = req.params
	validateMongodbId(id)
	try {
		const updateOrderStatus = await Order.findByIdAndUpdate(id, {
			orderStatus: status,
			paymentIntent: {
				status
			}
		}, { new: true })
		res.json(updateOrderStatus)
	}
	catch (error) {
		throw new Error (error)
	}
})

module.exports = {
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
}