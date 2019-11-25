// Credit to: vanbalken
// Converted from Python project @ https://github.com/vanbalken/arris-tg2492lg/
const Device = require('./device')

const ARRIS_ENTERPRISE_OID = '1.3.6.1.4.1.4115'
const HOST_NAME_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.3`
const MAC_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.4`
const ADAPTER_TYPE_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.6`
const TYPE_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.7`
const LEASE_END_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.9`
const ROW_STATUS_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.13`
const ONLINE_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.14`
const COMMENT_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.15`
const DEVICE_NAME_OID = `${ARRIS_ENTERPRISE_OID}.1.20.1.1.2.4.2.1.20`

const ADAPTER_TYPES = {
    0: 'unknown',
    1: 'ethernet',
    2: 'usb',
    3: 'moca',
    4: 'dsg',
    5: 'wireless1',
    6: 'wireless2',
    7: 'wireless3',
    8: 'wireless4',
    9: 'wireless5',
    10: 'wireless6',
    11: 'wireless7',
    12: 'wireless8',
    13: 'wireless9',
    14: 'wireless10',
    15: 'wireless11',
    16: 'wireless12',
    17: 'wireless13',
    18: 'wireless14',
    19: 'wireless15',
    20: 'wireless16',
    21: 'ethernet2',
    22: 'ethernet3',
    23: 'ethernet4'
}

convert = (data) => {
    const devices = []
    let current = undefined

    for (let key in data) {
        const value = data[key]

        if (key == "1" && value == "Finish"){
            continue
        }

        const split_key = key.split('.')
        const oid = split_key.slice(0, 16).join('.')
        const ip = split_key.slice(19).join('.')

        if (!current || current.ip != ip){
            current = new Device(ip)
            devices.push(current)
        }

        if (oid == HOST_NAME_OID){
            current.hostname = value
        } else if (oid == MAC_OID) {
            //Need to format
            current.mac = value
        } else if (oid == ADAPTER_TYPE_OID) {
            current.adapter_type = ADAPTER_TYPES[value]
        } else if (oid == TYPE_OID) { 
            current.type = value
        } else if (oid == LEASE_END_OID) {
            // Need to format
            current.lease_end = value
        } else if (oid == ROW_STATUS_OID) {
            current.row_status = value
        } else if (oid == ONLINE_OID) {
            current.online = value == "1"
        } else if (oid == COMMENT_OID) {
            current.comment = value
        } else if (oid == DEVICE_NAME_OID) {
            current.device_name = value
        } else {
            console.log(`Unknown OID: ${key} Value:${value}`)
        }

    }
    return devices
}

module.exports = {
    convert
}
