

/**
 * - ServerAuth extention
 */
module.exports = function (expressApp) {
    const {notify} = require('../utils')
    return class ServerAuth {
        constructor() {

        }

        authCheck(req, res, next) {

            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, token-expiry");
            notify(`-- calling url: ${req.url}`)
            return next();
            // providing no restrictions apart from the header
            // return res.status(400).send({ error: true, msg: 'No token provided, or session expired' });

        }

        AppUseAuth() {
            expressApp.use(this.authCheck.bind(ServerAuth));
        }

        // SECTION disabled, not in play
        // verifyAccess(req, token, cb){
        //     jwt.verify(token, config.secret, function (err, decoded) {
        //         if (err) {
        //             console.log('There was an error with the authentication');
        //             cb(false)
        //         } else {
        //             req.token = decoded //[1]
        //             cb(true)
        //         }
        //     })
        // }
        // getToken(headers) {
        //     if (headers && headers.authorization) {
        //         var parted = headers.authorization.split(' ');
        //         if (parted.length === 2) {
        //             return parted[1];
        //         } else {
        //             return null;
        //         }
        //     } else {
        //         return null;
        //     }
        // };
        // !SECTION 

    }
}