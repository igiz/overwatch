module.exports = {
    create: (obj, authfunc, retryCount) => {
        let handler = {
            Token: '',
            retry: function (target, prop , receiver){

            },
            get: function (target, prop, receiver) {
                if (typeof target[prop] === 'function') {
                    const authFunction = target[authfunc]
                    const functionToCall = target[prop]
                    //Wrap it with authentication function if initial call fails
                    return (...args) => {
                        return new Promise((resolve, reject) => {
                            functionToCall.apply(target, args).then((result) => {
                                resolve(result)
                            }).catch((error) => {
                                if(error.response && error.response.status == 401){
                                    authFunction.apply(target)
                                    .then((result) => {
                                        this.Token = result
                                        return this.get(target, prop, receiver)
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