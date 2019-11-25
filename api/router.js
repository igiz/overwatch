const arris = require('./arris/api')

module.exports = {
    init: (router, config) => {
        switch (router) {
            case 'arris':
                return new arris(config)
            default:
                throw "Unsupported Router"
        }
    }
}