

/**
 * SimpleOrder config file, for setting up offers and discounts
 * - settings only work agains available items in our `storeData.json`
 * - please note if applied `discount` directly to `storeData.json` it will priority 
 */


/**
 * global store discounts for each item
 */
exports.storeConfig = {
   // TODO maxPurchase:1000, // allowed purchase limit 
    store:[{
            // NOTE if you set discount in `./simple-order/storeData.json` it will take priority over this configuration, nice! 
            name: 'apples', discount: 15 // percentage number
    }]
}

/**
* - offers for basket purchases
* - current available offer conditions are set for 'soup', can be fount on `Basket.calculatePrice`
* 
* **/

exports.basketOffers = [
    {   // offer name
        'bread': { 
            // when you purchase
            when: 'soup', // < product name that is available in the store
            purchase: 2,

             // you receive
            discount: 50, 
            //coupon:'124sdf46', TODO alternativly when apply coupon you also receive discount 
            message: 'Buy 2 or more tins of soup and get a loaf of bread for half price' 
        },
    }
]


exports.currency = { name: 'USD', symbol: '$' }