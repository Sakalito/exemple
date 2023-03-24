const Product = require("../models/ProductModel.js");
const ErrorHandLer = require("../utils/ErrorHandler.js");
const catchingAsyncError = require("../middleware/catchingAsyncError");
const Features = require("../utils/Features");

//Ajouter un produit---Admin
exports.createProduct = catchingAsyncError(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    product,
  });
});

//Lire tous les produits 
exports.getAllProducts = catchingAsyncError(async (req, res) => {
  const resultPerPage = 5;
  const productsCount = await Product.countDocuments();

  const feature = new Features(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await feature.query;
  res.status(200).json({
    success: true,
    products,
    productsCount
  });
});

//maj du produit ---Admin
exports.updateProduct = catchingAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandLer("Produit introuvable avec cet id", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useUnified: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

//Suppression du produit ---Admin
exports.deleteProduct = catchingAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandLer("Produit introuvable avec cet id", 404));
  }
  await product.remove();

  res.status(200).json({
    success: true,
    message: "Produit supprimé",
  });
});

//Lire le produit détaillé
exports.getSingleProduct = catchingAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandLer("Produit introuvable avec cet id", 404));
  }
  res.status(200).json({
    success: true,
    product
  });
});

// Creer ou met a jour un review 
exports.createProductReview = catchingAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All reviews pour un seul produit
exports.getSingleProductReviews = catchingAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandLer("Produit introuvable avec cet id", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review --Admin
exports.deleteReview = catchingAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandLer("Produit introuvable avec cet id", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

