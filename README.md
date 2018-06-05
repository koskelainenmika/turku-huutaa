# Turku huutaa twitter bot
Twitter bot that tweets the customer feedback given to City of Turku.

## Requirements
- Firebase account with blaze (paid) plan. Free plan will not allow outbound requests.
- Twitter app account

## Installation
````
git clone git@github.com:koskelainenmika/turku-huutaa.git
npm install -g firebase-admin firebase-tools
npm install
firebase use --add
````
Fill Twitter api keys & secrets to config.js

## Usage
Deploy to firebase:
````
firebase deploy --only functions
````
Now go to the address of that function and the function fires up. Use curl and cronjob to repeat the
function.