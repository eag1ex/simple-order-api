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


module.exports = () => {

    const { notify,timestamp } = require('../utils')
    const {cloneDeep} = require('lodash') 
    const Store = require('./Store')()
    const Basket = require('./Basket')()
   
    return class SimpleOrder extends Store {
        constructor(opts) {
            super(opts)

            // collect all client orders here
            this.clientBaskets = {}
            const b = new Basket(cloneDeep(this.listStore))
            // b.set(,{hello:true})
            // notify({Basket:b.get('soap')})
        }
        
        /**
         * - get available Store
         */
        get listStore(){
            return this.menu
        }

        /**
         * currently collected orders 
         */
        basket(){
        }

        order(){

        }
    }
}