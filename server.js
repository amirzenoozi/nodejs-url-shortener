const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/short-url.js');
const app = express();

mongoose.connect('mongodb://localhost/urlShortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));


app.get('/', async (req, res) => {
    const shortUrlRecords = await ShortUrl.find();
    res.render('index', { shortUrlRecords });
});

app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({full: req.body.fullUrl });
    res.redirect('/');
});

app.get('/:shortId', async (req, res) => {
    const targetRecord = await ShortUrl.findOne({ short: req.params.shortId} );
    if ( targetRecord === null ) return res.sendStatus(404);

    targetRecord.clicks++
    targetRecord.save();

    res.redirect(targetRecord.full);
});

app.listen(process.env.PORT || 5000);
