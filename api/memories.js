import { ethers } from 'ethers';

// Vercel'in standart serverless fonksiyon formatı
export default async function handler(req, res) {
    const ledgerContractAddress = '0xd34f98A99F313781a3F463ff151f721cFB1bE448';
    const ledgerContractAbi = ["event MemoryAnchored(address indexed user, uint256 timestamp, string data)"];
    
    // Güvenilir bir sunucuya bağlanıyoruz
    const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/bsc');
    const ledgerContract = new ethers.Contract(ledgerContractAddress, ledgerContractAbi, provider);

    try {
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = latestBlock - 250000; // Son ~1 haftalık veriyi tara
        
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
                        timestamp: event.args.timestamp * 1000,
                        txHash: event.transactionHash
                    };
                } catch (e) { return null; }
            }
            return null;
        }).filter(m => m !== null);

        // Başarılı olursa, veriyi JSON olarak gönder
        res.status(200).json(memories.reverse());

    } catch (error) {
        // Hata olursa, 500 koduyla bir hata mesajı gönder
        res.status(500).json({ error: "Could not fetch memories from the blockchain." });
    }
}
