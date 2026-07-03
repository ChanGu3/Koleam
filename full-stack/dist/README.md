# Guide

## Prerequesites

1. Must install the Node Package Manager 11.16.0 or greater and Node 26.3.1 or greater.
[Install Instructions](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
2. Inside the server folder in a terminal do `npm run i` or `npm run install`
3. Setup is complete go look at how to Run for more info

## How To Run

1. Inside the server folder in a terminal do `npm run start` 
2. This will run the express application and in the terminal and log information of the running process.
3. Within the logs 3 links will show up with different numbers on the end these are called ports each are named private, local, and public. If you are not worried about configuring the app dont worry about private if you are you may want to look more into the source code to understand what routes are acceptable otherwise use the configuration app. The public link allows for memebers usages of streaming vidoes while the local link allows for admin usage which is for uploading titles, installments, streams and the media that goes with them.
4. Once you've clicked one of those links a browser will appear and you are now in the part of the app you have chosen! yay you!

## Important Info

- All uploaded files on the web app are stored in the server folder!
- DO NOT MODIFY THE UPLOADS FOLDER YOU CAN DO SO AT YOUR OWN RISK BUT IT MAY CAUSE UNRECOVERABLE ERRORS
- You should be able to drag and drop the data folder to keep data between version as long as naming convention does not change for different versions of the app this will be easily done using installer/config in the future evne with name changes however keep in mind doing so must contain both the sql database and the uploads.
- DEFAULT ADMIN: One admin account comes with the full stack build you must either use the configuration app to add more or use the private port to do so. (DEFAULT CREDENTIALS: useramae: username, password: Password*0) The password can be changed in the web app.
