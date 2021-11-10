const express = require('express')
const Good = require('../model/Good')  // 引入商品模型
const Article = require('../model/Article') // 引入文章模型

const router = express.Router()

const jwt = require('jsonwebtoken') // 引入token组件
const { secret } = require('../config/key')

// 获取首页跑马灯内容
router.post('/getHomepageBanner',async(req,res)=>{
    const article2 = await Article.find({aid: 2}).limit(3)
    const article3 = await Article.find({aid: 3}).limit(3)
    const article = article2.concat(article3)
    if (article) {
        return res.send(article)
    } else {
        return res.status(204).send('没有更多内容了')
    }
})

// 获取首页商品信息
router.post('/getHomepageGoods',async(req,res)=>{
    const goods = await Good.find({showHomepage:true})
    if(goods){
        res.send(goods)
    } else {
        res.status(204).send('未查询到商品信息')
    }
})

// 获取首页视频文章内容
router.post('/getHomepageVideo',async(req,res) => {
    const article = await Article.find({aid: 1}).limit(3)
    if(article){
        res.send(article)
    } else {
        res.status(204).send('没有更多内容了')
    }
})

module.exports = router