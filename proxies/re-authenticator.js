// This is a recursive authenticator
const authenticator = {
    authenticate: function (authFunction, target, retry, retryCount, waitFor) {
        return new Promise((resolve, reject) => {
            console.log('Authenticating')
            authFunction.apply(target)
                .then((result) => {
                    resolve(result)
                }).catch((error) => {
                    if (this.unauthorized(error)) {
                        if (retry >= retryCount) {
                            reject('Exceeded re-authentication retry limit')
                        } else {
                            console.log('Waiting to retry the connection')
                            setTimeout(() => { resolve(this.authenticate(authFunction, target, ++retry, retryCount, waitFor)) }, waitFor)
                        }
                    } else {
                        reject(error)
                    }
                })
        })
    },
    unauthorized: function (response) {
        return (response.response && response.response.status == 401)
    }
}

module.exports = {
    create: (obj, authfunc, retryCount, waitFor) => {
        let handler = {
            Token: '',
            get: function (target, prop, receiver) {
                if (typeof target[prop] === 'function') {
                    const authFunction = target[authfunc]
                    const functionToCall = target[prop]
                    return (...args) => {
                        return new Promise((resolve, reject) => {
                            functionToCall.apply(target, args).then((result) => {
                                resolve(result)
                            }).catch((error) => {
                                if (authenticator.unauthorized(error)) {
                                    authenticator.authenticate(authFunction, target, 0, retryCount, waitFor)
                                        .then(() => {
                                            resolve(functionToCall.apply(target, args))
                                        })
                                        .catch((error) => {
                                            reject(error)
                                        })
                                } else {
                                    reject(error)
                                }
                            })
                        })
                    }
                }
            }
        }
        return new Proxy(obj, handler)
    }
}