const mongoose = require('mongoose')

var colorSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: false
	}
})

module.exports = mongoose.model("Color", colorSchema)