document.addEventListener('DOMContentLoaded', async function() {
    // Kütüphanelerin yüklenip yüklenmediğini kontrol etmek için güvenlik ağı
    if (typeof L === 'undefined' || typeof ethers === 'undefined') {
        console.error("Leaflet or Ethers.js library is not loaded. Check script tags in explorer.html.");
        const mapDiv = document.getElementById('map');
        if(mapDiv) {
            mapDiv.innerHTML = '<p style="color: #ff6b6b; text-align: center; padding-top: 50px;">Map library could not be loaded. Please check your connection and refresh.</p>';
        }
        return;
    }

    const bscscanApiKey = 'YMWFRRRGXZFBF47SMRCQFMMDD9E9TYTSWX';
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const eventSignature = 'MemoryAnchored(address,uint256,string)';
    const eventTopic = ethers.utils.id(eventSignature);
    const apiUrl = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${ledgerContractAddress}&topic0=${eventTopic}&apikey=${bscscanApiKey}`;

    var map = L.map('map').setView([45, 15], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "1" && data.result.length > 0) {
            const iface = new ethers.utils.Interface(["event MemoryAnchored(address indexed user, uint256 timestamp, string data)"]);
            
            data.result.forEach(log => {
                try {
                    const parsedLog = iface.parseLog(log);
                    const decodedMessage = parsedLog.args.data;

                    if (decodedMessage.includes('LAT:') && decodedMessage.includes('LON:') && decodedMessage.includes('MSG:')) {
                        const latString = decodedMessage.split('LAT:')[1].split(';')[0];
                        const lonString = decodedMessage.split('LON:')[1].split(';')[0];
                        const message = decodedMessage.split('MSG:')[1].trim();

                        const lat = parseFloat(latString);
                        const lon = parseFloat(lonString);

                        if (!isNaN(lat) && !isNaN(lon)) {
                            const popupContent = `<b>Message:</b> ${message}<br><br><a href="https://bscscan.com/tx/${log.transactionHash}" target="_blank" class="link-arrow">View Transaction</a>`;
                            L.marker([lat, lon]).addTo(map).bindPopup(popupContent);
                        }
                    }
                } catch(e) {
                    console.error("Could not parse a specific log for the map:", log, e);
                }
            });
        }
    } catch (error) {
        console.error("Could not fetch memories for the map:", error);
    }
});
