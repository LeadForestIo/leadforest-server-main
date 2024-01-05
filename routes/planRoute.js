// All Requires
const router = require("express").Router();
const { getApp } = require("firebase-admin/app");
const { sendEmail } = require("../controllers/emailController");
const {
  createNewPlan,
  allPlans,
  updatePlan,
  deletePlan,
} = require("../controllers/planController");
const { authentication, authorization } = require("../middleware/auth");
const {
  isValidNewPlanData, isValidUpdatePlanData,
} = require("../middleware/validation/planValidation");

// Routes
router
  .route("/")
  /**
   * @method GET
   * @route base_url/plans
   */
  .get(authentication, allPlans)
  /**
   * @method POST
   * @route base_url/plans
   */
  .post(authentication, authorization, isValidNewPlanData, createNewPlan);
router
  .route("/:_id")
  /**
   * @method GET
   * @route base_url/plans/:_id
   */
  .get(authentication, authorization, getApp)
  /**
   * @method PUT
   * @route base_url/plans/:_id
   */
  .put(authentication, isValidUpdatePlanData, updatePlan)
  /**
   * @method DELETE
   * @route base_url/plans/:_id
   */
  .delete(authentication, authorization, deletePlan);

// Export
module.exports = router;
