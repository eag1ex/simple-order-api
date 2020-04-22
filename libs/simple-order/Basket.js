

/**
 * * Basket
 * - generate Basket model for calculating orders
 */
module.exports = function(){
    const { isEmpty, isString,reduce,cloneDeep,isNumber,isNaN } = require('lodash')
    const { notify, discountIt, trueObject } = require('../utils')
    return class Basket {
        constructor(id, store = {}, offers=null, debug) {
            if (isEmpty(store)) throw ('store cannot be empty')
            if (!trueObject(store)) throw ('store must be an object')
            if (offers && !trueObject(offers)) throw ('offers must be an object, refer to defaultOffers')
            if (!(id.toString())) throw ('id must be set')
            this.debug = debug
            this.data = null // dynamicly changing data access variable
            this.id = id.toString();
            this.offers = offers || this.defaultOffers

            this.store = store
            this.baskets = {} // generate baskets and assign purchase offers
            this._baskets = {}
            this.genBasket()
            this.basketErrors = [/**{name,message:msg} */] // store generated errors //
        }


        // SECTION  user calling methods

        /**
         * @param {*} value provide value agains our id
         */
        set(value) {
            this.data = null
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
            this.data = null
            if(!id) id = this.id
            if (!id || !isString(id)) {
                notify(`invalid name`,0)
                return null
            }
            this.data = this.baskets[id]['basket']
            return this
        }

        /**
         * - search thru basket to see if any discounts have been applied
         * - ignore discounts that came thru special offers, as per `./config.js`
         */
        getDisccounts() {
            if (!this.id) return null
            const basket = this.baskets[this.id]['basket']
            const discounts = []
            try {
                // grab all applied discounts
                // not including offers, just store discounts
                for (let [k, item] of Object.entries(basket)) {
                    if (item.metadata.discount !== undefined && item.metadata.offer===undefined) discounts.push(item.metadata.discount)

                }
            } catch (err) {
                notify(err, true)
            }
            // grab all applied 
            if (!discounts.length) return null

            // get the highest discount applied
            return  Math.max.apply(null, discounts)
        }

        /**
         * - compare subtotal and total to get differance
         */
        priceDifference() {
            if (!this.id) return null

            let total = this.total()
            let sub = this.subtotal()

            function diff(sub, total) {
                return 100 * Math.abs((sub - total) / ((sub + total) / 2));
            }

            const df = diff(sub, total)
            return Number(parseFloat(df).toFixed(2));
        }

        /**
         * - check available offers, search thru each ready basket and match by `offers...{ref}`
         * - ignore global store discounts as per `./config.js`
         * - when no offers available set different message
         */   
        getOffers() {
            if (!this.id) return null
            let sub = 0
            const basket = this.baskets[this.id]['basket']
            let offers = []

            try {
                /**
                 * - search thru entire offers until we find matching ref
                 * @param {*} ref 
                 */
                const findRef = (ref) => {
                    const refs = []
                    for (let [k, promo] of Object.entries(this.offers)) {
                        if (promo.ref === ref) refs.push({ ref, message: promo.message })
                    }
                    return refs
                }

                // only including offers not store discounts
                for (let [k, item] of Object.entries(basket)) {
                    if (item.metadata.offer !== undefined && item.metadata.discount!==undefined) {
                        const found = findRef(item.metadata.offer)
                        if (found.length) offers = [].concat(offers, found)

                    }
                }
            } catch (err) {
                notify(err, true)
            }
            const o = offers.filter(z => !!z)
            if (!o.length) return "No offers available"
            return o
        }
        /**
         * - get subtotal before any discount
         */
        subtotal(){
            if(!this.id) return null
            let sub = 0
            const basket = this.baskets[this.id]['basket']
            
            for (let [k,item] of Object.entries(basket)){
                console.log()
                sub = sub + (item.metadata.value) * item.purchase
            }
            if(sub>=0) return Number(parseFloat(sub).toFixed(2));         
            else{
                if(this.debug) notify(`[subtotal] ups your subtotal is wrong..`,true)
                return 0
            }
           
        }

        /**
         * - get total after any offer/discount applied
         */
        total(){    
            if(!this.id) return null
            const basket = this.baskets[this.id]['basket']
            let total = 0
            for (let [k,item] of Object.entries(basket)){
                total = total + item.price
            }
            if(total>=0) return Number(parseFloat(total).toFixed(2));         
            else{
                if(this.debug) notify(`[total] ups your total is wrong..`,true)
                return 0
            }
        }
        // SECTION  user calling methods

        
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
                soup: {
                    message:'Buy 2 or more tins of soup and get a loaf of bread for half price',
                    ref:'soupSpecial', // identify each offer
                    buyItems: 5, // if buyItems (val/100)*dis
                    bread: { discount: 50 /**50% */ } // receive discount for bread
                }
            }
        }
        /**
         * 
         * @params {*} { name, item } name: example `soup`, item: is the items basket values
         * @param {*} offers # available offers if, must return object, example:{discount}
         */
        priceItem({ name, item }, offers = null) {
            if(!this.store[name]) {
                const msg = `[priceItem] cannot price the item because it does not exist`
                notify(msg, 0)
                this.basketErrors.push({name,message:msg})
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
                 if(this.debug) notify({message:'applying store/global discounts', name, discount, id:this.id})    
            })    
            item.price = Number(parseFloat(newPrice).toFixed(2)); 

            
            return item
        }
        /**
         * @param {*} k basket key
         * @param {*} basket property value
         * - example:
         *   `
               { soup:
                     purchase: 2,
                     metadata: { lable: 'Soup', info: 'per item', _id: 'c29hcA' } 
                }`
         */
        calculatePrice(basket = {}, id) {
            if (!basket) throw ('basket must be set')
            /**
             * identify what offer and do custom munipulation
             * - also updates the `all` object state
             *  */
            const offers = (key, purchase, allBskt) => {

                let applied = null
                const { buyItems, bread, ref } = this.offers[key] || {}

                if (!ref)return null // no offers availeble            
                
                switch (key) {
                    ///////////// soup offer conditions
                    case 'soup':
                        if (purchase >= buyItems && allBskt['bread']) {
                            try {
                                console.log('')
                                const { price, metadata } = this.priceItem({ name: 'bread', item: allBskt['bread'] }, bread)
                                if(!metadata)  throw('metadata is not available on priceItem')
                                // check if store has global discount and use that instead
                                const discount = metadata.discount!==undefined ? metadata.discount:bread.discount

                                allBskt['bread']['price'] = price
                                allBskt['bread']['metadata'].discount = discount
                                allBskt['bread']['metadata'].offer = ref
                                notify({ message: `discount applied for bread`, bread: allBskt['bread'], id })
                                applied = true
                            } catch (err) {
                                notify({message:"[calculatePrice] error",err},true)
                            }

                        }
                        break
                    default:
                            notify(`[calculatePrice] Sorry, no offer conditions available for ${key}`,0)    
                        applied = false
                    // no offer    
                }
                return applied
            }

            try {
                reduce(basket, (n, item, k, all) => {
                    
                    offers(k, item.purchase, all)

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
                            if ( !trueObject(v)) {
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
            if(!trueObject(basket)){
                notify(`[validEntryValues] basket must be a valid object`,true)
                return null
            }
            for(let [key, value] of Object.entries(basket)){

                value = Number(value)
                // do not allow entries below 1, and not a number
                if (!isNumber(value) || value < 1 || isNaN(value)) {
                    if(this.debug) notify(`[validEntryValues] name: ${key} values below 1 are ignored`,0)
                    continue
                }

                if(!this.store[key]){
                    const msg = `sorry we dont have item: ${key} in our store`
                    notify(msg,0)
                    this.basketErrors.push({name:key,message:msg})
                    continue
                }
                updatedEntry[key] = value
            }
            if(isEmpty(updatedEntry)) return null
            return updatedEntry;
        }

    }
}