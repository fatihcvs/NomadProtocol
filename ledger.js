document.addEventListener('DOMContentLoaded', function() {
    const ledgerContainer = document.getElementById('ledger-entries');
    ledgerContainer.innerHTML = '';
    const memories = [
        { user: "0x68F7F7f7b7D258a1B9fB8183151c888B27b7B9fB8", timestamp: 1750911952000, message: "Nomad Protocol v1.0 is complete. The journey begins.", txHash: "0x98a9d18e583e74bcf6b2b52479e9334460f38d39371e7123955a024227f4d547" }
    ];
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
});
