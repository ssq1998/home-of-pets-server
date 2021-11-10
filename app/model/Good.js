const mongoose = require('mongoose')

const { Schema, model } = mongoose

//定义商品模型
const GoodSchema = new Schema({
    // 关联店铺ID
    storeID: {
        type: Schema.Types.ObjectId,
        ref: 'Store'
    },
    goodName: { type: String, required: true },  // 商品名称
    beforeDiscount: { type: Number },  // 优惠前价格
    afterDiscount: { type: Number, required: true },  // 优惠后价格
    isHotsale: { type: Boolean, default: false }, // 是否是热销商品
    goodPic: { type: Array, default: [] },  // 商品图片列表
    classification: { type: String, default: '' },  // 商品分类标识
    putDate: { type: Date, default: new Date() },  // 商品上架时间
    goodNum: { type: Number, default: 1 } // 商品数量
})

const Good = model('Good', GoodSchema)

module.exports = Good