// require('dotenv').config();

const { Builder, Browser } = require('selenium-webdriver');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 1231;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.post('/', (req, res) => {
	let data = req.body;
	res.json({ "DataReceived": JSON.stringify(data) });
	// res.json({ "message": "Hello" });
	// res.json({ "message2": "HI THERE" });
	// res.writeHead(200, { 'Content-Type': 'application/json' });
	try {
			myTest(data.URL, res);
	} catch (error) {
			console.log(error);
	}
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
});

// starts headless browser and navigates to the site
async function myTest(URL, res) {
	let driver = await new Builder().forBrowser(Browser.FIREFOX).build();
	await driver.get(URL);
	// res.write(JSON.stringify({message: "opened site"}));

	try {
		await fillCreds(driver);
	} catch (error) {
		// res.write(JSON.stringify({errorMessage: error }));
		console.log(error);
	}
	
	// res.write(JSON.stringify({message: "Credentials filled & submitted" , timestamp: Date.now()}));
	res.end()

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