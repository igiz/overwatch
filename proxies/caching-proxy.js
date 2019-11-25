module.exports = {
    create : (obj, expiry) => {
        let handler = {
            Cache : [],
            get: function(target, prop, receiver) {
                if (typeof target[prop] === 'function') {
                    if(Cache[prop] && Cache[prop].TakenAt + expiry >= Date.now()){
                        const originalFunction = target[propKey];
                        return (...args) => {
                            let result = originalFunction.apply(this, args);
                            Cache[prop] = {TakenAt: Date.now(), Data: result};
                        }
                    } else {
                        return (...args) => {
                            return Cache[prop].Data
                        }
                    }
                }
            }
        }
        return new Proxy(obj, handler)
    }
}