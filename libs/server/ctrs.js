


module.exports = function (expressApp) {
    return class ServerController {
        constructor() {

        }
        order(req, res) {
            return res.status(200).json({ success: true, message: 'works' });
        }
    }

}