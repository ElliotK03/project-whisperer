//guilded bot 
require('dotenv').config()
const { Client } = require("guilded.js");
const token = process.env.GUILDED_TOKEN;
const client = new Client({ token });

client.on("ready", () => {
	console.log(`Bot is successfully logged in`);
});
client.login();

module.exports = { client }