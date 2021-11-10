const express = require('express')
const Cart = require('../model/Cart') // 引入购物车模型
const Good = require('../model/Good') // 引入商品模型
const ReceivingInfo = require('../model/ReceivingInfo') // 引入收货信息模型
const router = express.Router()

const jwt = require('jsonwebtoken') // 引入token组件
const { secret } = require('../config/key')

// 加入购物车
router.post('/addToCart',async(req,res)=>{
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
    const cart = await Cart.findOne({userID: req.body.userID})
    if (cart.goodList.includes(req.body.goodID)) {
        return res.status(409).send('该商品已经加入购物车了')
    } else {
        cart.goodList.push(req.body.goodID)
    }
    await Cart.findOneAndUpdate({
        userID: req.body.userID
    },{
        goodList: cart.goodList
    })
    return res.send('加入购物车成功')
})

// 展示购物车
router.post('/showCart',async(req,res)=>{
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
    let cart = await Cart.findOne({userID: req.body.userID})
    let cartList = []
    let goodList = cart.goodList
    let len = goodList.length
    for (let i = 0;i < len;i++) {
        let good = await Good.findById({_id: goodList[i]})
        cartList.push(good)
    }
    res.send(cartList)
})

// 创建购物车  初始收货信息
router.post('/createCart', async(req,res) => {
    const newCart = await new Cart(req.body).save()
    const newReceivingInfo = await new ReceivingInfo(req.body).save()
    res.send([newCart,newReceivingInfo])
})

// 删除购物车中的商品
router.post('/deleteSelectedGood', async(req,res) => {
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
    const { userID, proList } = req.body
    let cart = await Cart.findOne({userID: userID})
    let goodList = cart.goodList
    let len = proList.length
    for(let i = 0; i<len; i++) {
        let index = goodList.indexOf(proList[i])
        goodList.splice(index,1)
    }
    let newCart = await Cart.findOneAndUpdate({
        userID: userID
    },{
        goodList: goodList
    },{
        new: true
    })
    let cartList = []
    let newGoodList = newCart.goodList
    let newLen = newGoodList.length
    for (let i = 0;i < newLen;i++) {
        let good = await Good.findById({_id: newGoodList[i]})
        cartList.push(good)
    }
    res.send(cartList)
})

module.exports = router