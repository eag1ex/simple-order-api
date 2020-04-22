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



Input should be via a suitable structured input (i.e., a List,  such as {‘~DATE~’, ‘item1’, ‘item2’, ‘item3’, … } ) :

 either via the command line in the form PriceBasket List. For example: PriceBasket {‘16/1/2020’, ‘milk’, ‘Bread’, ‘apples’}
Or via HTTP request to an appropriate endpoint with the same List

Output should be to the console and appropriate HTTP requests (with appropriate error codes), for example:

 */


module.exports = function () {
    const errorMessages = require('../errors')
    const { notify, timestamp } = require('../utils')
    const { cloneDeep, isEmpty } = require('lodash')
    const Store = require('./Store')()
    const Basket = require('./Basket')()

    return class SimpleOrder extends Store {
        constructor(opts, debug) {
            super(opts, debug)

            // collect all client orders here
            this.clientBaskets = {}

            // const id = timestamp()
            // const b = new Basket(id, cloneDeep(this.listStore),this.offerSchema['basket'], this.debug)

            // const purchase1 = {tuna:5,milk:2,apples:3}
            // const purchase2 = {bread:2,soap:2,milk:2,apples:3}

            // b.set({})
            // notify({Basket:b.get().data})

        }

        /**
         * - get available Store
         */
        get listStore() {
            return this.menu
        }

        /**
         * 
         * @param {*} id provide id in form of date timestamp
         * @param {*} order provide your desired purchase (per item quantity) example: `{bread:2,soap:2,milk:2,apples:3}`
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
            const b = new Basket(id, cloneDeep(this.listStore), this.offerSchema['basket'], this.debug)
            const o = b.set(order)
                .get().data

            if (isEmpty(o) || !o) {
                return { error: true, ...errorMessages['003'] }
            }
            // with this in mind we could create an update order, caching existing basket
            // and setting cache clear timeout
            this.clientBaskets[id] = o
            return this.clientBaskets[id]
        }
    }
}