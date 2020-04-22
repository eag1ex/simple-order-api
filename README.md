### Simple Order API 
* By `EagleX`
* 
##### LICENSE
* LICENCE: CC BY-NC-ND
* SOURCE: https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

#### About
* This application is a Simple Shop that allows you to purchase items from the store which you have initially setup. It has been design so that you can extend the store and departments of the application tree. There are 3 `Micro Services` doing independant calculation, this way it is easy read the flow of data and debug...

It runs on Express server with currently one `REST/get` api available. Express server is in its simple form to allow extention, with some pre offered integration.

#### Stack
* OOP, Express.js, REST/API,  build Micro Services _( `Basket.js`, `Store.js`, `SimpleOrder.js` )_, Error codes, Error handling, debug mode, Heroku ready


##### Installation & Start
```
$/ npm i
$/ npm run server
$/ npm run examples # this performs test from available examples
$/ npm run test  # just a simple test for each Heroku staging
```
 

#### REST/Api
Available get/ requests, id is optional, new generated when not provided:
```
http://localhost:5000/order

# example queries
http://localhost:5000/order?bread=5&apples=2&soup=2&milk=4
http://localhost:5000/order?id=1587581486216&bread=5&apples=2&soup=2&milk=4

```

#### Code Hierarchy
WE have Express server and `SimpleOrder` application initiated from `/server/controllers.`

* About `Simple Order - Micro Services`:
    - **/simple-order/Store.js:** : this is our base class that takes care of `store.json` and global discounts
    - **/simple-order/SimpleOrder.js**: extends from Store.js, and initializes the application _(not the server)_ including the Basket.js
    - **/simple-order/Basket.js** : Every `order` is a `new Basket()` that calculates order conditions and `specia offers` available in the config.js. The configuration of this class of controlled via SimpleOrder.js
    - **/simple-order/config.js**: aplications default configuration file imported to Store.js, but you can import yours, on how... available in `./examples.js`
    - **/simple-order/store.json** :  available store imported to Store.js class, you can add any more items following the same schema.

* About `server`:
  - Server starts via `./serverApp.js`, the `SimpleOrder` application is initialized from `./server/controllers.js` with currently one request `get/order(..)` available.



#### Examples
* examples are available in `./examples.js`

###### Thank you
