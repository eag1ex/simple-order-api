module.exports = ()=>{
    const store = require('./store.json')
    const { uid, notify,discountIt } = require('../utils')
    const {isEmpty,cloneDeep,reduce} = require('lodash') 
    return class Store {
        constructor(opts={}) {
            /**
             * [{
             *  name:'apples', discount:10
             * }]
             */
            this._offerSchema = opts.offerSchema || this.defaultOfferSchema
            this.applyDiscounts =opts.applyDiscounts || true 
            this.validOffer()
        }

        
        /**
         * our current shop
         * - items are already calculated and offerSchema is applied
         */
        get menu() {
            if(this._menu) return this._menu
            // assign {_id}
            const STORE = reduce(store,(n,el,k)=>{
                        n[k] = Object.assign({},el,{_id:uid(k)})
                        return n
            },{})
            this._menu = this.calc(STORE)
            /**
             * example output:
             * {
                soap: { _id: uid('soap'), lable: 'Soap', value: .65, info:'per item' }, // per item
                bread: { _id: uid('bread'), lable: 'Soap', value: .8, info:'per item' }, // per item
                milk: { _id: uid('milk'), lable: 'Milk', value: 1.3, info:'per item' }, // per item
                apples: { _id: uid('apples'), lable: 'Apples', value: 1, info:'per bag' }, // per bag
            }
             */
            return this._menu
        }
        
        get defaultOfferSchema(){
            return [{
                name:'apples', discount:10
            }]
        }
        
        /**
         * monitor purchase and apply disccount when condition meet
         */
        purchaseOffers(){

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


        get offerSchema(){
            return this._offerSchema || cloneDeep(this.defaultOfferSchema)
        }

       /**
        * calculate available discounts from `offerSchema`
        * @param {*} menu 
        */
        calc(menu={}){
            // do not calculate 
            if(!this.applyDiscounts ) return menu
            const _menu = {}  
            for (let [key, item] of Object.entries(menu)) { 
                // let {lable,value,_id} = item 
                this.offerSchema.reduce((n, el, i) => {                
                        if(key===el.name)  {
                            const origValue = item.value
                            item.value = discountIt(item.value,el.discount)
                            // check if disscount differs from original price 
                            if(origValue!==item.value ) item.discount = el.discount                  
                        }
                }, {})
                _menu[key] = item
            }
            return _menu
        }
        get currency() {
            return { name: 'USD', symbol: '$' }
        }
    }
}