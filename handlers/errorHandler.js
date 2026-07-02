export const errorHandler = (error, req, res, next) => {
    if(error){
        console.log(error);
        res.status(400).json({
            success: false,
            error: !error.message ? error: error.message,
        });
    }else{
        next();
    }
}