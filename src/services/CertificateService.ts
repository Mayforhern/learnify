import { v4 as uuidv4 } from 'uuid';
import DatabaseService from './DatabaseService';

interface CertificateData {
  id: string;
  studentName: string;
  courseName: string;
  completionDate: string;
  instructorName: string;
  studentId: string;
  courseId: string;
}

class CertificateService {
  private static instance: CertificateService;
  private db: DatabaseService;

  private constructor() {
    this.db = DatabaseService.getInstance();
  }

  public static getInstance(): CertificateService {
    if (!CertificateService.instance) {
      CertificateService.instance = new CertificateService();
    }
    return CertificateService.instance;
  }

  async generateCertificate(data: Omit<CertificateData, 'id'>): Promise<CertificateData> {
    const certificateId = uuidv4();
    const certificate: CertificateData = {
      ...data,
      id: certificateId,
    };

    await this.db.execute('INSERT', 'certificates', certificate);
    return certificate;
  }

  async validateCertificate(certificateId: string): Promise<CertificateData | null> {
    const certificates = await this.db.query('certificates', { id: certificateId });
    return certificates[0] || null;
  }

  async getStudentCertificates(studentId: string): Promise<CertificateData[]> {
    return await this.db.query('certificates', { studentId });
  }

  async getCourseCertificates(courseId: string): Promise<CertificateData[]> {
    return await this.db.query('certificates', { courseId });
  }
}

export default CertificateService; 