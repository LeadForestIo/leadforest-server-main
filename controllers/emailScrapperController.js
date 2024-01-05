//internal imports
const { isValidObjectId } = require("mongoose");
const ScrapedData = require("../models/ScrapedData");
const User = require("../models/User");
const TwitterUsers = require("../models/TwitterUsers");
const ScrapTrac = require("../models/ScrapTrac");
function call(params) {
  ScrapedData.findOne({ _id: "648f13692b25ec6966d5696b" })
    .then(async (d) => {
      let count = 0;
      let found = 0;
      const data = [];
      for await (const item of d?.data || []) {
        delete item.email;
        data.push(item);
      }
      const saved = await ScrapedData.findByIdAndUpdate(
        "648f13692b25ec6966d5696b",
        { data, status: "Incompleted", foundEmailCount: 0 },
        { new: true }
      );
      console.log(saved?.data);
    })
    .catch(console.error);
}
// setTimeout(() => {
//   call();
// }, 20000);
async function ScrapSingleAsync(id, uid, scraped = [], userEmail) {
  // let TimeStart;
  const len = scraped.length; // length of imported list
  const data = JSON.parse(JSON.stringify(scraped));
  // TimeStart = Date.now();

  let moreFindEmail = true,
    loop = -1;
  const lastUsername = scraped[len - 1]?.username; // last user of the scraped list

  for (const single of scraped) {
    loop++;

    if (!single?.username || single.email) {
      if (single?.username === lastUsername) {
        await ScrapedData.updateOne(
          { _id: id },
          {
            status: "Completed",
          }
        ).select("_id");
      }
      continue;
    }
    if (!moreFindEmail) break;

    try {
      const doesExits = await TwitterUsers.findOne({
        screenName: single.username,
      });

      if (doesExits) {
        const previousScrap = await ScrapTrac.findOne({ email: userEmail })
          .select("screenNames -_id")
          .exec();
        if (!previousScrap) break;
        const isPrev = previousScrap._doc?.screenNames?.includes?.(
          single.username
        );
        let status = "Scraping";
        if (!isPrev) {
          await ScrapTrac.updateOne(
            { email: userEmail },
            { $push: { screenNames: single.username } }
          );

          const checkCredits = await User.findByIdAndUpdate(
            uid,
            {
              $inc: { credits: -1 },
            },
            { new: true }
          ).select("credits -_id");

          if (checkCredits?._doc?.credits < 1) {
            console.log(`No credit`);
            moreFindEmail = false;
            status = "Incompleted";
          }
        }

        // if (checkCredits?._doc?.credits) {
        //   data[loop].email = doesExits._doc.email;
        // }
        data[loop].email = doesExits._doc.email;

        if (single.username === lastUsername) {
          status = "Completed";
        }

        // if (len !== data.length) {
        //   console.log(`Total scrape request and update scrape are not same`);
        //   break;
        // }

        const obj = { $inc: { foundEmailCount: 1 }, status };
        const result = await ScrapedData.findByIdAndUpdate(id, {
          data,
          ...obj,
        }).select("_id");
        console.log({ result });
      } else {
        console.log(`No email found for this user ${single.username}`);
        if (single.username === lastUsername) {
          await ScrapedData.updateOne(
            { _id: id },
            {
              status: "Completed",
            }
          ).select("_id");
        }
      }
    } catch (e) {
      console.log(e.message, "scrape email");
      // return false;
    }
  }
}

// Scrap();
const emailScrapperController = {};

