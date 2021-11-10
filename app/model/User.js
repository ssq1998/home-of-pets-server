const mongoose = require('mongoose')

const bcrypt = require('bcryptjs')
const { Schema, model } = mongoose

//定义用户模型
const UserSchema = new Schema({
    username: { type: String, required: true },  // 用户名
    password: {
        type: String,
        required: true,
        set(val){
            return bcrypt.hashSync(val,10)
        }
    },  // 密码
    phoneNumber: { type: String, required: true }, // 手机号
    isAdmin: { type: Boolean, default: false },   // 是否为管理员，默认普通用户
    isSeller: { type: Boolean, default: false },  // 是否为卖家用户，默认普通用户
    createDate: { type: Date, default: new Date() },  // 注册时间
    // 个人信息
    sex: { type: String, default: 'secret' },  // 性别
    birth: { type: Date, default: 1990-01-01 },  // 生日
    signature: { type: String, default: '我是一名称职的铲屎官' },  // 个性签名
    myAttentionList: { type: Array, default: [] },  // 关注列表
    myCollectionList: { type: Array, default: [] }, // 收藏列表
    visitList: { type: Array, default: [] }, // 访问列表
    userPhoto: { type: String, default: 'http://127.0.0.1:3000/upload/a0e93a505108ee8712dbfe4fe7f58c59.jpeg' }  // 用户头像
})

const User = model('User',UserSchema)

module.exports = User