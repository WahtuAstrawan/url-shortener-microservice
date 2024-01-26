# URL Shortener Microservice

This microservice, built using Express and Mongoose, provides functionality for generating short URLs from user-provided URLs.

## Usage Example :

1. Generate Short URL

- Endpoint: POST /api/shorturl
- Request Body: { "url": "your_long_url_here" }
- Response: { "original_url": "your_long_url_here", "short_url": "shortened_url" }

2. Access Original URL

- Endpoint: GET /api/shorturl/:short_url
- Response: Redirects to the original URL associated with the provided short URL.
