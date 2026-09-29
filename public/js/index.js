window.addEventListener('message', function (event) {
    if (!event.data || !event.data.type) return;
  
    if (event.data.type === 'registration_success') {
      const payload = event.data.payload; // όλο το JSON που ήρθε από τον server

      const safeJSON = escapeHTML(JSON.stringify(payload, null, 2));

    document.getElementById("ajaxContent").innerHTML = '<h3>Successful Registration!</h3>' + '<pre>' + safeJSON + '</pre>';
      



    }
  
    if (event.data.type === 'registration_error') {
      document.getElementById('ajaxContent').innerHTML =
        '<h3>Error during registration:</h3>' +
        '<pre>' +
        JSON.stringify(event.data.payload, null, 2) +
        '</pre>';
    }
  });
  
/****λογιν*****/
async function loginUser() {
  console.log("loggin user index.js");
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) return;

  const res = await fetch("/loginUser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  const output = document.getElementById("loginArea");

  if (!res.ok) {
      output.innerHTML = `<h3>${data.error}</h3>`;
      return;
  }

  output.innerHTML = `<h3 >${data.message}</h3><pre>${JSON.stringify(data.user, null, 2)}</pre>`;
}

/********λογοθτ*****/
async function logoutUser() {
  console.log("loggout user index.js");
  const res = await fetch("/logoutUser");
  const data = await res.json();

  document.getElementById("loginArea").innerHTML =
      `<h3'>${data.message}</h3>`;
}

/*********ανοιγμα του προφιλ*****////
async function openMyProfile() {
  const area = document.getElementById("profileArea");
  area.innerHTML = "";

  fetch("/sessionUser")
    .then(res => res.json())
    .then(data => {

      if (!data.loggedIn) {
        area.innerHTML = "<p>Πρέπει να κάνεις login πρώτα</p>";
        return;
      }
      //ADMIN
      if (data.user.type === "admin") {
        showAdminPanel();
        return;
      }
      // SIMPLE USER
      if (data.user.type === "user") {
        ShowProfile();
        return;   
      }

      // BAND USER
      if (data.user.type === "band") {
        showBandProfile();
        // loadBandReviews();
        return;   
      }
    });
}



function ShowProfile() {
  console.log("index.js ShowProfile");

  const output = document.getElementById("profileArea");
  output.innerHTML = "";

  fetch("/myProfile")
    .then(res => res.json())
    .then(user => {

      if (!user || user.error) {
        output.innerHTML = "<p>Σφάλμα φόρτωσης προφίλ</p>";
        return;
      }

      const birth = (user.birthdate)? user.birthdate.substring(0, 10): "";
      
      output.innerHTML = `
        <h2>My Profile</h2>
    
        <form id="profileForm" onsubmit="return false;">

          <label>Username</label>
          <input type="text" value="${user.username}" disabled>
          &nbsp;
          <label>Email</label>
          <input type="text" value="${user.email}" disabled>
          <br>

          <label>Firstname</label>
          <input id="firstname" type="text" value="${user.firstname || ""}">
          &nbsp;
          <label>Lastname</label>
          <input id="lastname" type="text" value="${user.lastname || ""}">
          <br>

          <label>Birthdate</label>
          <input id="birthdate" type="date" value="${birth}">
          &nbsp;
          <label>Gender</label>
          <input id="gender" type="text" value="${user.gender || ""}">
          <br>

          <label>Country</label>
          <input id="country" type="text" value="${user.country || ""}">
          &nbsp;
          <label>City</label>
          <input id="city" type="text" value="${user.city || ""}">
          <br>

          <label>Address</label>
          <input id="address" type="text" value="${user.address || ""}">
          &nbsp;
          <label>Telephone</label>
          <input id="telephone" type="text" value="${user.telephone || ""}">
          <br>

          <label>Latitude</label>
          <input id="lat" type="text" value="${user.lat || 0}">
          &nbsp;
          <label>Longitude</label>
          <input id="lon" type="text" value="${user.lon || 0}">
          <br><br>

          <button type="button" onclick="updateProfile()">Update Profile</button>
        </form>
      `;
    });
}
async function updateProfile() {
  console.log("updateprofile index.js");
  const data = {
    firstname: document.getElementById("firstname").value || null,
    lastname: document.getElementById("lastname").value || null,
    birthdate: document.getElementById("birthdate").value || null,
    gender: document.getElementById("gender").value || null,
    country: document.getElementById("country").value || null,
    city: document.getElementById("city").value || null,
    address: document.getElementById("address").value || null,
    telephone: document.getElementById("telephone").value || null,
    lat: document.getElementById("lat").value || null,
    lon: document.getElementById("lon").value || null
  };

  fetch("/updateMyProfile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(msg => alert(msg.message))
    .catch(err => console.error(err));
}



function updateBandProfile() {
  const data = {
    band_name: document.getElementById("band_name").value,
    music_genres: document.getElementById("genre").value,
    members_number: document.getElementById("members").value,
    band_city: document.getElementById("city").value,
    band_description: document.getElementById("description").value
  };

  fetch("/updateMyBandProfile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(msg => alert(msg.message));
}



function showBandProfile() {
  const area = document.getElementById("profileArea");
  area.innerHTML = "";

  fetch("/myBandProfile")
    .then(res => res.json())
    .then(band => {

      area.innerHTML = `
        <h2>Band Profile</h2>

        <form onsubmit="return false;">

          <label>Username</label>
          <input type="text" value="${band.username}" disabled><br>

          <label>Email</label>
          <input type="text" value="${band.email}" disabled><br>

          <label>Band Name</label>
          <input id="band_name" value="${band.band_name}"><br>

          <label>Genre</label>
          <input id="genre" value="${band.music_genres || ""}"><br>

          <label>Members</label>
          <input id="members" value="${band.members_number || ""}"><br>

          <label>City</label>
          <input id="city" value="${band.band_city || ""}"><br>

          <label>Description</label>
          <textarea id="description">${band.band_description || ""}</textarea><br><br>

          <button onclick="updateBandProfile()">Update Profile</button>
        </form>
      `;
    });
}






/***για ασφαλεια*****/
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, t => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[t]));
}

