

    /**
     * Few `SimpleOrder` code examples, including `Server` apis
     * - more documentation in `readme.md`, example code available at `./examples.js`
     */
    







/**
 * NOTE REST/api
 * GET `/order?bread=5&soup=2&apples=2`
 */
const simpleO = new SimpleOrder({ store, basket }, debug)
const id = timestamp() 
const order = { bread: 5, soup: 2, apples: 2 }
const response = simpleO.order(id, order)
console.log({ response })
// returns order for: bread: 5, soup: 2, apples: 2








   /**
    * NOTE REST/api
    * GET `/update?id=1587748967237&soup=1&apples=5&milk=5`
    */
   const simpleO = new SimpleOrder({ store, basket }, debug)
   const id = `1587748967237`

   // from `/order?id=1587748967237...`
   // const order = { bread: 5, soup: 2, apples: 2 }
   // simpleO.order(id, order)

   const update = { soup: 1, apples: 5, milk:5}
   const response = simpleO.updateOrder(id, update)
   console.log({ response })
   // returns updateOrder for: soup:1, apples:5, milk:5, bread: 5






/**
 * `Server REST/apis code examples`:
 */
controller.order(req, res) {...}  `/order?`
controller.update(req, res) {...} `/update?`
controller.shoppingcard(req, res) {...} `/shoppingcard?`   
controller.store(req, res) {...}  `/store` 
controller.offers(req, res) {...} `/offers` 

/**
 * (GET): `/order?milk=2&apples=4&bread=2` # make purchase
 * (GET): `/update?id=1587748967237&soup=20` # update
 * (GET): `/shoppingcard?id=1587748967237` # check card
 * (GET): `/offers` # offers in store
 * (GET): `/store` # products in store
 */




