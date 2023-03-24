const express = require("express");

const {
  createUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  userDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} = require("../controller/UserController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();
router.route("/inscription").post(createUser);
router.route("/connexion").post(loginUser);
router.route("/deconnexion").get(logoutUser);
router.route("/mdp/oublie").post(forgotPassword);
router.route("/mdp/reset/:token").put(resetPassword);
router.route("/moi/update").put(isAuthenticatedUser, updatePassword);
router.route("/moi/update/info").put(isAuthenticatedUser, updateProfile);
router.route("/moi").get(isAuthenticatedUser, userDetails);
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
module.exports = router;
