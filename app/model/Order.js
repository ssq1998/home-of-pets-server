const mongoose = require('mongoose')

const { Schema, model } = mongoose

const OrderSchema = new Schema({
    // 关联用户ID
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    goodInfo: { type: Array, required: true },  // 商品信息列表
    totalPrice: { type: Number },  // 实付款
    isChecked: { type: Boolean, default: false },  // 订单是否确认
    hasDone: { type: Boolean, default: false },  // 订单是否完成
    receivingInfo: { type: String, default: '' }  // 收货信息
})

const Order = model('Order', OrderSchema)

module.exports = Order