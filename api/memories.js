// Ethers.js kütüphanesini arka plan hizmetinde kullanmak için import ediyoruz
const { ethers } = require('ethers');

// Bu fonksiyon, web sitemiz /api/memories adresine istek attığında çalışacak
exports.handler = async function(event, context) {
    
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const ledgerContractAbi = ["event MemoryAnchored(address indexed user, uint256 timestamp, string data)"];
    
    // Güvenilir bir sunucuya bağlanıyoruz
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc');
    const ledgerContract = new ethers.Contract(ledgerContractAddress, ledgerContractAbi, provider);

    try {
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = latestBlock - 250000; // Son 250,000 bloğu tara (yaklaşık 8-9 gün)
        
        const events = await ledgerContract.queryFilter('MemoryAnchored', fromBlock, 'latest');
        
        const memories = events.map(event => {
            const decodedMessage = event.args.data;
            if (decodedMessage.includes('LAT:') && decodedMessage.includes('LON:') && decodedMessage.includes('MSG:')) {
                try {
                    return {
                        lat: parseFloat(decodedMessage.split('LAT:')[1].split(';')[0]),
                        lon: parseFloat(decodedMessage.split('LON:')[1].split(';')[0]),
                        message: decodedMessage.split('MSG:')[1].trim(),
                        user: event.args.user,
                        timestamp: event.args.timestamp * 1000, // Javascript'in anlayacağı formata çevir
                        txHash: event.transactionHash
                    };
                } catch (e) {
                    return null;
                }
            }
            return null;
        }).filter(m => m !== null); // Hatalı parse edilenleri listeden çıkar

        return {
            statusCode: 200,
            body: JSON.stringify(memories.reverse()) // En yeniden eskiye sırala ve gönder
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not fetch memories from the blockchain." })
        };
    }
};
