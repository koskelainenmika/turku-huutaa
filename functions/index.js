const functions = require('firebase-functions');
const twit = require('twit');
const config = require('./config.js');
const Parser = require('rss-parser');
const admin = require('firebase-admin');
const Twitter = new twit(config);
const parser = new Parser();
const differenceInMinutes = require('date-fns/difference_in_minutes');
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
        if (feed.items.length >= 15) {
          for (let i = 0; i < 15; i++) {
            const tweetItem = generateTweetFromFeed(feed.items[i]);
            if (tweetItem) {
              if (tweetToTwitter(tweetItem)){
                console.log("Successfully tweeted: " + tweetItem);
              }
            }
          }
          return response.send("Success");
        }
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
    Twitter.post('statuses/update', {status: tweetMessage}, (error, tweet, res) => {
      if (error) {
        console.log(error);
      }
      console.log(tweet);
      console.log(res);
      success = true;
    });
  }
  return success;
};


const generateTweetFromFeed = (feedItem) => {
  let returnedTweet = null;
  if (feedItem) {
    if (isNewPost(feedItem)) {
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

const isNewPost = (feedItem) => {
  let isNew = false;
  if (feedItem) {
    const currentDate = new Date();
    if (differenceInMinutes(currentDate, feedItem.isoDate) < 15) {
      isNew = true;
    }
  }

  return isNew;
};
