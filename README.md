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

Start with GET http://localhost:3000/:

```json
{
	"message": "Appoints service API",
	"details": "This is a REST api where you can schedule appointments for <insert business here>",
	"_links": {
		"self": {"href":"/"},
		"me": {"href":"/me"},
		"appointments" : {"href":"/appointments"}
	}
}
```
 
Following the links, you can see 2 other resources: '/me' and '/appointments'. Let's go to '/me' and see what happens:

```json
{
	"message": "Access to /me is not allowed.",
	"details": "No Authorization header was found. Format is Authorization: Bearer [token]",
	"_links": {
		"auth_facebook": {"href":"/auth/facebook"},
		"auth_google": {"href":"/auth/google"}
	}
}
```

Alright, so we're not supposed to view the resource unauthenticated and we need to supply an authorization token. How can we get a token? Perhaps follow one of the links? We're going to try the Google route: http://localhost:3000/auth/google. At this point there are two options: do a GET request that will redirect to the Google authentication/authorization page that redirects back to our API after successful authentication, or do a POST request to the same url with an already obtained token. The first scenario is suitable for web browser apps where the second scenario is better suited for mobile apps where access tokens can be obtained beforehand via native components. Successful authentication generates the authorization token:

```json
{
	"message": "Authentication successful",
	"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjUzN2Y2Yjk4MzFhNTEyYWJjY2Q1OGE5OCIsImVtYWlsIjoibWFydGlqbmJvbGFuZEBnbWFpbC5jb20iLCJkaXNwbGF5TmFtZSI6Ik1hcnRpam4gQm9sYW5kIiwicm9sZXMiOlsiY3VzdG9tZXIiXSwiaWF0IjoxNDAxMTI3NTYxLCJleHAiOjE0MDExMzExNjF9.eFjb_mQ413Dz8YUorVREuCYDvHrrZRopg89m-kD4Jh8",
	"_links":{
		"self": {"href":"/"},
		"me": {"href":"/me"},
		"appointments": {"href":"/appointments"}
	}
}
```

Here we have the authorization token (JWT). Also, the response contains links where we can go next. We try the '/me' link again but now with the authorization header HTTP HEADER set: 

```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjUzN2Y2Yjk4MzFhNTEyYWJjY2Q1OGE5OCIsImVtYWlsIjoibWFydGlqbmJvbGFuZEBnbWFpbC5jb20iLCJkaXNwbGF5TmFtZSI6Ik1hcnRpam4gQm9sYW5kIiwicm9sZXMiOlsiY3VzdG9tZXIiXSwiaWF0IjoxNDAxMTI3NTYxLCJleHAiOjE0MDExMzExNjF9.eFjb_mQ413Dz8YUorVREuCYDvHrrZRopg89m-kD4Jh8
```

which returns:

```json
{
	"_links": {
		"self": {"href":"/users/537f6b9831a512abccd58a98"}
	},
	"userId": "89928749324",
	"provider": "google",
	"email": "someone@gmail.com",
	"displayName": "A google user",
	"roles":["customer"]
}
```

Looking good! Where can we go next? We still have one link left to try: '/appointments'. Here we can manage our appointments (create, view, update and delete). 
Let's create a new appointment by POSTing (create a new resource) to '/appointments' (with the authorization header set properly). The data for our appointment is:

```json
{
  "title": "Fresh haircut",
  "dateAndTime": "2014-06-01T14:45:00.000Z",
  "duration": 30,
  "remarks": "Same as last time"
}
```

The response is the newly created appointment:

```json
{
	"_links":{
		"self": {"href":"/appointments/53838715fd51be21ee42b7d4"},
		"user": {"href":"/users/537f6b9831a512abccd58a98","title":"A google user"}
	},
	"id":"53838715fd51be21ee42b7d4",
	"title":"Fresh haircut",
	"dateAndTime":"2014-06-01T14:45:00.000Z",
	"duration":30,
	"remarks":"Same as last time"
}
```

There is one appointment in stored in the database. The GET request for '/appointments' returns all our appointments:

```json
{
	"_links": {
		"self": {"href":"/appointments"}
	},
	"_embedded": {
		"appointments":[{
			"_links": {
				"self":{"href":"/appointments/53838715fd51be21ee42b7d4"},
				"user": {
					"href":"/users/537f6b9831a512abccd58a98",
					"title":"A google user"
				}
			},
			"id":"53838715fd51be21ee42b7d4",
			"title":"Fresh haircut",
			"dateAndTime":"2014-06-01T14:45:00.000Z",
			"duration":30,
			"remarks":"Same as last time"
		}]
	},
	"count":1
}
```

