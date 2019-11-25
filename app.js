const network = require('network');
const routerApiFactory = require('./api/router')
const cacher = require('./proxies/caching-proxy')
require('dotenv').config()


getGatewayIP = () => {
    const result = new Promise((resolve, reject) => {
        network.get_gateway_ip((err, ip) => {
            err ? reject(err) : resolve(ip)
        })
    });

    return result
}

init = () => {
    return getGatewayIP().then((ip) => {
        const router = routerApiFactory.init(process.env.ROUTER, {
            url: ip,
            timeout: process.env.TIMEOUT,
            username: process.env.USER,
            password: process.env.PASSWORD
        })
        const proxy = cacher.create(router, process.env.CACHE_INTERVAL)
        return proxy
    })
}

start = () => {
    init().then((router) => {
        return router.connectedDevices()
    }).then((devices) => {
        const online = devices.filter(device => device.online)
        console.log(online)
    }).catch((error) => {
        console.log(error)
    })
}

start()