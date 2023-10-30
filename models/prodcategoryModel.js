const mongoose = require('mongoose')

var categorySchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
}, {
	timestamps: true
})

module.exports = mongoose.model("PCategory", categorySchema)