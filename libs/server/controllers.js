`use strict`


module.exports = function (expressApp) {
    const { timestamp,numDate } = require('../utils')
    const { isEmpty,unset } = require('lodash')
    const errorMessages = require('../errors')
    const SimpleOrder = require('../simple-order/SimpleOrder')()

    return class ServerController {
        constructor(debug) {
            this.debug = debug
            this.simpleOrder = new SimpleOrder({}, this.debug)
        }

        offers(req, res){
            return res.status(200).json({ success: true, response:'ok', code: 200 });
        }
        
        store(req, res){
            const o = {
                menu:this.simpleOrder.listStore,
                storeOpen: this.simpleOrder.storeOpen()
            }
            // 
            return res.status(200).json({ success: true, response:{menu:this.simpleOrder.listStore}, code: 200 });
        }

        order(req, res) {
            let quote= req.query || {}

            console.log('callin on order', quote)

            /// SECTION handle validation of requests
            if (isEmpty(quote)) {
                return res.status(200).json({ error: true, ...errorMessages['004'] });
            }
            // use provided id or generate new
            let id = quote.id ? quote.id:timestamp()
            unset(quote,'id')

            if(!numDate(id) && id){
                return res.status(200).json({ error: true, ...errorMessages['005'] });
            }
            /// !SECTION 

            const o = this.simpleOrder.order(id,quote)
            if (o.error) return res.status(200).json({ ...o });
            return res.status(200).json({ success: true, response:o, code: 200 });
        }


    }

}