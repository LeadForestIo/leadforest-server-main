const { ALLOW_PROMOTION_CODES } = require('../config');
const User = require('../models/User');
const { stripe } = require('../utils/stripe');

//get products
exports.getPrices = async (req, res, next) => {
  const prices = await stripe.prices.list({
    apiKey: process.env.STRIPE_SECRET_KEY,
  });
  res.send({ prices });
};

//createSession
exports.createSession = async (req, res, next) => {
  try {
    const { origin } = req.headers;
    const user = await User.findOne({ email: req.body.email }).exec();
    let stripeCustomerId = user?.stripeCustomerID;

    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create(
          {
            email: req.body.email,
          },
          {
            apiKey: process.env.STRIPE_SECRET_KEY,
          }
        );
        stripeCustomerId = customer.id;
        const updateDoc = {
          stripeCustomerId: customer.id,
        };
        const savedUser = await User.updateOne(
          { email: req.body.email },
          updateDoc,
          {
            upsert: true,
          }
        );
      } catch (err) {
        console.log(err);
      }
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create(
        {
          mode: 'subscription',
          payment_method_types: ['card'],
          currency: 'usd',
          allow_promotion_codes: ALLOW_PROMOTION_CODES,
          line_items: [
            {
              price: req.body.priceId,
              quantity: 1,
            },
          ],
          success_url: `${origin}/subscription?payment_success`,
          cancel_url: `${origin}/subscription?payment_fail`,
          customer: stripeCustomerId,
        },
        {
          apiKey: process.env.STRIPE_SECRET_KEY,
        }
      );
    } catch (er) {
      console.log(er);
    }

    return res.status(200).send({
      isSuccess: true,
      session: session,
    });
  } catch (e) {
    res.status(500).send({ message: 'something went wrong' });
  }
};

exports.webhook = async (request, response, next) => {
  try {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK;

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    console.log(event.type, 1234);

    switch (event.type) {
      // case "customer.subscription.created": // customer.subscription.updated event triggers when user creates a new subscription
      case 'customer.subscription.updated':
        const subscription = event.data.object;

        const endDate = new Date(subscription.current_period_end * 1000);
        const customerId = subscription.customer;
        let selectedPlan = 'none',
          credit = 0;

        if (subscription.plan.product === 'prod_OMXTSiXw1NU9f5') {
          selectedPlan = 'basic';
          credit = 29000;
        } else if (subscription.plan.product === 'prod_OMXQEZtGAEwA0O') {
          selectedPlan = 'standard';
          credit = 59000;
        } else if (subscription.plan.product === 'prod_OMXO7ou5AgB54d') {
          selectedPlan = 'premium';
          credit = 99000;
        }

        // else if (subscription.plan.product === 'prod_OTzu0aIoq1N97R') { testing form tweetsy.io stripe
        // id: 'price_1Nh1ufJiucP6ZDzJXiT2yiKJ', // test
        //   //test
        //   selectedPlan = 'standard';
        //   credit = 59001;
        // }

        // Retrieve the customer's email using the Stripe API
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;
        if (selectedPlan && credit) {
          const updateDoc = {
            $set: {
              selectedPlan: selectedPlan,
              endDate: endDate,
              credit: credit,
            },
          };

          try {
            const query = { email: email };
            const options = { upsert: true };
            const userUpdate = await User.updateOne(query, updateDoc, options);
          } catch (e) {
            console.log(e);
          }
        }

        break;
      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        const canceledUserId = canceledSubscription.customer;
        const customerObj = await stripe.customers.retrieve(canceledUserId);
        const canceledEmail = customerObj.email;

        // Update user data to reflect cancellation (you can set relevant fields to null or perform any other necessary action)
        const cancelUpdateDoc = {
          $set: {
            selectedPlan: 'none',
            // endDate: null,
            credit: 0,
          },
        };

        try {
          const cancelQuery = { email: canceledEmail };
          const cancelOptions = { upsert: true };

          const canceledUserUpdate = await User.updateOne(
            cancelQuery,
            cancelUpdateDoc,
            cancelOptions
          );
        } catch (e) {
          console.log(e);
        }

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (e) {
    response.status(500).send({ message: e.message || 'Something went wrong' });
  }
};
exports.webhook2 = async (request, response, next) => {
  try {
    console.log('object');
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK;
    // const endpointSecret = "whsec_Jut91jQPssjBCffB0gHmKqbO1aTnzgzA"; //for render server

    let event;

    try {
      console.log({
        stripeWebhooksConstructEvent: stripe.webhooks.constructEvent,
      });
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      console.log('try executed');
    } catch (err) {
      console.log('try error');
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case 'charge.succeeded':
        const chargeSucceeded = event.data.object;
        const status = chargeSucceeded?.status;
        const paid = chargeSucceeded?.paid;
        const amount_captured = chargeSucceeded?.amount_captured;
        const startDate = chargeSucceeded.created * 1000;
        const email = chargeSucceeded?.billing_details?.email;
        const stripeCustomerID = chargeSucceeded.customer;

        console.log({
          email,
          status,
          paid,
          amount_captured,
        });
        if (email && paid && amount_captured && status === 'succeeded') {
          //update your database
          if (amount_captured === 4900) {
            //add basic subscription
            try {
              const query = { email: email };
              const options = { upsert: true };
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              const updateDoc = {
                $set: {
                  selectedPlan: 'basic',
                  endDate: endDate,
                  credits: 1000,
                  startDate,
                  stripeCustomerID,
                },
              };
              const userUpdate = await User.updateOne(
                query,
                updateDoc,
                options
              );
            } catch (e) {
              console.log(e);
            }
          } else if (amount_captured === 9900) {
            //add standard subscription
            try {
              const query = { email: email };
              const options = { upsert: true };
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              const updateDoc = {
                $set: {
                  selectedPlan: 'standard',
                  endDate,
                  credits: 5000,
                  startDate,
                  stripeCustomerID,
                },
              };
              const userUpdate = await User.updateOne(
                query,
                updateDoc,
                options
              );
            } catch (e) {
              console.log(e);
            }
          } else if (amount_captured === 24900) {
            //add pro subscription
            try {
              const query = { email: email };
              const options = { upsert: true };
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);

              const updateDoc = {
                $set: {
                  selectedPlan: 'pro',
                  endDate,
                  credits: 20000,
                  startDate,
                  stripeCustomerID,
                },
              };
              const userUpdate = await User.updateOne(
                query,
                updateDoc,
                options
              );
            } catch (e) {
              console.log(e);
            }
          } else {
            console.log('request to another server');
          }
        } else {
          response.status(422).send({
            isSuccess: false,
            message:
              'billing details or some important payment infos are missing!',
          });
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  } catch (e) {
    response.status(500).send({ message: e.message || 'something went wrong' });
  }
};

//cancelSubscription
exports.cancelSubscription = async (req, res, next) => {
  try {
    const customerID = req.body.customerID;
    // https://stackoverflow.com/questions/63886638/stripe-cancel-a-subscription-in-js
    /*
        // Set your secret key. Remember to switch to your live secret key in production.
        // See your keys here: https://dashboard.stripe.com/apikeys
        const stripe = require('stripe')('sk_test_51M0QGtCx996FZZgar0EDav42cUAomy2QXE4UIeae8WglFKFD7VtyfUx2Jkgkaw9hEMyJ9pPLZ2eqJbngBHZdkozK00YBZqs9VM');

        stripe.subscriptions.update('sub_49ty4767H20z6a', {cancel_at_period_end: true});
    */
  } catch (err) {
    res.status.send({ isSuccess: false });
  }
};
