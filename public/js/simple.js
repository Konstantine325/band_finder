// ************ SHOW / HIDE PASSWORD (ΜΑΤΑΚΙ) ************
const pass = document.querySelector("#password");
const confirmPass = document.querySelector("#confirm_password");
const toggleIcon = document.querySelector("#toggle-pass");
const toggleIcon2 = document.querySelector("#toggle-pass2");

// πρώτο μάτι (password)
if (toggleIcon && pass) {
  toggleIcon.addEventListener("click", function () {
    const isPassword = pass.type === "password";
    pass.type = isPassword ? "text" : "password";
    toggleIcon.classList.toggle("fa-eye");
    toggleIcon.classList.toggle("fa-eye-slash");
  });
}

// δεύτερο μάτι (confirm password)
if (toggleIcon2 && confirmPass) {
  toggleIcon2.addEventListener("click", function () {
    const isConfirm = confirmPass.type === "password";
    confirmPass.type = isConfirm ? "text" : "password";
    toggleIcon2.classList.toggle("fa-eye");
    toggleIcon2.classList.toggle("fa-eye-slash");
  });
}

// ************ PASSWORD MATCH ************
const passwordInput = $("#password");
const confirmPasswordInput = $("#confirm_password");
const messageDiv = $("#confirm-pass-message");

confirmPasswordInput.on("input", function () {
  const passVal = passwordInput.val();
  const confirmVal = confirmPasswordInput.val();

  if (confirmVal.length === 0) {
    messageDiv.text("");
    return;
  }

  if (passVal !== confirmVal) {
    messageDiv.text("Password mismatch");
  } else {
    messageDiv.text("Password matched");
  }
});

// ************ PASSWORD STRENGTH ************
function Strength() {
  const forbidden = ["band", "music", "mpanta", "mousiki"];

  const passInput = document.getElementById("password");
  const pass = passInput.value;
  const strengthDiv = document.getElementById("pass-message");

  if (pass.length === 0) {
    strengthDiv.textContent = "Please enter a password";
    strengthDiv.style.color = "gray";
    passInput.dataset.weak = "true";
    return;
  }

  // απαγορευμένες λέξεις
  for (let leksi of forbidden) {
    const regex = new RegExp(leksi, "i");
    if (regex.test(pass)) {
      strengthDiv.textContent = "That is a forbidden word!";
      strengthDiv.style.color = "red";
      passInput.dataset.weak = "true";
      return;
    }
  }

  // πολλά νούμερα
  const numCount = (pass.match(/\d/g) || []).length;
  if (numCount / pass.length >= 0.4) {
    strengthDiv.textContent = "Weak password. Too many numbers";
    strengthDiv.style.color = "red";
    passInput.dataset.weak = "true";
    return;
  }

  // επαναλαμβανόμενοι χαρακτήρες
  const charCount = {};
  for (let c of pass) {
    charCount[c] = (charCount[c] || 0) + 1;
    if (charCount[c] / pass.length >= 0.5 && pass.length > 4) {
      strengthDiv.textContent = "Weak password. Too many repeated characters";
      strengthDiv.style.color = "red";
      passInput.dataset.weak = "true";
      return;
    }
  }

  // έλεγχος για strong
  const hasUpper = /[A-Z]/.test(pass);
  const hasLower = /[a-z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

  if (hasUpper && hasLower && hasNumber && hasSymbol) {
    strengthDiv.textContent = "Strong Password";
    strengthDiv.style.color = "green";
    passInput.dataset.weak = "false";
    return;
  }

  // medium
  strengthDiv.textContent = "Medium Password";
  strengthDiv.style.color = "orange";
  passInput.dataset.weak = "false";
}

// μπλοκάρουμε submit αν είναι weak (dataset.weak === "true")
document.getElementById("simple").addEventListener("submit", function (e) {
  const passInput = document.getElementById("password");
  if (passInput.dataset.weak === "true") {
    e.preventDefault();
    alert("Cannot submit: weak password!");
  }
});

// ************ ΕΚΤΥΠΩΣΗ JSON SIMPLE (για debug) ************
function printForm(event) {
  event.preventDefault();

  const form = document.getElementById("simple");
  const finalDiv = document.getElementById("finalMessage");
  const formData = {};

  const elements = form.elements;
  for (let e of elements) {
    if (!e.name) continue;
    if (e.type === "radio") {
      if (e.checked) {
        formData[e.name] = e.value;
      }
    } else {
      formData[e.name] = e.value;
    }
  }

  finalDiv.innerHTML =
    "<h3>Form JSON Output:</h3><br>" +
    "<pre>" +
    JSON.stringify(formData, null, 2) +
    "</pre><br><br>";
}

// ************ GEOCODING + ΧΑΡΤΗΣ ************

// global για να το βλέπουν verifyAddress & handler
var fullAddress;
var map; // global χάρτης

function geocodeRequest(address) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          try {
            const obj = JSON.parse(xhr.responseText);
            resolve(obj);
          } catch (err) {
            reject("Σφάλμα στο JSON parsing: " + err);
          }
        } else {
          reject("Αποτυχία αιτήματος: HTTP " + xhr.status);
        }
      }
    };

    xhr.onerror = function () {
      reject("Σφάλμα δικτύου ή CORS");
    };

    const url =
      "https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=" +
      encodeURIComponent(address) +
      "&accept-language=en&polygon_threshold=0.0";

    xhr.open("GET", url);
    xhr.setRequestHeader(
      "x-rapidapi-host",
      "forward-reverse-geocoding.p.rapidapi.com"
    );
    xhr.setRequestHeader(
      "x-rapidapi-key",
      "c2b2520e99msh45eb378b73220a3p1f7121jsn75725b5d630f"
    );
    xhr.send();
  });
}

