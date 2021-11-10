const express = require('express')
const ReceivingInfo = require('../model/ReceivingInfo')
const router = express.Router()

const jwt = require('jsonwebtoken') // 引入token组件
const { secret } = require('../config/key')

// 获取收货信息
router.post('/getReceivingInfo',async(req,res) => {
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
    const receivingInfo = await ReceivingInfo.findOne({userID: req.body.userID})
    if (receivingInfo) {
        return res.send(receivingInfo)
    } else {
        return res.status(204).send('无内容')
    }
})

// 新增收货信息
router.post('/addNewReceivingInfo',async(req,res) => {
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
    let receivingInfo = await ReceivingInfo.findOne({userID: req.body.userID})
    let receivingList = receivingInfo.ReceivingInfo
    receivingList.push(req.body.receivingInfo)
    let newReceivingInfo = await ReceivingInfo.findOneAndUpdate({
        userID: req.body.userID
    },{
        ReceivingInfo: receivingList
    },{
        new: true
    })
    return res.send(newReceivingInfo)
})

module.exports = router