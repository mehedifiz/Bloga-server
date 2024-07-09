const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 4000;
const uri = "mongodb://localhost:27017";

// Middleware
app.use(express.json());
app.use(cors());



// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const allBlogCollection = client.db('Bolgaa').collection('allBloges');

    // Endpoints
    app.get('/', (req, res) => {
      res.send('server is running');
    });

    app.get('/allBloges', async (req, res) => {
      const result = await allBlogCollection.find().toArray();
      res.send(result);
    });

   
    app.get('/allBloges/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allBlogCollection.findOne(query);
      res.send(result);
    });

    
    app.post('/allBloges', async (req, res) => {
      const blogs = req.body;
      const result = await allBlogCollection.insertOne(blogs);
      res.send(result);
    });

    
    app.get('/blogsByEmail', async (req, res) => {
      const email = req.query.email;
      let query ={}
      if (!email) {
        return res.status(400).send({ message: "Email query parameter is required" });
      }
      if(email)
     {
       query = {email : email}
      }
      console.log(query)
      const result = await allBlogCollection.find(query).toArray();
      res.send(result);
    });

    // Confirm successful connection to MongoDB
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
