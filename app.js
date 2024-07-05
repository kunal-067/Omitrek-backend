const express = require("express");
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const vRoutes = require('./Routes/v.route');
const v1Routes = require('./Routes/v1.route');
const v2Routes = require('./Routes/v2.route');
const authorize = require("./Middlewares/auth");

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())

app.use(session({
    secret: process.env.SESSION_SECRET || 'Omi_trek&@79127#$',
    resave: true,
    saveUninitialized: true
}));
app.use(cors({
    origin: ['http://localhost:3000','https://omitrek-website.vercel.app', 'https://www.omitrek.com', '*'], 
    credentials: true // Allow cookies to be sent from the frontend
}))


app.use('/api/v', vRoutes);
app.use('/api/v1', authorize, v1Routes);
app.use('/api/v2', authorize, v2Routes);


module.exports = app;