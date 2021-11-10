const express = require('express')
const Store = require('../model/Store')  //引入店铺模型
const User = require('../model/User')  //引入用户模型
const router = express.Router()

const jwt = require('jsonwebtoken') //引入token组件
const { secret } = require('../config/key')

//验证身份中间件
//验证是否是卖家用户
const isSeller = async(req,res,next)=>{
    //console.log(req.headers.authorization)
    //jwt-token
    const token = req.headers.authorization.split(' ').pop()
    const { _id } = jwt.verify(token,secret)
    //查询用户是否存在
    const user = await User.findById(_id)
    if(!user){ return res.status(422).send('用户不存在')}
    //用户存在，查看权限
    if (user.isSeller == true) {
        next()
    } else {
        res.status(409).send('没有权限')
    }
}

// 验证身份中间件
// 验证是否是系统管理员
const isAdmin = async(req,res,next)=>{
    // console.log(req.headers.authorization)
    // jwt-token
    const token = req.headers.authorization.split(' ').pop()
    const { _id } = jwt.verify(token,secret)
    // 查询用户是否存在
    const user = await User.findById(_id)
    if (!user){
        return res.status(422).send('用户不存在')
    }
    // 用户存在，查看权限
    if(user.isAdmin == true){
        next()
    } else {
        res.status(409).send('没有权限')
    }
}

// 注册店铺
router.post('/registerStore',async(req,res) => {
    let token = req.headers.authorization.split(' ').pop()
    if (token) {
        jwt.verify(token,secret,(err,decoded) => {
            if (err) {
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).send('该token已失效')
                } else if (err.name === 'TokenExpiredError') {
                    return res.status(401).send('该token已过期')
                }
            }
        })
    }
    const {storeName, storeOwnerCardID} = req.body
    let store = await Store.findOne({storeName: storeName})
    if (store) {
        return res.status(409).send('店铺名已被注册')
    }
    let storeowner = await Store.findOne({storeOwnerCardID: storeOwnerCardID})
    if (storeowner) {
        return res.status(409).send('身份证号已被注册')
    }
    const newStore = await new Store(req.body).save()
    res.send(newStore)
})

// 获取店铺信息
router.post('/getStoreInfo',isSeller,async(req,res) => {
    const storeInfo = await Store.find({userID: req.body.userID})
    if (storeInfo) {
        res.send(storeInfo)
    } else {
        res.status(204).send('没有查询到相关信息')
    }
})

// 获取待审核店铺信息
router.post('/getVerifyStoreInfo',isAdmin,async(req,res) => {
    const store = await Store.find()
    if (store) {
        res.send(store)
    } else {
        res.status(204).send('没有查询到相关信息')
    }
})

// 审核通过
router.post('/approved',isAdmin,async(req,res) => {
    let store = await Store.findByIdAndUpdate({
        _id: req.body._id
    },{
        isActive: true
    },{
        new: true
    })
    await User.findByIdAndUpdate({
        _id: store.userID
    },{
        isSeller: true
    })
    let newStore = await Store.find()
    if (newStore) {
        res.send(newStore)
    } else {
        res.status(204).send('无内容')
    }
})

// 审核不通过
router.post('/notApproved',isAdmin,async(req,res) => {
    await Store.findByIdAndRemove({
        _id: req.body._id
    })
    let newStore = await Store.find()
    if (newStore) {
        res.send(newStore)
    } else {
        res.status(204).send('无内容')
    }
})

module.exports = router