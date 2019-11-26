module.exports = {
    create: (obj, expiry) => {
        let handler = {
            Cache: [],
            get: function (target, prop, receiver) {
                if (typeof target[prop] === 'function') {
                    if (!this.Cache[prop] || this.Cache[prop].TakenAt + expiry >= Date.now()) {
                        const originalFunction = target[prop];
                        return (...args) => {
                            originalFunction.apply(target, args).then((result) => {
                                this.Cache[prop] = {
                                    TakenAt: Date.now(),
                                    Data: result
                                };
                            })
                            return Promise.resolve(this.Cache[prop].Data);
                        }
                    } else {
                        return (...args) => {
                            return Promise.resolve(this.Cache[prop].Data);
                        }
                    }
                }
            }
        }
        return new Proxy(obj, handler)
    }
}