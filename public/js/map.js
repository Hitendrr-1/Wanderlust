document.addEventListener("DOMContentLoaded", () => {

  const mapDiv = document.getElementById("map");

  // safety check
  if (!mapDiv) return;

  const lat = parseFloat(mapDiv.dataset.lat);
  const lng = parseFloat(mapDiv.dataset.lng);

  const map = L.map('map').setView([lat, lng], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
  }).addTo(map);

  const title = mapDiv.dataset.title;
const price = mapDiv.dataset.price;

  // MARKER ADD
  L.marker([lat, lng])
    .addTo(map)
   .bindPopup(`
  <h6>${title}</h6>
  <p>Price: ₹${price.toLocaleString("en-IN")}</p>`)
    .openPopup();
    setTimeout(() => {
    map.invalidateSize();
  }, 100);

});