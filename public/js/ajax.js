function createTableFromJSON(data) {
  var html = '<table><tr><th>Category</th><th>Value</th></tr>';
  for (const x in data) {
    var category = x;
    var value = data[x];
    html += '<tr><td>' + category + '</td><td>' + value + '</td></tr>';
  }
  html += '</table>';
  return html;
}

function getUser() {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      $('#ajaxContent').html(
        'correct login<br>' +
          createTableFromJSON(JSON.parse(xhr.responseText))
      );
    } else if (xhr.status !== 200) {
      $('#ajaxContent').html('user not exists or incorrect password');
    }
  };
  var data = $('#loginForm').serialize();
  xhr.open('GET', 'users/details?' + data);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send();
}

function initDB() {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      $('#ajaxContent').html('Successful Initialization');
    } else if (xhr.status !== 200) {
      $('#ajaxContent').html('Error Occured');
    }
  };

  xhr.open('GET', 'initDB');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send();
}

function insertDB() {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      $('#ajaxContent').html('Successful Insertion');
    } else if (xhr.status !== 200) {
      $('#ajaxContent').html('Error Occured');
    }
  };

  xhr.open('GET', 'insertRecords');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send();
}

function deleteDB() {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      $('#ajaxContent').html('Successful Deletion');
    } else if (xhr.status !== 200) {
      $('#ajaxContent').html('Error Occured');
    }
  };

  xhr.open('GET', 'dropdb');
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.send();
}

function showRegistrationForm() {
  $('#ajaxContent').load('registration.html', function () {
    // Όταν φορτωθεί το registration.html, δινουμε το dropdown
    if (typeof initRegistrationDropdown === 'function') {
      initRegistrationDropdown();
    }
  });
}


/*********** SIMPLE USER REGISTER ***********/

async function SimpleRegisterPOST(event) {
  event.preventDefault();
  console.log('simpleregisterPOST');

  const form = document.getElementById('simple');
  const fd = new FormData(form);
  let data = {};
  fd.forEach((v, k) => (data[k] = v));

  // default lat / lon
  if (!data.lat || String(data.lat).trim() === "") data.lat = 0;
  if (!data.lon || String(data.lon).trim() === "") data.lon = 0;

  try {
    const res = await fetch('/simple_register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      alert('Registration error: ' + JSON.stringify(result));
      return;
    }

  
    // κρύβω τη φόρμα
    document.getElementById('simple').style.display = 'none';

    // μήνυμα επιτυχίας
    document.getElementById('registerSuccess').style.display = 'block';

  } catch (err) {
    alert('Registration error: ' + err.toString());
  }
}


/*********** BAND REGISTER ***********/

async function BandRegisterPOST(event) {
  event.preventDefault();
  console.log("bandRegisterPOST");

  const form = document.getElementById("band");
  const fd = new FormData(form);
  let data = {};
  fd.forEach((v, k) => (data[k] = v));

  try {
    const res = await fetch("/band_register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      alert("Registration error: " + JSON.stringify(result));
      return;
    }

    // SUCCESS
    form.style.display = "none";

    const successDiv = document.createElement("div");
    successDiv.className = "alert alert-success mt-4";
    successDiv.innerHTML = `
      <h4>Επιτυχής εγγραφή</h4>
      <p>Η εγγραφή της μπάντας ολοκληρώθηκε με επιτυχία.<br>Μπορείτε να συνδεθείτε</p>
    `;

    form.parentNode.appendChild(successDiv);

  } catch (err) {
    alert("Registration error: " + err.toString());
  }
}


async function loginUser() {
  console.log("login user (ajax.js)");

  const username = $("#username").val().trim();
  const password = $("#password").val().trim();

  if (!username || !password) return;

  const res = await fetch("/loginUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",   // session cookie
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    $("#ajaxContent").html(`<h3>${data.error}</h3>`);
    return;
  }

  $("#ajaxContent").html(
    "Correct login<br>" + JSON.stringify(data.user, null, 2)
  );

  loadProfile();   
}


function loadProfile() {
  
  fetch("/myProfile", {
    credentials: "include"   
  })
    .then(r => r.json())
    .then(user => {
      if (user.error) {
        $("#ajaxContent").html("Please login first.");
        return;
      }
      const birth = user.birthdate  ? user.birthdate.substring(0, 10)  : "";
      let html = `
          <h2>My Profile</h2>

          Username: ${user.username} <br>
          Email: ${user.email} <br><br>

          <label>Firstname</label>
          <input id="fn" value="${user.firstname}"><br>

          <label>Lastname</label>
          <input id="ln" value="${user.lastname}"><br>

          <label>Birthdate</label>
          <input id="bd" type="date" value="${birth}"><br>

          <label>Gender</label>
          <input id="gd" value="${user.gender}"><br>

          <label>Country</label>
          <input id="co" value="${user.country}"><br>

          <label>City</label>
          <input id="ci" value="${user.city}"><br>

          <label>Address</label>
          <input id="ad" value="${user.address}"><br>

          <label>Telephone</label>
          <input id="tel" value="${user.telephone}"><br>

          <label>Lat</label>
          <input id="lat" value="${user.lat}"><br>

          <label>Lon</label>
          <input id="lon" value="${user.lon}"><br>

          <button onclick="saveProfile()">Save changes</button>
      `;

      $("#ajaxContent").html(html);
    })
}


