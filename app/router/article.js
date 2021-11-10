const express = require('express')
const router = express.Router()
const Article = require('../model/Article')
const User = require('../model/User')

const jwt = require('jsonwebtoken') //引入token组件
const { secret } = require('../config/key')
const { set } = require('mongoose')

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

// 发布文章
router.post('/publishArticle',async(req,res) => {
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
    const article = await new Article(req.body).save()
    res.send(article)
})

// 获取4条图文分类的文章
router.post('/getSomeArticle',async(req,res) => {
    const article = await Article.find({aid: 2}).skip(req.body.len).limit(4)
    if (article) {
        res.send(article)
    } else {
        res.status(204).send('没有更多内容了')
    }
})

// 提交一级评论
router.post('/submitComment',async(req,res) => {
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
    const article = await Article.findById(req.body._id)
    if (!article) {
        return res.send('文章不存在')
    }
    const {username, date, content, childComments, showLevelOneCommentBox, textarea, userPhoto} = req.body
    article.comments.push({username, date, content, childComments, showLevelOneCommentBox, textarea, userPhoto})
    let newArticle = await Article.findOneAndUpdate({
        _id: req.body._id
    },{
        comments: article.comments
    },{
        new: true
    })
    return res.send(newArticle)
})

// 提交二级评论
router.post('/submitChildComment',async(req,res) => {
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
    const article = await Article.findById(req.body._id)
    if (!article) {
        return res.send('文章不存在')
    }
    const {username, beCommented, date, content, showLevelTwoCommentBox, textarea} = req.body
    article.comments[req.body.idx].childComments.push({username, beCommented, date, content, showLevelTwoCommentBox, textarea})
    let newArticle = await Article.findOneAndUpdate({
        _id: req.body._id
    },{
        comments: article.comments
    },{
        new: true
    })
    return res.send(newArticle)
})

// 追加二级评论
router.post('/submitAppendChildComment',async(req,res) => {
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
    const article = await Article.findById(req.body._id)
    if (!article) {
        return res.send('文章不存在')
    }
    const {username, beCommented, date, content, showLevelTwoCommentBox, textarea} = req.body
    article.comments[req.body.idx].childComments.push({username, beCommented, date, content, showLevelTwoCommentBox, textarea})
    let newArticle = await Article.findOneAndUpdate({
        _id: req.body._id
    },{
        comments: article.comments
    },{
        new: true
    })
    return res.send(newArticle)
})

// 获取4条百科分类的文章
router.post('/getSomeWikiArticle',async(req,res) => {
    const article = await Article.find({aid: 3}).skip(req.body.len).limit(4)
    if (article) {
        res.send(article)
    } else {
        res.status(204).send('没有更多内容了')
    }
})

// 模糊匹配图文文章
router.post('/searchArticle',async(req,res) => {
    let text = req.body.text
    let reg = new RegExp(text, 'i')
    let _filter = {
        $or: [
            {title: {$regex: reg}},
            {describe: {$regex: reg}},
            {content: {$regex: reg}}
        ],
        aid: req.body.aid
    }
    const article = await Article.find(_filter)
    if(article){
        return res.send(article)
    } else {
        return res.status(204).send('未查询到文章信息')
    }
})

// 获取宠物社区跑马灯内容
router.post('/getCommunityLantern',async(req,res) => {
    const article = await Article.find({aid: 2}).limit(6)
    if(article){
        return res.send(article)
    } else {
        return res.status(204).send('无内容')
    }
})

// 获取宠物百科跑马灯内容
router.post('/getWikiLantern',async(req,res) => {
    const article = await Article.find({aid: 3}).limit(6)
    if(article){
        return res.send(article)
    } else {
        return res.status(204).send('无内容')
    }
})

// 获取分页宠物之家内容
router.post('/getPagingvideo',async(req,res) => {
    let { pageNum, pageSize } = req.body
    let skipNum = (pageNum - 1) * pageSize
    let allNum = await (await Article.find({aid: 1})).length
    let article = await Article.find({aid: 1}).skip(skipNum).limit(pageSize)
    if (article) {
        res.send({article, allNum})
    } else {
        res.status(204).send('没有更多内容了')
    }
})

// 获取宠物之家初始内容
router.post('/getPetsHomeVideo',async(req,res) => {
    let article = await Article.find({aid: 1}).limit(4)
    if (article) {
        res.send(article)
    } else {
        res.status(204).send('没有更多内容了')
    }
})

