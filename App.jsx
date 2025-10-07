import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

export default function App(){
  const [account, setAccount] = useState(null);
  const [metadata, setMetadata] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [provider, setProvider] = useState('web3');
  const [contract, setContract] = useState(null);
  const [record, setRecord] = useState(null);

  const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

  const abi = [
    "function register(string ipfsHash)",
    "function update(string ipfsHash)",
    "function get(address) view returns (tuple(address owner,string ipfsHash,uint256 timestamp))"
  ];

  async function connectWallet(){
    if(!window.ethereum) return alert('Install MetaMask first');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    const signer = await provider.getSigner();
    const ctr = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    setContract(ctr);
  }

  async function uploadToIPFS(){
    const url = provider === 'pinata'
      ? 'http://localhost:4000/upload-ipfs/pinata'
      : 'http://localhost:4000/upload-ipfs/web3';
    const res = await axios.post(url, { metadata });
    setIpfsHash(res.data.ipfsHash);
    return res.data.ipfsHash;
  }

  async function register(){
    const ipfs = await uploadToIPFS();
    const tx = await contract.register(ipfs);
    await tx.wait();
    alert('✅ Registered successfully!');
  }

  async function fetchRecord(){
    const rec = await contract.get(account);
    setRecord(rec);
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow'>
        <h1 className='text-2xl font-bold mb-4'>TrustMesh dApp (IPFS + Web3.Storage)</h1>

        {!account ? (
          <button className='px-4 py-2 bg-indigo-600 text-white rounded' onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <div>
            <p className='text-sm mb-4'>Connected: {account}</p>

            <label className='block mb-2 font-semibold'>Upload via:</label>
            <select
              className='border rounded p-2 mb-4 w-full'
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value='web3'>Web3.Storage (Free)</option>
              <option value='pinata'>Pinata (Pro)</option>
            </select>

            <textarea
              className='w-full border p-2 rounded mb-2'
              placeholder='Enter metadata JSON or text'
              value={metadata}
              onChange={e=>setMetadata(e.target.value)}
            />
            <button onClick={register} className='px-4 py-2 bg-green-600 text-white rounded'>
              Upload + Register
            </button>

            <button onClick={fetchRecord} className='ml-2 px-4 py-2 bg-gray-700 text-white rounded'>
              Fetch Record
            </button>

            {record && (
              <pre className='bg-gray-100 p-4 rounded mt-4 text-sm'>
                {JSON.stringify(record, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
