document.addEventListener('DOMContentLoaded', function() {
    if (!document.getElementById('anchorBtn')) return;

    const anchorButton = document.getElementById('anchorBtn');
    const getLocationButton = document.getElementById('getLocationBtn');
    const latInput = document.getElementById('latitude');
    const lonInput = document.getElementById('longitude');
    const msgInput = document.getElementById('message');
    const statusMessage = document.getElementById('statusMessage');

    const nmdTokenAddress = '0xdF80ce5D83282Cf12C285620a01900FD434AdCC7';
    const nmdTokenAbi = ["function transfer(address to, uint256 amount) public returns (bool)"];
    const burnAddress = '0x000000000000000000000000000000000000dEaD';
    
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const ledgerContractAbi = ["function anchor(string memory _data) public"];

    getLocationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            statusMessage.textContent = 'Fetching location...';
            navigator.geolocation.getCurrentPosition(position => {
                latInput.value = position.coords.latitude.toFixed(4);
                lonInput.value = position.coords.longitude.toFixed(4);
                statusMessage.textContent = 'Location found!';
            }, () => {
                statusMessage.textContent = 'Could not get location. Please enter manually.';
            });
        } else {
            statusMessage.textContent = 'Geolocation is not supported by your browser.';
        }
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

        statusMessage.textContent = 'Connecting to wallet... Please approve connection.';

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            
            statusMessage.textContent = 'Step 1/2: Approving 1 NMD for ink...';
            const nmdContract = new ethers.Contract(nmdTokenAddress, nmdTokenAbi, signer);
            const amountToSend = ethers.utils.parseUnits("1", 18);
            const burnTx = await nmdContract.transfer(burnAddress, amountToSend);
            statusMessage.textContent = 'Step 1/2: Burning ink... Waiting for confirmation...';
            await burnTx.wait();
            statusMessage.textContent = 'Step 1/2: Ink has been spent successfully!';
            
            statusMessage.textContent = 'Step 2/2: Preparing to anchor memory...';
            const formattedMessage = `LAT:${latInput.value};LON:${lonInput.value};MSG:${msgInput.value}`;
            const ledgerContract = new ethers.Contract(ledgerContractAddress, ledgerContractAbi, signer);
            const anchorTx = await ledgerContract.anchor(formattedMessage);
            statusMessage.textContent = 'Step 2/2: Anchoring... Waiting for confirmation...';
            await anchorTx.wait();
            
            statusMessage.innerHTML = `Success! Memory anchored. It will appear on the Explorer/Ledger shortly. <a href="https://bscscan.com/tx/${anchorTx.hash}" target="_blank" class="link-arrow">View Tx</a>`;
            latInput.value = '';
            lonInput.value = '';
            msgInput.value = '';

        } catch (error) {
            statusMessage.textContent = `Error: ${error.reason || "Transaction was rejected or failed."}`;
            console.error(error);
        }
    });
});
