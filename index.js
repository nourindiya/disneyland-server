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
            const cursor = activitessCollection.find({}).sort({ _id: -1 });
            const activites = await cursor.toArray();
            res.send(activites)
        })



        app.post('/activities', async (req, res) => {
            const activity = req.body;
            const result = await activitessCollection.insertOne(activity)
            res.json(result)
        })

        // booking
        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
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
            res.json(result)
        })

        // Approve or Reject
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
            res.json(result)
        });


        // Get All orders
        app.get('/orders/admin', async (req, res) => {
            const cursor = ordersCollection.find({})
            const result = await cursor.toArray()
            res.json(result);
        });


        // set order approval
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Delete Api
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query)
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