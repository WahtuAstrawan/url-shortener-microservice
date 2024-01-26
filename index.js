require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
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

const isValidURL = async (url) => {
  return new Promise((resolve) => {
    try {
      const parsedURL = new URL(url);
      const protocol = parsedURL.protocol.startsWith("http") ? "" : "http://";
      dns.lookup(`${protocol}${parsedURL.host}`, (err) => {
        resolve(!err);
      });
    } catch (error) {
      resolve(false);
    }
  });
}

const urlChecker = async (req, res, next) => {
  const url = req.body.url;

  if (url && (await isValidURL(url))) {
    next();
  } else {
    return res.json({ error: "Invalid URL" });
  }
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

  return res.json({ original_url: `${url}`, short_url: shortenerId });
});

app.get('/api/shorturl/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  const urlData = await UrlModel.findOne({ short_url: shortId });
  if (urlData) {
    return res.redirect(urlData.original_url);
  } else {
    return res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
