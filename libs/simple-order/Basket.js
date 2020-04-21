

/**
 * * Basket
 * - generate Basket model for calculating orders
 */
module.exports = () => {
    const { isEmpty, isString,reduce } = require('lodash')
    const { notify, discount } = require('../utils')
    return class Basket {
        constructor(id, store = {}, offers) {
            if (isEmpty(store)) throw ('store cannot be empty')
            if (!Object.entries(store).length) throw ('store must be an object')
            if (offers) {
                if (!Object.entries(offers).length) throw ('offers must be an object, refer to defaultOffers')
            }
            if (!(id.toString())) throw ('id must be set')
            this.id = id.toString();
            this.offers = offers || this.defaultOffers
            this.store = store
            this.baskets = {} // generate baskets and assign purchase offers
            this._baskets = {}
            this.genBasket()
        }

        /**
         * @param {*} k basket key
         * @param {*} basket property value
         */
        setOffers(basket = {}, id) {
            if (!basket) throw ('basket must be set')

            /**
             * identify what offer and do custom munipulation
             *  */
            const offers = (key, value, bskt, done) => {

                const { buyItems, bread, ref } = this.offers[key] || {}
                if (!ref) return null
                let applied = null
                switch (key) {
                    ///////////// soap offer
                    case 'soap':
                        if (value >= buyItems && bskt['bread']) {
                            bskt['bread'] = discount(bskt['bread'], bread.discount)
                            notify({ message: `discount applied for bread`, bread: bskt['bread'] })
                            applied = true
                            done(bskt)
                        }
                        break
                    default:
                        applied = false
                    // no offer    
                }
                return applied
            }

            return reduce(basket, (n, value, k, all) => {

                const ofr = offers(k, value, all, nAll => all = nAll)
                if (ofr === null) return n
                else n[k] = value

                return n
            }, {})

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
                    buyItems: 2, // if buyItems (val/100)*dis
                    bread: { discount: 50 /**50% */ } // receive discount for bread
                }
            }
        }

        get config() {
            return {
                configurable: true,
                enumerable: true
            }
        }
        /**
         * - initialize baskes with setter/getter to make dynamic adjustments
         */
        genBasket() {
            const self = this
            try {
                if (this.baskets[this.id]) return;
                // for (let k in this.store) {
                //     if (this.baskets[k]) continue;

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
                          

                            v = self.validEntryValues(v)
                            if(!v) return
                            console.log('setOffers',self.setOffers(v))
                            // if(self.defaultOffers[k]){

                            // }
                            // check item entries
                          
                            // this.offers

                            console.log('(genBaskets) what is id', self.id)
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
         * get 
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