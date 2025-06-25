document.addEventListener('DOMContentLoaded', async function() {
    const bscscanApiKey = 'YMWFRRRGXZFBF47SMRCQFMMDD9E9TYTSWX';
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const eventSignature = 'MemoryAnchored(address,uint256,string)';
    const eventTopic = ethers.utils.id(eventSignature);
    const apiUrl = `https://api.bscscan.com/api?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${ledgerContractAddress}&topic0=${eventTopic}&apikey=${bscscanApiKey}`;
    const ledgerContainer = document.getElementById('ledger-entries');
    ledgerContainer.innerHTML = '<p>Loading memories from the blockchain...</p>';

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        ledgerContainer.innerHTML = ''; 
        if (data.status === "1" && data.result.length > 0) {
            const events = data.result.reverse();
            const iface = new ethers.utils.Interface(["event MemoryAnchored(address indexed user, uint256 timestamp, string data)"]);
            events.forEach(log => {
                const parsedLog = iface.parseLog(log);
                const decodedMessage = parsedLog.args.data;
                const msgPart = decodedMessage.split('MSG:')[1].trim();
                const entryDiv = document.createElement('div');
                entryDiv.className = 'ledger-entry';
                const transactionDate = new Date(parseInt(parsedLog.args.timestamp) * 1000).toLocaleString();
                entryDiv.innerHTML = `<p class="entry-message">"${msgPart}"</p><div class="entry-meta"><span>Anchored by: ${parsedLog.args.user.substring(0, 6)}...${parsedLog.args.user.substring(38)}</span><span>Anchored on: ${transactionDate}</span><a href="https://bscscan.com/tx/${log.transactionHash}" target="_blank">View on BscScan</a></div>`;
                ledgerContainer.appendChild(entryDiv);
            });
        } else {
            ledgerContainer.innerHTML = '<p>No memories have been anchored yet. Be the first.</p>';
        }
    } catch (error) {
        ledgerContainer.innerHTML = `<p style="color: #ff6b6b;">Could not load memories. Please try again later.</p>`;
    }
});
