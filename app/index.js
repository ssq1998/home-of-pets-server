const express = require('express')
const bodyParser = require('body-parser')

const mongo = require('./config/db')
const routes = require('./router')
const ports = require('./config/port')

const app = new express()

// 开启gzip压缩
const compression = require('compression')
app.use(compression())

mongo(app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '1024mb'
}))
// routes(app) 要写在上面两行代码下面，否则从前端获取的数据为undefined
routes(app)

app.use(express.static('E:/homeofpetsserver/app/router'))

const { host, port } = ports.server
app.listen(port, () => {
    console.log(`服务启动成功:http://${host}:${port}`)
})