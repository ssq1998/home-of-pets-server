const mongoose = require('mongoose')

const { Schema, model } = mongoose

const ReceivingInfoSchema = new Schema({
    // 关联用户ID
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    ReceivingInfo: { type: Array, default: [] }  // 收货信息
})

const ReceivingInfo = model('ReceivingInfo', ReceivingInfoSchema)

module.exports = ReceivingInfo
