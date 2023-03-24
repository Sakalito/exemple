const ErrorHandLer = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchingAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");


const extractBearerToken = (headerValue) => {
  if (typeof headerValue !== "string") {
    return false;
  }

  const matches = headerValue.match(/(bearer)\s+(\S+)/i);
  return matches && matches[2];
};

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

  const token =
    req.headers.authorization && extractBearerToken(req.headers.authorization);

  if (!token) {
    return next(
      new ErrorHandLer("Veuillez vous connecter pour accéder à cette page", 401)
    );
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decodedData.id);

  next();
});
//Rôle administrateur
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandLer(
          `${req.user.role} ne peut pas avoir accès à cette page`
        )
      );
    }
    next();
  };
};
