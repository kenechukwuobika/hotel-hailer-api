const AppException = require('../utilities/AppException');

const handleCastError =  error => {
  return (new AppException(400, `${error.stringValue} is not a valid id`));
}

const handleValidationError =  error => {
    const err = Object.values(error.errors).map(el => el.message)
    return (new AppException(400, err));
}

const handleUniqueError =  error => {
    const keyValues = Object.keys(error.keyValue);
    if(keyValues.includes('property') && keyValues.includes('user')){
        return (new AppException(400, `Sorry you have already submitted a review on this property`));
    }

    // (error)
    return (new AppException(400, `this ${Object.keys(error.keyValue)} is already being used by another customer`));
}

const handleJWTError =  () => {
    return new AppException(401, 'Invalid token!!!, please login again to get a token');
}

const handleJWTExpireError =  () => {
    return new AppException(401, 'token has expired, please login again to get a token');
}

const sendDevError = (error, res) => {
    // console.log((error))
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            ...error,
        });
    }
    else{
        res.status(500).json({
            status: 'error',
            ...error,
        });
    }
    
}

const sendProdError = (error, res, next) => {
    // console.log(error)
    if(error.isOperational){
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
        
    }
    else{
        res.status(500).json({
            status: 'error',
            message: 'something went wrong'
        });
    }

}

module.exports = (err, req, res, next) => {
    let error = {...err};
        error.name = err.name;
        error.stack = err.stack;
        error.message = err.message;
    
    if(process.env.NODE_ENV === 'development'){  
        sendDevError(error, res)
    }
    else{
        
        if(error.name === 'CastError') error = handleCastError(error);
        if(error.name === 'ValidationError') error = handleValidationError(error);
        if(error.code === 11000) error = handleUniqueError(error);
        if(error.name === 'JsonWebTokenError') error = handleJWTError();
        if(error.name === 'TokenExpiredError') error = handleJWTExpireError();
        sendProdError(error, res)
    }
    next();
}