// 宠物之家换一批操作
router.post('/changeBatch',async(req,res) => {
    const article = await Article.find({aid: 1}).skip(req.body.countNum).limit(4)
    if (article) {
        res.send(article)
    } else {
        res.status(204).send('没有更多内容了')
    }
})

// 模糊匹配宠物之家视频
router.post('/searchVideo',async(req,res) => {
    let text = req.body.text
    let reg = new RegExp(text, 'i')
    let _filter = {
        $or: [
            {title: {$regex: reg}},
            {describe: {$regex: reg}},
            {content: {$regex: reg}},
            {tags: {$regex: reg}}
        ],
        aid: req.body.aid
    }
    let { pageNum, pageSize } = req.body
    let skipNum = (pageNum - 1) * pageSize
    const article = await Article.find(_filter).skip(skipNum).limit(pageSize)
    if(article){
        const len = await (await Article.find(_filter)).length
        return res.send({article, len})
    } else {
        return res.status(204).send('未查询到文章信息')
    }
})

// 获取选中的用户上传的所有文章 权限：管理员
router.post('/getUserArticle',isAdmin,async(req,res) => {
    let article = await Article.find({userID: req.body.userID})
    if (article) {
        res.send(article)
    } else {
        res.status(204).send('无内容')
    }
})

// 删除用户的某篇文章 权限：管理员
router.post('/deleteUserArticle',isAdmin,async(req,res) => {
    await Article.findByIdAndDelete(req.body._id)
    let article = await Article.find({userID: req.body.userID})
    if (article) {
        res.send(article)
    } else {
        res.status(204).send('无内容')
    }
})

// 获取登录用户的所有文章
router.post('/getUserAllArticle',async(req,res) => {
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
    let article = await Article.find({userID: req.body.userID})
    if (article) {
        return res.send(article)
    } else {
        return res.status(204).send('无内容')
    }
})

// 获取登录用户的所有分类的文章
router.post('/getArticle', async(req,res) => {
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
    let article = await Article.find({
        userID: req.body.userID,
        aid: req.body.aid
    })
    if (article) {
        return res.send(article)
    } else {
        return res.status(204).send('无内容')
    }
})

// 获取登录用户的所有收藏的分类文章
router.post('/getAllCollectArticle', async(req,res) => {
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
    let {collectionList, aid} = req.body
    let len = collectionList.length
    let articleList = []
    for (let i = 0; i<len; i++) {
        let article = await Article.findById({_id: collectionList[i]})
        if (article.aid === aid) {
            articleList.push(article)
        }
    }
    res.send(articleList)
})

// 文章阅读数+1
router.post('/addReadingNumber',async(req,res) => {
    await Article.findByIdAndUpdate({
        _id: req.body._id
    },{
        readingNumber: req.body.readingNumber
    })
    return res.send('+1')
})

// 获取分类文章的所有标签
router.post('/getAllTags',async(req,res) => {
    let article = await Article.find({
        aid: req.body.aid
    })
    let tagList = []
    for(let item of article) {
        tagList = tagList.concat(item.tags)
    }
    let tagSet = new Set()
    for(let item of tagList) {
        tagSet.add(item)
    }
    let newTagList = [...tagSet]
    res.send(newTagList)
})

// 根据标签获取分类文章
router.post('/getTagArticle',async(req,res) => {
    let article = await Article.find({
        aid: req.body.aid
    })
    let articleList = []
    for(let item of article) {
        if (item.tags.includes(req.body.tag)) {
            articleList.push(item)
        }
    }
    res.send(articleList)
})

// 获取用户访问过的相似文章
router.post('/getVisitedArticle',async(req,res) => {
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
    let articleList = []
    let articleIDList = []
    for(let item of req.body.visitList) {
        let reg = new RegExp(item, 'i')
        let _filter = {
            $or: [
                {title: {$regex: reg}},
                {describe: {$regex: reg}},
                {content: {$regex: reg}},
                {tags: {$regex: reg}}
            ],
            aid: req.body.aid
        }
        let article = await Article.find(_filter)
        for(let item of article) {
            if (articleIDList.includes(JSON.stringify(item._id)) === false) {
                articleIDList.push(JSON.stringify(item._id))
                articleList.push(item)
            }
        }
    }
    res.send(articleList)
})

module.exports = router