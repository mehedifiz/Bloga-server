const express = require('express');
// const cors = require('cors');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 4000;

app.use(express.json())
app.use(cors());


app.get('/', (req ,res)=>{
    res.send('server is running')
})


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb://localhost:27017";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

        const allBlogCollection = client.db('Bolgaa').collection('allBloges')



        app.get('/allBloges' , async(req , res)=>{
            const cursor = await allBlogCollection.find().toArray()
            res.send(cursor)
        })
        
        app.get('/allBloges/:id', async(req , res)=>{
          const id = req.params.id;
          const query = {_id : new ObjectId(id)}
          const result =  await allBlogCollection.findOne(query)
          res.send(result)
      })
      app.post('/allBloges' , async(req ,res)=>{
        const blogs = req.body;
        console.log(blogs)
  
        const result = await allBlogCollection.insertOne(blogs)
        res.send(result)
  
      })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port , ()=>{
    console.log(`server : ${port} `)
})