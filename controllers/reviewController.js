const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermission } = require('../utils');
const customPaginationLabels = require('../utils/custom-pagination-label');


const createReview = async(req, res) => {
    const { product: productId } = req.body;
    const isValidProduct = await Product.findOne({ _id: productId });
    if(!isValidProduct){
        throw new CustomError.NotFoundError(`No product with id: ${productId}`);
    }

    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
    });

    if(alreadySubmitted){
        throw new CustomError.BadRequestError('Already Submitted review for this product');
    }
    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({ review });
}

const getAllReviews = async(req, res) => {
    let q_offset = req.query.offset;
    let l_limit = req.query.limit;

    let reviews;
    if(!q_offset && !l_limit){
        reviews = await Review.find({}).populate({
            path: 'product',
            select: 'name company price',
        });
    }else{
        reviews = await Review.paginate({}, { offset: q_offset, limit: l_limit, customLabels: customPaginationLabels });
    }

    res.status(StatusCodes.OK).json({ reviews });
}

const getSingleReview = async(req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({ _id: reviewId });
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }
    res.status(StatusCodes.OK).json({ review });
}

const updateReview = async(req, res) => {
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const review = await Review.findOne({ _id: reviewId });
    if(!review){
        throw new CustomError.NotFoundError(`No Review with id: ${reviewId}`);
    }
    checkPermission(req.user, review.user);
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    res.status(StatusCodes.OK).json({ review });
}

const deleteReview = async(req, res) => {
    const { id: reviewId } = req.params;
    const review = await Review.findOne({ _id: reviewId });
    if(!review){
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }
    checkPermission(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({ msg: 'Success Remove Review'});
}

const getSingleProductReviews = async(req, res) => {
    let q_offset = req.query.offset;
    let l_limit = req.query.limit;
    const { id: productId } = req.params;
    let reviews;
    if(!q_offset && !l_limit){
        reviews = await Review.find({ product: productId });
    }else{
        reviews = await Review.paginate({ product: productId }, { offset: q_offset, limit: l_limit, customLabels: customPaginationLabels });
    }
    res.status(StatusCodes.OK).json({ reviews });
}
module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
}