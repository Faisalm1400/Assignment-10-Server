require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.daisl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // await client.connect();

        const campaignCollection = client.db('campaignDB').collection('campaign');
        const donatedCollection = client.db('campaignDB').collection('donated');
        const userCollection = client.db('campaignDB').collection('users');

        // campaign related api

        app.post('/campaign', async (req, res) => {
            const newCampaign = req.body;
            // console.log(newCampaign);
            const result = await campaignCollection.insertOne(newCampaign);
            res.send(result);
        })

        app.get('/campaign', async (req, res) => {
            const cursor = campaignCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const campaign = await campaignCollection.findOne(query);
            res.send(campaign);
        })

        app.delete('/campaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await campaignCollection.deleteOne(query);
            res.send(result);
        })

        app.put('/updateCampaign/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedCampaign = req.body;

            const campaign = {
                $set: {
                    image: updatedCampaign.image,
                    title: updatedCampaign.title,
                    type: updatedCampaign.type,
                    description: updatedCampaign.description,
                    minDonation: updatedCampaign.minDonation,
                    deadline: updatedCampaign.deadline
                }
            }

            const result = await campaignCollection.updateOne(filter, campaign, options);
            res.send(result);
        })



        // Users related api

        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            // console.log('creating new user', newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        })

        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const updatedDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime
                }
            }

            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.put('/users', async (req, res) => {

            const { email, createdAt, lastSignInTime } = req.body;

            const filter = { email };
            const updateDoc = {
                $set: {
                    createdAt,
                    lastSignInTime
                }
            };
            const options = { upsert: true };

            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // user campaigns
        app.get('/myCampaigns', async (req, res) => {
            const email = req.query.email;
            const filter = { email };

            const cursor = campaignCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result);
        });

        // donated apis
        app.post('/donated', async (req, res) => {
            const donationInfo = req.body;
            const result = await donatedCollection.insertOne(donationInfo);
            res.send(result);
        });

        app.get('/myDonations', async (req, res) => {
            const email = req.query.email;
            const filter = { email };

            const cursor = donatedCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Crowdcube server is running')
})

app.listen(port, () => {
    console.log(`Crowdcube server is running on port: ${port}`)
})