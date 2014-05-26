Appoints-Api
============

Appoints-Api is an example appointment scheduler REST API built with Node.js, Express 4 and Mongodb.

Features
--------
- Create, view, update and delete appointments
- Authentication with 3rd party providers (Facebook & Google)
- Hypermedia API (HAL, see http://stateless.co/hal_specification.html)
- Full integration test suite

Getting started
---------------
1. [Node.js](http://nodejs.org/) needs to be installed on your machine
2. Make sure you have access to a [MongoDB](http://www.mongodb.org/) instance, either on your local machine or somewhere in the cloud. The test suite is configured by default to use a local database with the name 'appointstest'
3. Clone the repository:

		git clone https://github.com/martijnboland/appoints-api-node.git

4. Install packages:

		npm install
		
5. Run the server (default on http://localhost:3000/):

		node index.js
		
You can run the integration test suite with:

		npm test (*nix, Mac OS X)
		runtests.bat (Windows)

Usage
-------------
When the server is running locally, you can try the api with a browser, curl or an API testing tool like [Postman](http://www.getpostman.com/). 

Start with GET http://localhost:3000/. This results in:

```json
{
	"message": "Appoints service API",
	"details": "This is a REST api where you can schedule appointments for <insert business here>",
	"_links": {
		"self": {"href":"/"},
		"me": {"href":"/me"},
		"appointments" :{"href":"/appointments"}
	}
}
```



{
  "title": "Get a haircut",
  "dateAndTime": "2014-06-01T14:45:00.000Z",
  "duration": 30,
  "remarks": "Same as last time"
}