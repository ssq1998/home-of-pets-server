const express = require('express')
const User = require('../model/User')  // 引入用户模型
const Store = require('../model/Store')  // 引入店铺模型
const Article = require('../model/Article')  // 引入文章模型 
const router = express.Router()

const bcrypt = require('bcryptjs')  // 引入密码加密组件
const jwt = require('jsonwebtoken') // 引入token组件
const { secret } = require('../config/key')

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

const verifyToken = async(req, res, next) => {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ').pop()
        if (token) {
            jwt.verify(token,secret,(err,decoded) => {
                if (err) {
                    if (err.name === 'JsonWebTokenError') {
                        return res.status(401).send('该token已失效')
                    } else if (err.name === 'TokenExpiredError') {
                        return res.status(401).send('该token已过期')
                    }
                } else {
                    next()
                }
            })
        } else {
            res.status(401).send('请先进行登录')
        }
    } else {
        res.status(401).send('请先进行登录')
    }
}

// 获取登录用户信息
router.get('/getLoginUserInfo', verifyToken, async(req,res) => {
    const token = req.headers.authorization.split(' ').pop()
    const { _id } = jwt.verify(token,secret)
    const user = await User.findById(_id)
    if(user) {
        res.send(user)
    } else {
        res.status(422).send('用户未登录')
    }
})

// 更新用户信息
router.post('/updateUserInfo', verifyToken, async(req,res)=>{
    // console.log(req.body)
    const { _id, username, sex, birth, signature } = req.body
    let user = await User.findOneAndUpdate({
        _id: _id
    },{
        username: username,
        sex: sex,
        birth: new Date(birth),
        signature: signature
    },{
        new: true
    })
    await Article.updateMany({
        userID: _id
    },{
        username: username
    })
    if (user) {
        res.send(user)
    } else {
        res.status(204).send()
    }
})

// 修改用户头像
router.post('/updateUserPhoto',async(req,res)=>{
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
    const { _id, userPhoto } = req.body
    let user = User.findOneAndUpdate({
        _id
    },{
        userPhoto
    },{
        new: true
    })
    if (user) {
        res.send(user)
    } else {
        res.status(204).send()
    }
})

// 获取所有普通用户
router.post('/getAllOrdinaryUsers',isAdmin,async(req,res)=>{
    const users = await User.find({isAdmin: false, isSeller: false})
    if (users) {
        res.send(users)
    } else {
        res.status(204).send('没有查询到相关信息')
    }
})

// 获取所有卖家用户
router.post('/getAllSellerUsers',isAdmin,async(req,res)=>{
    const users = await User.find({isSeller: true})
    if (users) {
        res.send(users)
    } else {
        res.status(204).send('没有查询到相关信息')
    }
})

// 用户注册
router.post('/register',async(req,res)=>{
    const user = await User.findOne({username: req.body.username})
    if(user){ return res.status(409).send('该用户名已存在')}
    const phoneNumber = await User.findOne({phoneNumber: req.body.phoneNumber})
    if(phoneNumber){ return res.status(409).send('该电话号码已被注册')}
    //密码加密
    const newUser = await new User(req.body).save()
    res.send(newUser)
})

// 用户登录
router.post('/login',async(req,res)=>{
    //查询用户名是否已经注册
    const user = await User.findOne({username:req.body.username})
    if(!user){ return res.status(422).send('该用户名未注册')}
    //密码解密
    let isPassword = await bcrypt.compareSync(req.body.password, user.password)
    if(!isPassword){ return res.status(422).send('密码错误')}
    //返回token
    const { _id } = user
    const token = jwt.sign({ _id },secret,{expiresIn: '7d'})
    res.send(token)
})

// 获取当前文章的发布者信息
router.post('/getArticleUserInfo',async(req,res) => {
    let user = await User.findById(req.body._id)
    if (user) {
        res.send(user)
    } else {
        res.status(204).send('该用户不存在')
    }
})

// 关注文章作者
router.post('/followArticlePublisher',async(req,res) => {
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
    let user = await User.findById(req.body._id)
    let attentionList = user.myAttentionList
    if (req.body.state) {
        let index = attentionList.indexOf(req.body.publisherID)
        attentionList.splice(index,1)
        let newUser = await User.findByIdAndUpdate({
            _id: req.body._id
        },{
            myAttentionList: attentionList
        },{
            new: true
        })
        return res.send(newUser)
    } else {
        attentionList.push(req.body.publisherID)
        let newUser = await User.findByIdAndUpdate({
            _id: req.body._id
        },{
            myAttentionList: attentionList
        },{
            new: true
        })
        return res.send(newUser)
    }
})

