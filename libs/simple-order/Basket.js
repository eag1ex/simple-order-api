

/**
 * * Basket
 * - generate Basket model for calculating orders
 */
module.exports = () => {
    const { isEmpty, isString,reduce,cloneDeep } = require('lodash')
    const { notify, discountIt } = require('../utils')
    return class Basket {
        constructor(id, store = {}, offers, debug) {
            if (isEmpty(store)) throw ('store cannot be empty')
            if (!Object.entries(store).length) throw ('store must be an object')
            if (offers) {
                if (!Object.entries(offers).length) throw ('offers must be an object, refer to defaultOffers')
            }
            if (!(id.toString())) throw ('id must be set')
            this.debug = debug
            this.id = id.toString();
            this.offers = offers || this.defaultOffers
            this.store = store
            this.baskets = {} // generate baskets and assign purchase offers
            this._baskets = {}
            this.genBasket()
        }


        /**
         * @param {*} value provide value agains our id
         */
        set(value) {
            this.genBasket()

            if (!this.baskets[this.id]) {
                notify(`[item] busket ${id} does not exist, see the store for avialable lists`, true)
                return null
            }

            this.baskets[this.id]['basket'] = value
            return this
        }
        
        /**
         * @param {*} id optional id, using global this.id
         */
        get(id = '') {
            if(!id) id = this.id
            if (!id || !isString(id)) {
                notify(`invalid name`)
                return null
            }
            return this.baskets[id]['basket']
        }

        
        get config() {
            return {
                configurable: true,
                enumerable: true
            }
        }
        
        /**
         * when offers are not set we will default to these offers
         */
        get defaultOffers() {
            return {
                // Buy 2 tins of soup and get a loaf of bread for half price
                // offer only applies when you buy `bread`
                soap: {
                    ref:'soap', // identify each offer
                    buyItems: 5, // if buyItems (val/100)*dis
                    bread: { discount: 50 /**50% */ } // receive discount for bread
                }
            }
        }
        /**
         * 
         * @params {*} { name, item } name: example `soap`, item: is the items basket values
         * @param {*} offers # available offers if, must return object, example:{discount}
         */
        priceItem({ name, item }, offers = null) {
            if(!this.store[name]) {
                notify(`[priceItem] cannot price the item because it does not exist`, 0)
                return null
            }
            // NOTE in case we have discount set directly on the store, use that
            const { value, discount } = this.store[name] || {}
            const { purchase,metadata } = item

            if(!metadata) throw('metadata is not available on priceItem')
            // returns  {discount} or null
            const getOffers = () => {
                return isEmpty(offers) ? null : offers
            }
            
            /**
             * if store has discount use that, else check available discounts, or apply `0`
             */
            const calcPrice = (cb) => {
                const hasDiscount = getOffers() ? getOffers().discount : discount||0   
                if(discount>0) {
                    // update metadata for the item
                    if(typeof cb==='function') cb()
                }   
                const initialPrice = purchase * value
                const totalPrice = discountIt(initialPrice, hasDiscount)
                
                return totalPrice
            }
            // add decimal points
            const newPrice = calcPrice(d=>{
                item['metadata']['discount'] =discount
                if(this.debug) notify({message:'applying store/global discounts', name, discount, id})    
            })
            item.price = Number(parseFloat(calcPrice()).toFixed(2)); 

            
            return item
        }
        /**
         * @param {*} k basket key
         * @param {*} basket property value
         * - example:
         *   `
               { soap:
                     purchase: 2,
                     metadata: { lable: 'Soap', info: 'per item', _id: 'c29hcA' } 
                }`
         */
        calculatePrice(basket = {}, id) {
            if (!basket) throw ('basket must be set')
            /**
             * identify what offer and do custom munipulation
             * - also updates the `all` object state
             *  */
            const offers = (key, purchase, allBskt) => {

                const { buyItems, bread, ref } = this.offers[key] || {}
                if (!ref) return null
                let applied = null
                switch (key) {
                    ///////////// soap offer
                    case 'soap':
                        if (purchase >= buyItems && allBskt['bread']) {
                            try {
                                console.log('')
                                const { price, metadata } = this.priceItem({ name: 'bread', item: allBskt['bread'] }, bread)
                                if(!metadata)  throw('metadata is not available on priceItem')
                                // check if store has global discount and use that instead
                                const discount = metadata.discount!==undefined ? metadata.discount:bread.discount

                                allBskt['bread']['price'] = price
                                allBskt['bread']['metadata'].discount = discount
                                notify({ message: `discount applied for bread`, bread: allBskt['bread'], id })
                                applied = true
                            } catch (err) {
                                notify({message:"[calculatePrice] error",err},true)
                            }

                        }
                        break
                    default:
                        applied = false
                    // no offer    
                }
                return applied
            }

            try {
                reduce(basket, (n, item, k, all) => {
                    const ofr = offers(k, item.purchase, all)

                    if (item.price !== undefined) return n
                    const { price, metadata } = this.priceItem({ name: k, item })
                    n[k] = {
                        ...item,
                        ...metadata,
                        price
                    }

                    return n
                }, {})
            } catch (err) {
                notify({ message: 'reduce error', err }, true)
            }


            return basket
        }


        /**
         * - initialize baskes with setter/getter to make dynamic adjustments
         */
        genBasket() {
            const self = this
            try {
                if (this.baskets[this.id]) return;
                this.baskets[this.id] = Object.create({}, {
                    basket: {
                        ...this.config,
                        get: function () {
                            return self._baskets[self.id]
                        },

                        set: function (v) {
                            if (self._baskets[self.id] === undefined) self._baskets[self.id] = null
                            if (!Object.entries(v).length) {
                                notify(`your baskets ${v} must be an object`, 0)
                                return
                            }
                            // set our offers here, every time there is change in the basket, nice!
                          

                            v = self.validEntryValues(v)  // check item entries
                            if(!v) return

                            v = self.withStoreMetadata(v,self.id)
                            v = self.calculatePrice(v, self.id) // and existing offers                       

                            notify(`busket id:${self.id} updated`)
                            self._baskets[self.id] = v
                        }
                    }
                })

            } catch (err) {
                console.log(err)
            }

            return this
        }

        /**
         * - reconstruct busket to include Store metadata
        * @param {*} basket
        */
        withStoreMetadata(basket,id){
            const n={}
            const storeCopy = cloneDeep(this.store)

            for(let [key,value] of Object.entries(basket)){
                    if(storeCopy[key]){
                        delete storeCopy.value // delete original value before any offers
                        n[key] = {
                            purchase:value,
                            metadata:storeCopy[key]                          
                        }
                    }
                    else notify({message:`[setMetadata] ups, this item: ${key} does not exist in our store`, id},0)
            }
            return n          
        }

        
        /**
         * - check that we have valid entries for our store, so only those can be accepted
         * @param {*} v 
         */
        validEntryValues(basket={}){
            const updatedEntry = {}
            for(let [key, value] of Object.entries(basket)){
                if(!this.store[key]){
                    notify(`sorry we dont have item: ${key} in our store `,0)
                    continue
                }
                updatedEntry[key] = value
            }
            if(isEmpty(updatedEntry)) return null
            return updatedEntry;
        }

    }
}