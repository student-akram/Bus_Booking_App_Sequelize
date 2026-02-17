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
  seatNumber: DataTypes.INTEGER
});

// PAYMENTS (not used here but kept)
const Payment = sequelize.define("Payment", {
  amount: DataTypes.FLOAT,
  status: DataTypes.STRING
});

/* ================= ASSOCIATIONS ================= */

// User ↔ Booking
User.hasMany(Booking);
Booking.belongsTo(User);

// Bus ↔ Booking
Bus.hasMany(Booking);
Booking.belongsTo(Bus);

/* ================= SAMPLE DATA ================= */

async function insertSampleData() {
  await User.bulkCreate([
    { name: "Akram", email: "akram@gmail.com" },
    { name: "John", email: "john@gmail.com" }
  ]);

  await Bus.bulkCreate([
    { busNumber: "TS01", totalSeats: 40, availableSeats: 25 }
  ]);

  console.log("Sample data inserted");
}

/* ================= API ENDPOINTS ================= */

// CREATE USER
app.post("/users", async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

// CREATE BUS
app.post("/buses", async (req, res) => {
  const bus = await Bus.create(req.body);
  res.json(bus);
});

// CREATE BOOKING
app.post("/bookings", async (req, res) => {
  const booking = await Booking.create({
    seatNumber: req.body.seatNumber,
    UserId: req.body.userId,
    BusId: req.body.busId
  });

  res.json(booking);
});

// GET BOOKINGS FOR USER
app.get("/users/:id/bookings", async (req, res) => {
  const bookings = await Booking.findAll({
    where: { UserId: req.params.id },
    include: Bus
  });

  res.json(bookings);
});

// GET BOOKINGS FOR BUS
app.get("/buses/:id/bookings", async (req, res) => {
  const bookings = await Booking.findAll({
    where: { BusId: req.params.id },
    include: User
  });

  res.json(bookings);
});

/* ================= START ================= */

sequelize.sync({ alter: true })
  .then(async () => {
    console.log("Tables synced");

    await insertSampleData();

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch(err => console.log(err));
