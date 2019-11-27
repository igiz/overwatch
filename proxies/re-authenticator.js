// This is a recursive authenticator
const authenticator = {
    authenticate: function (authFunction, target, retry) {
        return new Promise((resolve, reject) => {
            authFunction.apply(target)
                .then((result) => {
                    resolve(result)
                }).catch((error) => {
                    if (this.unauthorized(error)) {
                        if (retry > retryCount) {
                            reject('Exceeded re-authentication retry limit')
                        } else {
                            resolve(this.authenticate(authFunction, target, ++retry))
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
    create: (obj, authfunc, retryCount) => {
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
                                    authenticator.authenticate(authFunction, target, 0)
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