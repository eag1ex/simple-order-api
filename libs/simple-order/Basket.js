

/**
 * * Basket
 * - generate Basket model for calculating orders
 */
module.exports = () => {
    const {isEmpty,isString} = require('lodash') 
    const { notify,discount } = require('../utils')
    return class Basket {
        constructor(store = {}, offers) {
            if (isEmpty(store)) throw ('store cannot be empty')
            if(!Object.entries(store).length) throw ('store must be an object')
            if(offers){
                if(!Object.entries(offers).length)throw ('offers must be an object, refer to defaultOffers')
            } 
            this.offers = offers || this.defaultOffers
            this.store = store
            this.baskets = {} // generate baskets and assign purchase offers
            this._baskets = {}
            this.genBaskets()
        }
        
        /**
         * @param {*} k basket key
         * @param {*} v basket property value
         */
        setOffers(key,v){
            if(!key) throw('key must be set')

            /// identify what offer and do custom munipulation
            if(this.offers[key] && key==='soap'){

            }
            
        }

        /**
         * when offers are not set we will default to these offers
         */
        get defaultOffers(){
            return{
                // Buy 2 tins of soup and get a loaf of bread for half price
                // offer only applies when you buy `bread`
                soap:{buyItems:2, // if buyItems (val/100)*dis
                      bread:{disccount:50 /**50% */} // receive discount for bread
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
        genBaskets() {
            const self = this
            try {
                for (let k in this.store) {
                    if (this.baskets[k]) continue;

                    this.baskets[k] = Object.create({}, {
                        basket: {
                            ...this.config,
                            get: function () {
                                return self._baskets[k]
                            },
                            set: function (v) {
                                if (self._baskets[k] === undefined) self._baskets[k] = null
                                if(!Object.entries(v).length) {
                                    notify(`your baskets ${v} must be an object`,0)
                                    return
                                }
                                // set our offers here, every time there is change in the basket, nice!
                                // (exampe): Buy 2 tins of soup and get a loaf of bread for half price

                                if(self.defaultOffers[k]){

                                }
                                // check item entries
                                // for(let [key, value]of Object.entries(v)){

                                // }
                                // this.offers

                                console.log('(genBaskets) what is k',k)
                                self._baskets[k] = v
                            }
                        }
                    })
                }
            } catch (err) {
                console.log(err)
            }

            return this
        }

        /**
         * 
         * @param {*} id provide id purchase refrence
         */
        set(id = '', value) {
            if (!this.baskets[name]) {
                notify(`[item] busket ${name} does not exist, see the store for avialable lists`, true)
                return null
            }
            this.baskets[name]['basket'] = value
            return this
        }
        /**
         * get 
         * @param {*} name name of the item to return
         */
        get(name = '') {
            if (!name || !isString(name)) {
                notify(`invalid name`)
                return null
            }
            return this.baskets[name]['basket']
        }
    }
}