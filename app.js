// Rig up dotenv
dotenv = require("dotenv")
dotenv.load()

// Express requires
var express = require("express"),
	app = express(),
	server = require("http").Server(app),
	bodyParser = require("body-parser");

// Socket.io stuff
var io = require("socket.io")(server);

// Express config: Serve up our static assets on /
app.use(express.static(__dirname + "/dist"))

// Express config: Fuck security
app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
 });

// Monogodb stuff
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI);

var Image = mongoose.model('Image', {
	submitter: String, 
	url: String,
	timestamp: {type: Date, default: Date.now}});

var imageQuery = Image.find({}).sort('-timestamp').limit(100);

// Image POST API
app.post("/", bodyParser.json(), function(req, res) {
	console.log(req.body);
	var img = new Image(req.body.image);
	img.save(function(err, doc) {
		if (err){
			console.log('failure');
			res.send('failure');
		} else {
			console.log('success')
			var j = JSON.stringify(doc);
			res.send(j);
			io.emit('image', j)
		}
	})
});

// Image Preload API
app.get("/images", function(req, res) {
	imageQuery.lean().exec(function(err, items) {
	    res.send(JSON.stringify(items));
	});
});


// Socket.io stuff
io.on("connection", function (socket) {
	console.log("connection!")
})


// Start the server
server.listen(process.env.PORT, function() {
	console.log("listening on port " + process.env.PORT);
});