document.addEventListener('DOMContentLoaded', async function() {
    const ledgerContainer = document.getElementById('ledger-entries');
    ledgerContainer.innerHTML = '<p>Loading memories from our ledger...</p>';

    try {
        const response = await fetch('/api/memories');
        const memories = await response.json();
        
        ledgerContainer.innerHTML = ''; // Temizle

        if (memories.length === 0) {
            ledgerContainer.innerHTML = '<p>No memories have been anchored yet.</p>';
            return;
        }

        memories.forEach(memory => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'ledger-entry';
            const transactionDate = new Date(memory.timestamp).toLocaleString();
            entryDiv.innerHTML = `<p class="entry-message">"${memory.message}"</p><div class="entry-meta"><span>Anchored by: ${memory.user.substring(0, 6)}...${memory.user.substring(38)}</span><span>Anchored on: ${transactionDate}</span><a href="https://bscscan.com/tx/${memory.txHash}" target="_blank">View on BscScan</a></div>`;
            ledgerContainer.appendChild(entryDiv);
        });
    } catch (error) {
        console.error("Could not load memories:", error);
        ledgerContainer.innerHTML = '<p style="color: #ff6b6b;">Could not load memories. Please try again later.</p>';
    }
});
