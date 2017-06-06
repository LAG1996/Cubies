const http = require('http')
const port = 8000

const requestHandler = (request, response) => {
	console.log(request.url)
	response.end("Hello Node.js Server!")
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
	if(err){
		return console.log("This is some shit: ", err)
	}

	console.log('Server is listening on ${port}')
})