const ErrorHandLer = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Interval server error"

    //mongo db erreur d'id 
    if(err.name === "CastError"){
      const message = `Ressources non trouvées avec cet ${err.path} invalide`;
      err = new ErrorHandLer(message, 400);
  }
  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandLer(message, 400);
  }
  // Erreur JwT mauvais
  if (err.name === "JsonWebTokenError") {
    const message = `Votre url n'est pas valide, veuillez réessayer`;
    err = new ErrorHandLer(message, 400);
    }

     //Erreur Jwt expiré 
     if (err.name === "TokenExpiredError") {
       const message = `Votre url n'est pas valide, veuillez réessayer`;
       err = new ErrorHandLer(message, 400);
       }

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
