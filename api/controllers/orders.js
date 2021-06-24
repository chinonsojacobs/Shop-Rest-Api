const Order = require('../model/order');
const Product = require('../model/product');

const mongoose = require('mongoose');

exports.orders_get_all = (req, res, next) => {
    Order.find()
    .select('quantity product _id')
    .populate('product', 'name')
    .exec()
    .then(docs => {
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    _id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/orders/' + doc.id
                    }
                }
            }) 
        });
    })
    .catch( error => {
        res.status(500).json({
            err: error
        });
    });
}

exports.orders_new_order = (req, res, next) => {  
    Product.findById(req.body.productId)
    .then(product => {
        if (!product) {
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId
    });
    return order.save()
    }).then(result => {
        console.log(result);
        res.status(201).json({
        message: 'Order stored',
        createdOrder: {
            _id: result._id,
            product: result.product,
            quantity: result.quantity
        },
        request: {
                type: 'GET',
                url: 'http://localhost:3000/orders/' + result.id
            }
    });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            err: error
        });
    });
}

exports.orders_get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
    .populate('product')
    .exec()
    .then(order => {
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.status(200).json({
            order: order,
            request: {
                type: 'GET', 
                url: 'http://localhost:3000/orders/'
            }
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            err: error
        });
    });
}

exports.order_delete_order = (req, res, next) => {
    const id = req.params.orderId;
    Order.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Order deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products/',
                body: { productId: 'ID', quantity: 'Number' }
            }
        });
    })
    .catch(error => {
        res.status(500).json({
            err: error
        });
    });
}