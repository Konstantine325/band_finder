// καλείται από showRegistrationForm() στο ajax για να ανοιγει ταβ με την επιλογη
function initRegistrationDropdown() {
    const select = document.getElementById('userType');
    if (!select) return;
  
    select.addEventListener('change', function () {
      const url = this.value;
      if (!url) return;
  
      // άνοιγμα νέου tab με τη φόρμα
      window.open(url, '_blank');
  
      // reset επιλογή
      this.selectedIndex = 0;
    });
  }
  