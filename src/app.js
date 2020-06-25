require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const MOVIEDEX = require('../moviedex.json')
const { NODE_ENV } = require('./config')

const app = express()

const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'dev';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello, World!')
})


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
        )
    }
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
    if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

module.exports = app