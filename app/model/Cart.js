const mongoose = require('mongoose')

const { Schema, model } = mongoose

const CartSchema = new Schema({
    // 关联用户ID
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    goodList: { type: Array, default: [] }  // 商品信息列表
})

const Cart = model('Cart', CartSchema)

module.exports = Cart