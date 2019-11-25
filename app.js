const routerApiFactory = require('./api/router')
const cacher = require('./proxies/caching-proxy')
const network = require('network');
require('dotenv').config()

getGatewayIP = () => {
    return new Promise((resolve, reject) => {
        network.get_interfaces_list(function (err, list) {
            const ethernet = list.find(item => item.name == 'Ethernet')
            err ? reject(err) : resolve(ethernet.gateway_ip)
        })
    });
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