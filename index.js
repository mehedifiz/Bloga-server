 const express = require('express');
const cors = require('cors');
require('dotenv').config();

const jwt = require('jsonwebtoken')
const  cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 4000;
const uri = "mongodb://localhost:27017";

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173',
 credentials: true }));

app.use(cookieParser())


// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
//own midderware

const logger = async(req ,res ,next)=>{
  console.log('called' ,req.host , req.originalUrl )

  next()
}



async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const allBlogCollection = client.db('Bolgaa').collection('allBloges');
    //auth Endpoints

      app.post('/jwt' , logger , async(req , res)=>{
        const user = req.body;
        console.log(user)
        const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '9h' });

   
        res.cookie('token' , token ,{
          httpOnly: true,
          secure :false,
          sameSite:'none'
        
        }).send({success : true}) 
      })

     const verifyToken = async(req , res , next)=>{
        const token = req.cookies?.token;
      console.log('value of token in middleware' , token)
        if(!token){
         return res.status(401).send({message: "forbidden"})
        }
        jwt.verify(token ,process.env.ACCESS_TOKEN , (err , decodeed)=>{

          if(err){
            return res.status(401).send({message:'unauth'})
          }

           console.log('deeecoded value tonkn' , decodeed)

          req.user = decodeed;
            next()
        
      }  )


     }



    // services Endpoints
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

    
    app.get('/blogsByEmail',logger,verifyToken, async (req, res) => {
      const email = req.query.email;
    // console.log('token :', req.cookies.token)


      let query ={}
      if (!email) {
        return res.status(400).send({ message: "Email query parameter is required" });
      }
      if(email !== req.user.email){
        return res.status(403).send({message: 'forbidden'})
      }
      if(email)
     {
       query = {email : email}
      }

      console.log(query)
      const result = await allBlogCollection.find(query).toArray();
      res.send(result);
    });



      //delete
    app.delete('/blogsByEmail/:id' , async(req ,res)=>{
    const id = new ObjectId(req.params.id)
    const query = {_id : id}
    const result = await allBlogCollection.deleteOne(query)
    res.send(result)

    }
    ) 


    //update 
    app.put('/blogsByEmail/:id' , async(req , res)=>{

      const id = req.params.id;
      const query  = {_id : new ObjectId(id)}
      const options ={upsert : true};
      const oldBlog = req.body;
      console.log(oldBlog)
      console.log(id)
      const updatedBlog = req.body;

      const updatedted ={
        $set:{
          title : updatedBlog.title ,
           category : updatedBlog.category ,
            image : updatedBlog.image ,
            author : updatedBlog.author , 
            date : updatedBlog.date , 
            content : updatedBlog.content , 
          
        }
      }
      const result = await allBlogCollection.updateOne(query , updatedted , options)
res.send(result)

    })
    


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
