const entitiesUrl = (urls = []) => {
  let newUrl = '';
  urls.forEach(({ display_url }) => {
    if (display_url) {
      newUrl += display_url.trim() + ' ';
    }
  });
  return newUrl;
};

const getUrls = (entities) => {
  let strURLs = '';
  const urls = entities?.url?.urls;
  const desc = entities?.description?.urls;
  // console.log(urls, desc);
  if (urls?.length) {
    strURLs += entitiesUrl(urls);
  }

  if (desc?.length) {
    strURLs += entitiesUrl(desc);
  }

  return strURLs;
};
/**
 *
 * @param {Array} allDatas
 * @param {Array} bioContains
 * @param {Array} bioNotContains
 * @param {Number} followerMoreThen
 * @param {Number} followingMoreThen
 * @param {Number} tweetMoreThen
 * @returns
 */
module.exports = (
  allDatas = [],
  bioContains = [],
  bioNotContains = [],
  followerMoreThen = 0,
  followingMoreThen = 0,
  tweetMoreThen = 0
) => {
  let res = [];

  for (const { public_metrics, entities, description, ...rest } of allDatas) {
    const moreThen = {
      followerMoreThen,
      followingMoreThen,
      tweetMoreThen,
    };

    if (
      followerFollowingAndTweetMoreThan(public_metrics, moreThen) &&
      bioContainsFilter(description, bioContains) &&
      bioNotContainsFilter(description, bioNotContains)
    ) {
      const urls = getUrls(entities);
      res.push({ urls, ...rest, ...public_metrics, description, email: '' });
    }
  }
  return res;
};

function bioContainsFilter(filterOf = '', bys = []) {
  let res = bys?.length ? false : true;
  for (const by of bys) {
    if (filterOf.toLocaleLowerCase().includes(by.trim().toLocaleLowerCase())) {
      res = true;
      break;
    }
  }
  return res;
}

function bioNotContainsFilter(filterOf = '', bys = []) {
  let res = true;
  for (const by of bys) {
    if (filterOf.toLocaleLowerCase().includes(by.trim().toLocaleLowerCase())) {
      res = false;
      break;
    }
  }
  return res;
}

function followerFollowingAndTweetMoreThan(entries, moreThen) {
  const { followerMoreThen, followingMoreThen, tweetMoreThen } = moreThen;
  const { followers_count, following_count, tweet_count } = entries;
  let res = true;

  if (
    followers_count < followerMoreThen ||
    following_count < followingMoreThen ||
    tweet_count < tweetMoreThen
  ) {
    res = false;
  }
  return res;
}