function submitReview() {
  const band = document.getElementById("reviewBand").value;
  const rating = document.getElementById("reviewRating").value;
  const text = document.getElementById("reviewText").value;

  fetch("/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      band_name: band,
      sender: "logged user",
      review: text,
      rating: rating
    })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("reviewMessage").innerHTML = data.message || data.error;
  });
}


function loadBandReviews() {
  console.log("loadBandReviews");

  fetch("/band/reviews")
    .then(res => res.json())
    .then(reviews => {
      const area = document.getElementById("bandReviewsArea");
      area.innerHTML = "<h3>My Band Reviews</h3>";

      if (reviews.length === 0) {
        area.innerHTML += "<p>No reviews yet.</p>";
        return;
      }

      reviews.forEach(r => {
        area.innerHTML += `
          <div style="border-bottom:1px solid #ccc; padding:10px;">
            <b>From:</b> ${r.sender}<br>
            <b>Rating:</b> ${r.rating}<br>
            <b>Review:</b> ${r.review}<br>
            <b>Status:</b> ${r.status}<br>
            ${
              r.status === "pending"
                ? `
                  <button onclick="updateReviewStatus(${r.review_id}, 'published')">
                    Publish
                  </button>
                  <button onclick="updateReviewStatus(${r.review_id}, 'rejected')">
                    Reject
                  </button>
                `
                : ""
            }
          </div>
        `;
      });
    })
    .catch(err => console.error(err));
}


function updateReviewStatus(reviewId, status) {
  fetch(`/reviewStatus/${reviewId}/${status}`, {
    method: "PUT"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadBandReviews(); // refresh
    })
    .catch(err => console.error(err));
}

function showAdminPanel() {
  const area = document.getElementById("profileArea");

  area.innerHTML = `
    <h2>Admin Panel</h2>
    <button onclick="loadAdminReviews()">Load Reviews</button>
    <button onclick="loadUsers()">Load Users</button>
    <button onclick="loadBands()">Load Bands</button>

    <div id="adminList" style="margin-top:20px;"></div>
  `;
}

function filterReviews() {
  console.log("index.js filterReviews");

  const from = document.getElementById("ratingFrom").value;
  const to = document.getElementById("ratingTo").value;

  let url = "/reviews";

  if (from && to) {
    url += `?from=${from}&to=${to}`;
  }

  fetch(url)
    .then(res => res.json())
    .then(reviews => {
      const div = document.getElementById("reviewsArea");
      div.innerHTML = "";

      if (!Array.isArray(reviews) || reviews.length === 0) {
        div.innerHTML = "<p>No reviews found</p>";
        return;
      }

      reviews.forEach(r => {
        div.innerHTML += `
          <p><b>Band:</b> ${r.band_name}</p>
          <p><b>Rating:</b> ${r.rating}</p>
          <p><b>Review:</b> ${r.review}</p>
          <hr>
        `;
      });
    })
    .catch(() => {
      document.getElementById("reviewsArea").innerHTML =
        "<p>Error loading reviews</p>";
    });
}


