const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");


const { getConnection, initDatabase, dropDatabase } = require("./database");
const {insertUser,insertBand,insertReview,insertMessage,insertPublicEvent,insertPrivateEvent} = require("./databaseInsert");

const {users,bands,public_events,private_events,reviews,messages} = require("./resources");

const {getUserByCredentials,updateUser} = require("./databaseQueriesUsers");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

/*******session************/
app.use(
  session({
    secret: "supersecret359",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2, httpOnly: true }
  })
);

/***εδωσα index.html γιατι ειχα προβλημα με τα paths*****/
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/******init,drop,insert βαση****************/
app.get('/initdb', async (req, res) => {
  try {
    const result = await initDatabase();
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/insertRecords', async (req, res) => {
  try {
    for(const user of users)
      var result = await insertUser(user);
    for(const band of bands)
      var result = await insertBand(band);
    for(const pev of public_events)
      var result = await insertPublicEvent(pev);    
    for(const rev of reviews)
      var result = await insertReview(rev);    
    for(const priv of private_events)
      var result = await insertPrivateEvent(priv);    
    for(const msg of messages)
      var result = await insertMessage(msg);
    res.send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message);
  }
});


app.get('/dropdb', async (req, res) => {
  try {
    const message = await dropDatabase();
    res.send(message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/users/details', async (req, res) => {
  const { username, password } = req.query;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }

  try {
    const users = await getUserByCredentials(username, password);

    if (users.length > 0) {
      res.json(users[0]);
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*****διαθεσιμο username****************/
app.get("/check/username", async (req, res) => {
  try {
    const { value } = req.query;
    if (!value) return res.status(400).json({ error: "Missing value" });

    const conn = await getConnection();
    const [u] = await conn.execute(
      "SELECT user_id FROM users WHERE username = ?",
      [value]
    );
    const [b] = await conn.execute(
      "SELECT band_id FROM bands WHERE username = ?",
      [value]
    );

    if (u.length > 0 || b.length > 0)
      return res.status(403).json({ error: "Το username χρησιμοποιείται ήδη" });

    res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/*****διαθεσιμο μειλ*********************/
app.get("/check/email", async (req, res) => {
  try {
    const { value } = req.query;
    if (!value) return res.status(400).json({ error: "Missing value" });

    const conn = await getConnection();
    const [u] = await conn.execute(
      "SELECT user_id FROM users WHERE email = ?",
      [value]
    );
    const [b] = await conn.execute(
      "SELECT band_id FROM bands WHERE email = ?",
      [value]
    );

    if (u.length > 0 || b.length > 0)
      return res.status(403).json({ error: "Το email υπάρχει ήδη" });

    res.json({ available: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/*******simple register ****************/
app.post("/simple_register", async (req, res) => {

  try {
    const user = req.body;
    //an den exo lat ,lon vazo 0
    if (!user.lat) user.lat = 0;
    if (!user.lon) user.lon = 0;

    const conn = await getConnection();

    const [u1] = await conn.execute(
      "SELECT user_id FROM users WHERE username=?",
      [user.username]
    );
    const [b1] = await conn.execute(
      "SELECT band_id FROM bands WHERE username=?",
      [user.username]
    );
    if (u1.length > 0 || b1.length > 0)
      return res.status(403).json({ error: "Το username χρησιμοποιείται ήδη" });

    const [u2] = await conn.execute(
      "SELECT user_id FROM users WHERE email=?",
      [user.email]
    );
    const [b2] = await conn.execute(
      "SELECT band_id FROM bands WHERE email=?",
      [user.email]
    );
    if (u2.length > 0 || b2.length > 0)
      return res.status(403).json({ error: "Το email υπάρχει ήδη" });

    await insertUser(user);

    res.json({ message: "Η εγγραφή σας πραγματοποιήθηκε", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/*******band register*********/
app.post("/band_register", async (req, res) => {
  try {
    const band = req.body;

    const conn = await getConnection();

    const [u1] = await conn.execute(
      "SELECT user_id FROM users WHERE username=?",
      [band.username]
    );
    const [b1] = await conn.execute(
      "SELECT band_id FROM bands WHERE username=?",
      [band.username]
    );
    if (u1.length > 0 || b1.length > 0)
      return res.status(403).json({ error: "Το username χρησιμοποιείται ήδη" });

    const [u2] = await conn.execute(
      "SELECT user_id FROM users WHERE email=?",
      [band.email]
    );
    const [b2] = await conn.execute(
      "SELECT band_id FROM bands WHERE email=?",
      [band.email]
    );
    if (u2.length > 0 || b2.length > 0)
      return res.status(403).json({ error: "Το email υπάρχει ήδη" });

    await insertBand(band);

    res.json({ message: "Η εγγραφή σας πραγματοποιήθηκε", band });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**********login*************/
app.post("/loginUser", async (req, res) => {
  try {
    const { username, password } = req.body;
    const conn = await getConnection();

    /*  admin */
    if (username === "admin") {
      const [rows] = await conn.execute(
        "SELECT * FROM users WHERE user_id = 0 AND password = ?",
        [password]
      );

      if (rows.length === 0)
        return res.status(401).json({ error: "Wrong credentials" });

      req.session.user = {
        id: 0,
        username: "admin",
        type: "admin"
      };

      return res.json({ message: "Admin login success", user: req.session.user });
    }

    /*  band */
    const [bands] = await conn.execute(
      "SELECT * FROM bands WHERE username = ? AND password = ?",
      [username, password]
    );

    if (bands.length > 0) {
      const band = bands[0];

      req.session.user = {
        id: band.band_id,
        username: band.username,
        email: band.email,
        type: "band",
        band_name: band.band_name
      };

      return res.json({ message: "Band login success", user: req.session.user });
    }

    /* simple user */
    const [users] = await conn.execute(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (users.length === 0)
      return res.status(401).json({ error: "Wrong credentials" });

    const user = users[0];

    req.session.user = {
      id: user.user_id,
      username: user.username,
      email: user.email,
      type: "user"
    };

    res.json({ message: "User login success", user: req.session.user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



/****ελεγχος για το session********/
app.get("/sessionUser", (req, res) => {
  if (!req.session.user) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: req.session.user });
});

/****logout*******/
app.get("/logoutUser", (req, res) => {
  req.session.destroy(() => {
      res.json({ message: "logged out (app.get)" });
  });
});


/*****βρισκω το προφιλ στη βαση*****/
app.get("/myProfile", async (req, res) => {
  console.log("app.js /myProfile");
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });
  
  if (req.session.user.type !== "user")
    return res.status(403).json({ error: "Not a simple user" });
  

  const conn = await getConnection();
  const [rows] = await conn.execute(
      "SELECT * FROM users WHERE user_id = ?",
      [req.session.user.id]
  );

  res.json(rows[0]);
});

/***** βρισκω το band profile στη βαση *****/
app.get("/myBandProfile", async (req, res) => {
  console.log("app.js /myBandProfile");

  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  // επιτρέπεται μόνο σε band
  if (req.session.user.type !== "band")
    return res.status(403).json({ error: "Not a band user" });

  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM bands WHERE band_id = ?",
      [req.session.user.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Band not found" });

    res.json(rows[0]);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


/******update to profile*/////

app.post("/updateMyProfile", async (req, res) => {
  console.log("update my profile app.js");

  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const {
      firstname,
      lastname,
      birthdate,
      gender,
      country,
      city,
      address,
      telephone,
      lat,
      lon
    } = req.body;

    const conn = await getConnection();

    await conn.execute(
      `UPDATE users SET
        firstname = ?,
        lastname = ?,
        birthdate = ?,
        gender = ?,
        country = ?,
        city = ?,
        address = ?,
        telephone = ?,
        lat = ?,
        lon = ?
       WHERE user_id = ?`,
      [
        firstname ?? null,
        lastname ?? null,
        birthdate ?? null,
        gender ?? null,
        country ?? null,
        city ?? null,
        address ?? null,
        telephone ?? null,
        lat ?? null,
        lon ?? null,
        req.session.user.id
      ]
    );

    res.json({ message: "επιτυχές update" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});





app.get("/reviews", async (req, res) => {
  const { from, to } = req.query;

  let sql = `
    SELECT 
      r.rating,
      r.review,
      r.band_name
    FROM reviews r
    WHERE r.status = 'published'
  `;

  let params = [];

  if (from && to) {
    sql += " AND r.rating BETWEEN ? AND ?";
    params.push(from, to);
  }

  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(sql, params);
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error loading reviews" });
  }
});



/*post reviw****/

app.post("/review", async (req, res) => {
  console.log("app.post /review");

  try {
    if (!req.session.user)
      return res.status(401).json({ error: "Not logged in" });

    if (req.session.user.type !== "user")
      return res.status(403).json({ error: "Only users can submit reviews" });

    const { band_name, review, rating } = req.body;

    if (!band_name || !review || !rating)
      return res.status(406).json({ error: "Missing fields" });

    const rate = parseInt(rating);
    if (rate < 1 || rate > 5)
      return res.status(406).json({ error: "Rating must be 1-5" });

    const sender = req.session.user.username;

    const conn = await getConnection();

    /* έλεγχος αν υπάρχει band */
    const [bands] = await conn.execute(
      "SELECT band_id FROM bands WHERE band_name = ?",
      [band_name]
    );

    if (bands.length === 0)
      return res.status(403).json({ error: "Band does not exist" });

    const now = new Date();

    await conn.execute(
      `INSERT INTO reviews 
       (band_name, sender, review, rating, date_time, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [band_name, sender, review, rate, now]
    );

    res.json({ message: "Review submitted (pending approval)" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



/*** vrisko to review me status publised*****/

app.get("/reviews/:band_name", async (req, res) => {
  console.log("app.get /reviews/:band_name");

  try {
    const band_name = req.params.band_name;
    const { ratingFrom, ratingTo } = req.query;

    let sql = "SELECT * FROM reviews WHERE status='published'";
    let params = [];

    if (band_name !== "all") {
      sql += " AND band_name = ?";
      params.push(band_name);
    }

    if (ratingFrom) {
      sql += " AND rating >= ?";
      params.push(ratingFrom);
    }

    if (ratingTo) {
      sql += " AND rating <= ?";
      params.push(ratingTo);
    }

    const conn = await getConnection();
    const [rows] = await conn.execute(sql, params);

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


//review srtatus

app.put("/reviewStatus/:review_id/:status", async (req, res) => {
  console.log("app.put /reviewStatus/:review_id/:status");

  try {
    const { review_id, status } = req.params;

    if (!(status === "published" || status === "rejected")) {
      return res.status(406).json({ error: "Invalid status" });
    }

    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM reviews WHERE review_id = ?",
      [review_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: "Review does not exist" });
    }

    await conn.execute(
      "UPDATE reviews SET status = ? WHERE review_id = ?",
      [status, review_id]
    );

    res.json({ message: "Review status updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


//delete

app.delete("/reviewDeletion/:review_id", async (req, res) => {
  console.log("app.delete /reviewDeletion/:review_id");

  try {
    const { review_id } = req.params;

    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM reviews WHERE review_id = ?",
      [review_id]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: "Review not found" });
    }

    await conn.execute(
      "DELETE FROM reviews WHERE review_id = ?",
      [review_id]
    );

    res.json({ message: "Review deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/******** BAND REVIEWS ********/
app.get("/band/reviews", async (req, res) => {
  console.log("GET /band/reviews");

  // πρέπει να είναι logged in
  if (!req.session.user)
    return res.status(401).json({ error: "Not logged in" });

  // πρέπει να είναι band
  if (req.session.user.type !== "band")
    return res.status(403).json({ error: "Not a band user" });

  try {
    const bandName = req.session.user.band_name;

    const conn = await getConnection();

    const [rows] = await conn.execute(
      `SELECT * 
       FROM reviews 
       WHERE band_name = ?
       ORDER BY date_time DESC`,
      [bandName]
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.get("/band/reviews", async (req, res) => {
  try {
    if (!req.session.user || req.session.user.type !== "band") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const band_name = req.session.user.band_name;

    if (!band_name) {
      return res.status(400).json({ message: "Band name missing in session" });
    }

    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM reviews WHERE band_name = ?",
      [band_name]
    );

    res.json(rows);

  } catch (err) {
    console.error("BAND REVIEWS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



/******** ADMIN – ALL REVIEWS ********/


app.get("/admin/reviews", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM reviews ORDER BY date_time DESC"
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/users", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT user_id, username, email FROM users WHERE user_id != 0"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/admin/bands", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT band_id, band_name, username, email FROM bands"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/admin/user/:id", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const conn = await getConnection();
    await conn.execute(
      "DELETE FROM users WHERE user_id = ?",
      [req.params.id]
    );
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/admin/band/:id", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const conn = await getConnection();
    await conn.execute(
      "DELETE FROM bands WHERE band_id = ?",
      [req.params.id]
    );
    res.json({ message: "Band deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/updateMyBandProfile", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "band") {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    const {
      band_name,
      music_genres,
      members_number,
      band_city,
      band_description
    } = req.body;

    const conn = await getConnection();

    await conn.execute(
      `UPDATE bands
       SET band_name = ?,
           music_genres = ?,
           members_number = ?,
           band_city = ?,
           band_description = ?
       WHERE band_id = ?`,
      [
        band_name || null,
        music_genres || null,
        members_number || null,
        band_city || null,
        band_description || null,
        req.session.user.id
      ]
    );

    res.json({ message: "Band profile updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/********************EVENTS***********************/

//***cCREATE*****************///
app.post("/publicEvents", async (req, res) => {
  console.log("POST /publicEvents");

  if (!req.session.user || req.session.user.type !== "band") {
    return res.status(403).json({ error: "Only bands can create events" });
  }

  try {
    const {
      event_type,
      event_datetime,
      event_city,
      event_address,
      participants_price,
      event_description
    } = req.body;

    const conn = await getConnection();

    await conn.execute(
      `INSERT INTO public_events
       (band_id, event_type, event_datetime, event_city,
        event_address, participants_price, event_description,
        event_lat, event_lon)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        req.session.user.id,
        event_type,
        event_datetime,
        event_city,
        event_address,
        participants_price,
        event_description
      ]
    );

    res.json({ message: "Public event created" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
/***********EMFANISH*****************////
app.get("/publicEvents", async (req, res) => {
  console.log("GET /publicEvents");

  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(
      `SELECT p.*, b.band_name
       FROM public_events p
       JOIN bands b ON p.band_id = b.band_id
       ORDER BY event_datetime`
    );

    res.json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/***********DELETE DIKA TIS******/
app.delete("/publicEvents/:id", async (req, res) => {
  console.log("DELETE /publicEvents/:id");

  if (!req.session.user || req.session.user.type !== "band") {
    return res.status(403).json({ error: "Only bands can delete events" });
  }

  try {
    const eventId = req.params.id;
    const bandId = req.session.user.id;

    const conn = await getConnection();

    // σβήνει ΜΟΝΟ αν το event ανήκει στη μπάντα
    const [result] = await conn.execute(
      "DELETE FROM public_events WHERE public_event_id = ? AND band_id = ?",
      [eventId, bandId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Not your event" });
    }

    res.json({ message: "Event deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
/*******private events**********///
app.get("/privateEvents/user", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "user") {
    return res.status(401).json({ error: "Not logged in as user" });
  }

  const conn = await getConnection();

  const [rows] = await conn.execute(
    `SELECT pe.*, b.band_name
     FROM private_events pe
     JOIN bands b ON pe.band_id = b.band_id
     WHERE pe.user_id = ?`,
    [req.session.user.id]
  );

  res.json(rows);
});

app.get("/privateEvents/band", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "band") {
    return res.status(401).json({ error: "Not logged in as band" });
  }

  const conn = await getConnection();

  const [rows] = await conn.execute(
    `SELECT pe.*, u.username
     FROM private_events pe
     JOIN users u ON pe.user_id = u.user_id
     WHERE pe.band_id = ?`,
    [req.session.user.id]
  );

  res.json(rows);
});

///********ACCEPT/REJECT********//
app.post("/privateEvents/decide", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "band") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { private_event_id, decision, band_decision } = req.body;

  const status =
    decision === "accept" ? "to be done" : "rejected";

  const conn = await getConnection();

  await conn.execute(
    `UPDATE private_events
     SET status = ?, band_decision = ?
     WHERE private_event_id = ? AND band_id = ?`,
    [status, band_decision, private_event_id, req.session.user.id]
  );

  res.json({ message: "Decision saved" });
});

/***********PRIVATE EVENT  DONE***********/


app.post("/privateEvents/done", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "band") {
    return res.status(401).json({ error: "Not logged in as band" });
  }

  const { private_event_id } = req.body;

  if (!private_event_id) {
    return res.status(400).json({ error: "Missing private_event_id" });
  }

  try {
    const conn = await getConnection();

    const [result] = await conn.execute(
      `UPDATE private_events
       SET status = 'done'
       WHERE private_event_id = ?
         AND band_id = ?
         AND status = 'to be done'`,
      [
        private_event_id,
        req.session.user.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Cannot mark as done" });
    }

    res.json({ message: "Private event marked as done" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

/***USER REQUESTED ****////
app.post("/privateEvents", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "user") {
    return res.status(401).json({ error: "Not logged in as user" });
  }

  const {
    band_id,
    event_type,
    price,
    event_datetime,
    event_city,
    event_address,
    event_description
  } = req.body;

  // ΥΠΟΧΡΕΩΤΙΚΟΣ ΕΛΕΓΧΟΣ
  if (
    !band_id ||
    !event_type ||
    !price ||
    !event_datetime ||
    !event_city ||
    !event_address ||
    !event_description
  ) {
    return res.status(406).json({ error: "All fields are required" });
  }

  const conn = await getConnection();

  await conn.execute(
    `INSERT INTO private_events
     (band_id, price, status, band_decision, user_id,
      event_type, event_datetime, event_description,
      event_city, event_address, event_lat, event_lon)
     VALUES (?, ?, 'requested', '', ?, ?, ?, ?, ?, ?, 0, 0)`,
    [
      band_id,
      price,
      req.session.user.id,
      event_type,
      event_datetime,
      event_description,
      event_city,
      event_address
    ]
  );

  res.json({ message: "Private event request sent" });
});



app.get("/bandsList", async (req, res) => {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT band_id, band_name FROM bands ORDER BY band_name"
    );
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/privateEvents", async (req, res) => {
  if (!req.session.user || req.session.user.type !== "user") {
    return res.status(401).json({ error: "Not logged in as user" });
  }

  try {
    const {
      band_id,
      event_type,
      event_datetime,
      event_city,
      event_address,
      event_description,
      price
    } = req.body;

    if (!band_id || !event_type || !event_datetime || !event_city || !event_address || !event_description) {
      return res.status(406).json({ error: "Missing fields" });
    }

    const conn = await getConnection();

    await conn.execute(
      `INSERT INTO private_events
       (band_id, price, status, band_decision, user_id,
        event_type, event_datetime, event_description,
        event_city, event_address, event_lat, event_lon)
       VALUES (?, ?, 'requested', '', ?, ?, ?, ?, ?, ?, 0, 0)`,
      [
        parseInt(band_id),
        parseFloat(price || 0),
        req.session.user.id,
        event_type,
        event_datetime,
        event_description,
        event_city,
        event_address
      ]
    );

    res.json({ message: "Private event request sent" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
/*************MESSAGES*////////
app.get("/messages/user", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  if (req.session.user.type !== "user") return res.status(403).json({ error: "Forbidden" });

  try {
    const conn = await getConnection();

    const [msgs] = await conn.execute(
      `SELECT 
  m.message_id,
  m.private_event_id,
  m.message,
  m.sender,
  m.recipient,
  m.date_time,
  pe.status AS event_status,

  -- sender name
  CASE 
    WHEN m.sender = 'user' THEN u.username
    ELSE b.band_name
  END AS sender_name,

  -- recipient name  
  CASE 
    WHEN m.recipient = 'user' THEN u.username
    ELSE b.band_name
  END AS recipient_name

FROM messages m
JOIN private_events pe ON pe.private_event_id = m.private_event_id
JOIN users u ON u.user_id = pe.user_id
JOIN bands b ON b.band_id = pe.band_id
WHERE pe.user_id = ?
ORDER BY m.date_time DESC
`,
      [req.session.user.id]
    );

    res.json(msgs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/messages/band", async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "Not logged in" });
  if (req.session.user.type !== "band") return res.status(403).json({ error: "Forbidden" });

  try {
    const conn = await getConnection();

    const [msgs] = await conn.execute(
      `SELECT 
  m.message_id,
  m.private_event_id,
  m.message,
  m.sender,
  m.recipient,
  m.date_time,
  pe.status AS event_status,

  CASE 
    WHEN m.sender = 'user' THEN u.username
    ELSE b.band_name
  END AS sender_name,

  CASE 
    WHEN m.recipient = 'user' THEN u.username
    ELSE b.band_name
  END AS recipient_name

FROM messages m
JOIN private_events pe ON pe.private_event_id = m.private_event_id
JOIN users u ON u.user_id = pe.user_id
JOIN bands b ON b.band_id = pe.band_id
WHERE pe.band_id = ?
ORDER BY m.date_time DESC
`,
      [req.session.user.id]
    );

    res.json(msgs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/messages", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  const { private_event_id, message } = req.body;

  if (!private_event_id || !message || !message.trim()) {
    return res.status(400).json({ error: "private_event_id and message are required" });
  }

  try {
    const conn = await getConnection();

    // βρίσκουμε το event για να ξέρουμε band_id & user_id
    const [rows] = await conn.execute(
      `SELECT private_event_id, band_id, user_id
       FROM private_events
       WHERE private_event_id = ?`,
      [private_event_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Private event not found" });
    }

    const pe = rows[0];

    // έλεγχος ότι αυτός που στέλνει, ανήκει στο event
    let sender = "";
    let recipient = "";

    if (req.session.user.type === "user") {
      if (req.session.user.id !== pe.user_id) {
        return res.status(403).json({ error: "Not allowed" });
      }
      sender = "user";
      recipient = "band";
    } else if (req.session.user.type === "band") {
      if (req.session.user.id !== pe.band_id) {
        return res.status(403).json({ error: "Not allowed" });
      }
      sender = "band";
      recipient = "user";
    } else {
      return res.status(403).json({ error: "Only user/band can send messages" });
    }

    await conn.execute(
      `INSERT INTO messages (private_event_id, message, sender, recipient, date_time)
       VALUES (?, ?, ?, ?, NOW())`,
      [private_event_id, message.trim(), sender, recipient]
    );

    res.json({ message: "Message sent" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/genres", async (req, res) => {
  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(`
      SELECT DISTINCT music_genres
      FROM bands
      WHERE music_genres IS NOT NULL
    `);

   
    let genres = [];
    rows.forEach(r => {
      r.music_genres
        .split(",")
        .map(g => g.trim())
        .forEach(g => {
          if (!genres.includes(g)) genres.push(g);
        });
    });

    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/reviews/music/genre", async (req, res) => {
  console.log("app.js reviews/genre");
  const { genre } = req.query;

  if (!genre) {
    return res.status(400).json({ error: "Missing genre" });
  }

  try {
    const conn = await getConnection();

    const [rows] = await conn.execute(
      `
      SELECT 
        r.rating,
        r.review,
        r.band_name
      FROM reviews r
      JOIN bands b ON r.band_name = b.band_name
      WHERE r.status = 'published'
        AND b.music_genres LIKE ?
      `,
      [`%${genre}%`]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error filtering by genre" });
  }
});




app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

