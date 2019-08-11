'use strict'
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();

const port = process.env.PORT || 3000;

app.use(express.static('./public'));
app.use(express.json({limit: '5mb'}));
app.set('view engine','ejs');
app.set('views','./views');

const db = new Datastore('database.db');
db.loadDatabase();

server.listen(port, () => console.log(`Server is running at port: ${port}`));
// route for webpages
app.get('/', (req, res) => res.render("home"));
app.get('/logs', (req, res) => res.render("logs"));

// api routing
app.get('/api/logs', (req, res) => {
	db.find({}, (err, data) => {
		if (err) return res.end();
		res.json(data);
	});
})

app.get('/api/weather/:latlon', async (req, res) => {
	const latlon = req.params.latlon.split(',');
	const lat = latlon[0];
	const lon = latlon[1];

	//6df044b2d0d64de5179fba47777ea2fd
	const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
	const darksky_api_endpoint = `https://api.darksky.net/forecast/${WEATHER_API_KEY}/${lat},${lon}/?units=si`;
	const weather_response = await fetch(darksky_api_endpoint);
	const weather_data = await weather_response.json();

	const airquality_api_endpoint = `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}`;
	const airquality_response = await fetch(airquality_api_endpoint);
	const airquality_data = await airquality_response.json();

	const data = {
		weather : weather_data,
		airquality: airquality_data
	}
	res.json(data);
})

app.post('/api/savedata', (req, res) => {
	console.log(res.body);
	const data = req.body;
	const timestamp = Date.now();
	data.timestamp = timestamp;

	// save to database
	db.insert(data);

	// response to client
	res.json({
		status: "success",
		data: data
	});
})