emailScrapperController.newScrapByExtension = async (req, res) => {
  try {
    console.log(req.headers);
    const { importType, scrapeReference, extensionCode, data } = req.body;
    // const { _id } = req.user;
    const doesExits = await User.findOne({ extensionCode })
      .select("_id")
      .exec();
    if (!doesExits)
      return res.status(400).json({
        isSuccess: false,
        message: `Invalid User!`,
      });
    await ScrapedData.create({
      importType,
      scrapeReference,
      uid: doesExits._doc._id, // It should be user _id
      data,
      totalScraped: data.length,
    });
    res.json({
      isSuccess: true,
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

emailScrapperController.myScrapFromExtension = async (req, res) => {
  try {
    const { uid } = req.params;
    const { status, select = "" } = req.query;
    const { credits } = req.user;
    if (!isValidObjectId(uid)) {
      return res.status(422).json({
        isSuccess: false,
        message: `Invalid query id`,
      });
    }
    const qry = {
      uid,
    };
    if (status) qry.status = { $in: status.split(",") };
    const multiSelect = select?.split?.(",")?.join(" ");
    const data = await ScrapedData.find(qry).select(multiSelect).exec();
    res.json({
      isSuccess: true,
      data,
      credits,
    });
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

emailScrapperController.mySingleScrapFromExtension = async (req, res) => {
  try {
    const { _id } = req.params;
    const { select = "" } = req.query;
    if (!isValidObjectId(_id)) {
      return res.status(400).json({
        isSuccess: false,
        message: `Invalid query id!`,
      });
    }
    const qry = {
      _id,
      uid: req.user._id,
    };
    let status = 200;
    const data = await ScrapedData.findOne(qry).select(select).exec();
    if (!data) status = 404;
    res.status(status).json({
      isSuccess: true,
      data,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: e.message,
    });
  }
};

emailScrapperController.extensionScrapStart = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!isValidObjectId(_id)) {
      return res.status(422).json({
        isSuccess: false,
        message: `Invalid query id!`,
      });
    }
    const { _id: uid, endDate, credits, email, selectedPlan } = req.user;

    if (selectedPlan === "none") {
      return res
        .status(402)
        .json({ isSuccess: false, message: `Please subscribe!` });
    }
    if (
      selectedPlan === "basic" ||
      selectedPlan === "standard" ||
      selectedPlan === "pro" ||
      selectedPlan === "trial"
    ) {
      const expiry = new Date(endDate);
      const currentTime = new Date();
      if (expiry.getTime() < currentTime.getTime()) {
        return res
          .status(402)
          .json({ isSuccess: false, message: `Please subscribe!` });
      }
    }

    // Allow one scraper at a time (check running scraping)
    const countScraping = await ScrapedData.countDocuments({
      uid,
      status: "Scraping",
    });
    if (countScraping) {
      return res.status(400).json({
        message: `Already, another scraper is running!`,
        isSuccess: false,
      });
    }
    // Check Credit (throw error following credit)
    if (credits < 1)
      return res.status(400).json({
        message: `Credit limit extended!`,
        isSuccess: false,
      });

    const doesExits = await ScrapedData.findOne({ uid, _id }).exec();
    if (!doesExits) {
      return res.status(404).json({
        message: `Scrape does't exist`,
        isSuccess: false,
      });
    }

    if (doesExits._doc.status === "Completed") {
      return res.status(400).json({
        message: `Scrape already completed!`,
        isSuccess: false,
      });
    } else if (doesExits._doc.status === "Scraping") {
      return res.status(400).json({
        message: `Scrape already Scraping!`,
        isSuccess: false,
      });
    }
    // doesExits.status = "Initializing";
    // await doesExits.save();
    await ScrapedData.updateOne(
      { _id: _id },
      {
        status: "Scraping",
      }
    ).select("_id");

    res.json({
      isSuccess: true,
      message: `Scrape has been started, Successfully!`,
    });

    ScrapSingleAsync(_id, uid, doesExits._doc.data, email);
    // console.log((Date.now() - TimeStart) / 1000);
  } catch (e) {
    res.status(500).json({
      message: e.message,
    });
  }
};

emailScrapperController.deleteExtensionScrap = async (req, res) => {
  try {
    const { id: _id } = req.params;
    const { _id: uid } = req.user;
    if (!isValidObjectId(id)) {
      return res.status(422).json({ message: `you sent an invalid id` });
    }

    const deleted = await ScrapedData.findOneAndDelete({ uid, _id });
    if (!deleted) {
      return res.status(422).json({ message: `There is no scrape for delete` });
    }

    res.json({
      msg: "Alhamdu lillah - deleted scraped emails successfully",
      deleted,
      isSuccess: true,
    });
  } catch (e) {
    res.sendStatus(500);
  }
};

module.exports = emailScrapperController;
