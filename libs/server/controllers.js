`use strict`


module.exports = function (expressApp) {
    const { timestamp,numDate, notify } = require('../utils')
    const { isEmpty,unset } = require('lodash')
    const errorMessages = require('../errors')
    const SimpleOrder = require('../simple-order/SimpleOrder')()

    return class ServerController {
        constructor(debug) {
            this.debug = debug
            this.serverCatchLastError = null
            try {
                this.simpleOrder = new SimpleOrder({}, this.debug)
            } catch (err) {
                this.serverCatchLastError = err
            }
        }

        offers(req, res){
            if(this.serverCatchLastError){
                notify(this.serverCatchLastError,true)
                return res.status(500).json({ error: true, ...errorMessages['007'] });
            }
            const o = this.simpleOrder.offerSchema

            return res.status(200).json({ success: true, response:o, code: 200 });
        }
        
        store(req, res){
            if(this.serverCatchLastError){
                notify(this.serverCatchLastError,true)
                return res.status(500).json({ error: true, ...errorMessages['007'] });
            }
            const o = {
                menu:this.simpleOrder.listStore,
                storeOpen: this.simpleOrder.storeOpen()
            }
            // 
            return res.status(200).json({ success: true, response:{menu:this.simpleOrder.listStore}, code: 200 });
        }


        /**
         * - update order is the same get request except for `simpleOrder.updateOrder` has changed
         * @param {*} req 
         * @param {*} res 
         */
        update(req, res){
            if(this.serverCatchLastError){
                notify(this.serverCatchLastError,true)
                return res.status(500).json({ error: true, ...errorMessages['007'] });
            }
            let quote= req.query || {}


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

            const o = this.simpleOrder.updateOrder(id,quote)
            if (o.error) return res.status(200).json({ ...o });
            return res.status(200).json({ success: true, response:o, code: 200 });
        }


        order(req, res) {
            if(this.serverCatchLastError){
                notify(this.serverCatchLastError,true)
                return res.status(500).json({ error: true, ...errorMessages['007'] });
            }
            let quote= req.query || {}


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