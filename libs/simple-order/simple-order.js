/**
 * The goods that can be purchased, which are all priced in $, are:

Soup – 65p per tin
Bread – 80p per loaf
Milk – $1.30 per bottle
Apples – $1.00 per bag
Current special offers are:

Apples have 10% off their normal price this week
Buy 2 tins of soup and get a loaf of bread for half price
The program should accept a list of items (with a date) in the basket and output the subtotal, the special offer discounts and the final price.
 */


module.exports = () => {
    const { uid, notify } = require('../utils')
    const {isNumber,isEmpty,cloneDeep,reduce} = require('lodash') 
    class Shop {
        constructor(opts={}) {
            /**
             * [{
             *  name:'apples', discount:10
             * }]
             */
            this._offerSchema = opts.offerSchema || null
            this.validOffer()
        }
        
        /**
         * validate the provided offerSchema properties
         */
        validOffer() {
            try {
                if (!isEmpty(this._offerSchema) && !this._offerSchema.length) {
                    throw('error')
                }
            } catch (err) {
                notify(`provided opts/haveOffers must be an array`,true)
                return false
            }
            const isValid = ()=>{
                // test our props match
                let ok = null
                for(let i = 0; i< this._offerSchema.length; i++){
                    const offer = this._offerSchema[i]
                    const keys = Object.keys(this.defaultOfferSchema[0])
                    const valid = keys.filter(z=> offer[z]!==undefined)
                    ok = valid.length === keys.length
                }
                return ok
            }
            if(!isValid()) throw(' your offer schema setting is invalid')
            return true          
        }

        get defaultOfferSchema(){
            return [{
                name:'apples', discount:0
            }]
        }

        get offerSchema(){
            return this._offerSchema || cloneDeep(this.defaultOfferSchema)
        }

       /**
        * calculate available discounts from `offerSchema`
        * @param {*} menu 
        */
        calc(menu={}){

            const c = (val, dis)=> (val / dis) * 100 
            const _menu = {}
            for (let [key, value] of Object.entries(menu)) {
                
                this.offerSchema.reduce((n, el, i) => {
                        if(key===el.name) value = c(value,el.discount)
                }, {})
                _menu[key] =value
            }
            return _menu
        }

        get currency() {
            return { name: 'USD', symbol: '$' }
        }



        // offers({keyName, value}){
        //     if(!keyName) throw('must provide item menu keyName')
        //     if(!isNumber(value))  throw('must provide item value number')
            
        //     const o = {
        //         // 50*10/100   (value*procent / 100%)
        //         apples:{discount: (value / 100) * 10000}
        //     }

        //     return o[keyName]
        // }

        /**
         * our current shop
         * - items are already calculated and offerSchema is applied
         */
        get menu() {
            if(this._menu) return this._menu
            this._menu = this.calc({
                soap: { _id: uid('soap'), lable: 'Soap', value: .65 },
                bread: { _id: uid('soap'), lable: 'Soap', value: .8 },
                milk: { _id: uid('soap'), lable: 'Milk', value: 1.3 },
                apples: { _id: uid('soap'), lable: 'Apples', value: 1 },
            })
            return this._menu
        }
    }
    return class SimpleOrder {
        constructor() {

        }
    }
}