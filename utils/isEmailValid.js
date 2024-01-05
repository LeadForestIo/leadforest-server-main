var axios = require('axios');

async function IsEmailValidFunc(email) {
  const res = await axios.post(
    'https://app.nullbounce.com/api/v1/validation_history/validate/',
    { email },
    {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: 'Token d51f83a51084c870f3185d48be635ed7a99f7925',
      },
    }
  );
  console.log(res?.data?.result !== 'Invalid');
  return res?.data?.result !== 'Invalid';
}

// var unirest = require('unirest');

// async function IsEmailValidFunc(email) {
//   var req = unirest(
//     'POST',
//     'https://app.nullbounce.com/api/v1/validation_history/validate/'
//   );

//   req.headers({
//     accept: 'application/json',
//     'content-type': 'application/json',
//     authorization: 'Token d51f83a51084c870f3185d48be635ed7a99f7925',
//   });

//   await req.send(`{"email": "${email}"}`);
//   console.log('req.end before');

//   await req.end(function (res) {
//     console.log('req.end start');
//     return res.body?.result !== 'Invalid';
//   });
//   console.log('req.end executed');
// }

module.exports = { IsEmailValidFunc };
