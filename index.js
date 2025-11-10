// server.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config(); // ⬅️ load .env variables

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI; 

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db("eduNestDB");
    const userCollection = db.collection("users");
    const courseCollection = db.collection("courses");
    const enrollCollection = db.collection("enrolls");

    // ====== User Routes ======
    app.post('/users', async (req, res) => {
      try {
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });

    app.get('/users', async (req, res) => {
      const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.get('/users/:uid', async (req, res) => {
      const uid = req.params.uid;
      const user = await userCollection.findOne({ uid });
      if (!user) return res.status(404).send({ message: 'User not found' });
      res.send(user);
    });

    // ====== Course Routes ======
    app.post('/courses', async (req, res) => {
      try {
        const newCourse = req.body;
        const result = await courseCollection.insertOne(newCourse);
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });

    app.get('/courses', async (req, res) => {
      const courses = await courseCollection.find().toArray();
      res.send(courses);
    });

    app.get("/courses/:id", async (req, res) => {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid course ID format" });
      }

      try {
        const course = await courseCollection.findOne({ _id: new ObjectId(id) });
        if (!course) {
          return res.status(404).send({ message: "Course not found" });
        }
        res.send(course);
      } catch (error) {
        res.status(500).send({ message: "Internal server error", error });
      }
    });

    app.get('/courses/user/:email', async (req, res) => {
      const { email } = req.params;
      try {
        const courses = await courseCollection.find({ instructor_email: email }).toArray();
        res.send(courses);
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });

    app.put('/courses/:id', async (req, res) => {
      const { id } = req.params;
      const updatedCourse = req.body;
      try {
        const result = await courseCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedCourse }
        );
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });

    app.delete('/courses/:id', async (req, res) => {
      const { id } = req.params;
      try {
        const result = await courseCollection.deleteOne({ _id: new ObjectId(id) });
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });

    // ====== Enrollment Routes ======
    app.post('/enroll', async (req, res) => {
      try {
        const enrollment = req.body;
        const result = await enrollCollection.insertOne(enrollment);
        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });

    app.get('/enroll/:email', async (req, res) => {
      const { email } = req.params;
      try {
        const enrolledCourses = await enrollCollection.find({ userEmail: email }).toArray();
        res.send(enrolledCourses);
      } catch (error) {
        res.status(500).send({ success: false, error });
      }
    });

    // Test route
    app.get('/', (req, res) => {
      res.send('EduNest Server is Running');
    });

    console.log("✅ API Ready");
  } finally {
    // do nothing
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
