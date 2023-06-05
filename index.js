const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000
// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.x6iur0l.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const usersCollection = client.db('aircncDb').collection('users')
    const roomsCollection = client.db('aircncDb').collection('rooms')
    const bookingsCollection = client.db('aircncDb').collection('bookings')
 
  //  save user email amd role in DB 
    app.put('/users/:email',async(req,res)=>{
        const email = req.params.email;
        const user = req.body;
        const query = {email: email};
        const options = {upsert: true};
        const updateDoc = {
            $set: user
        }
        const result = await usersCollection.updateOne(query,updateDoc,options)
        res.send(result)
    })

    // get user 
    app.get('/users/:email', async(req,res)=>{
         const email = req.params.email;
         const query = {email:email}
         const result = await usersCollection.findOne(query)
         res.send(result)
    })

    // Get all rooms
    app.get('/rooms', async(req,res)=>{
      const result = await roomsCollection.find().toArray()
      res.send(result)
    })
     
    // delete room 
    app.delete('/room/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await roomsCollection.deleteOne(query)
      res.send(result)
    })
    // get rooms with email
    app.get('/rooms/:email', async(req,res)=>{
      const email = req.params.email 
      const query = {'host.email':email}
      const result = await roomsCollection.find(query).toArray()
      res.send(result)
    })

      // get room you will see room details page

      app.get('/room/:id', async(req,res)=>{
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await roomsCollection.findOne(query)
        res.send(result)
      })



    // save a room in database when user added new room
    app.post('/rooms', async(req,res)=>{
      const room = req.body;
      const result = await roomsCollection.insertOne(room)
      res.send(result)
    })


    //  get bookings for guest 
    app.get('/bookings', async(req,res)=>{
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = {'guest.email': email}
      const result = await bookingsCollection.find(query).toArray()
      res.send(result)
    })
      // save a room booking in database
      app.post('/bookings', async(req,res)=>{
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking)
        res.send(result)
      })
 
       // delete booking
       app.delete('/bookings/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await bookingsCollection.deleteOne(query)
        res.send(result)
       })
       
      // update room booing status
      app.patch('/rooms/status/:id', async(req,res)=>{
        const id = req.params.id;
        const status = req.body.status;
        const query = {_id: new ObjectId(id)}
        const updateDoc = {
          $set: {
            booked: status,
          },
        }
        const update = await roomsCollection.updateOne(query,updateDoc)
        res.send(update)
      })

    

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('AirCNC Server is running..')
})

app.listen(port, () => {
  console.log(`AirCNC is running on port ${port}`)
})
