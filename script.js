document.addEventListener('DOMContentLoaded', async function() {
    // Kütüphanelerin yüklenip yüklenmediğini kontrol et
    if (typeof L === 'undefined') {
        console.error("Leaflet library (L) is not defined. Check script tag in explorer.html.");
        return;
    }
    if (typeof ethers === 'undefined') {
        console.error("Ethers.js library is not defined. Check script tag in explorer.html.");
        return;
    }

    // --- GEREKLİ BİLGİLER ---
    const bscscanApiKey = 'YMWFRRRGXZFBF47SMRCQFMMDD9E9TYTSWX'; // Senin API Anahtarın
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448'; // Ledger Kontrat Adresi
    // -------------------------

    const eventSignature = 'MemoryAnchored(address,uint256,string)';
    const eventTopic = ethers.utils.id(eventSignature);
    const apiUrl = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${ledgerContractAddress}&topic0=${eventTopic}&apikey=${bscscanApiKey}`;

    // Haritayı başlat
    var map = L.map('map').setView([45, 15], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "1" && Array.isArray(data.result)) {
            const iface = new ethers.utils.Interface(["event MemoryAnchored(address indexed user, uint256 timestamp, string data)"]);
            
            data.result.forEach(log => {
                try {
                    const parsedLog = iface.parseLog(log);
                    const decodedMessage = parsedLog.args.data;

                    if (decodedMessage.startsWith('LAT:') && decodedMessage.includes(';LON:') && decodedMessage.includes(';MSG:')) {
                        const parts = decodedMessage.split(';');
                        const latString = parts[0].split(':')[1];
                        const lonString = parts[1].split(':')[1];
                        const message = parts[2].substring(4); // "MSG:" kısmından sonrasını al

                        const lat = parseFloat(latString);
                        const lon = parseFloat(lonString);

                        if (!isNaN(lat) && !isNaN(lon)) {
                            const popupContent = `<b>Message:</b> ${message}<br><br><a href="https://bscscan.com/tx/${log.transactionHash}" target="_blank" class="link-arrow">View Transaction</a>`;
                            L.marker([lat, lon]).addTo(map).bindPopup(popupContent);
                        }
                    }
                } catch(e) {
                    // Bu logun formatı bozuksa atla, diğerlerine devam et
                    console.warn("Could not parse a specific log:", log);
                }
            });
        } else {
            console.log("No memories found or API error:", data.message || "No result array");
        }
    } catch (error) {
        console.error("Error fetching or processing memories for the map:", error);
    }
});
