const Product = require('../model/product');

const mongoose = require('mongoose');

exports.products_get_all = (req, res, next) => {
    Product.find()
    .select('name price _id productImage')//control which data to be fetched
    .exec()
    .then(docs => {
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price : doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + doc.id
                    }
                }
            })
        }
        // if (docs.length >= 0) {
        res.status(200).json(response);
        // } else {
        //     res.status(404).json({
        //         message: 'No entries found'
        //     });
        // }
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({
            err: error
        });
    });
}

exports.products_new_product = (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage:  req.file.path
    });
    product
    .save()
    .then(result => {
        console.log(result);
        res.status(201).json({
        message: 'Product created',
        createdProduct: {
            name: result.name,
            price : result.price,
            _id: result._id,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + result.id
            }
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

exports.products_get_product = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log("From database", doc);
        if (doc) {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products/'
                }
            });
        } else {
            res.status(404).json({message: 'No valid entry found for provided ID'});
        }
        res.status(200).json(doc);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({err: error});
    });
}

exports.products_update_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateMany({_id: id}, { $set: updateOps })
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product updated',
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products/' + id
            }
        });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({err: error});
    });
}

exports.products_delete_product = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'Product deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/products/',
                body: { name: 'String', price: 'Number' }
            }
        });
    })
    .catch(error => {
        res.status(500).json({
            err: error
        });
    });
}