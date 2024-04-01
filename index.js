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
	res.send('Hello World!')
})

app.post('/', async (req, res) => {
	let data = req.body;
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.write(`{ "DataReceived": ${JSON.stringify(data)} }`);
	try {
			await myTest(data.URL, res);
			res.write("End");
		} catch (error) {
			res.write("Error!");
			console.log(error);
		}
		res.end()
	
})

app.listen(port, () => {
	console.log(`App listening on port ${port}`)
});

// starts headless browser and navigates to the site
async function myTest(URL, res) {
	let driver = await new Builder()
		.forBrowser(Browser.FIREFOX)
		.setFirefoxOptions(new Options()
		.addArguments('--headless'))
		.build();
		
	await driver.get(URL);
	res.write(JSON.stringify({message: "opened site"}));

	if (URL.startsWith("https://osc.mmu.edu.my/psc/csprd/EMPLOYEE/SA/c/N_PUBLIC.N_CLASS_QRSTUD_ATT.GBL")) {
		try {
			await fillCreds(driver);
			res.write(JSON.stringify({message: "Credentials filled & submitted" , timestamp: Date.now()}));
		} catch (error) {
			res.write(JSON.stringify({errorMessage: error }));
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