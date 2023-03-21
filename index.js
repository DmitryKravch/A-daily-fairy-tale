import express from 'express';
import  expressHandlebars  from 'express-handlebars';
import mongodb from 'mongodb';
import __dirname from './__dirname.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

let mongoClient =new mongodb.MongoClient('mongodb://localhost:27017/',{
	useUnifiedTopology: true
});
const handlebars = expressHandlebars.create({
	defaultLayout: 'main',
	extname: 'hbs'
});

let app = express();
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.use(bodyParser());
//---------------------------для использлвания статических файлов
app.use('/farytale', express.static('static'));
//---------------------------cookie
let secret = 'qwerty';
app.use(cookieParser(secret));


mongoClient.connect(async (error, mongo)=>{
	if(!error){
		let db = mongo.db('everydayTale');
		let coll = db.collection('tales');
		//---------------------------главная страница
		app.get('/farytale/',async (req, res)=>{
			let years = req.cookies.years;
			if(req.cookies.years){
				let date = new Date().toLocaleDateString('en-ca');
				console.log({date, years})
				let tale = await coll.findOne({date, years});
				console.log(tale);
				res.render('farytale', {tale})
			}else{
				res.render('farytale')
			}
		})
		//---------------------------добавление в монго
		app.get('/admin/', (req, res)=>{
			req.render('admin')
		})
		app.post('/admin/', async(req, res)=>{
			let obj = req.body;
			console.log(obj);
			await coll.insertOne(obj);
			res.redirect('/farytale')
		})
		//---------------------------установка куки
		app.get('/farytale/:years', async (req, res)=>{
			let years = req.params.years;
			res.cookie('years', years,{
				path: '/',
				maxAge: 1000 * 60 * 60 * 24 * 365,
			})
			res.redirect('/farytale')
		})
	}else{
		console.log(error)
	}
})

app.get('/admin', (req, res)=>{
	res.render('admin', {
		layout: 'admin',
	})
})

app.listen(1234, ()=>{
	console.log('Running')
})