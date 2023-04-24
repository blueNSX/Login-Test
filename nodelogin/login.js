
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
// const connection = mysql.createConnection({
// 	host     : 'localhost',
// 	user     : 'sqluser',
// 	password : 'password',
// 	database : 'nodelogin'
// });
const connection = mysql.createConnection({
		host     : '45.32.219.12',
		user     : 'nimdas',
		password : 'FormR!1234',
		database : 'iodd'
	});
const app = express();

var mRS 

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
	// Capture the input fields
	let username = request.body.username;
	let password = request.body.password;
	//alert ("username = " + username)
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		//connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
		// var aSQL = 	`SELECT * FROM login_check_view WHERE Email = '${ username }' AND PIN = '${ password }' AND Active = 'Y';`
		var aSQL = 	`SELECT Count FROM login_count_view WHERE Email = '${ username }' AND PIN = '${ password }' AND Active = 'Y';`
		connection.query(aSQL, function(error, results, fields) {
			console.log(results);
			//alert ("aSQL = " + aSQL)
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.username = username;
				mRS = results;
				console.log( mRS )

				var dNow = Date.now()
				var aSQLUpdate = `UPDATE members SET IsLoggedIn = 'Y' LogInDateTime = ${ dNow } WHERE Email = '${ username }' AND PIN = '${ password }';`
				connection.query(aSQLUpdate, function(error, results, fields){

				} )
		

				// Redirect to home page
				response.redirect('/user');
			} else {
				response.send('Incorrect Username and/or Password!<br>Count: 0');
				// aHTML = `<h2>Incorrect UserName and/or PIN</h2>
				// 		 <h2>Count:  ${ pUser.Count }</h2>`
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get("/user", function(request, response) {
	var aLastName = (mRS && mRS[0]) ? mRS[0].LastName : "Not Here"
	var dNow = new Date(Date.now())
	var aHTML = fmtUser(mRS[0])
	response.send(aHTML)	
	//response.send(`Hello ${ aLastName }` )
	function fmtUser(pUser) {
		var aHTML = `<br>
			<h1>WELCOME TO IODD</h1>
			<h1 class="Inits">Hello ${ pUser.Initials }</h1>
			<h2 class="Name">My Full Name: ${ pUser.FullName }</h2>
			<h3 class="Company">My Company: ${ pUser.Company }</h3>
			<h3 class.="intCount">Count: ${ pUser.Count }</h3> 
			<h3 class="dNow">Login Date/Time: ${ dNow }</h3> 
			`
		return aHTML
	}
});
// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

console.log ("server running on port 3000")
app.listen(3000);