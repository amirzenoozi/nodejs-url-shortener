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
app.use(express.json());


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

app.get("/api/v1/get-urls", async (req, res, next) => {
    const targetRecord = await ShortUrl.find();
    res.json( targetRecord );
});

app.post("/api/v1/url", async (req, res, next) => {
    try {
        const {fullUrl} = req.body;
        const urlData = await ShortUrl.create({full: fullUrl});
        res.status(201).json({
            error: false,
            data: {
                clicks: urlData['clicks'],
                full: urlData['full'],
                short: urlData['short'],
            }
        });
    }
    catch(e) {
        res.status(500).json({error: true, data: []});
    }
});

app.delete("/api/v1/url/:shortId", async (req, res, next) => {
    try {
        const { shortId } = req.params;
        const urlData = await ShortUrl.findOneAndRemove({short: shortId});
        res.status(410).json({
            error: false,
            data: urlData
        });
    }
    catch(e) {
        res.status(500).json({error: true, data: []});
    }
});

app.listen(process.env.PORT || 5000);
