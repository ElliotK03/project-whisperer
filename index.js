require('dotenv').config();

const puppeteer = require('puppeteer-extra');

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
	//res.send('Hello World!')
	//add frontend with form to submit URL
	res.type('html');
	res.send('<form action="/" method="post"> <label for="URL">URL:</label> <input type="text" id="URL" name="URL"> <input type="submit" value="Submit"> </form>')
})

app.post('/', async (req, res) => {
	let data = req.body;
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write(` "DataReceived": ${JSON.stringify(data)} \n`);
	if (!isValidUrl(data.URL)) {
		res.write("Error!");
	} else {
		try {
			await navigateToSite(data.URL, res);
			res.write("End");
		} catch (error) {
			res.write("Error!");
			console.log(error);
		}
	}
	res.end()
})

const server = app.listen(port, () => {
	console.log(`App listening on port ${port}`)
});

// starts headless browser and navigates to the site

async function navigateToSite(URL, res) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();

	await page.goto(URL);
	res.write(`message: "opened site\n`);

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
			res.write(`message: "Credentials filled & submitted" , timestamp: ${Date.now()} `);
		} catch (error) {
			res.write(`errorMessage: ${error} `);
			console.log(error);
		}
	}
	setTimeout(async () => await browser.close(), 30000);
}

async function fillCreds(page) {
	let username = '1211111316';
	await page.type(':focus', username);
	await page.keyboard.press('Tab');
	await page.type(':focus', process.env.PW1);
	await page.keyboard.press('Tab');
	await page.click(':focus');
}

const isValidUrl = urlString => {
	var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
		'(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
	return !!urlPattern.test(urlString);
}
module.exports = { navigateToSite, isValidUrl, server };