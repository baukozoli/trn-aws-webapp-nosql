var express = require("express");
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require("uuid");

const bodyParser = require("body-parser");
require("dotenv").config();

// Using environment variables
const access_key = process.env.AWS_ACCESS_KEY;
const secret_key = process.env.AWS_SECRET_KEY;
const region = process.env.AWS_REGION;
const table_name = process.env.AWS_TABLE_NAME;
const partition_key = process.env.AWS_TABLE_PARTITION_KEY;


// AWS DynamoDB configuration
AWS.config.update({
  accessKeyId: access_key,
  secretAccessKey: secret_key,
  region: region,
});
const docClient = new AWS.DynamoDB.DocumentClient();

// Initialize express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // For serving static files (CSS, JS, etc.)
app.set("view engine", "ejs");

// Routes
// Route to display entities
app.get('/', (req, res) => {
  const params = {
    TableName: table_name,
  };

  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Hiba történt az adatok lekérdezésekor: ", err);
      res.send("Hiba történt az adatok lekérdezésekor.");
    } else {
      res.render('index', { items: data.Items });
    }
  });
});

// Route to add an entity
app.post("/add-entity", async (req, res) => {
  const { data } = req.body;
  const rowId = uuidv4();

  const params = {
    TableName: table_name,
    Item: {
      id: rowId,
      data: data,
    }
  };

  docClient.put(params, (err, data) => {
    if (err) {
      console.error("Hiba történt az adatok mentésekor: ", err);
      res.send("Hiba történt az adatok mentésekor.");
    } else {
      res.redirect('/');
    }
  });
});

// Route to generate and insert 100 data objects
app.post("/generate-data", async (req, res) => {
  // Keresztnevek listája
  const firstnames = [
    "Gergő",
    "Petra",
    "Balázs",
    "Krisztián",
    "Anikó",
    "Márton",
    "Zsófia",
    "Bence",
    "Dóra",
    "Gábor",
  ];

  const surenames = [
    "Nagy",
    "Kovács",
    "Horváth",
    "Tóth",
    "Szabó",
    "Kiss",
    "Molnár",
    "Varga",
    "Farkas",
    "Pap",
  ];



  const records = [];
  for (let i = 0; i < 100; i++) {
    const fIndex = Math.floor(Math.random() * firstnames.length);
    const sIndex = Math.floor(Math.random() * surenames.length);
    const rowId = uuidv4();
    const entity = {
      id: rowId,
      data: `{
          kor: ${Math.floor(Math.random() * (75 - 18 + 1)) + 18},
          nev: {
              vezeteknev: ${surenames[sIndex]},
              keresztnev: ${firstnames[fIndex]}
          }
      }`,
    };
    records.push({
      PutRequest: {
        Item: entity
      }
    });
  }

  // DynamoDB batch write (note: max 25 items per batch)
  // Split records into batches of 25
  const batchedRecords = []; // Array to hold batches
  while (records.length) {
    batchedRecords.push(records.splice(0, 25));
  }

  // Perform batch writes
  try {
    for (const batch of batchedRecords) {
      const params = {
        RequestItems: {
          [table_name]: batch
        }
      };
      await docClient.batchWrite(params).promise();
    }
    res.redirect("/"); // Redirect back to the main page or render a success message
  } catch (error) {
    console.error("Hiba történt az adatok mentésekor:", error);
    res.status(500).json({ error: "FHiba történt az adatok mentésekor" });
  }
});

module.exports = app;
