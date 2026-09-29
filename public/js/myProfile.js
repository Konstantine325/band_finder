//******εμφανιση στοιχειων του προφιλ******/
function loadProfile() {
    fetch("/myProfile")
        .then(r => r.json())
        .then(user => {
            const birth = user.birthdate  ? user.birthdate.substring(0, 10)  : "";
            document.getElementById("username").value = user.username;
            document.getElementById("email").value = user.email;

            document.getElementById("firstname").value = user.firstname;
            document.getElementById("lastname").value = user.lastname;
            document.getElementById("birthdate").value = birth;
            document.getElementById("gender").value = user.gender;
            document.getElementById("country").value = user.country;
            document.getElementById("city").value = user.city;
            document.getElementById("address").value = user.address;
            document.getElementById("telephone").value = user.telephone;

            document.getElementById("lat").value = user.lat;
            document.getElementById("lon").value = user.lon;
        });
}

/*****αποθηκευση προφιλ******/
document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {firstname: firstname.value,lastname: lastname.value,birthdate: birthdate.value,gender: gender.value,
        country: country.value,city: city.value,address: address.value,telephone: telephone.value,lat: lat.value,
        lon: lon.value
    };

    const res = await fetch("/updateMyProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    const msg = document.getElementById("msg");

    if (res.ok) {
        msg.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
    } else {
        msg.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
    }
});

/****logout***/
function logoutUser() {
    fetch("/logoutUser")
        .then(() => window.location.href = "login.html");
}
