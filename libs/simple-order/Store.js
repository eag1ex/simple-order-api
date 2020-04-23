`use strict`

/**
 * our `Store`
 * - keeps record of available store items initialy setup in `./simple-order/storeData.json`
 * `storeData.json`: you can add new items to the store keeping in mind of required schema - validation is performed via `validateStore()` 
 * 
 * you can check if store is open with `storeOpen()` and list any available items via `menu`
 */
module.exports = function () {

    //////////////////////
    // our available store
    const storeEntries = require('./storeData.json')
    const errorMessages = require('../errors')
    //////////////////////

    const { storeConfig, basketOffers, currency } = require('./config')

    const { uid, notify, discountIt, isType, trueObject } = require('../utils')
    const { isEmpty, cloneDeep, reduce, isNaN } = require('lodash')
    return class Store {

        /**
         * @param opts.offerSchema #  if not settings applied using `defaultOfferSchema= { store: storeConfig['store'], basket: basketOffers }`, refer to default structure from `./simple-order/config.js`
         */
        constructor(opts = {}, debug) {
            this.lastStoreError = null // store our last store error
            this.debug = debug || null
            this._offerSchema = (opts || {}).offerSchema || this.defaultOfferSchema
            this.applyStoreDiscounts = (opts || {}).applyStoreDiscounts || true
            this.validOffer()
        }


        /**
         * our current shop
         * - items are already calculated and offerSchema is applied
         */
        get menu() {
            this.lastStoreError = null
            if (this._menu) return this._menu
            try {
                reduce(this.storeEntries, (n, el, k) => {
                    n[k] = Object.assign({}, el, { _id: uid(k) })
                    return n
                }, {})

                // calculate store offers
                this._menu = this.calc(
                    cloneDeep(this.storeEntries)
                )

            } catch (err) {
                notify({ message: 'store entry error', err }, true)
            }


            /**
             * example output:
             * {
                soup: { _id: uid('soup'), label: 'Soup', value: .65, info:'per item' }, // per item
                bread: { _id: uid('bread'), label: 'Bread', value: .8, info:'per item' }, // per item
                milk: { _id: uid('milk'), label: 'Milk', value: 1.3, info:'per item' }, // per item
                apples: { _id: uid('apples'), label: 'Apples', value: 1, info:'per bag' }, // per bag
            }
             */
            return this._menu
        }

        /**
         * * check if the store is open
         */
        storeOpen() {
            try {
                this.validateStore()
                this.lastStoreError = null
                return true
            } catch (err) {
                notify(err, true)
                return null
            }
        }

        get defaultOfferSchema() {
            return { store: storeConfig['store'], basket: basketOffers }
            // return {
            //     // global store discounts for each item
            //     store: [{
            //         name: 'apples', discount: 10
            //     }],
            //     /**
            //      * - offers for basket purchases
            //      * - current available offer conditions are set for 'soup', can be fount on `Basket.calculatePrice`
            //      * 
            //      * **/
            //     basket: {
            //         soup: {
            //             ref: 'soup', // identify each offer
            //             buyItems: 5, // if buyItems (val/100)*dis
            //             bread: { discount: 50 /**50% */ } // receive discount for bread
            //         }
            //     }
            // }
        }

        get offerSchema() {
            return this._offerSchema || cloneDeep(this.defaultOfferSchema)
        }

        get currency() {
            return currency
            //return { name: 'USD', symbol: '$' }
        }
        /**
         * - populate our store with valid entries from `storeData.json`
         */
        get storeEntries() {

            if (this._storeEntries) return this._storeEntries
            this._storeEntries = this.validateStore()
            return this._storeEntries
        }



        /**
         * - check `storeData.json` entries are valid
         */
        validateStore() {

            const throwError = () => {
                this.lastStoreError = errorMessages['006'].message ///'Sorry, our store is out of stock!'
                throw ('ups, your storeData.json is either empty or has invalid items')
            }
            if (isEmpty(storeEntries) || !trueObject(storeEntries)) throwError()

            const entries = {}
            for (let [key, item] of Object.entries(storeEntries)) {
                if (key.toString().length < 2) {

                    if (this.debug) notify(`[validateStore], your store entry for ${key} is too short`, 0)

                    continue
                }

                // test minimum required props
                if (isType(item.value) !== 'number') {
                    if (this.debug) notify(`[validateStore], your store entry for ${key} / value doesnt exist or is not a number`, true)

                    continue
                }
                if (item.label !== undefined && isType(item.label) !== 'string') {
                    if (this.debug) notify(`[validateStore], your store entry for ${key} / label must be a string`, true)

                    continue
                }

                if (item.info !== undefined && isType(item.info) !== 'string') {
                    if (this.debug) notify(`[validateStore], your store entry for ${key} / info must be a string`, true)

                    continue
                }
 
                if (item.discount !== undefined && isType(item.discount) !== 'number') {
                    if (this.debug) notify(`[validateStore], your store entry for ${key} / discount must be a number`, true)

                    continue
                }
                /// we are good here
                entries[key] = item;
            }

            if (!trueObject(entries)) {
                ///'Sorry, our store is out of stock!'
                throwError()
            }
            return entries

        }

        /**
         * validate the provided offerSchema properties
         */
        validOffer() {
            try {
                if (!isEmpty(this.offerSchema['store']) && !this.offerSchema['store'].length) {
                    throw ('error')
                }
            } catch (err) {
                notify(`provided opts/haveOffers must be an array`, true)
                return false
            }
            const isValid = () => {
                // test our props match
                let ok = null
                const stor = this.offerSchema['store']
                for (let i = 0; i < stor.length; i++) {
                    const offer = stor[i]
                    const keys = Object.keys(this.defaultOfferSchema['store'][0])
                    const valid = keys.filter(z => offer[z] !== undefined)
                    ok = valid.length === keys.length
                }
                return ok
            }
            if (!isValid()) throw (' your offer schema setting is invalid')
            return true
        }


        /**
         * calculate available discounts from `offerSchema`
         * @param {*} menu 
         */
        calc(menu = {}) {
            // do not calculate 
            if (!this.applyStoreDiscounts) return menu
            const _menu = {}
            for (let [key, item] of Object.entries(menu)) {
                let { label, value, discount } = item || {}
                this.offerSchema['store'].reduce((n, el, i) => {
                    if (key === el.name) {
                        const origValue = item.value

                        // store discount takes priority over `config.js` `storeConfig` discount
                        const discnt = (discount !== undefined && discount >= 0) ? discount : el.discount
                        item.value = discountIt(item.value, discnt)

                        // check if disscount differs from original price 
                        if (origValue !== item.value) {
                            item.discount = discnt
                            // keep old value since discoutn will change decimal points if we want to reverse wouldnt be the same
                            item._oldValue = origValue
                        }
                    }
                }, {})
                _menu[key] = item
            }
            return _menu
        }
    }
}