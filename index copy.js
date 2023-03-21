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
			res.render('farytale')
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
		//---------------------------вывод на экран из монго
		app.get('/farytale/:years', async (req, res)=>{
			let date = new Date().toLocaleDateString('en-ca');
			console.log(date);
			let years = req.params.years;
			console.log(years);
			let tale = await coll.find({date, years}).toArray()
			res.render('farytale', {coll: tale})
		// //---------------------------записываем куку
		// 	res.cookie('yearsTale',{
		// 		years: years,
		// 	},
		// 	{
		// 		maxAge: 10 * 100 * 1000,
		// 		path: '/'
		// 	})
		// //---------------------------проверяем есть ли кука
		// console.log(req.cookies)
		// 	if(req.cookies.yearsTale){
		// 		res.send({years: tale1})
		// 	}else{
		// 		res.render('farytale', {coll: tale1})
		// 	}
		// 	//console.log(req.body)
		// 	// console.log(req.cookies)
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