### Simple Order API
#### - [ Developed by Eaglex ](http://eaglex.net)

##### LICENSE
* LICENCE: CC BY-NC-ND
* SOURCE: https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode


#### About

* This application is a Simple Shop that allows you to purchase items from the store which you have initially setup. It has been design so you can extend it, and departments of application tree. There are 3 `Micro Services` doing independent calculation, this way it is easy to read flow of data and debug it...

Application runs on simple **Express server** with currently one `REST/get` API available.

#### Why
* You can make e-commerce shop out of this application, the base structure is already in place. 

#### Stack
* OOP, Express.js, REST/API, build Micro Services _( `Basket.js`, `Store.js`, `SimpleOrder.js` )_, Error codes, Error handling, debug mode, Heroku ready, TESTS, eslint


#### Installation & Start
* on `localhost` application is available on `http://localhost:5000/` 
```
$/ npm i
$/ npm run server
$/ npm run examples # this performs test from available examples
$/ npm run test # just a simple test for each Heroku staging
```
  
#### Heroku node.js server:
* Running application is available to test on:
* 

#### REST/Api
Available get/ requests, `id` _(is optional,and generated when not provided)_:
```
http://localhost:5000/order

# example queries
http://localhost:5000/order?bread=5&apples=2&soup=2&milk=4
http://localhost:5000/order?id=1587581486216&bread=5&apples=2&soup=2&milk=4
```

#### Code Hierarchy

We have `Express server` and `SimpleOrder` application is initiated from `/server/controllers.`

* About `Simple Order - Micro Services`:

	-  **/simple-order/Store.js:** : our base class that takes care of `storeData.json` and global discounts

	-  **/simple-order/SimpleOrder.js**: extends from Store.js, and initializes the application  including the Basket.js

	-  **/simple-order/Basket.js** : Every  new`order` is  a `new Basket()` that calculates conditions and `offers` available in `config.js`. The configuration of this class of controlled via `SimpleOrder.js`

	-  **/simple-order/config.js**: default configuration file imported to Store.js, but you can import yours, __how to__ available in `./examples.js`

	-  **/simple-order/storeData.json** : available store imported to Store.js class, you can add any more items following the same schema.
	**/simple-order/storeData.js** : you can also provide as js file


* About `server`:

- Server starts via `./serverApp.js`, the `SimpleOrder`application is initialized from `./server/controllers.js` with currently one request `get/order(..)` available.

#### Examples and test
* examples are available in `./examples.js`
  

#### TODO
* **(add)** basketOffers to storeData.json in individual store items
* **(add)** get request test 
* **(add)** local storage
* **(add)** Mongo server

##### Contact
 * Have questions, or would like to submit feedback, `contact me at: https://eaglex.net/app/contact?product=Simple-Order-API`


###### Thank you