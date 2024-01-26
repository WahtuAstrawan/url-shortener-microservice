require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((error) => {
    console.log(`Error connecting to MongoDB: ${error}`);
  });

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    unique: true,
    required: true,
  }
});

const UrlModel = mongoose.model("Url", urlSchema);

const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

const urlChecker = (req, res, next) => {
  if (isValidURL(req.body.url)) next();
  else res.status(400).json({ error: "invalid url" });
}

const generateRandomNum = () => {
  return Math.floor(Math.random() * 9999) + 1;
}

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', urlChecker, async (req, res) => {
  const { url } = req.body;
  let shortenerId;

  while (true) {
    shortenerId = generateRandomNum();
    const urlData = await UrlModel.findOne({ short_url: shortenerId });
    if (!urlData) {
      break;
    }
  }

  await UrlModel.create({ original_url: url, short_url: shortenerId });

  res.json({ original_url: `${url}`, short_url: shortenerId });
});

app.get('/api/shorturl/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  const urlData = await UrlModel.findOne({ short_url: shortId });
  if (urlData) {
    res.redirect(urlData.original_url);
  } else {
    res.json({ error: "short url not valid" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
