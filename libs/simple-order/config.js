

/**
 * SimpleOrder config file, for setting up offers and discounts
 * - settings only work agains available items in our `store.json`
 * - please note if applied `discount` directly to `store.json` it will priority 
 */


/**
 * global store discounts for each item
 */
exports.storeConfig = {
   // TODO maxPurchase:1000, // allowed purchase limit 
    store:[{
            // NOTE if you set discount in `./simple-order/store.json` it will take priority over this configuration, nice! 
            name: 'apples', discount: 15 // percentage number
    }]
}


/**
* - offers for basket purchases
* - current available offer conditions are set for 'soup', can be fount on `Basket.calculatePrice`
* 
* **/
exports.basketConfig = {
    soup: {
        ref: 'soupSpecial', // identify each offer
        message:'Buy 2 or more tins of soup and get a loaf of bread for half price',
        buyItems: 2, // if buyItems (val/100)*dis
        bread: { discount: 50 /**50% */ } // receive discount for bread
    }
}

exports.currency = { name: 'USD', symbol: '$' }