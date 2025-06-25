document.addEventListener('DOMContentLoaded', async function() {
    var map = L.map('map').setView([45, 15], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    try {
        const response = await fetch('/api/memories');
        const memories = await response.json();

        memories.forEach(memory => {
            const popupContent = `<b>Message:</b> ${memory.message}<br><br><a href="https://bscscan.com/tx/${memory.txHash}" target="_blank">View Transaction</a>`;
            L.marker([memory.lat, memory.lon]).addTo(map).bindPopup(popupContent);
        });
    } catch (error) {
        console.error("Could not load memories:", error);
    }
});
