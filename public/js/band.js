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
document.getElementById("band").addEventListener("submit", function (e) {
  const passInput = document.getElementById("password");
  if (passInput.dataset.weak === "true") {
    e.preventDefault();
    alert("Cannot submit: weak password!");
  }
});

// ************ ΕΚΤΥΠΩΣΗ JSON SIMPLE (για debug) ************
function printForm(event) {
  event.preventDefault();

  const form = document.getElementById("band");
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

/******band register*****/
async function BandRegisterPOST(event) {
    event.preventDefault();

    const form = document.getElementById("band");
    const fd = new FormData(form);

    const data = Object.fromEntries(fd.entries());

  

    try {
        const res = await fetch("/band_register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            alert(result.error);
            return;
        }

        alert("Η εγγραφή του συγκροτήματος ολοκληρώθηκε!");

        // πισω στο index.html
        window.opener.postMessage(
            { type: "band_registration_success", payload: result.band },
            "*"
        );

        //close tab
        window.close();

    } catch (err) {
        console.error(err);
    }
}

/*****global συναρτησεις******/
window.Strength = Strength;
// window.verifyAddress = verifyAddress;
window.printForm = printForm;
window.BandRegisterPOST = BandRegisterPOST;
