const Product = require('../models/Product');
const Image= require('../models/Image');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const customPaginationLabels = require('../utils/custom-pagination-label');


const createProduct = async(req, res) => {
    req.body.user = req.user.userId;
    const product = await Product.create(req.body);
    res.status(StatusCodes.CREATED).json({ product });
}

const getAllProducts = async(req, res) => {
    let q_offset = req.query.offset;
    let l_limit = req.query.limit;
    let products;
    if(!q_offset && !l_limit){
        products = await Product.find({});
    }else{
        products = await Product.paginate({}, { offset: q_offset, limit: l_limit, customLabels: customPaginationLabels });
    }
    res.status(StatusCodes.OK).json({
        products
    });
}

const getSingleProduct = async(req, res) => {
    
    const product = await Product.findOne({ _id: req.params.id }).populate('reviews');
    if(!product){
        throw new CustomError.NotFoundError(`No product with id: ${req.params.id}`);
    }
    res.status(StatusCodes.OK).json({ product });
}


const updateProduct = async(req, res) => {
    const product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
    });
    if(!product){
        throw new CustomError.NotFoundError(`Not found product with id: ${req.params.id}`);
    }
    res.status(StatusCodes.OK).json({ product });
}

const deleteProduct = async(req, res) => {
    const product = await Product.findOne({ _id: req.params.id });
    if(!product){
        throw new CustomError.NotFoundError(`Product with id: ${req.params.id} Not Found`);
    }
    await product.remove();
    res.status(StatusCodes.OK).json({ msg: 'Product deleted Successfully '});
}

const uploadImage = async(req, res) => {
    //console.log(req.files);
    if(!req.params.id){
        throw new CustomError.BadRequestError('Product Id Not Entered');
    }
    if(req.files.file == null){
            throw new CustomError.BadRequestError('No Files to Upload');
    }
    req.files.file.forEach( async(file) => {
        const image = new Image({
            name: file.name,
            mimetype: file.mimetype,
            size: file.size,
            image: file.data,
            product: req.params.id
        });
        
        await image.save();
     });
    
    res.status(StatusCodes.OK).json({
        msg: 'Files has been uploaded',
    });

}
const getProductImages = async(req, res) => {
    if(!req.params.id){
        throw new CustomError.BadRequestError('Product Id Not Entered');
    }
    const images = await Image.find({ product: req.params.id });
    if(!images){
        throw new CustomError.BadRequestError(`Not found images for product with id: ${req.params.id}`);
    }
    res.status(StatusCodes.OK).json({ images: images, count: images.length });
}  

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    getProductImages,
}