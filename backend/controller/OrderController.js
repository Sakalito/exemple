const Order = require("../models/OrderModel");
const ErrorHandLer = require("../utils/ErrorHandler.js");
const catchingAsyncError = require("../middleware/catchingAsyncError");
const Product = require("../models/ProductModel");

// Create Commande
exports.createOrder = catchingAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//  Get Single order  
exports.getSingleOrder = catchingAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandLer("Commande introuvable avec cette id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// Get all orders
exports.getAllOrders = catchingAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json({
    success: true,
    orders,
  });
});

// Get All orders ---Admin
exports.getAdminAllOrders = catchingAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status ---Admin
exports.updateAdminOrder = catchingAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandLer("Commande non trouvée avec cette Id", 404));
  }

  if (order.orderStatus === "Délivré") {
    return next(new ErrorHandLer("Vous avez déjà délivré cette commande", 400));
  }

  if (req.body.status === "Expédié") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Délivré") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// delete Order ---Admin
exports.deleteOrder = catchingAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandLer("Commande non trouvée avec cet id", 404));
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
