
 const {timestamp, notify} = require('./libs/utils')

 const SimpleOrder = require('./libs/simple-order/SimpleOrder')()
 const debug = true
 const so = new SimpleOrder({},debug)

 /**
  * example:
  * - using `SimpleOrder` class directly without server
  */
 function simpleExample(){
     const id = timestamp()
     const order = { bread: 5, apples: 2, soup: 2, milk: 4, }
     const response = so.order(id,order)
     notify({response})
 }   
 simpleExample()


 function simpleExample2(){
    const id = timestamp()
    const order = { bread: 5, apples: 1, soup: 1, milk: 2,bananas:5 }
    const response = so.order(id,order)
    notify({response})
}   
simpleExample2()

