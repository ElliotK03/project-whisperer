//Winston logger instance and custom transports
const { logger, CustomTransport_SSE, GuildedBotTransport } = require("./logger.js");
const SSE_Transport = new CustomTransport_SSE();
const GuildedBot_Transport = new GuildedBotTransport();

//other dependencies
require('dotenv').config();
const { client } = require('./bot.js'); //guilded bot

const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const fs = require('fs');
const path = require('path');

/**
*  Simple HTML page
**/
const express = require('express');
const bodyParser = require('body-parser');

const app = express(), port = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'client')));

let submittedData = null; //cache submitted data

app.get('/', (req, res) => {
	res.type('html');
	res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.all('/send', async (req, res) => {
	if (req.method === "POST") { //form submission
		const { input } = req.body; //extract data from input
		submittedData = input;

		res.json({ message: "Data received successfully ", input });
	} else if (req.method === "GET") { //SSE subscription
		let data = null;
		if (!submittedData) {
			res.write("error: no data", (e) => {
				if (e) console.error(e);
			});
			return res.end();
		} else data = submittedData;

		res.set({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});
		res.flushHeaders();

		res.on("close", () => res.end());
		res.on("error", (e) => console.error(e));

		logger.add(SSE_Transport);

		logger.log({ 'level': 'info', 'message': `DataReceived "${data}"`, res });

		if (!isValidUrl(data)) {
			logger.log({ 'level': 'info', 'message': 'Invalid URL', res });
		} else {
			try {
				await navigateToSite(data, res);
				logger.log({ 'level': 'info', 'message': 'End of task...', res });
			} catch (error) {
				res.write(`data: Error!\n\n`);
				console.error(error);
			}
		}
		logger.log({ 'level': 'info', 'message': 'Connection closing..', res });
		logger.remove(SSE_Transport);
		res.end();
		submittedData = null;
	}
})

//express.js server
const server = app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});

/** 
 *  handles starting headless browser and navigating to the site
 **/

async function navigateToSite(URL, res) {
	const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	const page = await browser.newPage();

	logger.log({ 'level': 'info', 'message': `Navigating to ${URL}\n\n`, res });
	await page.goto(URL);
	logger.log({ 'level': 'info', 'message': `Navigation done`, res });

	//this is the magic part
	if (URL.startsWith("https://osc.mmu.edu.my/psc/csprd/EMPLOYEE/SA/c/N_PUBLIC.N_CLASS_QRSTUD_ATT.GBL")) {
		try {
			let elementText = await page.$eval('.PAPAGETITLE', element => element.textContent);
			if (elementText != "Attendance Signin") {
				await page.cookies().then(pageCookies =>
					pageCookies.forEach(async element => await page.deleteCookie(element.name))
				);
				await page.goto(URL);
			}
			await fillCreds(page);
			await page.goto(URL);
			logger.log({ 'level': 'info', 'message': `Credentials filled & submitted , timestamp: ${Date.now()} `, res });
		} catch (error) {
			logger.log({ 'level': 'info', 'message': `errorMessage: ${error} `, res });
			console.error(error);
		}
	}
	setTimeout(async () => await browser.close(), 30000);
}

/**
*  Browser automation
**/

async function fillCreds(page) {
	let username = '1211111316';
	await page.type(':focus', username);
	await page.keyboard.press('Tab');
	await page.type(':focus', process.env.PW1);
	await page.keyboard.press('Tab');
	await page.click(':focus');
}

/**
 *  RegExp URL checking
 **/

const isValidUrl = urlString => {
	var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
	return !!urlPattern.test(urlString);
}

//guilded bot
client.on("messageCreated", async (message) => {
	let m = message.content.toLocaleLowerCase().split(' ');

	if (m[0] === "poggers") {
		return message.reply("test indeed");
	}

	if (isValidUrl(m[0])) {
		let URL = m[0];
		let res;
		await message.reply("Message received...\n").then((msg) => res = msg); //res = the response message by the bot
		logger.add(GuildedBot_Transport);

		logger.log({ 'level': 'info', 'message': `test`, res });
		try {
			logger.log({ 'level': 'info', 'message': `test again`, res });
			await navigateToSite(URL, res);
		} catch (error) {
			console.error(error);
		}
		return logger.remove(GuildedBot_Transport);
	}
});

module.exports = { navigateToSite, isValidUrl, server };
