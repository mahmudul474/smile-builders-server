const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dmnves2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' })
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Unauthorized Access' })
    }
    req.decoded = decoded;

    next()
  })
}

async function run() {
  try {
    const serviceCollection = client.db('smileBuilders').collection('services');
    const reviewCollection = client.db('smileBuilders').collection('reviews');

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({ token })
    })

    app.get('/reviews', async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // Get home page services with limit data (3)
    app.get('/services', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort('time', -1);
      const services = await cursor.limit(3).toArray();
      res.send(services)
    })

    // Get services page all services
    app.get('/all-services', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort('time', -1);
      const services = await cursor.toArray();
      res.send(services)
    })

    // Get Specific Service Data
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service)
    })

    // Craete Service Data
    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    // Create Review Data
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get('/reviews',verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if(decoded.email !== req.query.email){
          res.status(403).send({message: 'unauthorized access'})
      }
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email
        }
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.get('/reviewsid', async (req, res) => {
      let query = {}
      if (req.query.serviceId) {
        query = {
          serviceId: req.query.serviceId
        }
        const cursor = reviewCollection.find(query).sort('time', -1)
        const matchedReviews = await cursor.toArray()
        res.send(matchedReviews)
      }
    })

    // const cursor = reviewCollection.find(query).sort('date', -1)

    // Review Display with service id


    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const review = await reviewCollection.findOne(query)
      res.send(review)
    })

    app.delete('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })

    app.patch('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const review = req.body;
      const query = { _id: ObjectId(id) }
      const updatedDoc = {
        $set: {
          message: review.message
        }
      }
      const result = await reviewCollection.updateOne(query, updatedDoc)
      res.send(result)
    })
  }
  finally {

  }
}

run().catch(err => console.error(err))


app.get('/', (req, res) => {
  res.send('Server Running')
})

app.listen(port, () => {
  console.log('Server Running on port', port);
})