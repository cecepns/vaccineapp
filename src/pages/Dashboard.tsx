import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye, Loader, Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import ReactDOM from 'react-dom/client';
import VaccinationCertificatePDF from '../components/VaccinationCertificatePDF';
import { generateQRDataUrl } from '../utils/generateQRDataUrl';
import { imageToGrayscaleDataUrl } from '../utils/imageToGrayscaleDataUrl';
import kemenkesLogo from '../assets/kemenkes.png';
import type { Patient } from '../types/patient';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  recordsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const Dashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [downloadingPdfSlug, setDownloadingPdfSlug] = useState<string | null>(null);
  const { token } = useAuth();
  const qrRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`https://api.kingcreativestudio.my.id/api/patients?page=${currentPage}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatients(response.data.patients);
        setPagination(response.data.pagination);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients');
        setLoading(false);
      }
    };

    fetchPatients();
  }, [token, currentPage]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this patient record?')) {
      return;
    }

    try {
      await axios.delete(`https://api.kingcreativestudio.my.id/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh current page after deletion
      const response = await axios.get(`https://api.kingcreativestudio.my.id/api/patients?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data.patients);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError('Failed to delete patient');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDownloadQR = (slug: string) => {
    // Create a temporary div for the larger QR code
    const tempDiv = document.createElement('div');
    const largeQR = document.createElement('div');
    tempDiv.appendChild(largeQR);
    document.body.appendChild(tempDiv);

    // Generate larger QR code
    const qrValue = window.location.origin + '/pasien/' + slug;
    const qrComponent = React.createElement(QRCodeSVG, {
      value: qrValue,
      size: 300,
      level: 'L'
    });

    // Render the QR code
    const root = ReactDOM.createRoot(largeQR);
    root.render(qrComponent);

    // Wait for the QR code to be rendered
    setTimeout(() => {
      const svg = largeQR.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 300, 300);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();

        // Clean up
        root.unmount();
        document.body.removeChild(tempDiv);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }, 100);
  };

  const handleDownloadPDF = async (slug: string) => {
    setDownloadingPdfSlug(slug);
    try {
      const response = await axios.get(`https://api.kingcreativestudio.my.id/api/patients/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const patient: Patient = response.data;
      const verifyUrl = `${window.location.origin}/pasien/${slug}`;
      const [qrDataUrl, watermarkDataUrl] = await Promise.all([
        generateQRDataUrl(verifyUrl, 200),
        imageToGrayscaleDataUrl(kemenkesLogo),
      ]);

      const blob = await pdf(
        <VaccinationCertificatePDF
          patient={patient}
          qrDataUrl={qrDataUrl}
          verifyUrl={verifyUrl}
          watermarkDataUrl={watermarkDataUrl}
        />
      ).toBlob();

      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `ICV_${slug}.pdf`;
      downloadLink.click();
      URL.revokeObjectURL(downloadLink.href);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF certificate');
    } finally {
      setDownloadingPdfSlug(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
        <Link 
          to="/add-patient" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
        >
          Add New Patient
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-4">No patient records found.</p>
          <Link 
            to="/add-patient" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Add your first patient
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vaccine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barcode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => {
                  const isExpired = new Date(patient.valid_until) < new Date();
                  
                  return (
                    <tr key={patient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.vaccine_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(patient.vaccine_date), 'dd MMM yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          isExpired 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {format(new Date(patient.valid_until), 'dd MMM yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div ref={el => qrRefs.current[patient.slug] = el}>
                          <QRCodeSVG value={window.location.origin + '/pasien/' + patient.slug} size={55} level="L" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-5 flex-col md:flex-row">
                          <Link 
                            to={`/pasien/${patient.slug}`} 
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            title="View"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link 
                            to={`/edit-patient/${patient.slug}`} 
                            className="text-yellow-600 hover:text-yellow-900 transition-colors duration-200"
                            title="Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDownloadPDF(patient.slug)}
                            disabled={downloadingPdfSlug === patient.slug}
                            className="text-purple-600 hover:text-purple-900 transition-colors duration-200 disabled:opacity-50"
                            title="Download PDF Certificate"
                          >
                            {downloadingPdfSlug === patient.slug ? (
                              <Loader className="h-5 w-5 animate-spin" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDownloadQR(patient.slug)}
                            className="text-green-600 hover:text-green-900 transition-colors duration-200"
                            title="Download QR Code"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient.id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.recordsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.recordsPerPage, pagination.totalRecords)} of{' '}
                {pagination.totalRecords} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pagination.hasPrevPage
                      ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                <div className="flex items-center space-x-1">
                  {(() => {
                    const totalPages = pagination.totalPages;
                    const currentPage = pagination.currentPage;
                    const pages = [];
                    
                    // Always show first page
                    pages.push(1);
                    
                    if (totalPages <= 7) {
                      // If total pages is 7 or less, show all pages
                      for (let i = 2; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Show ellipsis after first page if current page is > 4
                      if (currentPage > 4) {
                        pages.push('...');
                      }
                      
                      // Show pages around current page
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);
                      
                      for (let i = start; i <= end; i++) {
                        if (!pages.includes(i)) {
                          pages.push(i);
                        }
                      }
                      
                      // Show ellipsis before last page if current page is < totalPages - 3
                      if (currentPage < totalPages - 3) {
                        pages.push('...');
                      }
                      
                      // Always show last page if it's not already included
                      if (totalPages > 1 && !pages.includes(totalPages)) {
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                        disabled={typeof page !== 'number'}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          typeof page === 'number'
                            ? page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pagination.hasNextPage
                      ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;