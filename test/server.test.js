const supertest = require('supertest');
//const app = require('../index');
const request = supertest('http://localhost:1231');
const { server } = require('../index'); // Import missing functions
describe('GET /', function () {
    it('should return "Hello World!"', function (done) {
        request // Fix the app import
            .get('/')
            .expect(200)
            .expect('<form action="/" method="post"> <label for="URL">URL:</label> <input type="text" id="URL" name="URL"> <input type="submit" value="Submit"> </form>')
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });
});

describe('POST /', function () {
    it('should navigate to the site and return "End"', function (done) {
        request // Fix the app import
            .post('/')
            .send({ URL: 'https://example.com' })
            .expect(200)
            .expect(' "DataReceived": {"URL":"https://example.com"} \nmessage: "opened site\nEnd')
            .end(function (err) {
                if (err) return done(err);
                done();
            });
    });

});

/* describe('navigateToSite', function () {
    it('should open the site and return "opened site"', function (done) {
        const res = {
            write: function () { },
            end: function () { }
        };

        navigateToSite('https://example.com', res)
            .then(function () {
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });
});

describe('fillCreds', function () {
    it('should fill credentials and submit', function (done) {
        const driver = {
            actions: function () {
                return {
                    sendKeys: function () {
                        return {
                            perform: function () { }
                        };
                    }
                };
            }
        };

        fillCreds(driver)
            .then(function () {
                done();
            })
            .catch(function (err) {
                done(err);
            });
    });
});

let expect;
const { navigateToSite } = require('../index');

describe('navigateToSite', () => {
    before(async () => {
        const chai = await import('chai');
        expect = chai.expect;
    });

    it('should open the site and write a message', async () => {
        const res = {
            write: (data) => {
                // Assert that the message is correct
                expect(JSON.parse(data)).to.deep.equal({ message: 'opened site' });
            }
        };

        // Call the function with a sample URL
        await navigateToSite('https://example.com', res);
    });

    it('should fill credentials and submit', async () => {
        const res = {
            write: (data) => {
                const parsedData = JSON.parse(data);
                if (parsedData.message) {
                    // Assert that the message is correct
                    expect(parsedData.message).to.equal('Credentials filled & submitted');
                    // Assert that the timestamp is a valid number
                    expect(parsedData.timestamp).to.be.a('number');
                } else if (parsedData.errorMessage) {
                    // If there's an error message, fail the test
                    throw new Error(parsedData.errorMessage);
                }
            }
        };

        // Call the function with a sample URL that requires filling credentials
        await navigateToSite('https://osc.mmu.edu.my/psc/csprd/EMPLOYEE/SA/c/N_PUBLIC.N_CLASS_QRSTUD_ATT.GBL', res);
    });
}); */

after(() => {
    server.close();
  });