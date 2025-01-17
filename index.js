//defining logger transports
const Transport = require('winston-transport');
class CustomTransport_SSE extends Transport {
	constructor(opts) {
		super(opts);
	}

	log(info, callback) {
		setImmediate(() => {
			this.emit('logged', info);
		});

		info.res.write(`data: ${info.message}\n\n`);
		callback();
	}
};

const SSE_Transport = new CustomTransport_SSE();

//other dependencies
require('dotenv').config();
const { logger } = require("./logger.js");
const { client, appendEditTimeout } = require('./bot.js'); //guilded bot

const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

/**
*  Simple HTML page
**/
const express = require('express');
const bodyParser = require('body-parser');

const app = express(), port = 8080;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//cache submitted data
let submittedData = null;

app.get('/', (req, res) => {
	res.type('html');
	res.send(`
		<form action="/send" method="post" id="theform">
			<label for="URL">URL:</label>
			<input type="text" id="URLinput" name="URL">
			<input type="submit" value="Submit" id="submitButton">
			<output style="visibility: hidden;"></output>
		</form>
		<div id="messages"></div>
		<script>
			
        document.getElementById("theform").addEventListener("submit", function (event) {
            event.preventDefault(); //prevents default button action
			const inputData = document.getElementById("URLinput").value
			console.log("Form data:",  inputData);

            fetch("/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ input: inputData }),
            })
                // .then(response => response.json())
                .then(data => {
                    console.log("Server response:", data);
                })
                .catch(error => {
                    console.error("Error:", error);
                });

            // Prevent re-binding if the button is clicked multiple times
            if (this.sseBound) return;

            // Mark SSE as bound
            this.sseBound = true;

            const eventSource = new EventSource('/send');
            eventSource.onmessage = function (event) {
                const messagesDiv = document.getElementById('messages');
                const newMessage = document.createElement('div');
                newMessage.textContent = event.data;
                messagesDiv.appendChild(newMessage);
            };
            eventSource.onerror = function (event) {
                const messagesDiv = document.getElementById('messages');
                const newMessage = document.createElement('div');
                newMessage.textContent = "Connection error!";
                messagesDiv.appendChild(newMessage);
                eventSource.close();
            };

            eventSource.onopen = function (event) {
                const messagesDiv = document.getElementById('messages');
                const newMessage = document.createElement('div');
                newMessage.textContent = "Connection opened!";
                messagesDiv.appendChild(newMessage);
            };
            eventSource.onclose = function (event) {
                const messagesDiv = document.getElementById('messages');
                const newMessage = document.createElement('div');
                newMessage.textContent = "Connection closed!";
                messagesDiv.appendChild(newMessage);
            };
        });
		</script>
	`);
});

app.all('/send', async (req, res) => {

	if (req.method === "POST") {
		const { input } = req.body

		res.json({ message: "Data received successfully ", input });

		submittedData = input;
	} else if (req.method === "GET") {
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
		// res.on("error", (e) => console.error(e));

		logger.add(SSE_Transport);

		// res.write('retry: 10000\n\n');

		// res.write(` "DataReceived": ${JSON.stringify(data)} \n`);
		logger.log({ 'level': 'info', 'message': `DataReceived "${data}"`, res })

		if (!isValidUrl(data)) {
			// res.write(`message: "Error!"\n\n`);
			logger.log({ 'level': 'info', 'message': 'Invalid URL', res })
		} else {
			try {
				await navigateToSite(data, res);
				logger.log({ 'level': 'info', 'message': 'End of task...', res });
			} catch (error) {
				res.write(`{'data': 'Error!'\n\n}`);
				console.log(error);
			}
		}
		logger.log({ 'level': 'info', 'message': 'Connection closing..', res });
		logger.remove(SSE_Transport);
		res.end();
		submittedData = null;
	}
})

const server = app.listen(port, () => {
	console.log(`App listening on port ${port}`)
});

/** 
 *  handles starting headless browser and navigating to the site
 **/

async function navigateToSite(URL, res) {
	const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	const page = await browser.newPage();

	logger.log({ 'level': 'info', 'message': `Navigating to ${URL}\n\n`, res })
	await page.goto(URL);
	logger.log({ 'level': 'info', 'message': `Navigation done`, res })
	
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
			logger.log({ 'level': 'info', 'message': `Credentials filled & submitted , timestamp: ${Date.now()} `, res })
		} catch (error) {
			logger.log({ 'level': 'info', 'message': `errorMessage: ${error} `, res })
			console.log(error);
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
	let m = message.content.toLocaleLowerCase();

	if (m === "poggers") {
		return message.reply("test indeed");
	}

	if (isValidUrl(m)) {
		try {
			await navigateToSite(data, res);
			// res.write("End");
		} catch (error) {
			// res.write("Error!");
			console.log(error);
		}
		return;
	}
});

function errorCallback(error) {
	if (error) console.error(error);
}

module.exports = { navigateToSite, isValidUrl, server };