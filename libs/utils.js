

const util = require('util')
const base64 = require('base-64')
const Buffer = require('buffer').Buffer
const color = require('bash-color')
const {isNumber,isObject,isArray, isFunction, isEmpty} = require('lodash')

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

/**
 * - accepting object of messages, example: `{'001':['SimpleOrder listStore is empty',001],...}`
 * - returns : {'001':{message,code},...}
 */
exports.errorMessages = (messages) => {
    const msgs = {}
    for (let [k, v] of Object.entries(messages)) {
        msgs[k] = { message: v[0], code: v[1] }
    }
    return msgs
}

exports.numDate = (num)=>{
    return new Date(Number(num)).getTime() >1
}

// accept query params with numbers only
exports.validEntry = (basket)=>{
    const isTrueObject = (o)=>!isArray(o) && isObject(o) && !isFunction(o)

    const updatedEntry = {}
    if(!isTrueObject(basket) || isEmpty(basket)){
        notify(`[validEntryValues] basket must be a valid object`,true)
        return null
    }

    for(let [key, value] of Object.entries(basket)){
        value = Number(value)
        // do not allow entries below 1, and not a number
        if (!isNumber(value) || value < 1 || isNaN(value)) {
            continue
        }
        updatedEntry[key] = value
    }

    if(isEmpty(updatedEntry)) return null
    return updatedEntry;
}


