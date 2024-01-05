const Plan = require("../models/Plan");
const { stripe } = require("../utils/stripe");
// stripe.products.list().then((d) => console.log(d));
exports.createNewPlan = async (req, res) => {
    try {
        const {
            priceId,
            prodId,
            name,
            description,
            type,
            facilities,
            price,
            status,
            permission,
        } = req.body;
        const doesExistPlan = await Plan.findOne({
            $or: [{ prodId }, { priceId }],
        })
            .select("_id")
            .exec();
        if (doesExistPlan)
            return res.json({
                isSuccess: false,
                message: `ProdId or PriceId already exists!`,
            });
        const { default_price } = await stripe.products.retrieve(prodId);
        if (default_price !== priceId)
            return res.status(400).json({
                isSuccess: false,
                message: `PriceId doesn't exist on stripe!`,
                like: default_price.substr(-15),
            });
        const newData = {
            status,
            priceId,
            price,
            prodId,
            name,
            type,
            facilities,
            permission,
        };
        if (description) newData.description = description;
        const newPlan = await Plan.create(newData);
        res.json({ isSuccess: true, newPlan });
    } catch (e) {
        const status = e.statusCode || e.status || 500;
        const message = e.message;
        res.status(status).json({
            message,
            isSuccess: false,
        });
    }
};

exports.allPlans = async (req, res) => {
    try {
        const { status = "active", select = "" } = req.query;
        const qry = { status };
        if (status === "all") delete qry.status;
        const plans = await Plan.find(qry).select(select).exec();
        res.json({ isSuccess: true, plans });
        // res.status(404).json({
        //     message: "e.message",
        // });
    } catch (e) {
        res.status(500).json({
            message: e.message,
        });
    }
};

exports.getPlan = async (req, res) => {
    try {
        const { _id } = req.params;
        const { select = "" } = req.query;
        const qry = { _id };
        const { deletedCount } = await Plan.findOne(qry).select(select).exec();

        res.json({ isSuccess: true, plan });
    } catch (e) {
        res.status(500).json({
            message: e.message,
        });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { _id } = req.params;
        const { deletedCount } = await Plan.deleteOne({ _id }).exec();
        if (!deletedCount)
            return res.status(404).json({
                isSuccess: false,
                message: `Not found, _id: ${_id} `,
            });

        res.json({
            isSuccess: true,
            message: `Alhamdu lillah, Plan has been deleted, Successfully 😃`,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: e.message,
        });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const { _id } = req.params;
        const {
            priceId,
            prodId,
            name,
            description,
            type,
            facilities,
            price,
            status,
            permission,
        } = req.body;
        const updateObj = {
            priceId,
            prodId,
            name,
            description,
            type,
            facilities,
            price,
            status,
            permission,
        };
        const plan = await Plan.findByIdAndUpdate(_id, updateObj, {
            new: true,
            runValidators: true,
        });
        res.json({
            isSuccess: true,
            message: `Alhamdu lillah, Plan has been updated, Successfully 😃`,
            plan,
        });
    } catch (e) {
        res.status(500).json({
            message: e.message,
        });
    }
};
