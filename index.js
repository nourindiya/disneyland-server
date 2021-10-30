const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000

// miidle aware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mcosy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect()

        const database = client.db("DisneyLand")
        const activitessCollection = database.collection("activites")
        const ordersCollection = database.collection("orders")



        //  Get API
        app.get('/activities', async (req, res) => {
            // const cursor = activitessCollection.find({})
            const cursor = activitessCollection.find({}).sort({ _id: -1 });

            const activites = await cursor.toArray();
            res.send(activites)
        })


        // Post Api
        app.post('/activities', async (req, res) => {
            const activity = req.body;
            const result = await activitessCollection.insertOne(activity)
            res.json(result)
        })

        // booking
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(req.params.id);
            const query = { _id: ObjectId(id) }
            // const result = await activitessCollection.findOne(query)
            // res.send(result);
            const activity = await activitessCollection.findOne(query)
            res.send(activity)
        });


        // get my orders Api
        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.json(result)
        })

        // Add My Order
        app.get('/orders', async (req, res) => {

            const email = req.query.email;
            const query = { email: (email) }
            const orders = await ordersCollection.find(query)
            const result = await orders.toArray()
            // const order = req.body;
            // const result = await ordersCollection.insertOne(order)
            // res.json(result)
            res.json(result)
        })






        // Delete Api
        app.delete("/orders/:id", async (req, res) => {
            // console.log(req.params.id);

            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            // const result = await activitessCollection.deleteOne({ _id: ObjectId(req.params.id) })
            // res.send(result);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)



app.get('/', (req, res) => {
    res.send('Running Disneyland')
})

app.listen(port, () => {
    console.log('Running server', port);
})