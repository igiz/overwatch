module.exports = {
    create: (obj, authFunction, retryCount) => {
        let handler = {
            Token: '',
            get: function (target, prop, receiver) {
                if (typeof target[prop] === 'function') {
                    const authFunction = target[authFunction]
                    const functionToCall = target[prop]
                    //Wrap it with authentication function if initial call fails
                    return (...args) => {
                        return new Promise((resolve, reject) => {
                            functionToCall.apply(null, args).then((result) => {

                            }).catch((error) => {

                            })

                        })
                    }
                }
            }
        }
        return new Proxy(obj, handler)
    }
}