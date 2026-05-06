document.addEventListener("DOMContentLoaded", () => {

  //  TAX TOGGLE LOGIC
  const taxSwitch = document.getElementById("switchCheckDefault");
  const taxInfos = document.querySelectorAll(".tax-info");
  const prices = document.querySelectorAll(".price");

  if (taxSwitch) {
    taxSwitch.addEventListener("change", () => {

      prices.forEach(priceEl => {
        let basePrice = Number(priceEl.getAttribute("data-price"));

        if (taxSwitch.checked) {
          // +18% GST
          let total = basePrice * 1.18;
          priceEl.innerText = `₹ ${Math.round(total).toLocaleString("en-IN")}`;
        } else {
          // original price
          priceEl.innerText = `₹ ${basePrice.toLocaleString("en-IN")}`;
        }
      });

      // show/hide GST text
      taxInfos.forEach(el => {
        el.style.display = taxSwitch.checked ? "inline" : "none";
      });

    });
  }

  // WISHLIST LOGIC 
  const wishlistButtons = document.querySelectorAll(".wishlist-btn[data-id]");

  wishlistButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const id = btn.getAttribute("data-id");

      try {
        const res = await fetch(`/listings/${id}/wishlist`, {
          method: "POST",
          credentials: "same-origin"
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        const icon = btn.querySelector("i");

        if (data.status === "removed") {
          icon.classList.remove("fa-solid", "text-danger");
          icon.classList.add("fa-regular");
        } else {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid", "text-danger");
        }

      } catch (err) {
        console.log(err);
      }
    });
  });

});