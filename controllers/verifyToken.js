const { promisify } = require('util');
const jwt = require('jsonwebtoken');

module.exports = async (authHeader) => {

    try {
        console.log(authHeader)

        if ( authHeader && authHeader.startsWith('Bearer') ){
        token = authHeader && authHeader.split(" ")[1];
        }
        
        if (!token){
            return false;
        }
        
        // 2) Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded)
    
        // 3) Check if user still exists
        const currentUser = await User.findByPk(decoded.id);
        if (!currentUser) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
};