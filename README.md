Appoints-Api
============

Appoints-Api is an example appointment scheduler REST API built with Node.js, Express 4 and Mongodb.

Features
--------
- Create, view, update and delete appointments
- Authentication with 3rd party providers (Facebook & Google)
- Hypermedia API (HAL, see http://stateless.co/hal_specification.html)

Getting started
---------------
1. Make sure to have [node.js](http://nodejs.org/) installed on your machine
2. Make sure you have access to a [MongoDB](http://www.mongodb.org/) instance, either on your local machine or somewhere in the cloud. The test suite is configured by default to use a local database with the name 'appointstest'
3. Clone the repository:

		git clone https://github.com/martijnboland/appoints-api-node.git

4. Install packages:

		npm install
		
5. Run the server:

		node index.js
		
You can run the tests with:

		npm test
		
or when you are on Windows:

		runtests.bat