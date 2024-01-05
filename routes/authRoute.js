const {
  emailPasswordRegister,
  emailPasswordLogin,
  recreateToken,
  veriryOTPAndUpdateUserAndCrateLoggedIn,
  emailPasswordRegisterWithOTP,
  isExistOTPUser,
  authByExtension,
  userInfo,
} = require("../controllers/authController");
const { authentication } = require("../middleware/auth");
const {
  isValidRegisterData,
  isValidRegisterDataUpdate,
  isValidLoginData,
} = require("../middleware/validation/authValidation");
const {
  isExtensionCodeValid,
} = require("../middleware/validation/extensionCodeValidator");
const {
  verifyCustomTokenMiddleware,
} = require("../middleware/verifyCustomToken");

// All Requires
const router = require("express").Router();

// ROUTE
router
  /**
   * @method POST
   * @route base_url/auth/email-password-register
   */
  .post("/email-password-register", emailPasswordRegister)
  /**
   * @method POST
   * @route base_url/auth/by-extension
   */
  .post("/by-extension", isExtensionCodeValid, authByExtension)

  /**
   * @method POST
   * @route base_url/auth/email-password-register-with-otp
   */
  .post(
    "/email-password-register-with-otp",
    isValidRegisterData,
    emailPasswordRegisterWithOTP
  )

  /**
   * @method POST
   * @route base_url/auth/veriry-otp-with-loggedIn-user
   */
  .put(
    "/veriry-otp-with-loggedIn-user",
    isValidRegisterDataUpdate,
    veriryOTPAndUpdateUserAndCrateLoggedIn
  )

  /**
   * @method POST
   * @route base_url/auth/email-password-login
   */
  .post("/email-password-login", isValidLoginData, emailPasswordLogin)

  /**
   * @method POST
   * @route base_url/auth/check-existing-user-otp
   */
  .post("/check-existing-user-otp", isExistOTPUser)

  /**
   * @method GET
   * @route base_url/auth/recreateToken
   */
  .get("/recreateToken", verifyCustomTokenMiddleware, recreateToken)


  /**
   * @method GET
   * @route base_url/auth/check
   */
  .get("/check", authentication, userInfo);

// Exports
module.exports = router;
