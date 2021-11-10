/**
 * 支付相关接口
 * @type {createApplication}
 */

// 引入express模块
const express = require('express')
const fs = require('fs')
const path = require('path')
const request = require('request')

// 定义路由级中间件
const router = express.Router()

// js规则引入node sdk
const AlipaySdk = require('alipay-sdk').default
const AlipayFormData = require('alipay-sdk/lib/form').default

/**
 * 支付宝统一收单线下交易查询
 * @param {Object} queryObj {'alipay_trade_query_response': {...}, 'sign': 'xxx' }
 * @returns {String} msg API公告返回码对应的描述
 */
const getResponseMsg = function(queryObj) {
    let msg = ''
    if (queryObj instanceof Object && Object.keys(queryObj).length > 0) {
        let code = queryObj.alipay_trade_query_response.code
        switch(code) {
            case '10000':
                msg = '接口调用成功'
                break
            case '20000':
                msg = '服务不可用'
                break
            case '20001':
                msg = '授权权限不足'
                break
            case '40001':
                msg = '缺少必选参数'
                break
            case '40002':
                msg = '非法的参数'
                break
            case '40004':
                msg = '业务处理失败'
                break
            case '40006':
                msg = '权限不足'
                break
        }
    }
    return msg
}

router.post('/alipay', async(req,res) => {
    const alipaySdk = new AlipaySdk({
        appId: '2021000117668415',
        privateKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/app_private_key.pem'),'ascii'),
        signType: 'RSA2',
        alipayPublicKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/alipay_public_key.pem'),'ascii'),
        gateway: 'https://openapi.alipaydev.com/gateway.do',
        timeout: 5000,
        camelcase: true
    })
    const formData = new AlipayFormData()
    formData.setMethod('get')
    formData.addField('appId','2021000117668415')
    formData.addField('charset','utf-8')
    formData.addField('signType','RSA2')
    formData.addField('bizContent',{
        outTradeNo: req.body.outTradeNo,
        productCode: 'FAST_INSTANT_TRADE_PAY',
        totalAmount: req.body.totalAmount,
        subject: req.body.subject,
        body: '新订单'
    })
    formData.addField('returnUrl', 'http://localhost:8080/checkorder')
    const result = await alipaySdk.exec(
        'alipay.trade.page.pay',
        {},
        { formData: formData }
    )
    // console.log(result)
    return res.json({ status: 200, info: '查询成功', result })
})

router.post('/checkTradeNo',async(req,res) => {
    let outTradeNo = req.body.tradeNo
    if (!outTradeNo) {
        return res.json({ status: -1, info: '支付查询需要订单号' })
    }
    const alipaySdk = new AlipaySdk({
        appId: '2021000117668415',
        privateKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/app_private_key.pem'), 'ascii'),
        signType: 'RSA2',
        alipayPublicKey: fs.readFileSync(path.join(__dirname, '../config/alipay_key/alipay_public_key.pem'), 'ascii'),
        gateway: 'https://openapi.alipaydev.com/gateway.do',
        timeout: 5000,
        camelcase: true
    })
    const formData = new AlipayFormData()
    formData.setMethod('get')
    formData.addField('appId','2021000117668415')
    formData.addField('charset','utf-8')
    formData.addField('signType','RSA2')
    formData.addField('bizContent',{
        outTradeNo: outTradeNo,
    })
    await alipaySdk.exec(
        'alipay.trade.query',
        {},
        { formData: formData }
    ).then(result => {
        if (result) {
            request(result, function(error,response,body){
                let obj = JSON.parse(body)
                let msg = getResponseMsg(obj)
                // console.log('[alipay.trade.query--msg]====>', msg)
                // console.log('[alipay.trade.query]====>', obj)
                if (!error && response.statusCode == 200) {
                    return res.json({ status: 200, info: '支付查询成功', obj})
                } else {
                    return res.json({ status: -1, info: `支付查询失败_2: ${error}` })
                }
            })
        } else {
            return res.json({ status: -1, info: `支付查询失败_1: ${result}` })
        }
    }).catch(err => {
        return res.json({ status: -1, info: `支付查询失败: ${err}` })
    })
})

module.exports = router