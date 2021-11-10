const mongoose = require('mongoose')

const { Schema, model } = mongoose

// 定义商店模型
const StoreSchema = new Schema({
    // 关联用户ID
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    storeName: { type: String, required: true },  // 店铺名称
    storeMark: { type: Array, default: [] },  // 店铺图标列表
    registerDate: { type: Date, default: new Date() },  // 注册时间
    storeOwner: { type: String, required: true },  // 店铺所有者
    storeOwnerCardID: { type: String, required: true },  // 店铺所有者身份证号码
    storeAddress: { type: String, required: true },  // 店铺所有者所在地址
    isActive: { type: Boolean, default: false }  // 是否被激活，需要经过管理员审核
})

const Store = model('Store', StoreSchema)

module.exports = Store