async function verifyAddress() {
  const country = document.getElementById("country").value.trim();
  const city = document.getElementById("city").value.trim();
  const address = document.getElementById("address").value.trim();

  const messageDiv = document.getElementById("addressMessage");
  const mapDiv = document.getElementById("map");

  mapDiv.innerHTML = "";
  messageDiv.textContent = "Έλεγχος διεύθυνσης...";

  fullAddress = `${address}, ${city}, ${country}`;

  try {
    const data = await geocodeRequest(fullAddress);
    console.log("Αποτέλεσμα από API:", data);

    if (!data || data.length === 0) {
      messageDiv.textContent = "Δεν βρέθηκε η τοποθεσία.";
      return;
    }

    const location = data[0];
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    console.log("lat", lat);
    console.log("lon", lon);

    // γράφουμε στα hidden inputs για να τα στείλει το SimpleRegisterPOST
    const latInput = document.getElementById("lat");
    const lonInput = document.getElementById("lon");
    if (latInput) latInput.value = lat;
    if (lonInput) lonInput.value = lon;

    // έλεγχος για Ελλάδα
    if (
      !location.display_name.toLowerCase().includes("ελλάδα") &&
      !location.display_name.toLowerCase().includes("greece")
    ) {
      messageDiv.textContent =
        "Η υπηρεσία λειτουργεί μόνο για τοποθεσίες στην Ελλάδα.";
      return;
    }

    messageDiv.innerHTML =
      `Η τοποθεσία βρέθηκε: <b>${location.display_name}</b><br>` +
      `<button type="button" onclick="showMap(${lat}, ${lon})" id="showMapBtn">Άνοιγμα χάρτη</button>`;
  } catch (e) {
    console.error(e);
    messageDiv.textContent = "Σφάλμα κατά τον έλεγχο της διεύθυνσης.";
  }
}

function showMap(lat, lon) {
  const mapContainer = document.getElementById("map");
  mapContainer.innerHTML = "";
  mapContainer.style.height = "600px";
  mapContainer.style.width = "700px";
  mapContainer.style.marginTop = "10px";

  map = new OpenLayers.Map("map");
  var mapnik = new OpenLayers.Layer.OSM();
  map.addLayer(mapnik);

  var markers = new OpenLayers.Layer.Markers("Markers");
  map.addLayer(markers);

  var position = setPosition(lat, lon);

  map.setCenter(position, 10);

  var mar = new OpenLayers.Marker(position);
  markers.addMarker(mar);

  mar.events.register("mousedown", mar, function (evt) {
    handler(position, fullAddress);
    OpenLayers.Event.stop(evt);
  });
}

function setPosition(lat, lon) {
  var fromProjection = new OpenLayers.Projection("EPSG:4326");
  var toProjection = new OpenLayers.Projection("EPSG:900913");
  var position = new OpenLayers.LonLat(lon, lat).transform(
    fromProjection,
    toProjection
  );
  return position;
}

function handler(position, message) {
  var popup = new OpenLayers.Popup.FramedCloud(
    "Popup",
    position,
    null,
    message,
    null,
    true
  );
  map.addPopup(popup);

  var div = document.getElementById("divID");
  if (div) div.innerHTML += "Ενεργοποιήθηκε ο handler<br>";
}
