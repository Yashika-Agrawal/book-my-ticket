//  CREATE TABLE seats (
//      id SERIAL PRIMARY KEY,
//      name VARCHAR(255),
//      isbooked INT DEFAULT 0
//  );
// INSERT INTO seats (isbooked)
// SELECT 0 FROM generate_series(1, 20);

import express from "express";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { register, login } from "./controllers/auth.controller.mjs";
import { pool } from "./config/db.mjs";
import { isLoggedIn } from "./middlewares/auth.middleware.mjs";
import cookieParser from "cookie-parser";

dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

const port = process.env.PORT || 8080;

// Equivalent to mongoose connection
// Pool is nothing but group of connections
// If you pick one connection out of the pool and release it
// the pooler will keep that connection open for sometime to other clients to reuse

const app = new express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
//get all seats
app.get("/seats", async (req, res) => {
  const result = await pool.query("select * from seats"); // equivalent to Seats.find() in mongoose
  res.send(result.rows);
});

//book a seat give the seatId and your name
app.get("/test", isLoggedIn, (req, res) => {
  res.send("ok");
});
app.put("/:id", isLoggedIn, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    if (!id) {
      return res.status(400).send({
        message: "Seat ID is required"
      });
    }
    // payment integration should be here
    // verify payment
    const conn = await pool.connect(); // pick a connection from the pool
    //begin transaction
    // KEEP THE TRANSACTION AS SMALL AS POSSIBLE
    await conn.query("BEGIN");
    //getting the row to make sure it is not booked
    /// $1 is a variable which we are passing in the array as the second parameter of query function,
    // Why do we use $1? -> this is to avoid SQL INJECTION
    // (If you do ${id} directly in the query string,
    // then it can be manipulated by the user to execute malicious SQL code)
    const sql = "SELECT * FROM seats where id = $1 and isbooked = 0 FOR UPDATE";
    const result = await conn.query(sql, [id]);

    //if no rows found then the operation should fail can't book
    // This shows we Do not have the current seat available for booking
    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      conn.release();
      return res.status(400).send({ error: "Seat already booked" });
    }
    //if we get the row, we are safe to update
    const sqlU = "update seats set isbooked = 1, user_id = $2 where id = $1";
    const updateResult = await conn.query(sqlU, [id, userId]); // Again to avoid SQL INJECTION we are using $1 and $2 as placeholders

    //end transaction by committing
    await conn.query("COMMIT");
    conn.release(); // release the connection back to the pool (so we do not keep the connection open unnecessarily)
    // res.send(updateResult);
    res.status(200).send({
      success: true,
      message: "Seat booked successfully",
      seatId: id,
      userId: userId
    });
   
  } catch (ex) {
    console.log(ex);
    res.status(500).send({
      message: "Something went wrong"
    });
  }
});
//register

app.post("/register", register)
//login
app.post("/login", login)
app.listen(port, () => console.log("Server starting on port: " + port));
