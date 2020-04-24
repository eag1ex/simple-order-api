`use strict`

/**
 * SimpleOrder Store application
 * - the applicatio allows you to purchase items available in `./simple-order/storeData.json` by making call `order(..)`
 * -  It is seperated to independant micro services so it is more flexible to extend and read
 * - The base of this class imports all of the SimpleOrder components: `Store, Basket` and it is then initiated via Server application.
 * - Examples on implementation are available at root `./examples.js` or `npm run examples`
 * - I have implemented an `errorMessages` handler for displaying relevant messages, it applies to server as well, also there is `debug` option when enabled will show more critical errors.
 */
module.exports = function () {
    const moment = require('moment')
    const errorMessages = require('../errors')
    const { notify, timestamp,numDate } = require('../utils')
    const { cloneDeep, isEmpty,isNumber, reduce,last, merge,isEqual } = require('lodash')
    const Store = require('./Store')() // Micro Service
    const Basket = require('./Basket')() // Micro Service

    return class SimpleOrder extends Store {

        constructor(opts, debug) {
            super(opts, debug)

            // collect all client orders here
            this.clientBaskets = {}
            this.clientBasketModels = {} // keep track of basket objects for munipulation
            this.clientQueries = {}
        }


        /**
         * - handle validation of the order in case there are issues with basket, or the store is empty
         * - return valid order
         * @param {*} id provide id in form of date timestamp
         * @param {*} order provide your desired purchase (per item quantity) example: `{bread:2,soup:2,milk:2,apples:3}`
         * 
         */
        order(id = "", order = {}) {
            // validate
            if(!this.storeOpen()){
                return { error: true, ...errorMessages['006']}
            }
            if (isEmpty(this.listStore)) {
                return { error: true, ...errorMessages['001']}
            }
            if (isEmpty(this.offerSchema['basket'])) {
                return { error: true, ...errorMessages['002']}
            }

            /**
             * each Basket is assigned an id timestamp
             */
            //id = timestamp()
            const {data, basketModel} = this.newBasket(id,order)
            if (isEmpty(data) || !data) {
                return { error: true, ...errorMessages['003'] }
            }

            const extraMeta = this.basketMeta(basketModel)      
             // basket extra meta information 
            if(this.debug && !isEmpty(extraMeta)){
                notify({
                    message: "basket totals are",
                    ...extraMeta,
                })
            }

            // with this in mind we could create and update order, caching existing baskets
            // NOTE `clientBasketModels` maybe a memory overkill   
            this.setShopClient({id,order,basket:data, model:basketModel})

            const noAvailable = this.notAvailable(basketModel) ||{}
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
         * we check for last order query, and merge it to new order query, then delete old basket order
         * and use the same id to create new basket order.
         */
        updateOrder(id,updateOrder) {
            const lastBasket = this.getBasket(id) 
            if (!lastBasket) {
                return { error: true, ...errorMessages['011'] }
            }

            if(isEmpty(updateOrder)){
                // return same order
                console.log('returning same order!')
                return lastBasket['payload']
            }
            // make sure before making update order our entriesare valid
            const validEntry = (ordr)=>lastBasket['model'].validEntryValues(ordr,true)
            if(isEmpty(validEntry(updateOrder))){
                return { error: true, ...errorMessages['009'] }
            }

            const  {payload, model,query} =lastBasket
            const dest_order = cloneDeep(query)
            merge(dest_order,updateOrder);
            if(isEmpty(dest_order)){
                return { error: true, ...errorMessages['008'] }
            }

            // it si the same order, so return last basket instead
            if(isEqual(query,updateOrder)) return lastBasket['payload']

            // only test on existing order the new order we want to make, and return only valid items against the store
            const validDestOrder = validEntry(dest_order)
            if(isEmpty(validDestOrder)){
                return { error: true, ...errorMessages['009'] }
            }

            /**
             * to update existing order we create new one by mergind last to a combined new order, at the same time we delete last basket and re-create new basket using that id, so we can provide customer with the same order id.
             */
            try {
                return this.deleteClient(id)
                    .order(id, validDestOrder)
            } catch (err) {
                notify(err,true)
                return { error: true, ...errorMessages['010'] }
            }

        }
        
        /**
         * - create new basket 
         * @param {*} id # required
         * @param {*} order # required
         * returns : `{data,basketModel}`
         */
        newBasket(id,order={}){
            id = id.toString()
            const b = new Basket(id, cloneDeep(this.listStore), this.offerSchema['basket'], this.debug)
            const o = b.set(order)
                .get().data
            return {data:o, basketModel:b}
        }

        /**
         * - get available Store
         */
        get listStore() {
            return this.menu
        }

        /**
         * returns {store, basket} offers set in `config.js` of by user
         */
        get storeOffers(){
            return this.offerSchema
        }


        /**
         * get available Basket by id
         * - returns `{payload,model,query}`
         * @param {*} id timestamp
         */
        getBasket(id) {
            if (!id || !numDate(id)) {
                if (this.debug) notify('[getBasket] provided id for basket is invalid', true)
                return null
            }

            try {
                if (!this.shopClients['clientBaskets'][id] || 
                    !this.shopClients['clientBasketModels'][id] || 
                    !this.shopClients['clientQueries'][id]
                    ) {
                    if (this.debug) notify(`[getBasket] basket for id: ${id} does not exist`, true)
                    return null
                }
            } catch (err) {
                if(this.debug) notify(`[getBasket] your shopClient for: ${id} is empty`,true)
                return null
            }
          
            const b = {
                query:  this.shopClients['clientQueries'][id],
                payload: this.shopClients['clientBaskets'][id],
                model: this.shopClients['clientBasketModels'][id]
            }
            return b
        }

        /**
         * - format Basket extra meta data for output
         * @param {*} basket 
         */
        basketMeta(basket) {
            if (!basket) return {}

            const extraMeta = {
                total: basket.total(),
                subtotal: basket.subtotal(),
                discounts: basket.priceDifference(),
                //basket.getDisccounts(),
                offers: basket.getOffers()
            }

            // make date from id timestamp
            let date = moment(Number(basket.id))
            if (date.isValid()) {
                extraMeta.date = date.format()
            }
            else notify(`[basketMeta] id/timestamp is invalid for date`, 0)


            const b = reduce(extraMeta, (n, el, k) => {
                if (isNumber(el)) {
                    if (k !== 'discounts') n[k] = `${this.currency.symbol}${el}`
                    else n[k] = `${el}%`
                }
                else if (el !== undefined) {
                    n[k] = el
                }
                return n
            }, {})
            if (isEmpty(b)) {
                if (this.debug) notify(`[basketMeta] no extra meta available`, 0)
                return {}
            }
            return b
        }

        /**
         * sets each client request information and basket model
         */
        setShopClient({id,order, basket, model}){
            this.clientBasketModels[id] = model
            this.clientBaskets[id] = basket
            this.clientQueries[id]= order
            return this
        }

        //TODO delete client after purchase complete
        deleteClient(id) {
            if(!numDate(id)){
                throw(`cannot delete client, provided id is invalid id: ${id}`)
            }
            delete this.clientBasketModels[id]
            delete this.clientBaskets[id]
            delete this.clientQueries[id]

            return this
        }

        /**
         * return all available client informations
         * returns {clientBaskets,clientBasketModels,clientQueries} or empty object if any are empty 
         */
        get shopClients() {
            // save sandboxed
            return (function(){
                if(isEmpty(this.clientBaskets) || isEmpty( this.clientBasketModels) || isEmpty(this.clientQueries)) return {}
                return {
                    clientBaskets: this.clientBaskets,
                    clientBasketModels: this.clientBasketModels,
                    clientQueries: this.clientQueries
                }
            }).call(this,{clientBaskets:this.clientBaskets,clientQueries:this.clientQueries })
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
         * - calculate total on the basket
         * example:
         * `
         * {apples: {
                purchase: "2",
                metadata: {
                label: "Apples",
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