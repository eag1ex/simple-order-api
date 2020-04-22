


module.exports = function (expressApp) {
    return class ServerController {
        constructor() {

        }
        order(req, res) {
            console.log('callin on order')
            return res.status(200).json({ success: true, message: 'works' });
        }
    }

}