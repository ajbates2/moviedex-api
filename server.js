require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const MOVIEDEX = require('./moviedex.json')

const app = express()
app.use(helmet())
app.use(cors())

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'dev'
app.use(morgan(morganSetting))

app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    next()
})

function getMovieConditional(key, response, target) {
    if (key) {
        return response.filter(movie =>
            movie[target].toLowerCase().includes(key.toLowerCase())
        )}
    else {
        return response
    }
}

function handletGetMovies(req, res) {
    let response = MOVIEDEX

    response = getMovieConditional(req.query.genre, response, 'genre')
    response = getMovieConditional(req.query.country, response, 'country')

    if (req.query.avg_vote) {
        response = response.filter(vote =>
            vote.avg_vote >= Number(req.query.avg_vote))
    }

    res.json(response)
}

app.get('/movies', handletGetMovies)

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
      response = { error: { message: 'server error' }}
    } else {
      response = { error }
    }
    res.status(500).json(response)
  })

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
})