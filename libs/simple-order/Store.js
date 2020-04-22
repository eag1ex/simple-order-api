module.exports = function(){
    
    //////////////////////
    // our available store
    const storeEntries = require('./store.json')
    const errorMessages = require('../errors')
    //////////////////////

    const { storeConfig, basketConfig, currency } = require('./config')
   
    const { uid, notify, discountIt,isType, trueObject } = require('../utils')
    const { isEmpty, cloneDeep, reduce} = require('lodash')
    return class Store {

        /**
         * @param opts.offerSchema # refer to default structure from `config.js`
         */
        constructor(opts = {}, debug) {
            this.lastStoreError = null // store our last store error
            this.debug = debug || null
            this._offerSchema = (opts ||{}).offerSchema || this.defaultOfferSchema
            this.applyDiscounts = (opts ||{}).applyDiscounts || true
            this.validOffer()        
        }




        /**
         * our current shop
         * - items are already calculated and offerSchema is applied
         */
        get menu() {
            this.lastStoreError = null
            if (this._menu) return this._menu
            try {
                reduce(this.storeEntries, (n, el, k) => {
                    n[k] = Object.assign({}, el, { _id: uid(k) })
                    return n
                }, {})
                this._menu = this.calc(cloneDeep(this.storeEntries))
            } catch (err) {
                notify({message:'store entry error',err},true)
            }


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

        get defaultOfferSchema() {
            return { store: storeConfig['store'], basket: basketConfig }
            // return {
            //     // global store discounts for each item
            //     store: [{
            //         name: 'apples', discount: 10
            //     }],
            //     /**
            //      * - offers for busket purchases
            //      * - current available offer conditions are set for 'soap', can be fount on `Basket.calculatePrice`
            //      * 
            //      * **/
            //     busket: {
            //         soap: {
            //             ref: 'soap', // identify each offer
            //             buyItems: 5, // if buyItems (val/100)*dis
            //             bread: { discount: 50 /**50% */ } // receive discount for bread
            //         }
            //     }
            // }
        }
        get offerSchema() {
            return this._offerSchema || cloneDeep(this.defaultOfferSchema)
        }

        get currency() {
            return currency
            //return { name: 'USD', symbol: '$' }
        }

        /**
         * - populate our store with valid entries from `store.json`
         */
        get storeEntries(){
            
            if(this._storeEntries) return this._storeEntries
            this._storeEntries = this.validStore()
            return this._storeEntries
        }

        /**
         * * check if the store is open
         */
        storeOpen(){
            try{
                this.validStore()
                this.lastStoreError = null
                return true
            }catch(err){
                notify(err,true)
                return null
            }
        }

        /**
         * - check `store.json` entries are valid
         */
        validStore(){

            const throwError = ()=>{
                this.lastStoreError = errorMessages['006'].message ///'Sorry, our store is out of stock!'
                throw('ups, your store.json is either empty or has invalid items')
            }
            if(isEmpty(storeEntries) || !trueObject(storeEntries)) throwError()
            
            const entries = {}
            for(let [key,item] of Object.entries(storeEntries)){
                    if(key.toString().length<2) {
                        notify(`[validStore], your store entry for ${key} is too short`,0)
                        continue
                    }

                    // test minimum required props
                    if(isType(item.value)!=='number'){
                        notify(`[validStore], your store entry for ${key} / value doesnt exist or is not a number`,true)
                        continue
                    }
                    if(item.label!==undefined && isType(item.label)!=='string'){
                        notify(`[validStore], your store entry for ${key} / label must be a string`,true)
                        continue
                    }

                    if(item.info!==undefined && isType(item.info)!=='string'){
                        notify(`[validStore], your store entry for ${key} / info must be a string`,true)
                        continue
                    }

                    if(item.discount!==undefined && isType(item.discount)!=='number'){
                        notify(`[validStore], your store entry for ${key} / discount must be a number`,true)
                        continue
                    }
                    /// we are good here
                    entries[key] = item;
            }

            if(!trueObject(entries)){
                ///'Sorry, our store is out of stock!'
               throwError()
            }
            return entries

        }

        /**
         * validate the provided offerSchema properties
         */
        validOffer() {
            try {
                if (!isEmpty(this.offerSchema['store']) && !this.offerSchema['store'].length) {
                    throw ('error')
                }
            } catch (err) {
                notify(`provided opts/haveOffers must be an array`, true)
                return false
            }
            const isValid = () => {
                // test our props match
                let ok = null
                const stor = this.offerSchema['store']
                for (let i = 0; i < stor.length; i++) {
                    const offer = stor[i]
                    const keys = Object.keys(this.defaultOfferSchema['store'][0])
                    const valid = keys.filter(z => offer[z] !== undefined)
                    ok = valid.length === keys.length
                }
                return ok
            }
            if (!isValid()) throw (' your offer schema setting is invalid')
            return true
        }


        /**
         * calculate available discounts from `offerSchema`
         * @param {*} menu 
         */
        calc(menu = {}) {
            // do not calculate 
            if (!this.applyDiscounts) return menu
            const _menu = {}
            for (let [key, item] of Object.entries(menu)) {
                // let {lable,value,_id} = item 
                this.offerSchema['store'].reduce((n, el, i) => {
                    if (key === el.name) {
                        const origValue = item.value
                        item.value = discountIt(item.value, el.discount)
                        // check if disscount differs from original price 
                        if (origValue !== item.value) item.discount = el.discount
                    }
                }, {})
                _menu[key] = item
            }
            return _menu
        }
    }
}