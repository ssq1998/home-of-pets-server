const express = require('express')
const Order = require('../model/Order')
const User = require('../model/User')
const router = express.Router()

const jwt = require('jsonwebtoken') // 引入token组件
const { secret } = require('../config/key')

//验证身份中间件
//验证是否是卖家用户
const isSeller = async (req, res, next) => {
    //jwt-token
    const token = req.headers.authorization.split(' ').pop()
    const {
        _id,
        username
    } = jwt.verify(token, secret)
    //查询用户是否存在
    const user = await User.findById(_id)
    if (!user) {
        return res.status(422).send('用户不存在')
    }
    //用户存在，查看权限
    if (user.isSeller === true) {
        next()
    } else {
        res.status(409).send('没有权限')
    }
}

// 购物车下单
router.post('/createOrder',async(req,res)=>{
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
    const newOrder = await new Order(req.body).save()
    res.send(newOrder)
})

// 确认订单页面获取订单信息
router.post('/showOrder', async(req,res)=>{
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
    const order = await Order.find({
        userID: req.body.userID,
        isChecked: req.body.isChecked
    })
    if (order) {
        res.send(order)
    } else {
        res.status(204).send('无内容')
    }
})

// 获取正在进行中的订单信息
router.post('/showInProgressOrder', async(req,res)=>{
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
    const inProgressOrder = await Order.find({
        userID: req.body.userID,
        isChecked: req.body.isChecked,
        hasDone: req.body.hasDone
    })
    res.send(inProgressOrder)
})

// 获取已经完成的订单信息
router.post('/showHasDoneOrder', async(req,res)=>{
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
    const hasDoneOrder = await Order.find({
        userID: req.body.userID,
        hasDone: true
    })
    res.send(hasDoneOrder)
})

// 删除未确认的订单
router.post('/deleteOrder', async(req,res)=>{
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
    await Order.deleteOne({_id: req.body.orderID}).then(()=>{
        res.send('删除订单成功')
    }).catch((err)=>{
        res.send(err)
    })
})

// 确认订单
router.post('/submitOrder', async(req,res)=>{
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
    let result = await Order.findOneAndUpdate({   
        _id: req.body.orderID
    },
    {
        receivingInfo: req.body.receivingInfo,
        isChecked: req.body.isChecked
    })
    res.send(result)
})

// 确认收货，完成订单
router.post('/confirmReceipt', async(req,res)=> {
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
    let result = await Order.findOneAndUpdate({
        _id: req.body.orderID
    },
    {
        hasDone: req.body.hasDone
    })
    res.send(result)
})

// 获取卖家所有待发货的商品
router.post('/getWaitGoods',isSeller, async(req,res) => {
    let order = await Order.find({
        isChecked: true,
        hasDone: false
    })
    let goodList = []
    let newGoodList = []
    for (let item of order) {
        let goodInfo = item.goodInfo
        let len = goodInfo.length
        for (let i=0; i<len; i++) {
            goodInfo[i].receivingInfo = item.receivingInfo
        }
        goodList = goodList.concat(goodInfo)
    }
    for (let item of goodList) {
        if (item.storeID == JSON.stringify(req.body.storeID)) {
            newGoodList.push(item)
        }
    }
    res.send(newGoodList)
})

module.exports = router