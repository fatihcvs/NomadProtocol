document.addEventListener('DOMContentLoaded', async function() {
    // --- KENDİ BSC API ANAHTARINI BURAYA YAPIŞTIR ---
    const bscscanApiKey = 'YMWFRRRGXZFBF47SMRCQFMMDD9E9TYTSWX';
    // ---------------------------------------------------

    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const eventSignature = 'MemoryAnchored(address,uint256,string)';
    const eventTopic = ethers.utils.id(eventSignature);

    const apiUrl = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${ledgerContractAddress}&topic0=${eventTopic}&apikey=${bscscanApiKey}`;

    var map = L.map('map').setView([45, 15], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.status === "1") {
            const events = data.result;
            const iface = new ethers.utils.Interface(["event MemoryAnchored(address indexed user, uint256 timestamp, string data)"]);

            events.forEach(log => {
                const parsedLog = iface.parseLog(log);
                const decodedMessage = parsedLog.args.data;

                if (decodedMessage.includes('LAT:') && decodedMessage.includes('LON:') && decodedMessage.includes('MSG:')) {
                    try {
                        const lat = parseFloat(decodedMessage.split('LAT:')[1].split(';')[0]);
                        const lon = parseFloat(decodedMessage.split('LON:')[1].split(';')[0]);
                        const message = decodedMessage.split('MSG:')[1].trim();
                        if (!isNaN(lat) && !isNaN(lon)) {
                            const popupContent = `<b>Message:</b> ${message}<br><br><a href="https://bscscan.com/tx/${log.transactionHash}" target="_blank">View Transaction</a>`;
                            L.marker([lat, lon]).addTo(map).bindPopup(popupContent);
                        }
                    } catch (e) {}
                }
            });
        }
    } catch (error) {
        console.error("Could not fetch memories:", error);
    }
});
