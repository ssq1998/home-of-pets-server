const mongoose = require('mongoose')

const { Schema, model } = mongoose

const ArticleSchama = new Schema({
    // 关联用户ID
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    username: { type: String, required: true },  // 作者名
    title: { type: String, required: true },  // 文章标题
    aid: { type: String },  // 1:视频  2:图文  3:百科
    describe: { type: String, default: '' },  // 文章描述
    content: { type: String, default: '' },  // 文章内容
    uploadImg: { type: Array, default: [] },  // 上传图片列表
    uploadVideo: { type: Array, default: [] },  // 上传视频列表
    tags: { type: Array, default: [] },  // 文章标签
    publishDate: { type: Date, default: new Date() },  // 文章发布时间
    readingNumber: { type: Number, default: 0 }, // 阅读数
    praiseList: { type: Array, default: [] }, // 点赞用户列表
    collectList: { type: Array, default: [] }, // 收藏用户列表
    comments: { type: Array, default: [] }   // 评论内容
})

const Article = model('Article', ArticleSchama)

module.exports = Article