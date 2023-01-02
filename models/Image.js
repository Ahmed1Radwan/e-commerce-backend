const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    size:{
        type: Number,
    },
	image: {
		type: Buffer,
        required: true,
	},
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true,
    }

},{ timestamps: true });

module.exports = mongoose.model('Image', ImageSchema);
