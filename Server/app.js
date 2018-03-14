var io = require('socket.io')(process.envPort||3000);
var shortid = require('shortid');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

console.log("Server Started");


var dbObj;
MongoClient.connect(url, function(err, client){
	if(err) throw err;
	
	dbObj = client.db('SocketRoundData');
});


/* MongoClient.connect(); */

io.sockets.on('connection', function(socket){
	var thisId = shortid.generate();
	
	console.log('generating id: '+ thisId);
	socket.broadcast.emit('open');
	
	socket.on('request data', function(){
		dbObj.collection('questionData').find({}).toArray(function(err, results){
				socket.emit('sent data', {datas:results});
				console.log("Data Sent");
			});
	});
	
	socket.on('send data', function(data)
	{
		console.log(JSON.stringify(data));	
		
		dbObj.collection('questionData').save(data, function(err, results){
			if(err) throw err;
			console.log("Data saved to MongoDB");
		});
	});
});