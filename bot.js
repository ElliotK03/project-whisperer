//guilded bot 
const { Client } = require("guilded.js");

const token = require("./token.json").token;
const client = new Client({ token });

client.on("ready", () => {
	console.log(`Bot is successfully logged in`);
});
client.login();

const appendEditTimeout = (m, appendContent, timeout = 0) => {
	if (timeout) {
		setTimeout(() => {
			return m.edit(`${m.content}\n${appendContent}`);
		}, timeout);
	} else {
		return m.edit(`${m.content}\n${appendContent}`);
	}
}

module.exports = { client, appendEditTimeout }