/* Login: /login?arg=username:password&_n=nonce&_=timestamp (where username:password is Base64 encoded) */

const axios = require('axios')
const mib_mapper = require('./mib/mib_mapper')

class RouterAPI {

    constructor(config) {
        this.config = config
        this.headers = {}

        this.api = axios.create({
            baseURL: `http://${config.url}`,
            timeout: config.timeout,
            hostname: config.url,
            port: 80,
            withCredentials: true
        })
    }

    login = async () => {
        this.nonce = `_n=${(""+Math.random()).substr(2,5)}`
        const credentials = Buffer.from(`${this.config.username}:${this.config.password}`, 'ascii').toString('base64')
        const timestamp = `_=${Date.now()}`
        const url = `login?arg=${credentials}&${this.nonce}&${timestamp}`
        const result = await this.get(url)
        this.headers.Cookie = 'credential=' + result.data
        return result.data
    }

    connectedDevices = async () => {
        const timestamp = `_=${Date.now()}`
        const url = `getConnDevices?${this.nonce}&${timestamp}`
        const result = await this.get(url)
        const devices = mib_mapper.convert(result.data)
        return devices
    }

    get = async (url) => {
        let response = await this.api.get(url, {
            headers: this.headers
        })
        return response
    }
}

module.exports = RouterAPI