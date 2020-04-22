

const util = require('util')
const base64 = require('base-64')
const Buffer = require('buffer').Buffer
const color = require('bash-color')
const {isNumber,isObject,isArray, isFunction} = require('lodash')
/**
 * @prop {*} l any data to print
 * @prop {*} err display as error if set to true
 */
exports.notify = (l = null, err = false) => {
    if (err === 0) {
        console.log('  ')
        console.log(util.inspect(l, false, null, true), (color.yellow('WARNING', true))) 
        console.log(color.yellow('-----------------------', true))
        console.log('  ')
        return
    }
    if (err === true || err === 1) {
        console.log('  ')
        console.log(util.inspect(l, false, null, true), (color.red('ERROR', true)))
        console.log(color.red('-----------------------', true))
        console.log('  ')
    } else {

        console.log(util.inspect(l, false, null, true))
        console.log(color.blue('----'))
    }
}

exports.uid = (str) => {
    if (!str) throw('must provide str')
    str = str.trim().replace(/\s/g, '')
    str = str.replace('.', '')
    str = str.replace('-', '')
    var ref = base64.encode(Buffer.from(str))
    return ref.replace(/=/g, '')
}

exports.timestamp = ()=>{
    return new Date().getTime()
}

exports.isType = (value)=>{
    return typeof value
}

exports.trueObject = (value)=>{
    return !isArray(value) && isObject(value) && !isFunction(value)
}

exports.discountIt = (val=0, discount=0)=>{
    if(!isNumber(val) || !isNumber(discount)) throw('discount props must be numbers!')
    const dcVal =  (val/100) * discount
    return  val - dcVal
}