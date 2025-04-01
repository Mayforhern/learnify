import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PDFViewer, Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode.react';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  content: {
    fontSize: 16,
    marginBottom: 20,
  },
  signature: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qrCode: {
    position: 'absolute',
    bottom: 40,
    right: 40,
  },
});

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
  certificateId: string;
  instructorName: string;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  completionDate,
  certificateId,
  instructorName,
}) => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const validationUrl = `${window.location.origin}/validate-certificate/${certificateId}`;

  const CertificateDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Certificate of Completion</Text>
        <View style={styles.content}>
          <Text>This is to certify that</Text>
          <Text style={{ fontSize: 20, marginVertical: 10 }}>{studentName}</Text>
          <Text>has successfully completed the course</Text>
          <Text style={{ fontSize: 18, marginVertical: 10 }}>{courseName}</Text>
          <Text>on {new Date(completionDate).toLocaleDateString()}</Text>
          <Text style={{ marginTop: 20 }}>Instructor: {instructorName}</Text>
        </View>
        <View style={styles.signature}>
          <Text>Certificate ID: {certificateId}</Text>
          <Text>Date: {new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.qrCode}>
          <QRCode value={validationUrl} size={100} />
        </View>
      </Page>
    </Document>
  );

  const handleShare = async () => {
    setShowShareOptions(true);
  };

  const generatePDF = async () => {
    try {
      const blob = await pdf(<CertificateDocument />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setPdfError(error instanceof Error ? error.message : 'Failed to generate PDF');
    }
  };

  if (pdfError) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p>Error generating PDF: {pdfError}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-4">
        <button
          onClick={handleShare}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Share Certificate
        </button>
        <button
          onClick={generatePDF}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download PDF
        </button>
      </div>
      
      {pdfUrl && (
        <div className="border rounded-lg overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-[500px]"
            title="Certificate PDF"
          />
        </div>
      )}

      {showShareOptions && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-bold mb-2">Share Certificate</h4>
          <p className="text-sm mb-2">Certificate ID: {certificateId}</p>
          <p className="text-sm mb-2">Validation URL: {validationUrl}</p>
          <button
            onClick={() => navigator.clipboard.writeText(validationUrl)}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Copy Validation URL
          </button>
        </div>
      )}
    </div>
  );
};

export default Certificate; 