function loadAdminReviews() {
  fetch("/admin/reviews")
    .then(res => res.json())
    .then(reviews => {
      const area = document.getElementById("adminList");
      area.innerHTML = "<h3>All Reviews</h3>";

      if (reviews.length === 0) {
        area.innerHTML += "<p>No reviews found.</p>";
        return;
      }

      reviews.forEach(r => {
        area.innerHTML += `
          <div style="border-bottom:1px solid #ccc; padding:10px;">
            <b>Band:</b> ${r.band_name}<br>
            <b>From:</b> ${r.sender}<br>
            <b>Rating:</b> ${r.rating}<br>
            <b>Review:</b> ${r.review}<br>
            <b>Status:</b> ${r.status}<br><br>

            <button onclick="updateReviewStatus(${r.review_id}, 'published')">
              Publish
            </button>
            <button onclick="updateReviewStatus(${r.review_id}, 'rejected')">
              Reject
            </button>
            <button onclick="deleteReview(${r.review_id})">
              Delete
            </button>
          </div>
        `;
      });
    })
    .catch(err => console.error(err));
}


function deleteReview(reviewId) {
  if (!confirm("Delete this review?")) return;

  fetch(`/reviewDeletion/${reviewId}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadAdminReviews();
    })
    .catch(err => console.error(err));
}

function loadUsers() {
  fetch("/admin/users")
    .then(res => res.json())
    .then(users => {
      const area = document.getElementById("adminList");
      area.innerHTML = "<h3>Users</h3>";

      if (users.length === 0) {
        area.innerHTML += "<p>No users found</p>";
        return;
      }

      users.forEach(u => {
        area.innerHTML += `
          <div style="border-bottom:1px solid #ccc; padding:8px;">
            <b>${u.username}</b> (${u.email})
            <button onclick="deleteUser(${u.user_id})">Delete</button>
          </div>
        `;
      });
    });
}


function loadBands() {
  fetch("/admin/bands")
    .then(res => res.json())
    .then(bands => {
      const area = document.getElementById("adminList");
      area.innerHTML = "<h3>Bands</h3>";

      if (bands.length === 0) {
        area.innerHTML += "<p>No bands found</p>";
        return;
      }

      bands.forEach(b => {
        area.innerHTML += `
          <div style="border-bottom:1px solid #ccc; padding:8px;">
            <b>${b.band_name}</b> (${b.username})
            <button onclick="deleteBand(${b.band_id})">Delete</button>
          </div>
        `;
      });
    });
}


function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  fetch(`/admin/user/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      loadUsers();
    });
}

