const path = require("path");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
require("dotenv").config({ path: path.resolve(__dirname, "./.env") });

// Connection Function
async function connection() {
  try {
    await mongoose.connect(process.env.URL);
    console.log("DB connected successfully!");
  } catch (err) {
    console.log("Error at connecting an MongoDB Server", err);
  }
};

// Exports
const db = {
  mongoose: mongoose,
  url: process.env.URL,
  users: require("./userModel")(mongoose)
};

module.exports = {
  connection,
  db
};
