/* Login: /login?arg=username:password&_n=nonce&_=timestamp (where username:password is Base64 encoded) */

const axios = require('axios')
const mib_mapper = require('./mib/mib_mapper')

class RouterAPI {

    constructor(config) {
        this.config = config
        this.headers = {}
        this.nonce = `_n=${(""+Math.random()).substr(2,5)}`

        this.api = axios.create({
            baseURL: `http://${config.url}`,
            timeout: config.timeout,
            hostname: config.url,
            port: 80,
            withCredentials: true
        })
    }

    async login() {
        const credentials = Buffer.from(`${this.config.username}:${this.config.password}`, 'ascii').toString('base64')
        const timestamp = `_=${Date.now()}`
        const url = `login?arg=${credentials}&${this.nonce}&${timestamp}`
        const result = await this.get(url)


        if (result.data) {
            this.headers.Cookie = 'credential=' + result.data
        } else {
            // Arris router API doesn't seem to send any response back if password is incorrect - just get an empty 200 response. 
            // So I will assume empty OK response is failed login
            throw {
                response: {
                    status: 401
                }
            }
        }

        return result.data
    }

    async connectedDevices() {
        const timestamp = `_=${Date.now()}`
        const url = `getConnDevices?${this.nonce}&${timestamp}`
        const result = await this.get(url)
        const devices = mib_mapper.convert(result.data)
        return devices
    }

    async get(url) {
        let response = await this.api.get(url, {
            headers: this.headers
        })
        return response
    }
}

module.exports = RouterAPI