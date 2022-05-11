const AppException = require('./AppException');

module.exports = fn => (req, res, next) => {
    if(typeof(fn) !== 'function'){
        console.log(fn)
        return next(new AppException(400, 'fn is spposed to be a function'))
    }
    return fn(req, res, next).catch(next)
};