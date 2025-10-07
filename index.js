import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { Web3Storage, File } from 'web3.storage';
import { ethers } from 'ethers';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 4000;
const RPC = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PINATA_JWT = process.env.PINATA_JWT;
const WEB3STORAGE_TOKEN = process.env.WEB3STORAGE_TOKEN;

const provider = new ethers.JsonRpcProvider(RPC || 'http://127.0.0.1:8545');
const abi = [
  "function get(address) view returns (tuple(address owner,string ipfsHash,uint256 timestamp))"
];
const contract = new ethers.Contract(CONTRACT_ADDRESS || ethers.ZeroAddress, abi, provider);

// --- Pinata Upload ---
app.post('/upload-ipfs/pinata', async (req, res) => {
  try {
    const data = req.body;
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      { headers: { Authorization: `Bearer ${PINATA_JWT}` } }
    );
    res.json({ ipfsHash: response.data.IpfsHash });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- Web3.Storage Upload ---
app.post('/upload-ipfs/web3', async (req, res) => {
  try {
    if (!WEB3STORAGE_TOKEN) throw new Error("Missing WEB3STORAGE_TOKEN");
    const storage = new Web3Storage({ token: WEB3STORAGE_TOKEN });

    const jsonData = JSON.stringify(req.body, null, 2);
    const buffer = Buffer.from(jsonData);
    const file = new File([buffer], "trustmesh.json", { type: "application/json" });

    const cid = await storage.put([file], { wrapWithDirectory: false });
    res.json({ ipfsHash: cid });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- Get Record ---
app.get('/record/:address', async (req, res) => {
  try {
    const record = await contract.get(req.params.address);
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () =>
  console.log(`🔥 TrustMesh backend running at http://localhost:${PORT}`)
);
