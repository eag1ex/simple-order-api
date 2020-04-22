

/**
 * - SimpleOrder Store application
 * - the applicatio allows you to purchase items available in the `./simple-order/store.json` by making a call `order(..)`
 * -  It is seperated to independant micro services so it is more flexible to extend and read
 * - The base of this class imports all of the SimpleOrder components: `Store, Basket` and it is then initiated via Server application.
 * - Examples on implementation are available at root `./examples.js` or `npm run examples`
 * - I have implemented an `errorMessages` handler for displaying relevant messages, it applies to server as well, also there a `debug` option when enabled will also show more critical errors < good fore debuging
 */
module.exports = function () {
    const errorMessages = require('../errors')
    const { notify, timestamp } = require('../utils')
    const { cloneDeep, isEmpty,isNumber, reduce,last } = require('lodash')
    const Store = require('./Store')()
    const Basket = require('./Basket')()

    return class SimpleOrder extends Store {
        constructor(opts, debug) {
            super(opts, debug)

            // collect all client orders here
            this.clientBaskets = {}
            this.clientBasketModels = {} // keep track of basket objects for munipulation
        }

        /**
         * - handle validation of the order in case there are issues with basket, or the store is empty
         * - return valid order
         * @param {*} id provide id in form of date timestamp
         * @param {*} order provide your desired purchase (per item quantity) example: `{bread:2,soup:2,milk:2,apples:3}`
         * 
         */
        order(id = "", order = {}) {
            if(!this.storeOpen()){
                return { error: true, ...errorMessages['006']}
            }
            if (isEmpty(this.listStore)) {
                return { error: true, ...errorMessages['001']}
            }
            if (isEmpty(this.offerSchema['basket'])) {
                return { error: true, ...errorMessages['002']}
            }
            //id = timestamp()
            id = id.toString()
            const b = new Basket(id, cloneDeep(this.listStore), this.offerSchema['basket'], this.debug)
            const o = b.set(order)
                .get().data

            if (isEmpty(o) || !o) {
                return { error: true, ...errorMessages['003'] }
            }

            const extraMeta = this.basketMeta(b)
           
             // basket extra meta information 
            if(this.debug && !isEmpty(extraMeta)){
                notify({
                    message: "basket totals are",
                    ...extraMeta,
                })
            }

            // NOTE this maybe a memory overkill
            // this.clientBasketModels = [id] = b

            // with this in mind we could create an update order, caching existing basket
            // and setting cache clear timeout
            this.clientBaskets[id] = o

            const noAvailable = this.notAvailable(b) ||{}
            const currency =  this.currency.name
            return {
                currency,
                id,
                ...extraMeta,
                basket:{
                    ...this.clientBaskets[id],
                    ...noAvailable
                }
                
            }     
        }

        /**
         * TODO
         * - update existing order
         */
        // updateOrder(id){
                // this.clientBasketModels[id] etc
        //     // this.clientBaskets[id] etc
        // }
        


        /**
         * - get available Store
         */
        get listStore() {
            return this.menu
        }


        /**
         * - provide message for when item your are requesting is not available in the Backet
         * returns `{[name]:{message, error}}` name of item to order, and message reason
         */
        notAvailable(basket) {

            if (!basket) return null
            const { name, message } = last(basket.basketErrors) || {}
            if (!name) {
                return null
            }

            return {
                [name]: {
                    message,
                    error: true
                }
            }
        }

        /**
         * - format Basket extra meta data for output
         * @param {*} basket 
         */
        basketMeta(basket){
            if(!basket) return {}
            const extraMeta = {
                total:basket.total(),
                subtotal: basket.subtotal(),
                discounts: basket.priceDifference(),  
                //basket.getDisccounts(),
                offers: basket.getOffers()
            }

           const b= reduce(extraMeta,(n,el,k)=>{
                if(isNumber(el)){
                    if(k!=='discounts')  n[k] = `${this.currency.symbol}${el}`
                    else n[k] = `${el}%`
                }
                else if(el!==undefined){
                    n[k] = el
                }
                return n
           },{})
           if(isEmpty(b)) {
               if(this.debug) notify(`[basketMeta] no extra meta available`,0)
            return {}
           }
           return b
        }


        /**
         * - calculate total on the basket
         * example:
         * `
         * {apples: {
                purchase: "2",
                metadata: {
                lable: "Apples",
                value: 0.9,
                info: "per bag",
                discount: 10
                },
                price: 1.62
                }
            },...`
         */
        // calcTotal(id){
        //       if(!this.clientBaskets[id]) return null
        //        let total = 0

        //        for(let [k,item] of Object.entries(this.clientBaskets[id])){
        //             total = total+item.price
        //        }      

        //        return `${this.currency.symbol}${total}`
        // }
    }
}