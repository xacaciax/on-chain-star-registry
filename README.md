# Getting Started

Prerequisites: Make sure you have `node` and `npm` installed.

1. Clone the repo
2. run `npm install`
3. Run `node app.js` in your terminal
4. Check your terminal for the Express application logs `Listening in the PORT 8000`

5. [recommended] Use postman to interact with the endpoints listed in `BlockchainController.js`

## This is a simple blockchain implementation that allows you to register stars

1. The application will create a Genesis Block when you run the application.
2. The user will request the application to send a message to be signed using a Wallet and in this way verify the ownership over the wallet address. The message format will be: `<WALLET_ADRESS>:${new Date().getTime().toString().slice(0,-3)}:starRegistry`;
3. Once the user have the message the user can use a Wallet to sign the message. Use Electrum or Bitcoin Core to do this. Note: The address must be a Bitcoin legacy address. To use legacy Bitcoin addresses, set `addresstype=legacy` in the `bitcoin.conf` file for Bitcoin Core, and restart it.
4. The user will try to submit the Star object for that it will submit: `wallet address`, `message`, `signature` and the `star` object with the star information.
   The Start information will be formed in this format:
   ```json
       "star": {
           "dec": "68° 52' 56.9",
           "ra": "16h 29m 1.0s",
           "story": "Testing the story 4"
   	}
   ```
5. The application will verify if the time elapsed from the request ownership (the time is contained in the message) and the time when you submit the star is less than 5 minutes.
6. If everything is okay the star information will be stored in the block and added to the `chain`
7. The application will allow us to retrieve the Star objects belong to an owner (wallet address).

## Application Structure

1. `app.js` contains the configuration and initialization of the REST Api, the team who provide this boilerplate code suggest do not change this code because it is already tested and works as expected.
2. `BlockchainController.js` contains the routes of the REST Api. Those are the methods that expose the urls you will need to call when make a request to the application.
3. `src` folder containing `block.js` and `blockchain.js` that contain the `Block` and `BlockChain` classes.

## Interacting with this API

1. Run your application using the command `node app.js`
   You should see in your terminal a message indicating that the server is listening in port 8000:

   > Server Listening for port: 8000

2. To make sure your application is working fine and it creates the Genesis Block you can use POSTMAN to request the Genesis block:
   [Request: http://localhost:8000/block/0 ](https://photos.app.goo.gl/byqvMeKHJUgMrnf8A)
3. Make your first request of ownership sending your wallet address:
   [Request: http://localhost:8000/requestValidation ](https://photos.app.goo.gl/12VXu7nGvFQtQ59h9)
4. Sign the message with your Wallet:
   [Use the Wallet to sign a message](https://photos.app.goo.gl/MmMmUxgBQpedwSep9)
5. Submit your Star
   [Request: http://localhost:8000/submitstar](https://photos.app.goo.gl/1R6Hybk2h5jSQM6V6)
6. Retrieve Stars owned by me
   [Request: http://localhost:8000/blocks/<WALLET_ADDRESS>](https://photos.app.goo.gl/mjtdZg4i6iyP3UAA9)
7. Validate the chain: [Request: http://localhost:8000/chain/validate](https://photos.app.goo.gl/1UFbNj5QaLgbSHsc6)

## Debugging

If you are using vs code, default debugger configuration should work just fine:

```
    {
      "type": "pwa-node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/app.js"
    }
```

To view server logs, set an env variable `export DEBUG="express"` to activate the `debug` logger. To view more verbose logs, set `export DEBUG=*`, oor see https://github.com/debug-js/debug#readme for more.
