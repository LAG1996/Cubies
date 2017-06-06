const http = require('http')
const fs = require('fs')
const port = 8000

const requestHandler = (request, response) => {
	console.log(request.url)
	response.writeHead(200)


	response.end("Hello Node.js Server!")
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
	if(err){
		return console.log("This is some shit: ", err)
	}

	console.log('Server is listening on ${port}')
})