const AppException = require('./AppException');

module.exports = fn => {
    if(typeof(fn) !== 'function'){
        console.log(fn)
        return next(new AppException(400, 'fn is spposed to be a function'))
    }
    return (req, res, next) => {
        return fn(req, res, next).catch(next)
    };}