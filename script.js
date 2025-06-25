document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([45, 15], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    const memories = [
        { lat: 38.4192, lon: 27.1287, message: "Nomad Protocol v1.0 is complete. The journey begins.", txHash: "0x98a9d18e583e74bcf6b2b52479e9334460f38d39371e7123955a024227f4d547" }
    ];
    memories.forEach(memory => {
        const popupContent = `<b>Message:</b> ${memory.message}<br><br><a href="https://bscscan.com/tx/${memory.txHash}" target="_blank">View Transaction</a>`;
        L.marker([memory.lat, memory.lon]).addTo(map).bindPopup(popupContent);
    });
});