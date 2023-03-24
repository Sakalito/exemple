const User = require("../models/UserModel");
const ErrorHandLer = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchingAsyncError");
const sendToken = require("../utils/jwtToken.js");
const sendMail = require("../utils/sendMail.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");




//inscription
exports.createUser = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, email, password, avatar } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Utilisateur déjà existant" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
    });

    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: myCloud.public_id, url: myCloud.secure_url },
    });
    
    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
//Connexion
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(
      new ErrorHandLer("Veuillez saisir votre email et votre mot de passe", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandLer("Adresse e-mail ou mot de passe incorrect", 401));
  }
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandLer("Adresse e-mail ou mot de passe incorrect", 401)
    );
  }
  sendToken(user, 200, res);
});


//Deconnexion
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Vous êtes déconnecté",
  });
});


//Mot de passe oublié
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandLer("Utilisateur non trouvé avec cet email", 404));
  }

  // Get ResetPassword Token

  const resetToken = user.getResetToken();

  await user.save({
    validateBeforeSave: false,
  });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/mdp/reset/${resetToken}`;

  const message = `Votre mot de passe est reinitialisé  token is :- \n\n ${resetPasswordUrl}`;

  try {
    await sendMail({
      email: user.email,
      subject: `Wassim Ecommerce récupération`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email enovoyé à ${user.email} avec succès`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;

    await user.save({
      validateBeforeSave: false,
    });

    return next(new ErrorHandLer(error.message, 500));
  }
});


//Reset mot de passe
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Create Token hash

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordTime: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandLer("L'URL de réinitialisation du mot de passe n'est pas valide ou a expiré", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHandLer("Le mot de passe ne correspond pas au nouveau mot de passe", 400)
    );
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordTime = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//  Lire informations user
exports.userDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User mdp
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
   
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(
      new ErrorHandLer("L'ancien mot de passe est incorrect", 400)
    );
  };

  if(req.body.newPassword  !== req.body.confirmPassword){
      return next(
          new ErrorHandLer("Les mots de passe ne correspondent pas les uns aux autres", 400)
        );
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user,200,res);
});

// Update User Profile
exports.updateProfile = catchAsyncErrors(async(req,res,next) =>{
  const newUserData = {
      name: req.body.name,
      email: req.body.email,
  };

 if (req.body.avatar !== "") {
  const user = await User.findById(req.user.id);

  const imageId = user.avatar.public_id;

  await cloudinary.v2.uploader.destroy(imageId);

  const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
    folder: "avatars",
    width: 150,
    crop: "scale",
  });
  newUserData.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };
}

const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
  new: true,
  runValidator: true,
  useFindAndModify: false,
});

res.status(200).json({
  success: true,
  user,
});
});
// Get All users ---Admin
exports.getAllUsers = catchAsyncErrors(async (req,res,next) =>{
  const users = await User.find();

  res.status(200).json({
      success: true,
      users,
  });
});

// Get Single User Details ---Admin
exports.getSingleUser = catchAsyncErrors(async (req,res,next) =>{
  const user = await User.findById(req.params.id);
 
  if(!user){
      return next(new ErrorHandLer("Utilisateur introuvable avec cet id",400));
  }

  res.status(200).json({
      success: true,
      user,
  });
});

// Change user Role --Admin
exports.updateUserRole = catchAsyncErrors(async(req,res,next) =>{
  const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
  };
  const user = await User.findByIdAndUpdate(req.params.id,newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
  });

  res.status(200).json({
      success: true,
      user
  })
});

// Delete User ---Admin
exports.deleteUser = catchAsyncErrors(async(req,res,next) =>{

 const user = await User.findById(req.params.id);

 const imageId = user.avatar.public_id;

 await cloudinary.v2.uploader.destroy(imageId);

  if(!user){
      return next(new ErrorHandLer("Utilisateur introuvable avec cet id",400));
  }

  await user.remove();

  res.status(200).json({
      success: true,
      message:"Utilisateur supprimé"
  })
});