function deleteBand(id) {
  if (!confirm("Delete this band?")) return;

  fetch(`/admin/band/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      loadBands();
    });
}

/******EVENTS*********************************************/
function openPublicEvents() {
  showSection("public_events");

  const area = document.getElementById("eventsArea");
  area.innerHTML = "";

  // πρώτα ελέγχουμε αν είναι band
  fetch("/sessionUser")
    .then(res => res.json())
    .then(data => {

      if (data.loggedIn && data.user.type === "band") {
        area.innerHTML += `
          <h3>Create Public Event</h3>

          <label>Event type</label><br>
          <input id="event_type"><br><br>

          <label>Date & time</label><br>
          <input id="event_datetime" type="datetime-local"><br><br>

          <label>City</label><br>
          <input id="event_city"><br><br>

          <label>Address</label><br>
          <input id="event_address"><br><br>

          <label>Price</label><br>
          <input id="participants_price" type="number"><br><br>

          <label>Description</label><br>
          <textarea id="event_description"></textarea><br><br>

          <button onclick="createPublicEvent()">Create Event</button>
          <hr>
        `;
      }

      loadPublicEvents();
    });
}

function createPublicEvent() {
  const data = {
    event_type: document.getElementById("event_type").value,
    event_datetime: document.getElementById("event_datetime").value,
    event_city: document.getElementById("event_city").value,
    event_address: document.getElementById("event_address").value,
    participants_price: document.getElementById("participants_price").value,
    event_description: document.getElementById("event_description").value
  };

  fetch("/publicEvents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      openPublicEvents();   // ξαναφορτώνει λίστα
    })
    .catch(err => console.log(err));
}


function loadPublicEvents() {
  fetch("/sessionUser")
    .then(res => res.json())
    .then(session => {

      fetch("/publicEvents")
        .then(res => res.json())
        .then(events => {
          const area = document.getElementById("eventsArea");

          if (events.length === 0) {
            area.innerHTML += "<p>No public events found</p>";
            return;
          }

          events.forEach(ev => {
            area.innerHTML += `
              <p><b>Band:</b> ${ev.band_name}</p>
              <p><b>Type:</b> ${ev.event_type}</p>
              <p><b>Date:</b> ${
  new Date(ev.event_datetime).toLocaleString("el-GR")
}</p>
              <p><b>City:</b> ${ev.event_city}</p>
              <p><b>Address:</b> ${ev.event_address}</p>
              <p><b>Price:</b> ${ev.participants_price} €</p>
              <p>${ev.event_description}</p>
            `;

            // ΜΟΝΟ αν είναι δικό της event
            if (
              session.loggedIn &&
              session.user.type === "band" &&
              session.user.id === ev.band_id
            ) {
              area.innerHTML += `
                <button onclick="deletePublicEvent(${ev.public_event_id})">
                  Delete
                </button>
              `;
            }

            area.innerHTML += "<hr>";
          });
        });
    });
}

///*********delete diko mopu public event***********///

function deletePublicEvent(id) {
  if (!confirm("Delete this event?")) return;

  fetch("/publicEvents/" + id, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message);
      openPublicEvents(); // ξαναφορτώνει τη λίστα
    })
    .catch(err => console.log(err));
}


////*******PRIVATE EVENTS METAKSI USER KAI MPANTAS******/////
function openPrivateEvents() {
  showSection("private_events");

  const area = document.getElementById("privateEventsArea");
  area.innerHTML = "";

  fetch("/sessionUser")
    .then(res => res.json())
    .then(data => {

      // visitor
      if (!data.loggedIn) {
        alert("You must be logged in");
        return;
      }

      //  simple user
      if (data.user.type === "user") {
        showUserPrivateEventsUI(area);
      }

      //  band
      if (data.user.type === "band") {
        showBandPrivateEventsUI(area);
      }
    });
}

/***uyser***/
function showUserPrivateEventsUI(area) {
  area.innerHTML = `
    <h3>Request Private Event</h3>

    <label>Band</label><br>
    <select id="pe_band_id">
      <option value="">-- select band --</option>
    </select><br><br>

   <label>Event type</label><br>
<select id="pe_event_type" required>
  <option value="">-- select --</option>
  <option value="Wedding">Wedding</option>
  <option value="Party">Party</option>
  <option value="Baptism">Baptism</option>
  <option value="Other">Other</option>
</select><br><br>

    <label>Date & time</label><br>
    <input id="pe_datetime" type="datetime-local"><br><br>

    <label>City</label><br>
    <input id="pe_city"><br><br>

    <label>Address</label><br>
    <input id="pe_address"><br><br>

    <label>Price </label><br>
    <input id="pe_price" type="number" step="0.01"><br><br>

    <label>Description</label><br>
    <textarea id="pe_description"></textarea><br><br>

    <button onclick="createPrivateEvent()">Send Request</button>

    <hr>
    <h3>My Private Events</h3>
    <div id="myPrivateEvents"></div>
  `;

  loadBandsDropdown();     // γεμίζει το dropdown
  loadUserPrivateEvents(); // φορτώνει τα δικά του requests
}
function createPrivateEvent() {
  const band_id = document.getElementById("pe_band_id").value;
  const event_type = document.getElementById("pe_event_type").value;
  const price = document.getElementById("pe_price").value;
  const event_datetime = document.getElementById("pe_datetime").value;
  const event_city = document.getElementById("pe_city").value;
  const event_address = document.getElementById("pe_address").value;
  const event_description = document.getElementById("pe_description").value;

  // ΥΠΟΧΡΕΩΤΙΚΑ ΠΕΔΙΑ
  if (!band_id || !event_type || !price || !event_datetime || !event_city || !event_address || !event_description) {
    alert("Fill ALL fields (price & event type required)");
    return;
  }

  fetch("/privateEvents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      band_id,
      event_type,
      price,
      event_datetime,
      event_city,
      event_address,
      event_description
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      loadUserPrivateEvents();
    });
}


function loadBandsForPrivateEvent() {
  fetch("/bandsList")
    .then(res => res.json())
    .then(bands => {
      const sel = document.getElementById("pe_band_id");
      sel.innerHTML = "";

      bands.forEach(b => {
        sel.innerHTML += `
          <option value="${b.band_id}">
            ${b.band_name}
          </option>
        `;
      });
    });
}


///****band****////
function showBandPrivateEventsUI(area) {
  area.innerHTML = `
    <h3>Private Event Requests</h3>
    <div id="bandPrivateEvents"></div>
  `;

  loadBandPrivateEvents();
}


function loadBandPrivateEvents() {
  fetch("/privateEvents/band")
    .then(res => res.json())
    .then(events => {
      const div = document.getElementById("bandPrivateEvents");
      div.innerHTML = "";

      if (events.length === 0) {
        div.innerHTML = "<p>No private events</p>";
        return;
      }

      events.forEach(ev => {

        let controls = "";
      
        if (ev.status === "requested") {
          controls = `
            <textarea id="decision_${ev.private_event_id}"
              placeholder="Write a message to the user..."
              style="width:300px; height:60px;"></textarea><br><br>
      
            <button onclick="decidePrivateEvent(${ev.private_event_id}, 'accept')">
              Accept
            </button>
            <button onclick="decidePrivateEvent(${ev.private_event_id}, 'reject')">
              Reject
            </button>
           <textarea id="msg_${ev.private_event_id}"></textarea>
<button onclick="sendMessage(${ev.private_event_id}, 'msg_${ev.private_event_id}')">
  Send Message
</button>


          `;
        }
      
        if (ev.status === "to be done") {
          controls = `
            <button onclick="markPrivateEventDone(${ev.private_event_id})">
              Done
            </button>
          `;
        }
      
        div.innerHTML += `
          <p><b>User:</b> ${ev.username}</p>
          <p><b>Event type:</b> ${ev.event_type}</p>
          <p><b>Price:</b> ${ev.price} €</p>
          <p><b>Date:</b> ${new Date(ev.event_datetime).toLocaleString("el-GR")}</p>
          <p><b>City:</b> ${ev.event_city}</p>
          <p><b>Description:</b> ${ev.event_description}</p>
          <p><b>Status:</b> ${ev.status}</p>
      
          ${controls}
      
          <hr>
        `;
      });
      
      
    });
}

function markPrivateEventDone(id) {
  fetch("/privateEvents/done", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      private_event_id: id
    })
  })
    .then(res => res.json())
    .then(msg => {
      alert(msg.message || msg.error);
      loadBandPrivateEvents(); // refresh
    })
    .catch(err => console.log(err));
}


function decidePrivateEvent(id, decision) {
  const text = document.getElementById(`decision_${id}`).value;

  fetch("/privateEvents/decide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      private_event_id: id,
      decision: decision,
      band_decision: text
    })
  })
  .then(res => res.json())
  .then(() => loadBandPrivateEvents());
}


function loadUserPrivateEvents() {
  fetch("/privateEvents/user")
    .then(res => res.json())
    .then(events => {
      const div = document.getElementById("myPrivateEvents");
      div.innerHTML = "";

      if (events.length === 0) {
        div.innerHTML = "<p>No private events</p>";
        return;
      }

      events.forEach(ev => {
        div.innerHTML += `
          <p><b>Band:</b> ${ev.band_name}</p>
          <p><b>Date:</b> ${
            new Date(ev.event_datetime).toLocaleString("el-GR")
          }</p>
          <p><b>Status:</b> ${ev.status}</p>

          <textarea id="msg_${ev.private_event_id}"></textarea>
<button onclick="sendMessage(${ev.private_event_id}, 'msg_${ev.private_event_id}')">
  Send Message
</button>
        `;
      });
    });
}





function loadBandsDropdown() {
  fetch("/bandsList")
    .then(res => res.json())
    .then(bands => {
      const sel = document.getElementById("pe_band_id");
      if (!sel) return;

      sel.innerHTML = `<option value="">-- select band --</option>`;

      bands.forEach(b => {
        sel.innerHTML += `<option value="${b.band_id}">${b.band_name}</option>`;
      });
    })
    .catch(err => console.log(err));
}

/*****MESSAGES*****///
function openMessages() {
  showSection("messages");

  const area = document.getElementById("messagesArea");
  area.innerHTML = "";

  fetch("/sessionUser")
    .then(res => res.json())
    .then(data => {
      if (!data.loggedIn) {
        alert("You must be logged in to view messages");
        return;
      }

      if (data.user.type === "user") {
        showUserMessagesUI(area);
      } else if (data.user.type === "band") {
        showBandMessagesUI(area);
      } else {
        area.innerHTML = "<p>No messages for this account</p>";
      }
    });
}

function showUserMessagesUI(area) {
  area.innerHTML = `
    <h3>My Messages</h3>
    <div id="messagesList"></div>
  `;
  loadMessages();
}

function showBandMessagesUI(area) {
  area.innerHTML = `
    <h3>Messages from Users</h3>
    <div id="messagesList"></div>
  `;
  loadMessages();
}

function loadMessages() {
  fetch("/sessionUser")
    .then(res => res.json())
    .then(session => {
      if (!session.loggedIn) return [];

      const url =
        session.user.type === "user"
          ? "/messages/user"
          : "/messages/band";

      return fetch(url).then(res => res.json());
    })
    .then(msgs => {
      const div = document.getElementById("messagesList");
      if (!div) return;

      div.innerHTML = "";

      if (!Array.isArray(msgs) || msgs.length === 0) {
        div.innerHTML = "<p>No messages</p>";
        return;
      }

      msgs.forEach(msg => {
        const isDone = msg.event_status === "done";
        const textareaId = `reply_${msg.message_id}`;
      
        div.innerHTML += `
          <p><b>From:</b> ${msg.sender_name}</p>
          <p><b>To:</b> ${msg.recipient_name}</p>

          <p><b>For private event:</b> ${msg.private_event_id}</p>
      
          <p>${msg.message}</p>
      
          <small>${new Date(msg.date_time).toLocaleString("el-GR")}</small>
          <br><br>
      
          ${
            isDone
              ? `<p><i>Event completed – reply disabled</i></p>`
              : `
                <textarea id="${textareaId}" placeholder="Write reply"></textarea><br>
                <button onclick="sendReply(${msg.private_event_id}, '${textareaId}')">
                  Reply
                </button>
              `
          }
      
          <hr>
        `;
      });
    })
    .catch(err => {
      console.log(err);
      const div = document.getElementById("messagesList");
      if (div) div.innerHTML = "<p>Error loading messages</p>";
    });
}



function sendMessage(private_event_id, textareaId) {
  const text = document.getElementById(textareaId).value.trim();

  if (!text) {
    alert("Write a message");
    return;
  }

  fetch("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      private_event_id: private_event_id,
      message: text
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || data.error);
      document.getElementById(textareaId).value = "";
    })
    .catch(err => console.log(err));
}


function sendReply(private_event_id, textareaId) {
  const text = document.getElementById(textareaId).value.trim();

  if (!text) {
    alert("Write a message");
    return;
  }

  fetch("/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      private_event_id: private_event_id,
      message: text
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || data.error);
      document.getElementById(textareaId).value = "";
      loadMessages(); // refresh
    })
    .catch(err => console.log(err));
}
 ////filter music genre////
 function filterGenre() {
  console.log("index.js filterGenre ");

  const sel = document.getElementById("musicGenre");
  if (!sel) {
    alert("musicGenre dropdown not found");
    return;
  }

  const genre = sel.value;

  if (!genre) {
    alert("Select a music genre");
    return;
  }

  fetch("/reviews/music/genre?genre=" + encodeURIComponent(genre))
    .then(res => res.json())
    .then(reviews => {
      const div = document.getElementById("reviewsArea");
      div.innerHTML = "";

      if (!Array.isArray(reviews) || reviews.length === 0) {
        div.innerHTML = "<p>No reviews found</p>";
        return;
      }

      reviews.forEach(r => {
        div.innerHTML += `
          <p><b>Band:</b> ${r.band_name}</p>
          <p><b>Rating:</b> ${r.rating}</p>
          <p><b>Review:</b> ${r.review}</p>
          <hr>
        `;
      });
    })
    .catch(err => console.log(err));
}



function loadGenres() {
  fetch("/genres")
    .then(res => res.json())
    .then(genres => {
      const sel = document.getElementById("musicGenre");
      if (!sel) return;

      sel.innerHTML = `<option value="">-- select genre --</option>`;

      genres.forEach(g => {
        sel.innerHTML += `<option value="${g}">${g}</option>`;
      });
    })
    .catch(err => console.log(err));
}
