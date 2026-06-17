import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format, isValid } from 'date-fns';
import type { Patient } from '../types/patient';
import headerLogoPdf from '../assets/header-logo-pdf.png';

const YELLOW_BG = '#FDF2A7';
const HEADER_BG = '#E8D79C';
const TEXT_COLOR = '#4A4A4A';

const formatCertDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (!isValid(date)) return '';
  return format(date, 'do MMMM yyyy');
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: YELLOW_BG,
    paddingTop: 14,
    paddingBottom: 28,
    paddingHorizontal: 28,
    fontFamily: 'Helvetica',
    color: TEXT_COLOR,
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: 310,
    left: 198,
    width: 200,
    opacity: 0.06,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLogo: {
    width: 180,
    height: 120,
    objectFit: 'contain',
    marginBottom: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 1,
    color: '#3D3D3D',
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 0,
    color: '#5A5A5A',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
    paddingRight: 20,
  },
  patientName: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    color: '#3D3D3D',
  },
  patientDetail: {
    fontSize: 10,
    marginBottom: 3,
    color: '#5A5A5A',
  },
  qrSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 2,
  },
  qrImage: {
    width: 90,
    height: 90,
  },
  qrSlug: {
    fontSize: 8,
    marginTop: 4,
    textAlign: 'center',
    color: '#5A5A5A',
  },
  introSection: {
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 6,
  },
  introTextEn: {
    fontSize: 8,
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#3D3D3D',
    marginBottom: 1,
  },
  introTextFr: {
    fontSize: 8,
    textAlign: 'left',
    fontWeight: 'normal',
    color: '#5A5A5A',
    marginBottom: 0,
  },
  table: {
    marginBottom: 0,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: HEADER_BG,
  },
  tableDataRow: {
    flexDirection: 'row',
    backgroundColor: YELLOW_BG,
  },
  col1: { width: '18%', padding: 5 },
  col2: { width: '22%', padding: 5 },
  col3: { width: '14%', padding: 5 },
  col4: { width: '14%', padding: 5 },
  col5: { width: '32%', padding: 5 },
  col2b: { width: '20%', padding: 5 },
  col3b: { width: '12%', padding: 5 },
  col4b: { width: '22%', padding: 5 },
  col5b: { width: '18%', padding: 5 },
  col6b: { width: '28%', padding: 5 },
  headerCell: {
    fontSize: 6.5,
    fontWeight: 'bold',
    color: '#3D3D3D',
    lineHeight: 1.3,
  },
  dataCell: {
    fontSize: 7.5,
    color: '#4A4A4A',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 34,
    left: 28,
    right: 28,
    alignItems: 'center',
  },
  disclaimerTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4A4A4A',
    marginBottom: 1,
  },
  disclaimerBody: {
    fontSize: 8,
    textAlign: 'center',
    color: '#5A5A5A',
    marginBottom: 10,
  },
  footerIssued: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3D3D3D',
    marginBottom: 2,
  },
  footerIssuedFr: {
    fontSize: 7,
    textAlign: 'center',
    color: '#6B6B6B',
    fontStyle: 'italic',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#4A90C2',
  },
});

interface VaccinationCertificatePDFProps {
  patient: Patient;
  qrDataUrl: string;
  verifyUrl: string;
  watermarkDataUrl: string;
}

const VaccinationCertificatePDF = ({ patient, qrDataUrl, watermarkDataUrl }: VaccinationCertificatePDFProps) => {
  const manufacturerBatch =
    patient.vaccine_batch_number || patient.manufacture_brand_batch || '';
  const administeringClinician = [patient.administration_location, patient.doctor_name]
    .filter(Boolean)
    .join(', ');

  const validUntil = formatCertDate(patient.valid_until);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={watermarkDataUrl} style={styles.watermark} />

        <View style={styles.headerSection}>
          <Image src={headerLogoPdf} style={styles.headerLogo} />
          <Text style={styles.title}>International Certificate of Vaccination (Prophylaxis)</Text>
          <Text style={styles.subtitle}>
            Certificat International de Vaccination ou de Prophylaxie
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            {patient.national_id && (
              <Text style={styles.patientDetail}>Passport {patient.national_id}</Text>
            )}
            <Text style={styles.patientDetail}>
              {formatCertDate(patient.birth_date)}
            </Text>
          </View>
          <View style={styles.qrSection}>
            <Image src={qrDataUrl} style={styles.qrImage} />
            <Text style={styles.qrSlug}>{patient.slug}</Text>
          </View>
        </View>

        <View style={styles.introSection}>
          <Text style={styles.introTextEn}>
            In accordance with the International Health Regulations
          </Text>
          <Text style={styles.introTextFr}>
            conformément au Règlement sanitaire international
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <View style={styles.col1}>
              <Text style={styles.headerCell}>
                Vaccine or Prophylaxis{'\n'}Vaccin ou agent prophylactique
              </Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.headerCell}>
                Manufacturer and Batch no. of vaccine or prophylaxis{'\n'}
                Fabricant et n° de lot du vaccin ou agent prophylactique
              </Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.headerCell}>Date{'\n'}Date</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.headerCell}>Valid Until{'\n'}Valable jusqu'au</Text>
            </View>
            <View style={styles.col5}>
              <Text style={styles.headerCell}>
                Administering Location & Supervising Clinician{'\n'}
                Lieu d'administration et clinicien superviseur
              </Text>
            </View>
          </View>

          <View style={styles.tableDataRow}>
            <View style={styles.col1}>
              <Text style={styles.dataCell}>{patient.vaccine_type}</Text>
            </View>
            <View style={styles.col2}>
              <Text style={styles.dataCell}>{manufacturerBatch}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.dataCell}>{formatCertDate(patient.vaccine_date)}</Text>
            </View>
            <View style={styles.col4}>
              <Text style={styles.dataCell}>{validUntil}</Text>
            </View>
            <View style={styles.col5}>
              <Text style={styles.dataCell}>{administeringClinician}</Text>
            </View>
          </View>

          <View style={styles.tableHeaderRow}>
            <View style={styles.col2b}>
              <Text style={styles.headerCell}>Disease targeted{'\n'}Maladie ciblée</Text>
            </View>
            <View style={styles.col3b}>
              <Text style={styles.headerCell}>Date{'\n'}Date</Text>
            </View>
            <View style={styles.col4b}>
              <Text style={styles.headerCell}>
                Manufacture and Batch No. of vaccine or prophylaxis{'\n'}
                Fabricant et n° de lot du vaccin ou agent prophylactique
              </Text>
            </View>
            <View style={styles.col5b}>
              <Text style={styles.headerCell}>Next Booster{'\n'}Rappel suivant</Text>
            </View>
            <View style={styles.col6b}>
              <Text style={styles.headerCell}>
                Official stamp and signature{'\n'}Cachet et signature officiels
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
           <Text style={styles.disclaimerTitle}>Penafisan (Disclaimer):</Text>
          <Text style={styles.disclaimerBody}>
            Nomor kode ICV elektronik (eICV) berbeda dengan nomor seri ICV fisik
          </Text>
          <Text style={styles.footerIssued}>
            This certificate was issued by Ministry of Health of Indonesia
          </Text>
          <Text style={styles.footerIssuedFr}>
            Ce certificat a été délivré par le ministère Indonésien de la Santé
          </Text>
        </View>

        <View style={styles.footerBar} />
      </Page>
    </Document>
  );
};

export default VaccinationCertificatePDF;
