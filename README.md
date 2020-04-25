
### Simple Order API
#### - [ Developed by Eaglex ](http://eaglex.net)


##### LICENSE

* LICENCE: CC BY-NC-ND
* SOURCE: https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

#### About

* This application is a Simple E-commerce Shop allowing you to purchase items from store that you initially setup. Design is extendable with nice application hierarchy. There are 3 `Micro Services` doing independent calculation, this way it is easy to read the flow of data, and debug it...
* Good Tests and Coverage is also included
* Application runs on **Express.js Server** 
* Good catch exceptions and error handling
  

#### The Store
* You can create own offers against purchases, and quantities of orders, examples available in: `./libs/simple-order/config.js`


#### Why

* You can make e-commerce shop out of this application, the base structure is already in place.

  
#### Stack

* OOP, Express.js, REST/API, build Micro Services _( `Basket.js`, `Store.js`, `SimpleOrder.js` )_, Error codes, Error handling, debug mode, Heroku ready, eslint
	* TESTS: Mocha, Chai, Istanbul/nyc _( code coverage )_
  

#### Installation & Start

* on `localhost` application is available at: `http://localhost:5000/`

```
$/ npm i
$/ npm run server
$/ npm run examples # this performs test from available examples
$/ npm run test # runs coverage as well
```

#### Tests

* Tests are located in `./test/*.*` just run `npm run test`


#### Examples

* examples are available in `./examples.js`


###  Code Coverage
  * Latest code coverage in `./coverage/index.html`


#### REST/Api

* Available get/ requests:

```
# example queries
/order #(optionaly can prodive id= param)
http://localhost:5000/order?bread=5&milk=2&apples=3&soup=3

/update # make update to existing order
http://localhost:5000/update?id=1587841023650&bread=7&apples=5

/shoppingcard # returns your order
http://localhost:5000/shoppingcard?id=1587841023650

/store # see whats in the store
http://localhost:5000/store

/offers# see whats on offer
http://localhost:5000/offers
```


#### Heroku node.js server:
* Running application is also available on:

```
# using same **REST/Api** requests
https://peaceful-wildwood-49218.herokuapp.com/
```


#### Code Hierarchy

We have `Express server` and `SimpleOrder`, application is initiated from `/server/controllers.`

* About `Simple Order - Micro Services`:

-  **/simple-order/Store.js:** : our base class that takes care of `storeData.json` and global discounts

-  **/simple-order/SimpleOrder.js**: extends from Store.js, and initializes the application including the Basket.js

-  **/simple-order/Basket.js** : Every new`order` is a `new Basket()` that calculates conditions and `offers` available from `config.js`. Configuration of this class is controlled via `SimpleOrder.js`

-  **/simple-order/config.js**: default configuration imported to Store.js, but can import yours, __how to__ available in `./examples.js`

-  **/simple-order/storeData.json** : available store imported to Store.js class, can add any more items following the same schema.

**/simple-order/storeData.js** : can also provide as js file

* About `server`:

- it starts via `./serverApp.js`, `SimpleOrder` application is initialized from `./server/controllers.js` with currently one request `get/order(..)` available.


#### TODO

*  **(add)** basketOffers to storeData.json on individual items
*  **(add)** add more tests
*  **(add)** add mocha and istanbul
*  **(add)** local storage
*  **(add)** Mongo server


##### Contact
* Have questions, or would like to submit feedback, `contact me at: https://eaglex.net/app/contact?product=Simple-Order-API`

  

##### Thank you