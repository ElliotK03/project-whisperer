//guilded bot 
const { Client } = require("guilded.js");

const token = require("./token.json").token;
const client = new Client({ token });

client.on("ready", () => {
	console.log(`Bot is successfully logged in`);
});
client.login();

module.exports = { client }