// 给文章点赞
router.post('/praiseArticle',async(req,res) => {
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
    let article = await Article.findById(req.body.articleID)
    let praiseList = article.praiseList
    if (req.body.state) {
        let index = praiseList.indexOf(req.body.userID)
        praiseList.splice(index,1)
        let newArticle = await Article.findByIdAndUpdate({
            _id: req.body.articleID
        },{
            praiseList: praiseList
        },{
            new: true
        })
        return res.send(newArticle)
    } else {
        praiseList.push(req.body.userID)
        let newArticle = await Article.findByIdAndUpdate({
            _id: req.body.articleID
        },{
            praiseList: praiseList
        },{
            new: true
        })
        return res.send(newArticle)
    }
})

// 收藏文章
router.post('/collectArticle',async(req,res) => {
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
    let user = await User.findById(req.body.userID)
    let myCollectionList = user.myCollectionList
    let article = await Article.findById(req.body.articleID)
    let collectList = article.collectList
    if (req.body.state) {
        let index = collectList.indexOf(req.body.userID)
        collectList.splice(index,1)
        let newArticle = await Article.findByIdAndUpdate({
            _id: req.body.articleID
        },{
            collectList: collectList
        },{
            new: true
        })
        let idx = myCollectionList.indexOf(req.body.articleID)
        myCollectionList.splice(idx,1)
        let newUser = await User.findByIdAndUpdate({
            _id: req.body.userID
        },{
            myCollectionList: myCollectionList
        },{
            new: true
        })
        return res.send({newArticle, newUser})
    } else {
        collectList.push(req.body.userID)
        let newArticle = await Article.findByIdAndUpdate({
            _id: req.body.articleID
        },{
            collectList: collectList
        },{
            new: true
        })
        myCollectionList.push(req.body.articleID)
        let newUser = await User.findByIdAndUpdate({
            _id: req.body.userID
        },{
            myCollectionList: myCollectionList
        },{
            new: true
        })
        return res.send({newArticle, newUser})
    }
})

// 获取宠物百科页面的百科用户
router.post('/getSomeUsers',async(req,res) => {
    let user = await User.find({isAdmin: false}).limit(3)
    if (user) {
        return res.send(user)
    } else {
        return res.status(204).send('无内容')
    }
})

// 获取登录用户的所有关注的用户
router.post('/getAttentionUsers',async(req,res) => {
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
    let {attentionList} = req.body
    let len = attentionList.length
    let userList = []
    for (let i = 0; i<len; i++) {
        let user = await User.findById({_id: attentionList[i]})
        userList.push(user)
    }
    res.send(userList)
})

// 取消关注
router.post('/deleteAttentionUser',async(req,res) => {
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
    let user = await User.findById(req.body._id)
    let attentionList = user.myAttentionList
    let index = attentionList.indexOf(req.body.attentionUserID)
    attentionList.splice(index,1)
    await User.findByIdAndUpdate({
        _id: req.body._id
    },{
        myAttentionList: attentionList
    })
    let len = attentionList.length
    let userList = []
    for (let i = 0; i<len; i++) {
        let user = await User.findById({_id: attentionList[i]})
        userList.push(user)
    }
    res.send(userList)
})

// 更新用户访问列表
router.post('/updateVisitList',async(req,res) => {
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
    let user = await User.findById({_id: req.body._id})
    let visitList = user.visitList
    for (let item of req.body.tagList) {
        if (!visitList.includes(item)) {
            visitList.push(item)
        }
    }
    let newUser = await User.findByIdAndUpdate({
        _id: req.body._id
    },{
        visitList: visitList
    },{
        new: true
    })
    res.send(newUser)
})

// 验证
router.get('/verity',async(req,res)=>{
    //console.log(req.headers.authorization)
    //获取token
    const token = req.headers.authorization.split(' ')[1]
    const id = token.split('.')[0]
    const username = token.split('.')[1]
    console.log(id,username)
    //查询用户是否存在
    const user = await User.findById(id)
    if(!user){ return res.status(422).send('用户不存在')}
    //查看用户名
    if(username !== user.username){
        res.status(422).send('用户名错误')
    }else{
        //用户存在，查看权限
        if (!user.isAdmin) {
            res.status(409).send('没有权限')
        } else {
            res.send('Admin')
        }
    }
})

module.exports = router