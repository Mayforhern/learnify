import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { CertificateVerification } from "../contracts/CertificateVerification";

const CONTRACT_ADDRESS = process.env.REACT_APP_CERTIFICATE_CONTRACT_ADDRESS;

interface ValidationFormProps {
  onValidationComplete?: (isValid: boolean) => void;
}

const ValidationForm: React.FC<ValidationFormProps> = ({ onValidationComplete }) => {
  const [certificateHash, setCertificateHash] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    checkTotalCertificates();
  }, []);
  
  const isValidBytes32 = (hash: string): boolean => /^0x[a-fA-F0-9]{64}$/.test(hash);
  
  const checkCertificate = async () => {
    if (!isValidBytes32(certificateHash)) {
      setStatus("Invalid bytes32 format");
      return;
    }

    setIsLoading(true);
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error("Please install MetaMask or another Web3 wallet");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS || '',
        CertificateVerification.abi,
        signer
      );
      
      const result = await contract.isValidCertificate(certificateHash);
      setIsValid(result);
      setStatus(result ? "Certificate is valid" : "Certificate is NOT valid");
      onValidationComplete?.(result);
    } catch (error) {
      console.error("Certificate validation error:", error);
      setStatus(error instanceof Error ? error.message : "Error checking certificate");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkTotalCertificates = async () => {
    try {
      if (typeof window.ethereum === 'undefined') return;

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS || '',
        CertificateVerification.abi,
        signer
      );
      
      const total = await contract.totalCertificates();
      setTotalCertificates(Number(total));
    } catch (error) {
      console.error("Error fetching total certificates:", error);
    }
  };
  
  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Certificate Validation</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="certificateHash" className="block text-sm font-medium text-gray-700 mb-1">
            Certificate Hash
          </label>
          <input
            id="certificateHash"
            type="text"
            placeholder="Enter Certificate Hash (0x...)"
            value={certificateHash}
            onChange={(e) => setCertificateHash(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={checkCertificate}
          disabled={isLoading || !certificateHash}
          className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors
            ${isLoading || !certificateHash
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isLoading ? 'Validating...' : 'Validate Certificate'}
        </button>

        {status && (
          <div className={`p-3 rounded-md ${
            isValid === true ? 'bg-green-50 text-green-700' :
            isValid === false ? 'bg-red-50 text-red-700' :
            'bg-yellow-50 text-yellow-700'
          }`}>
            {status}
          </div>
        )}

        <div className="text-sm text-gray-500 text-center">
          Total Certificates Issued: {totalCertificates.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default ValidationForm; 