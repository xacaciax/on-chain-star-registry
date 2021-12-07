const SHA256 = require("crypto-js/sha256");
const hex2ascii = require("hex2ascii");

class Block {
  constructor(data) {
    this.hash = null; // Hash of the block
    this.height = 0; // Block Height (consecutive number of each block)
    this.body = Buffer.from(JSON.stringify(data)).toString("hex"); // Will contain the transactions stored in the block, by default it will encode the data
    this.time = 0; // Timestamp for the Block creation
    this.previousBlockHash = null; // Reference to the previous Block Hash
  }

  /**
   *  Validates if the block has been tampered or not.
   *  Been tampered means that someone from outside the application tried to change
   *  values in the block data as a consecuence the hash of the block should be different.
   */
  validate() {
    let self = this;
    return new Promise((resolve, reject) => {
      resolve(
        self.hash ===
          SHA256(
            JSON.stringify({
              ...self,
              hash: null,
            })
          ).toString()
      );
    });
  }

  /**
   *  Auxiliary Method to return the block body (decoding the data)
   */
  getBData() {
    let self = this;

    return new Promise((resolve, reject) => {
      // Getting the encoded data saved in the Block
      let data = self.body;

      // Decoding the data to retrieve the JSON representation of the object
      let json = hex2ascii(data);

      // Parse the data to an object to be retrieved.
      let blockData = JSON.parse(json);

      // Resolve with the data if the object isn't the Genesis block
      if (self.height > 0) {
        resolve(blockData);
      } else {
        reject("No data in the genesis block.");
      }
    });
  }
}

module.exports.Block = Block;
