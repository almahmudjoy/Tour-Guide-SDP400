const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// MongoDB connection
const uri = 'mongodb://localhost:27017'; // Change if needed
const client = new MongoClient(uri);
let db;

client.connect().then(() => {
  db = client.db('village_tour_bd');
  console.log('Connected to MongoDB');
}).catch(err => console.error(err));

// Routes
app.post('/get-item', async (req, res) => {
  const { table, data, where } = req.body;

  try {
    if (table === 'users') {
      const { email, password } = data;
      const user = await db.collection('users').findOne({ email, password });
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else if (table === 'place_type') {
      const placeTypes = await db.collection('place_type').find().toArray();
      res.json(placeTypes);
    } else if (table === 'places') {
      const { user_email } = where;
      const places = await db.collection('places').find({ user_email }).toArray();
      res.json(places);
    } else {
      res.status(400).json({ message: 'Invalid table' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/insert-item', async (req, res) => {
  const { table, data } = req.body;

  try {
    if (table === 'users') {
      const result = await db.collection('users').insertOne(data);
      res.json({ message: 'User created', id: result.insertedId });
    } else if (table === 'places') {
      const result = await db.collection('places').insertOne(data);
      res.json({ message: 'Place created', id: result.insertedId });
    } else {
      res.status(400).json({ message: 'Invalid table' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
