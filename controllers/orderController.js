const Order = require('../models/Order');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermission } = require('../utils');
const customPaginationLabels = require('../utils/custom-pagination-label');


const fakeStripeAPI = async({ amount, currency }) => {
    let client_secret = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!+-';
    var charactersLength = characters.length;
    for ( var i = 0; i < charactersLength; i++ ) {
        client_secret += characters.charAt(Math.floor( Math.random() * charactersLength) );
    }
    
    return {client_secret, amount};
}

const createOrder = async(req, res) => {
    const { items: cartItems, tax, shippingFee } = req.body;
    if(!cartItems || cartItems.length < 1){
        throw new CustomError.BadRequestError('No Items in the Cart');
    }
    if(!tax || !shippingFee){
        throw new CustomError.BadRequestError('Please Provide tax and Shipping Fee for your order');
    }

    let orderItems = [];
    let subtotal = 0;
    for(const item of cartItems){
        const dbProduct = await Product.findOne({ _id: item.product });
        if(!dbProduct){
            throw new CustomError.NotFoundError(`No product with id: ${item.product}`);
        }
        const { name, price, image, _id } = dbProduct;
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        };
        orderItems = [...orderItems, singleOrderItem];
        subtotal += item.amount * price;
    }
    const total = tax + shippingFee + subtotal;
    const paymentIntent = await fakeStripeAPI({
        amount: total,
        currency: 'usd',
    });
    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: req.user.userId,
    });

    res.status(StatusCodes.OK).json({ order, clientSecret: order.clientSecret });

}

const getAllOrders = async(req, res) => {
    let q_offset = req.query.offset;
    let l_limit = req.query.limit;
    let orders;
    if(!q_offset && !l_limit){
        orders = await Order.find({});
    }else{
        orders = await Order.paginate({}, { offset: q_offset, limit: l_limit, customLabels: customPaginationLabels });
    }
    res.status(StatusCodes.OK).json({ orders });
}

const getSingleOrder = async(req, res) => {
    const { id: orderId } = req.params;
    const order = await Order.findOne({ _id: orderId });
    if(!order){
        throw new CustomError.NotFoundError(`No Order with id: ${orderId}`);
    }
    checkPermission(req.user, order.user);
    res.status(StatusCodes.OK).json({ order });
}

const getCurrentUserOrders = async(req, res) => {
    const orders = await Order.find({ user: req.user.userId });
    res.status(StatusCodes.OK).json({ orders, count: orders.length });
}

const updateOrder = async(req, res) => {
    const { id: orderId } = req.params;
    const { paymentIntentId } = req.body;

    const order = await Order.findOne({ _id: orderId });
    if(!order){
        throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
    }
    checkPermission(req.user, order.user);
    order.paymentIntentId = paymentIntentId;
    order.status = 'paid';
    await order.save();
    res.status(StatusCodes.OK).json({ order });
}

module.exports = {
    createOrder,
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    updateOrder,
}