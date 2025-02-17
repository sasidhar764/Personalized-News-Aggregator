const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/user.model')
const userRoute = require('./routes/user.route')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : false}))

app.use('/api/users', userRoute)

app.get('/', (req, res) => {
    res.send("Cloud Mongo DB Connection")
})

mongoose.connect('mongodb+srv://user:Yjf0CelLvYQOF50K@backenddb.lxmhq.mongodb.net/nodedb?retryWrites=true&w=majority&appName=BackendDB')
.then(() => {
  app.listen(5000, () => {console.log('Server running on port 5000')})
  console.log('Connected!')
})
