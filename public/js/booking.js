document.addEventListener("DOMContentLoaded", () => {

  const checkInInput = document.getElementById("checkIn");
  const checkOutInput = document.getElementById("checkOut");
  const totalPriceEl = document.getElementById("totalPrice");
  const pricePerNightEl = document.getElementById("pricePerNight");

  // safety check (page pe form nahi ho to error na aaye)
  if (!checkInInput || !checkOutInput) return;

  const pricePerNight = Number(pricePerNightEl.value);

  function calculateTotal() {
    if (!checkInInput.value || !checkOutInput.value) {
      totalPriceEl.innerText = "0";
      return;
    }

    const checkInDate = new Date(checkInInput.value);
    const checkOutDate = new Date(checkOutInput.value);

    const diffTime = checkOutDate - checkInDate;
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // invalid case
    if (days <= 0) {
      totalPriceEl.innerText = "0";
      return;
    }

    const total = days * pricePerNight;

    totalPriceEl.innerText = total.toLocaleString("en-IN");
  }

  // event listeners
  checkInInput.addEventListener("change", calculateTotal);
  checkOutInput.addEventListener("change", calculateTotal);

});