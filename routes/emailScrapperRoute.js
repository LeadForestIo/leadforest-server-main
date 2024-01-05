// All Requires
const router = require("express").Router();
const emailScrapperController = require("../controllers/emailScrapperController");
const { authentication } = require("../middleware/auth");
const {
  isValidExtensionScrapData,
} = require("../middleware/validation/scraperValidation");
const {
  deleteExtensionScrap,
  newScrapByExtension,
  myScrapFromExtension,
  mySingleScrapFromExtension,
  extensionScrapStart,
} = emailScrapperController;
// ROUTE
router
  /**
   * @method DELETE
   * @urs base_url/email-scrapper/delete/:id
   */
  .delete("/delete/:id", deleteExtensionScrap)
  /**
   * @method POST
   * @urs base_url/email-scrapper/new-scrap-by-extension
   */
  .post(
    "/new-scrap-by-extension",
    //  authentication,
    isValidExtensionScrapData,
    newScrapByExtension
  )
  /**
   * @method GET
   * @urs base_url/email-scrapper/scrap-by-extension/:uid
   */
  .get("/scrap-by-extension/:uid", authentication, myScrapFromExtension)

  /*
   * @method GET
   * @urs base_url/email-scrapper/single-scrap-by-extension/:_id
   */
  .get(
    "/single-scrap-by-extension/:_id",
    authentication,
    mySingleScrapFromExtension
  )

  /*
   * @method GET
   * @urs base_url/email-scrapper/extensions-scrap-start/:_id
   */
  .get("/extensions-scrap-start/:_id", authentication, extensionScrapStart);

module.exports = router;
