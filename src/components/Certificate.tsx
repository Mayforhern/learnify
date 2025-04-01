import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ethers } from 'ethers';
import { CertificateVerification } from '../contracts/CertificateVerification';

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  certificateHash?: string;
  organizationName?: string;
  courseDuration?: string;
}

const Certificate: React.FC<CertificateProps> = ({ 
  studentName, 
  courseName, 
  completionDate,
  instructorName,
  certificateHash,
  organizationName,
  courseDuration
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'valid' | 'invalid'>('pending');

  const verifyCertificate = async () => {
    if (!certificateHash) return;
    
    setIsVerifying(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          process.env.REACT_APP_CERTIFICATE_CONTRACT_ADDRESS || '',
          CertificateVerification.abi,
          provider
        );

        const isValid = await contract.verifyCertificate(certificateHash);
        setVerificationStatus(isValid ? 'valid' : 'invalid');
      }
    } catch (error) {
      console.error('Certificate verification error:', error);
      setVerificationStatus('invalid');
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('certificate-content');
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`certificate-${certificateHash || Date.now()}.pdf`);
  };

  return (
    <div className="bg-white p-8 rounded-lg border-8 border-double border-gray-200">
      <div id="certificate-content" className="text-center">
        <h1 className="text-4xl font-serif mb-8">Certificate of Completion</h1>
        
        <p className="text-xl mb-6">This is to certify that</p>
        
        <p className="text-3xl font-bold mb-6 text-[#FF4D4D]">{studentName}</p>
        
        <p className="text-xl mb-6">has successfully completed the course</p>
        
        <p className="text-3xl font-bold mb-8">{courseName}</p>

        {courseDuration && (
          <p className="text-lg mb-4">Duration: {courseDuration}</p>
        )}
        
        <div className="flex justify-between items-center mt-16">
          <div className="text-center">
            <div className="w-48 border-t-2 border-gray-400 pt-2">
              <p className="text-sm text-gray-600">Date of Completion</p>
              <p className="font-medium">{new Date(completionDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="text-center">
            <img src="/signature.png" alt="Signature" className="h-12 mb-2" />
            <div className="w-48 border-t-2 border-gray-400 pt-2">
              <p className="text-sm text-gray-600">Course Instructor</p>
              <p className="font-medium">{instructorName}</p>
            </div>
          </div>
        </div>

        {certificateHash && (
          <div className="mt-8 flex flex-col items-center">
            <div className="bg-white p-2 rounded-lg shadow-sm">
              <QRCodeSVG
                value={`${window.location.origin}/validate-certificate/${certificateHash}`}
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">Scan to verify</p>
            <p className="text-xs text-gray-400 mt-1">ID: {certificateHash.slice(0, 8)}...</p>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={verifyCertificate}
                disabled={isVerifying}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isVerifying ? 'Verifying...' : 'Verify on Blockchain'}
              </button>
              
              {verificationStatus !== 'pending' && (
                <div className={`text-sm ${
                  verificationStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {verificationStatus === 'valid' ? '✓ Certificate Verified' : '✗ Certificate Invalid'}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">Certificate ID: {certificateHash ? certificateHash.slice(0, 8) + '...' : Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={downloadPDF}
          className="px-6 py-2 bg-[#FF4D4D] text-white rounded-lg hover:bg-[#ff3333] transition-colors"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default Certificate; 