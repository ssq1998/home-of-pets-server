const express = require('express')
const router = express.Router()
const fs = require('fs')
const SparkMD5 = require('spark-md5')

const multiparty = require("multiparty"),
    uploadDir = `${__dirname}/upload`;

function handleMultiparty(req, res, temp) {
    return new Promise((resolve, reject) => {
        // multiparty的配置
        let options = {
            maxFieldsSize: 200 * 1024 * 1024
        };
        !temp ? options.uploadDir = uploadDir : null;
        let form = new multiparty.Form(options);
        // multiparty解析
        form.parse(req, function (err, fields, files) {
            if (err) {
                res.send({
                    code: 1,
                    reason: err
                });
                reject(err);
                return;
            }
            resolve({
                fields,
                files
            });
        });
    });
}

// 上传BASE64
router.post('/uploadPic', (req, res) => {
    let {
        chunk,
        filename
    } = req.body;

    // chunk的处理：转换为buffer
    chunk = decodeURIComponent(chunk);
    chunk = chunk.replace(/^data:image\/\w+;base64,/, "");
    chunk = Buffer.from(chunk, 'base64');

    // 存储文件到服务器
    let spark = new SparkMD5.ArrayBuffer(),
        suffix = /\.([0-9a-zA-Z]+)$/.exec(filename)[1],
        path;
    spark.append(chunk);
    path = `${uploadDir}/${spark.end()}.${suffix}`;
    fs.writeFileSync(path, chunk);
    res.send({
        code: 0,
        originalFilename: filename,
        path: path.replace(__dirname, `http://127.0.0.1:3000`)
    });
})

// 切片上传 && 合并
router.post('/uploadVideo', async (req, res) => {
    let {
        fields,
        files
    } = await handleMultiparty(req, res, true);

    let [chunk] = files.chunk,
        [filename] = fields.filename;
    let hash = /([0-9a-zA-Z]+)_\d+/.exec(filename)[1],
        // suffix = /\.([0-9a-zA-Z]+)$/.exec(file.name)[1],
        path = `${uploadDir}/${hash}`;
    !fs.existsSync(path) ? fs.mkdirSync(path) : null;
    path = `${path}/${filename}`;
    fs.access(path, async err => {
        // 存在的则不再进行任何的处理
        if (!err) {
            res.send({
                code: 0,
                path: path.replace(__dirname, `http://127.0.0.1:3000`)
            });
            return;
        }

        // 为了测试出效果，延迟1秒钟
        await new Promise(resolve => {
            setTimeout(_ => {
                resolve();
            }, 200);
        });

        // 不存在的再创建
        let readStream = fs.createReadStream(chunk.path),
            writeStream = fs.createWriteStream(path);
        readStream.pipe(writeStream);
        readStream.on('end', function () {
            fs.unlinkSync(chunk.path);
            res.send({
                code: 0,
                path: path.replace(__dirname, `http://127.0.0.1:3000`)
            });
        });
    });
});

router.get('/mergeVideo', (req, res) => {
    let {
        hash
    } = req.query;

    let path = `${uploadDir}/${hash}`,
        fileList = fs.readdirSync(path),
        suffix;
    fileList.sort((a, b) => {
        let reg = /_(\d+)/;
        return reg.exec(a)[1] - reg.exec(b)[1];
    }).forEach(item => {
        !suffix ? suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1] : null;
        fs.appendFileSync(`${uploadDir}/${hash}.${suffix}`, fs.readFileSync(`${path}/${item}`));
        fs.unlinkSync(`${path}/${item}`);
    });
    fs.rmdirSync(path);
    res.send({
        code: 0,
        path: `http://127.0.0.1:3000/upload/${hash}.${suffix}`
    });
});

module.exports = router