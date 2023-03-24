const express = require("express");
const {
  createOrder,
  getSingleOrder,
  getAllOrders,
  getAdminAllOrders,
  updateAdminOrder,
  deleteOrder,
} = require("../controller/OrderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/commande/new").post(isAuthenticatedUser, createOrder);

router.route("/commande/:id").get(isAuthenticatedUser, getSingleOrder);

router.route("/commandes/moi").get(isAuthenticatedUser, getAllOrders);

router
  .route("/admin/commandes")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminAllOrders);

router
  .route("/admin/commande/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateAdminOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
