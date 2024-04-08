const express = require("express");
const cors = require("cors");
const app = express();
const port = 5003;
app.use(cors());
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const { MongoClient } = require("mongodb");
require('dotenv').config()
console.log(process.env.DB_USER) 
const admin = require("firebase-admin");

var serviceAccount = require("./configs/sajek-room-booking-firebase-adminsdk-wnuqi-8818403319.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace the uri string with your connection string.
const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.huwmvh7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri);

async function run() {
  try {
    const database = client.db("sajek");
    const bookings = database.collection("booking");
    app.post("/addBooking", async (req, res) => {
      const newBooking = req.body;
      bookings.insertOne(newBooking).then((result) => {
        console.log(result);
      });
      console.log(newBooking);
    });

    app.get("/bookings", async (req, res) => {
      const bearer = req.headers.authorization;
      if (bearer && bearer.startsWith("Bearer ")) {
        const idToken = bearer.split(" ")[1];
        console.log({ idToken });
        admin
          .auth()
          .verifyIdToken(idToken)
          .then((decodedToken) => {
            const tokenEmail = decodedToken.email;
            console.log(tokenEmail)
           
       
            // ...
          })
          .catch((error) => {
            // Handle error
          });
          const data = bookings.find({email: req.query.email});
          const results = await data.toArray();
          res.send(results);
      }

      
    });

    console.log("db is connected");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
