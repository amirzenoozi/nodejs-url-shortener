const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/short-url.js');
const validUrl = require('valid-url');
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
    const { fullUrl } = req.body;
    if (!validUrl.isUri( fullUrl )) {
        return res.status(404).json('Invalid base URL!');
    }

    if (validUrl.isUri( fullUrl )) {
        try {
            await ShortUrl.create({full: fullUrl });
        } catch (err) {
            console.log(err);
            res.status(500).json('Server Error');
        }
    }
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
