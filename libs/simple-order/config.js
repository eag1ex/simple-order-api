

/**
 * - SimpleOrder config file, for setting up offers and discounts
 * - settings only work agains available items in our `store.json`
 */



/**
 * global store discounts for each item
 */
exports.storeConfig = {
   // maxPurchase:1000, // allowed purchase limit // todo
    store:[{
            name: 'apples', discount: 20 // percentage number
    }]
}


/**
* - offers for busket purchases
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