class Device {
    
    constructor(ip){
        this.ip = ip
        this.hostname = "None"
        this.mac = "None"
        this.adapter_type = "None"
        this.type = "None"
        this.lease_end = "None"
        this.row_status = "None"
        this.online = "None"
        this.comment = "None"
        this.device_name = "None"
    }

    toString = () => {
        return `ip: ${this.ip}, hostname: ${this.hostname}`
    }

}

module.exports = Device