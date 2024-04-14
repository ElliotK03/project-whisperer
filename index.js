require('dotenv').config();

const { Builder, Browser } = require('selenium-webdriver');

const express = require('express');
const bodyParser = require('body-parser');
const { Options } = require('selenium-webdriver/firefox');

const app = express();
const port = 1231;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
	//res.send('Hello World!')
	//add frontend with form to submit URL
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
		res.end()
	}
})

const server = app.listen(port, () => {
	console.log(`App listening on port ${port}`)
});

// starts headless browser and navigates to the site
async function navigateToSite(URL, res) {
	let driver = await new Builder()
		.forBrowser(Browser.FIREFOX)
		.setFirefoxOptions(new Options()
			.addArguments('--headless'))
		.build();

	await driver.get(URL);
	res.write(`message: "opened site\n`);

	if (URL.startsWith("https://osc.mmu.edu.my/psc/csprd/EMPLOYEE/SA/c/N_PUBLIC.N_CLASS_QRSTUD_ATT.GBL")) {
		try {
			await fillCreds(driver);
			res.write(`message: "Credentials filled & submitted" , timestamp: ${Date.now()} `);
		} catch (error) {
			res.write(`errorMessage: ${error} `);
			console.log(error);
		}
	}
	setTimeout(() => { driver.quit(); }, 30000)
};

async function fillCreds(d) {
	let username = '1211111316';
	await d.actions()
		.sendKeys(username)
		.sendKeys('\uE004')
		.sendKeys(process.env.PW1)
		.sendKeys('\uE004')
		.sendKeys('\uE007')
		.perform();
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