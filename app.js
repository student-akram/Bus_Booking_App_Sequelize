const express = require("express");
const bodyParser = require("body-parser");
const { DataTypes, Sequelize, Op } = require("sequelize");

const app = express();
app.use(bodyParser.json());

/* ================= DB CONNECTION ================= */

const sequelize = new Sequelize(
  "bus_booking_db",
  "root",
  "root",
  {
    host: "localhost",
    dialect: "mysql"
  }
);

/* ================= MODELS ================= */

// USERS
const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING
});

// BUSES
const Bus = sequelize.define("Bus", {
  busNumber: DataTypes.STRING,
  totalSeats: DataTypes.INTEGER,
  availableSeats: DataTypes.INTEGER
});

// BOOKINGS
const Booking = sequelize.define("Booking", {
  seatCount: DataTypes.INTEGER
});

// PAYMENTS
const Payment = sequelize.define("Payment", {
  amount: DataTypes.FLOAT,
  status: DataTypes.STRING
});

/* ================= SAMPLE DATA INSERT ================= */

async function insertSampleData() {
  await User.bulkCreate([
    { name: "Akram", email: "akram@gmail.com" },
    { name: "John", email: "john@gmail.com" },
    { name: "Sara", email: "sara@gmail.com" }
  ]);

  await Bus.bulkCreate([
    { busNumber: "TS01", totalSeats: 40, availableSeats: 25 },
    { busNumber: "TS02", totalSeats: 50, availableSeats: 8 }
  ]);

  console.log("Sample data inserted");
}

/* ================= SYNC & START ================= */

sequelize.sync()
  .then(async () => {
    console.log("Tables created");

    await insertSampleData(); // ✅ Now runs AFTER sync

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch(err => console.log(err));

/* ================= API ENDPOINTS ================= */

// POST /users
app.post("/users", async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET /users
app.get("/users", async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// POST /buses
app.post("/buses", async (req, res) => {
  const bus = await Bus.create(req.body);
  res.json(bus);
});

// GET /buses/available/:seats
app.get("/buses/available/:seats", async (req, res) => {
  const seats = parseInt(req.params.seats);

  const buses = await Bus.findAll({
    where: {
      availableSeats: {
        [Op.gt]: seats
      }
    }
  });

  res.json(buses);
});
