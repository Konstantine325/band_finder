// CHECK USERNAME αναλογα τον τυπο band/simple κανω fetch check email η check username απ το app.js
document.getElementById('username').addEventListener('input', async (e) => {
    const value = e.target.value.trim();
    if (value.length < 3) return;
  
    const typeInput = document.getElementById('type'); // hidden πεδίο "user" ή "band"
    const type = typeInput ? typeInput.value : 'user';
  
    try {
      const res = await fetch(
        `/check/username?value=${encodeURIComponent(value)}&type=${type}`
      );
  
      const msgBox = document.getElementById('username-msg');
  
      if (res.status === 403) {
        const data = await res.json();
        msgBox.textContent = data.error;
      } else {
        msgBox.textContent = 'Διαθέσιμο';
      }
    } catch (err) {
      console.error(err);
    }
  });
  
  // CHECK EMAIL ακριβως ιδια λογικη με πανω
  document.getElementById('email').addEventListener('input', async (e) => {
    const value = e.target.value.trim();
    if (!value.includes('@')) return;
  
    const typeInput = document.getElementById('type');
    const type = typeInput ? typeInput.value : 'user';
  
    try {
      const res = await fetch(
        `/check/email?value=${encodeURIComponent(value)}&type=${type}`
      );
  
      const msgBox = document.getElementById('email-msg');
  
      if (res.status === 403) {
        const data = await res.json();
        msgBox.textContent = data.error;
      } else {
        msgBox.textContent = 'Διαθέσιμο';
      }
    } catch (err) {
      console.error(err);
    }
  });
  