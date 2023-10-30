const mongoose = require('mongoose')

var blogSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true
	},
	numViews: {
		type: Number,
		default: 0
	},
	isLiked: {
		type: Boolean,
		default:false
	},
	isDisliked: {
		type: Boolean,
		default: false
	},
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
	dislikes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
	image: {
		type: String,
		default: "https://www.tots100.co.uk/wp-content/uploads/2018/02/Is-Your-Blog-Due-for-an-Update-1.jpg"
	},
	author: {
		type: String,
		default: "Admin"
	},
	images: []
}, {
	toJSON: {
		virtuals: true
	},
	toObject: {
		virtuals: true
	},
	timestamps: true
})

module.exports = mongoose.model("Blog", blogSchema)