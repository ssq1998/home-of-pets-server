const express = require('express')
const Good = require('../model/Good') //引入商品模型
const User = require('../model/User') //引入用户模型
const Store = require('../model/Store') // 引入店铺模型
const router = express.Router()

const jwt = require('jsonwebtoken') //引入token组件
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

// 获取卖家上架的商品 权限：Seller
router.post('/getGoodsAutho',isSeller,async(req,res) => {
    const good = await Good.find({storeID: req.body.storeID})
    if (good) {
        res.send(good)
    } else {
        res.status(204).send('没有查询到相关信息')
    }
})

// 添加商品 权限：Seller
router.post('/addGood', isSeller, async(req,res) => {
    const newGood = await new Good(req.body).save()
    res.send(newGood)
})

// 删除商品 权限：Seller
router.post('/deleteGood',isSeller,async(req,res) => {
    await Good.findByIdAndDelete({_id: req.body._id})
    let good = await Good.find({storeID: req.body.storeID})
    if (good) {
        res.send(good)
    } else {
        res.status(204).send('没有查询到相关信息')
    }
})

// 上架商品 权限：Seller
router.post('/putGood',isSeller,async(req,res) => {
    const newGood = await new Good(req.body).save()
    res.send(newGood)
})

// 更新商品信息 权限: Seller
router.post('/updateGood',isSeller,async(req,res) => {
    let goodInfo = req.body.goodInfo
    let {goodName, beforeDiscount, afterDiscount, goodPic, classification} = goodInfo
    let good = await Good.findByIdAndUpdate({
        _id: goodInfo._id
    },{
        goodName,
        beforeDiscount,
        afterDiscount,
        goodPic,
        classification
    },{
        new: true
    })
    res.send(good)
})

// 获取5条热销商品信息（展示）
router.get('/getHotsaleGoods',async(req,res)=>{
    const goods = await Good.find({isHotsale: true}).limit(5)
    if(goods){
        res.send(goods)
    } else {
        res.status(204).send('未查询到商品信息')
    }
})

// 获取5条类别为clothes的商品信息（展示）
router.get('/getGoodsOfClothes',async(req,res)=>{
    const goods = await Good.find({classification: "clothes"}).limit(5)
    if(goods){
        res.send(goods)
    } else {
        res.status(204).send('未查询到商品信息')
    }
})

// 获取5条类别为food的商品信息 （展示）
router.get('/getGoodsOfFood',async(req,res)=>{
    const goods = await Good.find({classification: "food"}).limit(5)
    if(goods){
        res.send(goods)
    } else {
        res.status(204).send('未查询到商品信息')
    }
})

// 获取5条类别为living的商品信息 （展示）
router.get('/getGoodsOfLiving',async(req,res)=>{
    const goods = await Good.find({classification: "living"}).limit(5)
    if(goods){
        res.send(goods)
    } else {
        res.status(204).send('未查询到商品信息')
    }
})

// 获取5条类别为travel的商品信息 （展示）
router.get('/getGoodsOfTravel',async(req,res)=>{
    const goods = await Good.find({classification: "travel"}).limit(5)
    if(goods){
        res.send(goods)
    } else {
        res.status(204).send('未查询到商品信息')
    }
})

// 获取所有商品或者分类的商品 （展示）
router.post('/getGoods',async(req,res) => {
    if (req.body.classification) {
        const goods = await Good.find({classification: req.body.classification})
        if(goods){
            return res.send(goods)
        } else {
            return res.status(204).send('未查询到商品信息')
        }
    } else {
        const goods = await Good.find()
        if(goods){
            return res.send(goods)
        } else {
            return res.status(204).send('未查询到商品信息')
        }
    }
})

// 模糊匹配商品 （展示）
router.post('/searchGoods',async(req,res) => {
    let text = req.body.text
    let reg = new RegExp(text, 'i')
    let _filter = {
        goodName: {$regex: reg}
    }
    const goods = await Good.find(_filter)
    if(goods){
        return res.send(goods)
    } else {
        return res.status(204).send('未查询到商品信息')
    }
})

// 获取选中的卖家上架的所有商品 权限：管理员
router.post('/getSellerGoods',isAdmin,async(req,res) => {
    let store = await Store.findOne({userID: req.body.userID})
    let good = await Good.find({storeID: store._id})
    if (good) {
        res.send(good)
    } else {
        res.status(204).send('无内容')
    }
})

// 删除卖家的商品 权限：管理员
router.post('/deleteSellerGood',isAdmin,async(req,res) => {
    await Good.findByIdAndDelete(req.body._id)
    let good = await Good.find({storeID: req.body.storeID})
    if (good) {
        res.send(good)
    } else {
        res.status(204).send('无内容')
    }
})

// 获取用户访问过的文章的相关商品
router.post('/getVisitedArticleGood',async(req,res) => {
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
    let goodList = []
    let goodIDList = []
    for(let item of req.body.tags) {
        let reg = new RegExp(item, 'i')
        let _filter = {
            goodName: {$regex: reg}
        }
        let good = await Good.find(_filter)
        for(let item of good) {
            if (goodIDList.includes(JSON.stringify(item._id)) === false) {
                goodIDList.push(JSON.stringify(item._id))
                goodList.push(item)
            }
        }
    }
    if (goodList.length > 3) {
        res.send(goodList.splice(0,3))
    } else {
        res.send(goodList)
    }
})

// 获取文章详情页面的商品
router.post('/getArticleDetailGood',async(req,res) => {
    let good = await Good.find().limit(3)
    if (good) {
        return res.send(good)
    } else {
        return res.status(204).send('无内容')
    }
})

module.exports = router