var http = require('http');
var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var io = require('socket.io')(process.envPort||5000);
var shortid = require('shortid');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var app = express();

console.log("Mongodb server up and running");

// Website setup
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger("dev"));

app.use(bodyParser.urlencoded({extended:false}));

app.use(cookieParser());

app.use(session({
	secret:"SecretSession",
	resave:true,
	saveUninitialized:true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
	done(null, user);
});

passport.deserializeUser(function(user, done){
	done(null, user);
});

LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy({
	usernameField:'',
	passwordField:''
	},
	function(username, password, done){
		MongoClient.connect(url, function(err, db){
			if(err) throw err;
			
			var dbObj = db.db("users");
			
			dbObj.collection("users").findOne({username:username}, function(err, results){
				if(results.password === password){
					var user = results;
					done(null, user);
				}
				else{
					done(null, false, {message:'Bad Password'});	
				}
			});
		});
}));

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		res.redirect("/sign-in");
	}
};

// Website links
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/sign-in");
});

app.get("/", ensureAuthenticated, function(req, res){
	MongoClient.connect(url, function(err, db){
		if(err) throw err;
	
		var dbObj = db.db("questionData");
		
		dbObj.collection("questionData").find({}).toArray(function(err, results){
			console.log(results);
			res.render("index",{datas:results});
		});	
	});
});

app.get("/new-entry", ensureAuthenticated, function(req, res){
	res.render("new-entry");
});

app.get("/edit-entry", ensureAuthenticated, function(req, res){
	MongoClient.connect(url, function(err, db){
		if(err) throw err;
	
		var dbObj = db.db("questionData");
		dbObj.collection("questionData").find({}).toArray(function(err, results){
				console.log(results);
				res.render("edit-entry", {datas:results});
		});
	});
});

app.get("/sign-in", function(req, res){
	res.render("sign-in");
});

app.get("/sign-up", function(req, res){
	res.render("sign-up");
});

app.get("/success",function(req, res){
	res.render("success");
});
/* 
app.post("/new-entry", function(req, res){
	if(!req.body.title){
		res.status(400).send("Entries must have some text!");
		return;
	}
	
	MongoClient.connect(url, function(err, db){
		if(err) throw err;
				
		var dbObj = db.db("foods");
		
		var user = 
		{
			username:req.user.username,
			food:req.body
		}
		
		dbObj.collection("foods").save(user, function(err, results){
			console.log("Data saved");
			db.close();
			res.redirect("/");
		});		
	});
});
 */
app.post("/edit-entry", function(req, res){
	MongoClient.connect(url, function(err, db){
		if(err) throw err;
		
		var dbObj = db.db("questionData");
				
		dbObj.dropCollection('questionData', function (err, delOK){
					if(err) throw err;
					if(delOK) console.log("Collection deleted");	
			});
	});
	
	MongoClient.connect(url, function(err, db){
		if(err) throw err;
		console.log(JSON.stringify(req.body));
		
		var dbObj = db.db("questionData");
	
		dbObj.collection('questionData').save(req.body, function(err, results){
			if(err) throw err;
			console.log("Data saved to MongoDB");
			res.redirect("/");
		});
	});
	
	
});


app.post("/sign-up",function(req, res){
	console.log(req.body);
	
	MongoClient.connect(url, function(err, db){
		if(err) throw err;
	
		var dbObj = db.db("users");
			
		var user = {
			username: req.body.username,
			password: req.body.password
		};
		
		dbObj.collection('users').insert(user, function(err, results){
			if(err) throw err;
			req.login(req.body,function(){
			res.redirect('/success');
			});
		});
	});	
});

app.post("/sign-in", passport.authenticate('local', {
	failureRedirect:'/sign-in'
	}), function(req, res){
		res.redirect('/');
});

app.get('/profile', function(req, res){
	res.json(req.user);	
});


app.use(function(req, res){
	res.status(404).render("404");
});

http.createServer(app).listen(3000, function(){
	console.log("Website server up and running");
});


// Mongodb connection with Unity
io.sockets.on('connection', function(socket){
	//var thisId = shortid.generate();
	
	//console.log('generating id: '+ thisId);
	socket.broadcast.emit('open');
	
	socket.on('request data', function(){
		MongoClient.connect(url, function(err, db){
			if(err) throw err;
			
			var dbObj = db.db("questionData");
			dbObj.collection('questionData').find({}).toArray(function(err, results){
					socket.emit('sent data', results[0]);
					console.log("Data Sent");
				});
		});
	});
	
	socket.on('send data', function(data)
	{	
		MongoClient.connect(url, function(err, db){
		if(err) throw err;
		
			var dbObj = db.db("questionData");
			
			dbObj.dropCollection('questionData', function (err, delOK){
					if(err) throw err;
					if(delOK) console.log("Collection deleted");	
			});
		});
		
		MongoClient.connect(url, function(err, db){
			if(err) throw err;
			
			var dbObj = db.db("questionData");
			
			dbObj.collection('questionData').save(data, function(err, results){
			if(err) throw err;
			console.log("Data saved to MongoDB");
			});

			console.log(JSON.stringify(data));	

		});
	});
});