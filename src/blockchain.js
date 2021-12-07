const SHA256 = require("crypto-js/sha256");
const BlockClass = require("./block.js");
const bitcoinMessage = require("bitcoinjs-message");

class Blockchain {
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  /**
   * Generates the Genesis Block.
   */
  async initializeChain() {
    if (this.height === -1) {
      let block = new BlockClass.Block({ data: "Genesis Block" });
      await this._addBlock(block);
    }
  }

  /**
   * Utility method that return a Promise that will resolve with the height of the chain
   */
  getChainHeight() {
    return new Promise((resolve) => {
      resolve(this.height);
    });
  }

  /**
   * _addBlock(block) will store a block in the chain
   * @param {*} block
   * The method will return a Promise that will resolve with the block added
   * or reject if an error happenened during the execution.
   */
  _addBlock(block) {
    let self = this;
    return new Promise(async (resolve) => {
      //Check that the chain is valid before adding block
      await self.validateChain().then((chainValidationErrors) => {
        if (chainValidationErrors.length > 0) {
          // Propocate the errorLog to provide context for the failure
          resolve(chainValidationErrors);
        } else {
          // Check that this is not the genesis block, assign the previous block's hash to
          // previousBlockHash on current block.
          if (self.chain.length > 0) {
            block.previousBlockHash = self.chain[self.chain.length - 1].hash;
          }

          // assign the current time to the current block
          block.time = new Date().getTime().toString().slice(0, -3);

          // assign the height to the current block
          block.height = self.chain.length;

          // generate a hash and assign it to the current block hash
          block.hash = SHA256(JSON.stringify(block)).toString();

          // add the block to the chain
          self.chain.push(block);

          // assign new chain height
          self.height = self.height + 1;
          resolve(block);
        }
      });
    });
  }

  /**
   * The requestMessageOwnershipVerification(address) method requests a message that you
   * will use to sign it with your Bitcoin Wallet (Electrum or Bitcoin Core).
   * @param {*} address
   */
  requestMessageOwnershipVerification(address) {
    return new Promise((resolve) => {
      resolve(
        `${address}:${new Date()
          .getTime()
          .toString()
          .slice(0, -3)}:starRegistry`
      );
    });
  }

  /**
   * The submitStar(address, message, signature, star) method
   * will allow users to register a new Block with the star object
   * into the chain. This method will resolve with the Block added or
   * reject with an error.
   * @param {*} address
   * @param {*} message  // e.g. <WALLET_ADDRESS>:${new Date().getTime().toString().slice(0,-3)}:starRegistry
   * @param {*} signature
   * @param {*} star
   */
  submitStar(address, message, signature, star) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      // Confirm that the message was sent within the last five minutes
      let messageTime = parseInt(message.split(":")[1]);
      let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
      let withinFiveMinutes = (currentTime - messageTime) / 1000 / 60 < 5;

      // Verify the signature
      let signatureVerified = bitcoinMessage.verify(
        message,
        address,
        signature
      );

      // If sent within five minutes and verified, add new block to the chain
      if (withinFiveMinutes && signatureVerified) {
        let newBlock = new BlockClass.Block({ star: star, address: address });
        await self._addBlock(newBlock).then((block) => {
          if (block.hash === null) {
            // If the block hash is null, validation failed. The errorLog has been propogated
            // to be passed here to provide context for the failure.
            reject(block);
          } else {
            resolve(block);
          }
        });
      } else if (!withinFiveMinutes) {
        reject(
          "Request took longer than five minutes to reach us, please try again. Block was not added."
        );
      } else if (!signatureVerified) {
        reject("Unable to verify signature. Block was not added.");
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block
   *  with the hash passed as a parameter.
   * Search on the chain array for the block that has the hash.
   * @param {*} hash
   */
  getBlockByHash(hash) {
    let chain = this.chain;
    return new Promise((resolve, reject) => {
      for (let step = 0; step < chain.length; step++) {
        if (chain[step].hash === hash) {
          resolve(chain[step].block);
        }
      }
      reject("Unable to find a block with that hash.");
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block object
   * with the height equal to the parameter `height`
   * @param {*} height
   */
  getBlockByHeight(height) {
    let self = this;
    return new Promise((resolve) => {
      let block = self.chain.filter((p) => p.height === height)[0];
      if (block) {
        resolve(block);
      } else {
        resolve(null);
      }
    });
  }

  /**
   * This method returns a Promise that will resolve with an array of Stars objects existing in the chain
   * and are belongs to the owner with the wallet address passed as parameter.
   * @param {*} address
   */
  getStarsByWalletAddress(address) {
    let chain = this.chain;
    let stars = [];
    return new Promise((resolve, reject) => {
      chain.forEach((block, index) => {
        // Skip the genesis block
        if (index !== 0) {
          block.getBData().then((blockData) => {
            if (blockData.address === address) {
              stars.push(block);
            }
          });
        }
      });
      resolve(stars);
    });
  }

  /**
   * This method returns a Promise that will resolve with the list of errors when validating the chain.
   */
  validateChain() {
    let self = this;
    let errorLog = [];
    return new Promise(async (resolve) => {
      self.chain.forEach(async (block, index) => {
        if ((await block.validate()) === false) {
          errorLog.push({ error: "Block validation failed." });
        }
        // Only compare with blocks that have a hash and previousHash value
        if (index > 1) {
          if (block.previousBlockHash !== self.chain[index - 1].hash) {
            errorLog.push({ error: "Hash of previousBlock does not match." });
          }
        }
      });
      resolve(["test"]);
    });
  }
}

module.exports.Blockchain = Blockchain;
