const routerApiFactory = require('./api/router'),
    cacher = require('./proxies/caching-proxy'),
    reauthenticator = require('./proxies/re-authenticator'),
    network = require('network'),
    chalk = require('chalk');

require('dotenv').config();
const log = console.log,

    getGatewayIP = () => {
        return new Promise((resolve, reject) => {
            network.get_interfaces_list(function (err, list) {
                const interface = list.find(item => item.name == process.env.INTERFACE)
                err ? reject(err) : resolve(interface.gateway_ip)
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
        // Re-authenticating proxy on-top of caching proxy , because why not :))
        let proxy = cacher.create(router, process.env.CACHE_INTERVAL)
        proxy = reauthenticator.create(proxy, 'login', process.env.AUTH_RETRY)
        return proxy
    })
}

start = () => {
    init().then((router) => {
        return router.connectedDevices()
    }).then((devices) => {
        const online = [],
            offline = []

        devices.forEach(device => {
            device.online ? online.push(device) : offline.push(device)
        })

        log(chalk.green("Online Devices:"))
        online.forEach(device => {
            log(chalk `IP: {yellow ${device.ip}}\tHOSTNAME: {green ${device.hostname}}`);
        });

        log(chalk.red("Offline Devices:"))
        offline.forEach(device => {
            log(chalk `IP: {yellow ${device.ip}}\tHOSTNAME: {red ${device.hostname}}`);
        });

    }).catch((error) => {
        console.log(error)
    })
}

start()