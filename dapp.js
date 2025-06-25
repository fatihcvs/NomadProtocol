document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('anchorBtn')) return;
    const anchorButton = document.getElementById('anchorBtn');
    const getLocationButton = document.getElementById('getLocationBtn');
    const latInput = document.getElementById('latInput');
    const lonInput = document.getElementById('lonInput');
    const msgInput = document.getElementById('msgInput');
    const statusMessage = document.getElementById('statusMessage');
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const ledgerContractAbi = ["function anchor(string memory _data) public"];

    getLocationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            statusMessage.textContent = 'Fetching location...';
            navigator.geolocation.getCurrentPosition(position => {
                latInput.value = position.coords.latitude.toFixed(4);
                lonInput.value = position.coords.longitude.toFixed(4);
                statusMessage.textContent = 'Location found!';
            }, () => { statusMessage.textContent = 'Could not get location. Please enter manually.'; });
        } else { statusMessage.textContent = 'Geolocation is not supported by your browser.'; }
    });

    anchorButton.addEventListener('click', async () => {
        if (typeof window.ethereum === 'undefined') {
            statusMessage.textContent = 'MetaMask is not installed!';
            return;
        }
        if (!latInput.value || !lonInput.value || !msgInput.value) {
            statusMessage.textContent = 'Please fill in all fields.';
            return;
        }
        const formattedMessage = `LAT:${latInput.value};LON:${lonInput.value};MSG:${msgInput.value}`;
        statusMessage.textContent = 'Connecting to wallet... Please approve connection.';
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const ledgerContract = new ethers.Contract(ledgerContractAddress, ledgerContractAbi, signer);
            statusMessage.textContent = 'Preparing transaction... Please confirm in MetaMask.';
            const tx = await ledgerContract.anchor(formattedMessage);
            statusMessage.textContent = 'Transaction sent! Waiting for confirmation...';
            await tx.wait();
            statusMessage.innerHTML = `Success! Your memory is anchored forever. <a href="https://bscscan.com/tx/${tx.hash}" target="_blank" class="link-arrow">View Transaction</a>`;
            latInput.value = '';
            lonInput.value = '';
            msgInput.value = '';
        } catch (error) {
            statusMessage.textContent = `Error: ${error.message}`;
        }
    });
});
