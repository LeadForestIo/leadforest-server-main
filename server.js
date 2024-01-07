// ALL REQUIRES STARTS
// require('dotenv').config({ path: './dev.env' });
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const db = require('./config/db');
const defaultErrorHandle = require('./middleware/defaultErrorHandle');

// CREATING APP
const app = express();

// DECLARING PORT
const PORT = process.env.PORT || 5000;

// MIDDLEWARES
const middlwares = [
  cors({
    // origin: [
    //   "https://app.leadforest.io",
    //   "https://dev.leadforest.io",
    //   "https://dev-leadforest.netlify.app",
    //   "http://localhost:3000",
    //   "https://twitter.com",
    // ],
    origin: '*',
  }),
  express.urlencoded({ extended: true }),
  // express.json({ limit: "10mb" }),
  fileUpload(),
];

if (process.env.NODE_ENV !== 'production') {
  app.use(require('morgan')('dev'));
}
app.use(middlwares);

app.use((req, res, next) => {
  console.log(req.originalUrl);
  if (req.originalUrl === '/stripe/webhook') {
    next();
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});

// ROUTE DECLARATION
app.use('/auth', require('./routes/authRoute'));
app.use('/user', require('./routes/userRoute'));
app.use('/stripe', require('./routes/stripeRoute'));
app.use('/email', require('./routes/emailRoute'));
app.use('/email-scrapper', require('./routes/emailScrapperRoute'));
app.use('/plans', require('./routes/planRoute'));

//
// ROOT API
app.get('/', async (req, res) => {
  try {
    res.send({
      runningOn: process.env.NODE_ENV,
      date: '3-12-23', //last deployment date
    });
  } catch (e) {
    res.send({ e: e });
  }
});

// // POST route to insert new data
// app.post('/', (req, res) => {
//   const { type, data, totalScraped, status } = req.body;

//   const newData = new MyData({
//     type: type,
//     data: data,
//     totalScraped: totalScraped,
//     status: status
//   });

//   newData.save((err) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send(err);
//     }
//     return res.status(200).send('New data inserted successfully');
//   });
// });

app.use(defaultErrorHandle);

// CONNECT DB WITH MONGOOSE
db()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      app.listen(PORT, () => {
        console.log(`DEV SERVER IS RUNNING ON PORT: ${PORT} ❤️`);
        console.log('DB CONNECTED');
      });
    } else {
      app.listen(PORT, () => {
        console.log(`server started: ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log(`SERVER ERROR: ${err}`);
  });

// console.log(process.env.NODE_ENV)
// cors
const axios = require('axios');

const port = 3001;

app.use(express.json());

app.get('/twitter', async (req, res) => {
  try {
    const response = await axios.get(`https://api.twitter.com${req.url}`, {
      headers: {
        Authorization: req.headers.authorization, // Forward Twitter API authorization header
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(error.response.status).json(error.response.data);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
// testing commit