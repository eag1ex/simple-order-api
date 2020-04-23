
 const {timestamp, notify} = require('./libs/utils')


 /**
  * example:
  * - using `SimpleOrder` class directly without server
  * - should apply given discount in `./libs/simple-order/config.js` 
  */
 // simpleExample1()
 function simpleExample1(){
    const SimpleOrder = require('./libs/simple-order/SimpleOrder')()
    const debug = true
    /**
     * const offerSchema = {offerSchema: require('./libs/simple-order/config.js',applyStoreDiscounts:true)
     */
    const so = new SimpleOrder({},debug)
   // 
     const id = timestamp()
     const order ={ bread: 5,  soup: 2, apples: 2 } 
     const response = so.order(id,order)
     notify({simpleExample1:response})

     /**
      * example output:
      * 
        { currency: 'USD',
     id: '1587637803312',
     total: '$4.9',
     subtotal: '$7.3',
     discounts: '39.34%',
     offers:
      [ 'Buy 2 or more tins of soup and get a loaf of bread for half price' ],
     date: '2020-04-23T17:30:03+07:00',
     basket:
      { bread:
         { purchase: 5,
           metadata:
            { label: 'Bread',
              value: 0.4,
              info: 'per item',
              discount: 50,
              offer: true,
              _oldValue: 0.8 },
           price: 2 },
        soup:
         { purchase: 2,
           metadata: { label: 'Soup', value: 0.65, info: 'per item' },
           price: 1.3 },
        apples:
         { purchase: 2,
           metadata:
            { label: 'Apples',
              value: 0.8,
              info: 'per bag',
              discount: 20,
              _oldValue: 1 },
           price: 1.6 } } }  
      */
 }   

 /**
  * example:
  * - using `SimpleOrder` class directly without server
  * - should not apply offer/discount for bread according to current `basketConfig` in `./libs/simple-order/config.js`
  */
simpleExample2()
function simpleExample2(){
    const SimpleOrder = require('./libs/simple-order/SimpleOrder')()
    const debug = true
    /**
     * const offerSchema = {offerSchema: require('./libs/simple-order/config.js',applyStoreDiscounts:true)
     */
    const so = new SimpleOrder({},debug)
    const id = timestamp()
    const order = { bread: 5, apples: 1, soup: 1, milk: 2,bananas:5 }
    const response = so.order(id,order)
    notify({simpleExample2:response})

    /**
   { currency: 'USD',
     id: '1587637835643',
     total: '$8.05',
     subtotal: '$8.25',
     discounts: '2.45%',
     offers: 'No offers available',
     date: '2020-04-23T17:30:35+07:00',
     basket:
      { bread:
         { purchase: 5,
           metadata: { label: 'Bread', value: 0.8, info: 'per item' },
           price: 4 },
        apples:
         { purchase: 1,
           metadata:
            { label: 'Apples',
              value: 0.8,
              info: 'per bag',
              discount: 20,
              _oldValue: 1 },
           price: 0.8 },
        soup:
         { purchase: 1,
           metadata: { label: 'Soup', value: 0.65, info: 'per item' },
           price: 0.65 },
        milk:
         { purchase: 2,
           metadata: { label: 'Milk', value: 1.3, info: 'per item' },
           price: 2.6 },
        bananas:
         { message: 'sorry we dont have item: bananas in our store',
           error: true } } } 
     */
}   


