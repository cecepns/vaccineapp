import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { Printer, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import kemenkesLogo from '../assets/kemenkes.png';

interface Patient {
  id: number;
  name: string;
  address: string;
  birth_date: string;
  vaccine_type: string;
  vaccine_date: string;
  valid_until: string;
  administration_location: string;
  slug: string;
  sex: string;
  nationality: string;
  national_id: string;
  doctor_name: string;
  vaccine_batch_number: string;
  disease_targeted: string;
  disease_date: string;
  manufacture_brand_batch: string;
  next_booster_date: string;
  official_stamp_signature: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #ccc',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#666',
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
});

const PDFDocument = ({ patient, url }: { patient: Patient; url: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{patient.name}</Text>
        <Text style={styles.text}>ID: {patient.slug}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Personal Information</Text>
        <Text style={styles.text}>Name: {patient.name}</Text>
        <Text style={styles.text}>Address: {patient.address}</Text>
        <Text style={styles.text}>Date of Birth: {format(new Date(patient.birth_date), 'dd MMMM yyyy')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Vaccination Information</Text>
        <Text style={styles.text}>Vaccine Type: {patient.vaccine_type}</Text>
        <Text style={styles.text}>Date of Vaccination: {format(new Date(patient.vaccine_date), 'dd MMMM yyyy')}</Text>
        <Text style={styles.text}>Valid Until: {format(new Date(patient.valid_until), 'dd MMMM yyyy')}</Text>
        <Text style={styles.text}>Administration Location: {patient.administration_location}</Text>
      </View>

      <View style={styles.qrContainer}>
        <Text style={styles.text}>Scan to verify</Text>
        <Text style={styles.text}>{url}</Text>
      </View>
    </Page>
  </Document>
);

const PatientView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const url = window.location.href;

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await axios.get(`https://api.kingcreativestudio.my.id/api/patients/${slug}`);
        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError('Patient record not found');
        setLoading(false);
      }
    };

    if (slug) {
      fetchPatient();
    }
  }, [slug]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !patient) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-xl font-medium text-red-800 mb-2">Record Not Found</h2>
          <p className="text-red-600 mb-4">The vaccination record you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto bg-[#f5e19f] min-h-screen py-10 px-4 overflow-hidden">
      {/* Watermark Logo Kemenkes */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
        aria-hidden="true"
      >
        <img
          src={kemenkesLogo}
          alt=""
          className="w-[32%] max-w-[280px] opacity-[0.06] grayscale select-none"
          draggable={false}
        />
      </div>

      <div className="relative z-10">
      {/* Header Dokumen dengan QR Code */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            Certificat Internatiional de Vaccination ou de Prophylaxie
          </h1>
          <p className="text-sm text-gray-700 italic mt-1">
            International Certificate of Vaccination or Prophylaxis
          </p>
        </div>
        <div className="flex flex-col items-center bg-white/70 p-3 rounded-md shadow-sm">
          <QRCodeSVG value={url} size={120} level="H" includeMargin={false} />
          <span className="mt-2 text-xs font-medium text-gray-700">{patient.slug}</span>
        </div>
      </div>

      <div className="md:w-2/3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Balai Kekarantinaan Kesehatanan/Rumah Sakit</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.administration_location}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">No Dokumen</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.slug}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">This is to certify that [Name]</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.name}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Date Of Birth</div>
          <div className="text-gray-500 text-xs md:text-sm">{format(new Date(patient.birth_date), 'dd MMMM yyyy')}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Sex</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.sex}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Nationality</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.nationality}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">National Identification Documents, If Applicable</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.national_id}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Whose Signature Follows</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.name}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Has on the date indicated been vaccinated or <br /> received prophylaxis againts: (name of disease or <br /> condition)</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.vaccine_type}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Disease Targeted</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.disease_targeted}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Disease Date</div>
          <div className="text-gray-500 text-xs md:text-sm">{format(new Date(patient.disease_date), 'dd MMMM yyyy')}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Manufacture, Brand Name and Batch No. of Vaccine</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.manufacture_brand_batch}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Next Booster (date)</div>
          <div className="text-gray-500 text-xs md:text-sm">{format(new Date(patient.next_booster_date), 'dd MMMM yyyy')}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
          <div className="text-gray-500 md:text-right font-bold text-sm">Official Stamp and Signature</div>
          <div className="text-gray-500 text-xs md:text-sm">{patient.official_stamp_signature}</div>
        </div>
      </div>

      {/* Tabel Vaksinasi */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-yellow-900/30 bg-transparent text-sm text-gray-800">
          <thead className="bg-[#e8d79c]">
            <tr>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Vaccine or Prophy</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Date</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Signature and profesional status of supervising clinican</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Manufacture and batch no. of vaccine or prophylaxis</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Certificate valid until</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Official stamp of the administering centre</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Disease targeted</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Date</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Manufacture, brand name and batch no. of vaccine</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Next Booster (date)</th>
              <th className="border border-yellow-900/30 px-2 py-2 font-semibold">Official stamp and signature</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-yellow-900/30 px-2 py-2">{patient.vaccine_type}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{format(new Date(patient.vaccine_date), 'dd MMMM yyyy')}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{patient.doctor_name}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{patient.vaccine_batch_number}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{format(new Date(patient.valid_until), 'dd MMMM yyyy')}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{patient.administration_location}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{patient.disease_targeted}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{format(new Date(patient.disease_date), 'dd MMMM yyyy')}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{patient.manufacture_brand_batch}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{format(new Date(patient.next_booster_date), 'dd MMMM yyyy')}</td>
              <td className="border border-yellow-900/30 px-2 py-2">{patient.official_stamp_signature}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* QR Code & Footer */}
      {/* <div className="mt-10 flex flex-col items-center">
        <QRCodeSVG value={url} size={120} level="H" includeMargin={true} />
        <p className="mt-2 text-sm text-gray-700">Scan to verify</p>
      </div> */}
      </div>
    </div>
  );
};

export default PatientView;