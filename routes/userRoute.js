const router = require("express").Router();
const {
  getAllUsersExports,
  getsingleUserExports,
  updateUser,
  updateTokenOfUser,
  getUserByUID,
  me,
} = require("../controllers/userController");

const { authentication, authorization } = require("../middleware/auth");
const { isAuthenticated } = require("../middleware/firebase/firebaseAdmin");
// All Requires

// ROUTE
router
  /**
   * @route base_url/user/api/allusers
   * @method GET
   */
  .get("/api/allusers", authentication, authorization, getAllUsersExports)
  /**
   * @route base_url/user/api/user/:id
   * @method GET
   */
  .get("/api/user/:id", authentication, authorization, getsingleUserExports)

  /**
   * @route base_url/user/api/user-me
   * @method GET
   */
  .get("/api/user-me", authentication, me)

  /**
   * @route base_url/user/api/user/:id
   * @method POST
   */
  .post("/api/user/update/:id", authentication, authorization, updateUser);

// ROUTE
router
  /**
   * @method POST
   * @route base_url/user/update-token-user
   */
  .post("/update-token-user", updateTokenOfUser) ;
router
  /**
   * @method POST
   * @route base_url/user/getUserByUID
   */
  .post("/getUserByUID", getUserByUID);

// Exports
module.exports = router;
