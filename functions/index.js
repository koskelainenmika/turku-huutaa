const functions = require('firebase-functions');
const twit = require('twit');
const config = require('./config.js');
const twitterOptions = require('./options.js');
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
      if (feed && feed.items) {
        let count = 0;
        if (feed.items.length >= 15) {
          for (let i = 0; i < 15; i++) {
            console.log(feed.items[i]);
            const tweetItem = generateTweetFromFeed(feed.items[i]);
            if (tweetItem) {
              if (tweetToTwitter(tweetItem)){
                count++;
              }
            }
          }
        }
        return response.send("Succesfully tweeted " + count + " items");
      }
      else {
        return response.send('There was not 15 items in the feed');
      }
    }
  });
});

const tweetToTwitter = (tweetMessage) => {
  let success = false;
  if (tweetMessage) {
    Twitter.get('statuses/user_timeline', twitterOptions, (err, data) => {
      const isPostAlready = isAlreadyPost(tweetMessage, data);
      if (!isPostAlready) {
        Twitter.post('statuses/update', {status: tweetMessage}, (error, tweet, res) => {
          if (error) {
            console.log(error);
          }
          console.log(tweet);
          console.log(res);
          success = true;
        })
      }
    });
  }
  return success;
};

const generateTweetFromFeed = (feedItem) => {
  let returnedTweet = null;
  if (feedItem) {
    if (feedItem) {
      const link = feedItem.link;
      const content = feedItem.content;
      const urlLength = 25;
      const maxLength = 277 - urlLength;

      if (content.length >= maxLength) {
        returnedTweet = content.substring(0, maxLength) + '... ' + link;
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
    console.log(tweets[i]);
    if (!alreadyTwit && tweets[i].text.includes(post)) {
      return true;
    } else {
      alreadyTwit = false;
    }
  }
  return alreadyTwit;
};