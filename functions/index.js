const functions = require('firebase-functions');
const twit = require('twit');
const config = require('./config.js');
const options = require('./options.js');
const Parser = require('rss-parser');
const admin = require('firebase-admin');
const Twitter = new twit(config);
const parser = new Parser();
admin.initializeApp(functions.config().firebase);

/**
 * turku-huutaa twitter application & Firebase application.
 * By: Mika Koskelainen
 */

exports.showTwitter = functions.https.onRequest((request, response) => {
  parser.parseURL('https://opaskartta.turku.fi/eFeedback/API/Feed/rss', (err, feed) => {
    if (err !== null) {
      return response.send(err);
    }
    else {
      const newestPost = getNewestPost(feed);
      Twitter.get('statuses/user_timeline', options, (err, data) => {
        const isPostAlready = isAlreadyPost(newestPost, data);
        if (!isPostAlready) {
          Twitter.post('statuses/update', {status: newestPost}, (error, tweet, res) => {
            if (error) {
              console.log(error);
            }
            console.log(tweet);
            console.log(res);
            return response.send(newestPost);
          })
        }
        else {
          return response.send('post already tweeted');
        }
      });
    }
  });
});

const getNewestPost = (feed) => {
  let returnedTweet = 'tweet';
  if (feed) {
    const feedItem = feed.items[0];
    if (feedItem) {
      const link = feedItem.link;
      const content = feedItem.content;
      const urlLength = 25;
      const maxLength = 280 - urlLength;

      if (content.length >= maxLength) {
        returnedTweet = content.substring(0, maxLength) + ' ' + link;
      }
      else {
        returnedTweet = content + ' ' + link;
      }
    }
  }

  return returnedTweet;
};

const isAlreadyPost = (post, tweets) => {
  let alreadyTwit = false;
  for (let i = 0; i < tweets.length ; i++) {
    if (!alreadyTwit && tweets[i].text.includes(post)) {
      return true;
    } else {
      alreadyTwit = false;
    }
  }
  return alreadyTwit;
};