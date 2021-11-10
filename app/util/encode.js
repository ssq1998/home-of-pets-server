//加密方法
function setEncode(str,salt=''){
    let arr = str.split('')
    let encodeArr = []
    let encodeStr = ''
    arr.forEach(item => {
        let encodeItem = ''

        if(item == 'a'){
            encodeItem = 'abc0'
        }else if(item == 'b'){
            encodeItem = 'bcd0'
        }else if(item == 'c'){
            encodeItem = 'cde0'
        }else if(item == 'd'){
            encodeItem = 'def0'
        }else if(item == 'e'){
            encodeItem = 'efg0'
        }else if(item == 'f'){
            encodeItem = 'fgh0'
        }else if(item == 'g'){
            encodeItem = 'ghi0'
        }else if(item == 'h'){
            encodeItem = 'hij0'
        }else if(item == 'i'){
            encodeItem = 'ijk0'
        }else if(item == 'j'){
            encodeItem = 'jkl0'
        }else if(item == 'k'){
            encodeItem = 'klm0'
        }else if(item == 'l'){
            encodeItem = 'lmn0'
        }else if(item == 'm'){
            encodeItem = 'mno0'
        }else if(item == 'n'){
            encodeItem = 'nop0'
        }else if(item == 'o'){
            encodeItem = 'opq0'
        }else if(item == 'p'){
            encodeItem = 'pqr0'
        }else if(item == 'q'){
            encodeItem = 'qrs0'
        }else if(item == 'r'){
            encodeItem = 'rst0'
        }else if(item == 's'){
            encodeItem = 'stu0'
        }else if(item == 't'){
            encodeItem = 'tuv0'
        }else if(item == 'u'){
            encodeItem = 'uvw0'
        }else if(item == 'v'){
            encodeItem = 'vwx0'
        }else if(item == 'w'){
            encodeItem = 'wxy0'
        }else if(item == 'x'){
            encodeItem = 'xyz0'
        }else if(item == 'y'){
            encodeItem = 'yza0'
        }else if(item == 'z'){
            encodeItem = 'zab0'
        }else if(item == '0'){
            encodeItem = '1230'
        }else if(item == '1'){
            encodeItem = '2340'
        }else if(item == '2'){
            encodeItem = '3450'
        }else if(item == '3'){
            encodeItem = '4560'
        }else if(item == '4'){
            encodeItem = '5670'
        }else if(item == '5'){
            encodeItem = '6780'
        }else if(item == '6'){
            encodeItem = '7890'
        }else if(item == '7'){
            encodeItem = '8900'
        }else if(item == '8'){
            encodeItem = '9010'
        }else if(item == '9'){
            encodeItem = '0120'
        }
        encodeArr.push(encodeItem)
    })
    encodeStr = encodeArr.join('')
    if(salt){
        let saltStr = encodeStr + salt
        console.log(saltStr)
        return saltStr
    }else{
        console.log(encodeStr)
        return encodeStr
    }
}
//解密方法
function contrast(reqCode,dataCode,salt){
    let reqStr = ''
    if(salt){
        reqStr = setEncode(reqCode,salt)
    }else{
        reqStr = setEncode(reqCode)
    }
    if(reqStr === dataCode){
        console.log('密码正确')
        return true
    }else{
        console.log('密码错误')
        return false
    }
}

module.exports = { setEncode, contrast }