`use strict`

/**
 *   Micro Service
 * * Basket:  generate Basket model for calculating orders
 * - Each Basket is generated for each order over and over, the `Store` settings are imported via `SimpleOrder`
 * - You can create new offers depending on the items in store and the offers, the logic for this is in `checkBasketOffers()`
 * 
 * example:
 `
            const b = new Basket(id, menu, basketOffers, debug)
            const o = b.set(order)
                        .get().data 
            // user operators            
            o.getDisccounts() // returns max aplied discount amount of all items
            o.priceDifference() // returns percentage from tota and subtotal > amount of disscount applied
            o.getOffers() // returns applied offers to the current basket, or default message 
            o.subtotal() // initial price before any discount applied
            o.total() // price after discount applied
 `
 * 
 */
module.exports = function(){
    const { isEmpty, isString,reduce,cloneDeep,isNumber,isNaN,isArray } = require('lodash')
    const { notify, discountIt, trueObject } = require('../utils')
    return class Basket {
        /**
         * 
         * @param {*} id 
         * @param {*} store # calculated / valid Store menu 
         * @param {*} basketOffers # optional offers if any, default `basketOffers` is imported from `./simple-order/config.js`
         * @param {*} debug :)
         */
        constructor(id, store = {}, basketOffers=null, debug) {
            if (isEmpty(store)) throw ('store cannot be empty')
            if (!trueObject(store)) throw ('store must be an object')
            if (basketOffers && !isArray(basketOffers)) throw ('basketOffers must be an array[...], refer to defaultOffers')
            if (!(id.toString())) throw ('id must be set')
            this.debug = debug
            this.data = null // dynamicly changing data access variable
            this.id = id.toString();
            this.basketOffers = basketOffers || this.defaultOffers ||[]
            this.store = store
            this.baskets = {} // generate baskets and assign purchase offers
            this._baskets = {}
            this.basketErrors = [/**{name,message:msg} */] // store generated errors //
        }


        // SECTION  user calling methods

        /**
         * @param {*} value provide value agains our id
         * - generates new basket getter/setter and sets new values
         */
        set(value) {
            this.data = null
            this.genBasket()

            if (!this.baskets[this.id]) {
                notify(`[item] basket ${id} does not exist, see the store for avialable lists`, true)
                return null
            }

            this.baskets[this.id]['basket'] = value
            return this
        }
        
        /**
         * @param {*} id optional id, using global this.id
         * return with `this.data`
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
                const findOffers = (name) => {
                    return cloneDeep(this.basketOffers).map(z => {
                        if (z[name] !== undefined) return z[name].message
                    }).filter(z => !!z)
                }

                // only including offers not store discounts
                for (let [k, item] of Object.entries(basket)) {
                    if (item.metadata.offer !== undefined) {
                        const found = findOffers(k)
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
         * - we calculate subtotal against the `_oldValue` if exists, set in Store initially
         */
        subtotal(){
            if(!this.id) return null
            let sub = 0
            const basket = this.baskets[this.id]['basket']
            
            for (let [k,item] of Object.entries(basket)){
                // get initial price from before discount was set in the store
                let metaValue
                if(item.metadata.discount!==undefined && item.metadata._oldValue!==undefined){
                    metaValue = item.metadata._oldValue
                }else metaValue  = item.metadata.value
                sub = sub + (metaValue) * item.purchase
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
            return [
                {   // offer
                    'bread': {
                        // when you purchase
                        when: 'soup', purchase: 2,
                        // you receive
                        discount: 50,
                        //coupon:'124sdf46', TODO alternativly when apply coupon you also receive discount 
                        message: 'Buy 2 or more tins of soup and get a loaf of bread for half price'
                    }
                }
               //,... 
            ]
        }

        
        /**
         * - update and return new item if there are offers
         * - once offer is available, also create price in the item
         * - add `_oldValue` to offer item so we can calculate `subtotal`
         * @param {*} k 
         * @param {*} itm 
         * @param {*} al 
         */
        checkBasketOffers(k,itm,al){

            /**
             * // offer structure
                [
                        {   // offer
                            'bread': {
                                // when you purchase
                                when: 'soup', purchase: 2,
                                // you receive
                                discount: 50,
                                //coupon:'124sdf46', TODO alternativly when apply coupon you also receive discount 
                                message: 'Buy 2 or more tins of soup and get a loaf of bread for half price'
                            }
                        }
                    //,... 
            ]
             */       
            const offerConditions = (offer)=>{
                return offer
            }

            const checkOffers = (key, all) => {

                return cloneDeep(this.basketOffers).map(z => {
                     const offer = z[key]
                     if(!offer) return null
                     const when = all[(offer || {}).when]              
                     if(when===undefined) return null

                     // SECTION 
                     // when offer match our basket 
                     // return the offer
                    // console.log('what is offer',offer.purchase)
                     if (when.purchase >= offer.purchase) {                    
                         return offerConditions(offer)
                     }
                     // !SECTION 


                     else return null
                 }).filter(z=>!!z) [0] || null // there should only be 1 offer per item, for now
             }

             const updateProduct = (kk,item, offer)=>{               
                 if(offer===null)  return null
                 item['metadata']['discount'] = offer['discount']
                 item['metadata']['offer'] = true //offer.message;

                 // update initial value to discount value and add `_oldValue` to basket item
                 const _oldValue =  item['metadata']['value']
                 item['metadata']['value'] = discountIt(_oldValue, offer['discount'])
                 if(_oldValue!==item['metadata']['value']) item['metadata']['_oldValue'] = _oldValue
                 item = this.applyPrice(item)

                 if(this.debug) notify(`special offer/discounts applied for ${kk}`)
                 return item
             }
             // if there are offers update and return new item
             return updateProduct(k,itm,checkOffers(k,al))
        }

        
        /**
         * @param {*} k basket key
         * @param {*} basket property value
         */
        calculatePrice(basket = {}, id) {
            if (!basket) throw ('basket must be set')



            try {
                reduce(basket, (n, item, k, all) => {

                    const itemWitOffer = this.checkBasketOffers(k, item, all)
                    if (itemWitOffer) item = itemWitOffer
 
                    if (item.price !== undefined) return n
                    n[k] = this.applyPrice(item)

                    return n
                }, {})
            } catch (err) {
                notify({ message: 'reduce error', err }, true)
            }
            return basket
        }

        isBasketItem(item){
            if(!trueObject(item)) return null
            if(item['metadata'] && item.purchase!==undefined) return true
            return false
        }

        /**
         * - update basket item with new price property
         * @param {*} item # basket item
         */
        applyPrice(item){
            if(!this.isBasketItem(item)){
                const msg = `[applyPrice] cannot price the item because it does not exist`
                this.basketErrors.push({name,message:msg})
                throw(msg)
            }
            const initialPrice = item.purchase * item['metadata'].value
            item.price = Number(parseFloat(initialPrice).toFixed(2)); 
            return item
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

                            if(self.debug) notify(`basket id:${self.id} updated`)
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
         * - reconstruct basket to include Store metadata
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