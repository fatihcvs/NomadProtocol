document.addEventListener('DOMContentLoaded', function() {
    // Haritanın yüklendiğinden emin olmak için bir kontrol
    if (typeof L === 'undefined') {
        console.error("Leaflet library not loaded.");
        return;
    }

    var map = L.map('map').setView([45, 15], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    // Anıları manuel olarak ekliyoruz
    const memories = [
        {
            lat: 38.4192,
            lon: 27.1287,
            message: "Nomad Protocol v1.0 is complete. The journey begins.",
            txHash: "0x98a9d18e583e74bcf6b2b52479e9334460f38d39371e7123955a024227f4d547"
        },
        {
            lat: 37.00,
            lon: 35.32,
            message: "Greetings from the warm city of Adana.",
            txHash: "0x... (Adana işleminin hash'i buraya gelecek)"
        }
    ];

    memories.forEach(memory => {
        if (memory.lat && memory.lon) {
            const popupContent = `<b>Message:</b> ${memory.message}<br><br><a href="https://bscscan.com/tx/${memory.txHash}" target="_blank">View Transaction</a>`;
            L.marker([memory.lat, memory.lon]).addTo(map).bindPopup(popupContent);
        }
    });
});
