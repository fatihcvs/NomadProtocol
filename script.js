document.addEventListener('DOMContentLoaded', async function() {
    if (typeof ethers === 'undefined' || typeof L === 'undefined') return;
    const bscscanApiKey = 'YMWFRRRGXZFBF47SMRCQFMMDD9E9TYTSWX';
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const eventTopic = ethers.utils.id('MemoryAnchored(address,uint256,string)');
    const apiUrl = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${ledgerContractAddress}&topic0=${eventTopic}&apikey=${bscscanApiKey}`;
    var map = L.map('map').setView([45, 15], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(map);
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.status === "1") {
            const iface = new ethers.utils.Interface(["event MemoryAnchored(address indexed user, uint256 timestamp, string data)"]);
            data.result.forEach(log => {
                const parsedLog = iface.parseLog(log);
                const [lat, lon, message] = parsedLog.args.data.split(';').map(s => s.split(':')[1]);
                if (lat && lon && message) {
                    L.marker([parseFloat(lat), parseFloat(lon)]).addTo(map).bindPopup(`<b>Message:</b> ${message}<br><br><a href="https://bscscan.com/tx/${log.transactionHash}" target="_blank">View Transaction</a>`);
                }
            });
        }
    } catch (error) {}
});
