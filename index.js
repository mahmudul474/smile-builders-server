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

async function run() {
  try {
    const serviceCollection = client.db('smileBuilders').collection('services');
    const reviewCollection = client.db('smileBuilders').collection('reviews');

    // Get home page services with limit data (3)
    app.get('/services', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services)
    })

    // Get services page all services
    app.get('/all-services', async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
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

    app.get('/reviews', async (req, res) => {
      // const decoded = req.decoded;
      // if(decoded.email !== req.query.email){
      //     res.status(403).send({message: 'unauthorized access'})
      // }

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

    app.get('/reviews', async (req, res) => {
      // const decoded = req.decoded;
      // if(decoded.email !== req.query.email){
      //     res.status(403).send({message: 'unauthorized access'})
      // }

      let query = {};
      if (req.query.service_id) {
        query = {
          service_id: req.query.service_id
        }
      }
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

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