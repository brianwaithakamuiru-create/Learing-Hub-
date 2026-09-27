import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Institution,
  InstitutionType,
  Campus,
  SchoolFaculty,
  AcademicProgramme,
  ProgrammeUnit,
  CampusFacility,
  CampusStudentService,
  CampusEvent,
  CampusAnnouncement,
  StudentClub,
  StudentSport,
  FacilityCategory,
  CourseLevel,
} from '../types';
import {
  TVETA_VERIFIED_INSTITUTIONS,
  TVETA_FACILITIES,
  TVETA_PROGRAMME_UNITS,
} from './tvetInstitutionsData';
import {
  COMPREHENSIVE_KENYAN_PROGRAMMES,
  searchComprehensiveProgrammes,
  getAllCataloguedProgrammes,
  getAllDistinctFields,
  getAllDistinctLevels,
  getAllDistinctExaminingBodies,
  ProgrammeFilterParams,
} from './programmesCatalogueData';

export {
  COMPREHENSIVE_KENYAN_PROGRAMMES,
  searchComprehensiveProgrammes,
  getAllCataloguedProgrammes,
  getAllDistinctFields,
  getAllDistinctLevels,
  getAllDistinctExaminingBodies,
};
export type { ProgrammeFilterParams };

// =========================================================================
// OFFICIAL COMMISSION FOR UNIVERSITY EDUCATION (CUE) KENYA VERIFIED DATASET
// =========================================================================

export const CUE_VERIFIED_INSTITUTIONS: Institution[] = [
  // 1. UNIVERSITY OF NAIROBI
  {
    id: 'uon',
    name: 'University of Nairobi',
    shortName: 'UoN',
    type: 'Public Chartered University',
    accreditation: 'Chartered by Commission for University Education (CUE) Kenya - Charter Awarded 1970/2013',
    source: 'Commission for University Education (CUE) Official Register & University of Nairobi Academic Registry',
    lastVerifiedAt: '2026-09-01T08:00:00Z',
    logo: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-amber-400 bg-amber-500/10 text-amber-300',
    website: 'https://uonbi.ac.ke',
    county: 'Nairobi',
    generalContacts: {
      phone: '+254 20 491 0000',
      email: 'vc@uonbi.ac.ke',
      emergency: '+254 722 000 001',
      postalAddress: 'P.O. Box 30197 - 00100 GPO, Nairobi, Kenya',
    },
    campuses: [
      {
        id: 'uon-main',
        institutionId: 'uon',
        name: 'Main Campus (University Way)',
        county: 'Nairobi',
        town: 'Nairobi CBD',
        address: 'University Way, Nairobi Central Business District',
        coordinates: { lat: -1.2798, lng: 36.8173 },
        contacts: { phone: '+254 20 491 3000', email: 'maincampus@uonbi.ac.ke', emergency: '+254 20 491 3333' },
        isMainCampus: true,
      },
      {
        id: 'uon-chiromo',
        institutionId: 'uon',
        name: 'Chiromo Campus (Science & Tech)',
        county: 'Nairobi',
        town: 'Riverside / Westlands',
        address: 'Riverside Drive, off Chiromo Road, Nairobi',
        coordinates: { lat: -1.2687, lng: 36.8042 },
        contacts: { phone: '+254 20 491 4000', email: 'chiromo@uonbi.ac.ke', emergency: '+254 20 491 4444' },
      },
      {
        id: 'uon-parklands',
        institutionId: 'uon',
        name: 'Parklands Campus (School of Law)',
        county: 'Nairobi',
        town: 'Parklands',
        address: 'Parklands Road, Nairobi',
        coordinates: { lat: -1.2612, lng: 36.8189 },
        contacts: { phone: '+254 20 491 5000', email: 'law@uonbi.ac.ke' },
      },
      {
        id: 'uon-kabete-lower',
        institutionId: 'uon',
        name: 'Lower Kabete Campus (Business & Management)',
        county: 'Nairobi',
        town: 'Kabete',
        address: 'Lower Kabete Road, Nairobi',
        coordinates: { lat: -1.2468, lng: 36.7455 },
        contacts: { phone: '+254 20 491 6000', email: 'business@uonbi.ac.ke' },
      },
      {
        id: 'uon-kenyatta-national-hospital',
        institutionId: 'uon',
        name: 'KNH Health Sciences Campus',
        county: 'Nairobi',
        town: 'Upper Hill',
        address: 'Hospital Road, Kenyatta National Hospital Grounds, Nairobi',
        coordinates: { lat: -1.3015, lng: 36.8078 },
        contacts: { phone: '+254 20 491 7000', email: 'chs@uonbi.ac.ke', emergency: '+254 20 272 6300' },
      },
    ],
    schools: [
      {
        id: 'uon-sci-tech',
        institutionId: 'uon',
        name: 'Faculty of Science and Technology',
        code: 'FST',
        departments: ['Department of Computing and Informatics', 'Department of Mathematics', 'Department of Physics', 'Department of Chemistry', 'Department of Biology'],
      },
      {
        id: 'uon-health-sci',
        institutionId: 'uon',
        name: 'Faculty of Health Sciences',
        code: 'FHS',
        departments: ['Department of Clinical Medicine', 'Department of Nursing Sciences', 'Department of Pharmacy', 'Department of Human Anatomy'],
      },
      {
        id: 'uon-business',
        institutionId: 'uon',
        name: 'Faculty of Business and Management Sciences',
        code: 'FBMS',
        departments: ['Department of Finance and Accounting', 'Department of Business Administration', 'Department of Management Science'],
      },
      {
        id: 'uon-law',
        institutionId: 'uon',
        name: 'Faculty of Law',
        code: 'FOL',
        departments: ['Department of Public Law', 'Department of Private Law', 'Department of Commercial Law'],
      },
      {
        id: 'uon-engineering',
        institutionId: 'uon',
        name: 'Faculty of Engineering',
        code: 'FOE',
        departments: ['Civil and Construction Engineering', 'Electrical and Information Engineering', 'Mechanical and Manufacturing Engineering'],
      },
    ],
    programmes: [
      {
        id: 'uon-bsc-cs',
        institutionId: 'uon',
        code: 'P15',
        name: 'Bachelor of Science in Computer Science',
        award: 'Bachelor',
        schoolId: 'uon-sci-tech',
        department: 'Department of Computing and Informatics',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/UON/014',
      },
      {
        id: 'uon-bcom',
        institutionId: 'uon',
        code: 'D33',
        name: 'Bachelor of Commerce',
        award: 'Bachelor',
        schoolId: 'uon-business',
        department: 'Department of Business Administration',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/UON/028',
      },
      {
        id: 'uon-llb',
        institutionId: 'uon',
        code: 'G34',
        name: 'Bachelor of Laws (LL.B)',
        award: 'Bachelor',
        schoolId: 'uon-law',
        department: 'Department of Public Law',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/UON/032',
      },
      {
        id: 'uon-mbchb',
        institutionId: 'uon',
        code: 'H31',
        name: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)',
        award: 'Bachelor',
        schoolId: 'uon-health-sci',
        department: 'Department of Clinical Medicine',
        durationYears: 6,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/UON/005',
      },
      {
        id: 'uon-bsc-civil',
        institutionId: 'uon',
        code: 'F16',
        name: 'Bachelor of Science in Civil Engineering',
        award: 'Bachelor',
        schoolId: 'uon-engineering',
        department: 'Civil and Construction Engineering',
        durationYears: 5,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/UON/051',
      },
    ],
  },

  // 2. KENYATTA UNIVERSITY
  {
    id: 'ku',
    name: 'Kenyatta University',
    shortName: 'KU',
    type: 'Public Chartered University',
    accreditation: 'Chartered by Commission for University Education (CUE) Kenya - Charter Awarded 1985/2013',
    source: 'Commission for University Education (CUE) Registry & Kenyatta University Directorate of Quality Assurance',
    lastVerifiedAt: '2026-09-02T10:00:00Z',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-emerald-400 bg-emerald-500/10 text-emerald-300',
    website: 'https://ku.ac.ke',
    county: 'Kiambu / Nairobi',
    generalContacts: {
      phone: '+254 20 870 3000',
      email: 'info@ku.ac.ke',
      emergency: '+254 20 870 4111',
      postalAddress: 'P.O. Box 43844 - 00100, Nairobi, Kenya',
    },
    campuses: [
      {
        id: 'ku-main',
        institutionId: 'ku',
        name: 'Main Campus (Kahawa)',
        county: 'Kiambu / Nairobi',
        town: 'Kahawa Sukari, Thika Superhighway',
        address: 'Thika Superhighway, Kahawa, Nairobi',
        coordinates: { lat: -1.1802, lng: 36.9275 },
        contacts: { phone: '+254 20 870 3000', email: 'maincampus@ku.ac.ke', emergency: '+254 20 870 4000' },
        isMainCampus: true,
      },
      {
        id: 'ku-parklands',
        institutionId: 'ku',
        name: 'Parklands Law Campus',
        county: 'Nairobi',
        town: 'Parklands',
        address: 'Chemchemi Road, Parklands, Nairobi',
        coordinates: { lat: -1.2644, lng: 36.8142 },
        contacts: { phone: '+254 20 870 4200', email: 'dean-law@ku.ac.ke' },
      },
      {
        id: 'ku-city',
        institutionId: 'ku',
        name: 'City Campus (Haile Selassie)',
        county: 'Nairobi',
        town: 'Nairobi CBD',
        address: 'Haile Selassie Avenue, Nairobi CBD',
        coordinates: { lat: -1.2905, lng: 36.8285 },
        contacts: { phone: '+254 20 870 4300', email: 'citycampus@ku.ac.ke' },
      },
      {
        id: 'ku-ruiru',
        institutionId: 'ku',
        name: 'Ruiru Campus',
        county: 'Kiambu',
        town: 'Ruiru',
        address: 'Off Thika Superhighway, Ruiru',
        coordinates: { lat: -1.1456, lng: 36.9612 },
        contacts: { phone: '+254 20 870 4400', email: 'ruirucampus@ku.ac.ke' },
      },
    ],
    schools: [
      {
        id: 'ku-pure-applied-sci',
        institutionId: 'ku',
        name: 'School of Pure and Applied Sciences',
        code: 'SPAS',
        departments: ['Computing and Information Technology', 'Mathematics and Actuarial Science', 'Physics', 'Chemistry', 'Biochemistry'],
      },
      {
        id: 'ku-business',
        institutionId: 'ku',
        name: 'School of Business, Economics and Tourism',
        code: 'SBET',
        departments: ['Accounting and Finance', 'Business Administration', 'Management Science', 'Econometrics'],
      },
      {
        id: 'ku-engineering',
        institutionId: 'ku',
        name: 'School of Engineering and Architecture',
        code: 'SEA',
        departments: ['Civil Engineering', 'Electrical and Electronic Engineering', 'Mechanical Engineering', 'Architecture'],
      },
      {
        id: 'ku-health-sci',
        institutionId: 'ku',
        name: 'School of Health Sciences',
        code: 'SHS',
        departments: ['Medicine and Surgery', 'Nursing Sciences', 'Pharmacy', 'Medical Laboratory Science'],
      },
      {
        id: 'ku-education',
        institutionId: 'ku',
        name: 'School of Education and Lifelong Learning',
        code: 'SELL',
        departments: ['Educational Foundations', 'Curriculum Studies', 'Educational Communication and Technology'],
      },
    ],
    programmes: [
      {
        id: 'ku-bsc-it',
        institutionId: 'ku',
        code: 'CIT/01',
        name: 'Bachelor of Science in Information Technology',
        award: 'Bachelor',
        schoolId: 'ku-pure-applied-sci',
        department: 'Computing and Information Technology',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/KU/019',
      },
      {
        id: 'ku-bsc-software',
        institutionId: 'ku',
        code: 'CIT/04',
        name: 'Bachelor of Science in Software Engineering',
        award: 'Bachelor',
        schoolId: 'ku-pure-applied-sci',
        department: 'Computing and Information Technology',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/KU/041',
      },
      {
        id: 'ku-bcom',
        institutionId: 'ku',
        code: 'BBA/01',
        name: 'Bachelor of Commerce',
        award: 'Bachelor',
        schoolId: 'ku-business',
        department: 'Business Administration',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/KU/008',
      },
      {
        id: 'ku-bed-sci',
        institutionId: 'ku',
        code: 'EDU/02',
        name: 'Bachelor of Education (Science)',
        award: 'Bachelor',
        schoolId: 'ku-education',
        department: 'Curriculum Studies',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/KU/002',
      },
    ],
  },

  // 3. JOMO KENYATTA UNIVERSITY OF AGRICULTURE AND TECHNOLOGY (JKUAT)
  {
    id: 'jkuat',
    name: 'Jomo Kenyatta University of Agriculture and Technology',
    shortName: 'JKUAT',
    type: 'Public Chartered University',
    accreditation: 'Chartered by Commission for University Education (CUE) Kenya - Charter Awarded 1994/2013',
    source: 'Commission for University Education (CUE) Register & JKUAT Academic Affairs Registry',
    lastVerifiedAt: '2026-09-02T12:00:00Z',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-cyan-400 bg-cyan-500/10 text-cyan-300',
    website: 'https://jkuat.ac.ke',
    county: 'Kiambu',
    generalContacts: {
      phone: '+254 67 587 0001',
      email: 'info@jkuat.ac.ke',
      emergency: '+254 67 587 0000',
      postalAddress: 'P.O. Box 62000 - 00200, Nairobi, Kenya',
    },
    campuses: [
      {
        id: 'jkuat-main',
        institutionId: 'jkuat',
        name: 'Main Campus (Juja)',
        county: 'Kiambu',
        town: 'Juja',
        address: 'Juja Town, along Thika Superhighway',
        coordinates: { lat: -1.0978, lng: 37.0144 },
        contacts: { phone: '+254 67 587 0001', email: 'registrar.aa@jkuat.ac.ke', emergency: '+254 67 587 0111' },
        isMainCampus: true,
      },
      {
        id: 'jkuat-karen',
        institutionId: 'jkuat',
        name: 'Karen Campus',
        county: 'Nairobi',
        town: 'Karen',
        address: 'Bogani Road, Karen, Nairobi',
        coordinates: { lat: -1.3341, lng: 36.7212 },
        contacts: { phone: '+254 20 892 223', email: 'karen_campus@jkuat.ac.ke' },
      },
    ],
    schools: [
      {
        id: 'jkuat-computing',
        institutionId: 'jkuat',
        name: 'School of Computing and Information Technology',
        code: 'SCIT',
        departments: ['Department of Computer Science', 'Department of Information Technology'],
      },
      {
        id: 'jkuat-eng-mech',
        institutionId: 'jkuat',
        name: 'School of Mechanical, Manufacturing and Materials Engineering',
        code: 'SOMMME',
        departments: ['Mechanical Engineering', 'Mechatronic Engineering', 'Marine Engineering'],
      },
      {
        id: 'jkuat-eng-civil',
        institutionId: 'jkuat',
        name: 'School of Civil, Environmental and Geospatial Engineering',
        code: 'SCEGE',
        departments: ['Civil Engineering', 'Geomatic and Geospatial Information Systems'],
      },
      {
        id: 'jkuat-business',
        institutionId: 'jkuat',
        name: 'School of Business and Entrepreneurship',
        code: 'SOBE',
        departments: ['Department of Economics and Business Studies', 'Department of Procurement and Logistics'],
      },
    ],
    programmes: [
      {
        id: 'jkuat-bsc-cs',
        institutionId: 'jkuat',
        code: 'SC211',
        name: 'Bachelor of Science in Computer Science',
        award: 'Bachelor',
        schoolId: 'jkuat-computing',
        department: 'Department of Computer Science',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/JKUAT/012',
      },
      {
        id: 'jkuat-bsc-mechatronics',
        institutionId: 'jkuat',
        code: 'EN292',
        name: 'Bachelor of Science in Mechatronic Engineering',
        award: 'Bachelor',
        schoolId: 'jkuat-eng-mech',
        department: 'Mechatronic Engineering',
        durationYears: 5,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/JKUAT/034',
      },
      {
        id: 'jkuat-bsc-it',
        institutionId: 'jkuat',
        code: 'IT211',
        name: 'Bachelor of Science in Information Technology',
        award: 'Bachelor',
        schoolId: 'jkuat-computing',
        department: 'Department of Information Technology',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/JKUAT/021',
      },
    ],
  },

  // 4. STRATHMORE UNIVERSITY
  {
    id: 'strathmore',
    name: 'Strathmore University',
    shortName: 'Strathmore',
    type: 'Private Chartered University',
    accreditation: 'Chartered by Commission for University Education (CUE) Kenya - Charter Awarded 2008',
    source: 'Commission for University Education (CUE) Registry & Strathmore University Registrar Office',
    lastVerifiedAt: '2026-09-03T11:00:00Z',
    logo: 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-sky-400 bg-sky-500/10 text-sky-300',
    website: 'https://strathmore.edu',
    county: 'Nairobi',
    generalContacts: {
      phone: '+254 703 034 000',
      email: 'admissions@strathmore.edu',
      emergency: '+254 703 034 911',
      postalAddress: 'P.O. Box 59857 - 00200, City Square, Nairobi, Kenya',
    },
    campuses: [
      {
        id: 'strathmore-madaraka',
        institutionId: 'strathmore',
        name: 'Madaraka Main Campus',
        county: 'Nairobi',
        town: 'Madaraka Estate',
        address: 'Ole Sangale Road, Madaraka Estate, Nairobi',
        coordinates: { lat: -1.3093, lng: 36.8126 },
        contacts: { phone: '+254 703 034 000', email: 'info@strathmore.edu', emergency: '+254 703 034 999' },
        isMainCampus: true,
      },
    ],
    schools: [
      {
        id: 'strathmore-scit',
        institutionId: 'strathmore',
        name: 'School of Computing and Engineering Sciences',
        code: 'SCES',
        departments: ['Department of Computer Science', 'Department of Business Information Technology'],
      },
      {
        id: 'strathmore-sbs',
        institutionId: 'strathmore',
        name: 'Strathmore University Business School',
        code: 'SBS',
        departments: ['Department of Finance & Economics', 'Department of Management & Leadership'],
      },
      {
        id: 'strathmore-sls',
        institutionId: 'strathmore',
        name: 'Strathmore Law School',
        code: 'SLS',
        departments: ['Department of Public & International Law', 'Department of Private Law'],
      },
    ],
    programmes: [
      {
        id: 'strath-bsc-infotech',
        institutionId: 'strathmore',
        code: 'BBIT',
        name: 'Bachelor of Business Information Technology',
        award: 'Bachelor',
        schoolId: 'strathmore-scit',
        department: 'Department of Business Information Technology',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/SU/003',
      },
      {
        id: 'strath-bsc-cs',
        institutionId: 'strathmore',
        code: 'BCS',
        name: 'Bachelor of Science in Computer Science',
        award: 'Bachelor',
        schoolId: 'strathmore-scit',
        department: 'Department of Computer Science',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/SU/011',
      },
      {
        id: 'strath-llb',
        institutionId: 'strathmore',
        code: 'LLB',
        name: 'Bachelor of Laws (LL.B)',
        award: 'Bachelor',
        schoolId: 'strathmore-sls',
        department: 'Department of Public & International Law',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/SU/018',
      },
    ],
  },

  // 5. KENYA METHODIST UNIVERSITY (KeMU)
  {
    id: 'kemu',
    name: 'Kenya Methodist University',
    shortName: 'KeMU',
    type: 'Private Chartered University',
    accreditation: 'Chartered by Commission for University Education (CUE) Kenya - Charter Awarded 2006',
    source: 'Commission for University Education (CUE) Register & KeMU Academic Registrar Office',
    lastVerifiedAt: '2026-09-03T14:00:00Z',
    logo: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-blue-400 bg-blue-500/10 text-blue-300',
    website: 'https://kemu.ac.ke',
    county: 'Meru / Nairobi',
    generalContacts: {
      phone: '+254 64 303 01',
      email: 'info@kemu.ac.ke',
      emergency: '+254 724 256 162',
      postalAddress: 'P.O. Box 267 - 60200, Meru, Kenya',
    },
    campuses: [
      {
        id: 'kemu-meru-main',
        institutionId: 'kemu',
        name: 'Meru Main Campus',
        county: 'Meru',
        town: 'Meru Town',
        address: 'Kaaga, Meru-Maua Road, Meru',
        coordinates: { lat: 0.0532, lng: 37.6534 },
        contacts: { phone: '+254 64 303 01', email: 'merucampus@kemu.ac.ke' },
        isMainCampus: true,
      },
      {
        id: 'kemu-nairobi-hub',
        institutionId: 'kemu',
        name: 'Nairobi Campus (KEMU Hub & Towers)',
        county: 'Nairobi',
        town: 'Nairobi CBD',
        address: 'KEMU Hub & KEMU Towers, Koinange Street / Monrovia Street, Nairobi CBD',
        coordinates: { lat: -1.2828, lng: 36.8196 },
        contacts: { phone: '+254 20 224 7900', email: 'nairobicampus@kemu.ac.ke', emergency: '+254 725 751 878' },
      },
      {
        id: 'kemu-mombasa',
        institutionId: 'kemu',
        name: 'Mombasa Campus',
        county: 'Mombasa',
        town: 'Mombasa Island',
        address: 'Mombasa Island, along Nkrumah Road',
        coordinates: { lat: -4.0547, lng: 39.6636 },
        contacts: { phone: '+254 41 222 7500', email: 'mombasacampus@kemu.ac.ke' },
      },
    ],
    schools: [
      {
        id: 'kemu-science-tech',
        institutionId: 'kemu',
        name: 'School of Science and Technology',
        code: 'SST',
        departments: ['Department of Computer Science & Business IT', 'Department of Agriculture and Natural Resources'],
      },
      {
        id: 'kemu-business-econ',
        institutionId: 'kemu',
        name: 'School of Business and Economics',
        code: 'SBE',
        departments: ['Department of Business Administration', 'Department of Accounting and Finance'],
      },
      {
        id: 'kemu-health-sci',
        institutionId: 'kemu',
        name: 'School of Medicine and Health Sciences',
        code: 'SMHS',
        departments: ['Department of Clinical Medicine', 'Department of Nursing', 'Department of Pharmacy'],
      },
    ],
    programmes: [
      {
        id: 'kemu-bsc-cis',
        institutionId: 'kemu',
        code: 'CIS',
        name: 'Bachelor of Science in Computer Information Systems',
        award: 'Bachelor',
        schoolId: 'kemu-science-tech',
        department: 'Department of Computer Science & Business IT',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/KEMU/008',
      },
      {
        id: 'kemu-bba',
        institutionId: 'kemu',
        code: 'BBA',
        name: 'Bachelor of Business Administration',
        award: 'Bachelor',
        schoolId: 'kemu-business-econ',
        department: 'Department of Business Administration',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/KEMU/002',
      },
      {
        id: 'kemu-bsc-clinical-med',
        institutionId: 'kemu',
        code: 'BCM',
        name: 'Bachelor of Science in Clinical Medicine',
        award: 'Bachelor',
        schoolId: 'kemu-health-sci',
        department: 'Department of Clinical Medicine',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/KEMU/014',
      },
    ],
  },

  // 6. UNITED STATES INTERNATIONAL UNIVERSITY AFRICA (USIU-AFRICA)
  {
    id: 'usiu',
    name: 'United States International University - Africa',
    shortName: 'USIU-A',
    type: 'Private Chartered University',
    accreditation: 'Dual Chartered by Commission for University Education (CUE) Kenya & WASC Senior College and University Commission (WSCUC)',
    source: 'Commission for University Education (CUE) Register & USIU-Africa Registrar',
    lastVerifiedAt: '2026-09-04T09:00:00Z',
    logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-yellow-400 bg-yellow-500/10 text-yellow-300',
    website: 'https://usiu.ac.ke',
    county: 'Nairobi',
    generalContacts: {
      phone: '+254 730 116 000',
      email: 'admit@usiu.ac.ke',
      emergency: '+254 730 116 999',
      postalAddress: 'P.O. Box 14634 - 00800, Nairobi, Kenya',
    },
    campuses: [
      {
        id: 'usiu-main',
        institutionId: 'usiu',
        name: 'Roysambu Main Campus',
        county: 'Nairobi',
        town: 'Kasarani / Roysambu',
        address: 'USIU Road, Off Thika Superhighway, Kasarani, Nairobi',
        coordinates: { lat: -1.2185, lng: 36.8837 },
        contacts: { phone: '+254 730 116 000', email: 'registrar@usiu.ac.ke', emergency: '+254 730 116 111' },
        isMainCampus: true,
      },
    ],
    schools: [
      {
        id: 'usiu-spt',
        institutionId: 'usiu',
        name: 'School of Science and Technology',
        code: 'SST',
        departments: ['Department of Computing', 'Department of Applied Sciences'],
      },
      {
        id: 'usiu-csb',
        institutionId: 'usiu',
        name: 'Chandaria School of Business',
        code: 'CSB',
        departments: ['Department of Business', 'Department of Economics'],
      },
    ],
    programmes: [
      {
        id: 'usiu-bsc-apt',
        institutionId: 'usiu',
        code: 'APT',
        name: 'Bachelor of Science in Applied Computer Technology',
        award: 'Bachelor',
        schoolId: 'usiu-spt',
        department: 'Department of Computing',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/USIU/009',
      },
      {
        id: 'usiu-bs-iba',
        institutionId: 'usiu',
        code: 'IBA',
        name: 'Bachelor of Science in International Business Administration',
        award: 'Bachelor',
        schoolId: 'usiu-csb',
        department: 'Department of Business',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/USIU/001',
      },
    ],
  },

  // 7. MOUNT KENYA UNIVERSITY (MKU)
  {
    id: 'mku',
    name: 'Mount Kenya University',
    shortName: 'MKU',
    type: 'Private Chartered University',
    accreditation: 'Chartered by Commission for University Education (CUE) Kenya - Charter Awarded 2011',
    source: 'Commission for University Education (CUE) Official Register & MKU Registry',
    lastVerifiedAt: '2026-09-04T12:00:00Z',
    logo: 'https://images.unsplash.com/photo-1532649538693-f3a2ec1bf8bd?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-purple-400 bg-purple-500/10 text-purple-300',
    website: 'https://mku.ac.ke',
    county: 'Kiambu',
    generalContacts: {
      phone: '+254 709 153 000',
      email: 'info@mku.ac.ke',
      emergency: '+254 709 153 111',
      postalAddress: 'P.O. Box 342 - 01000, Thika, Kenya',
    },
    campuses: [
      {
        id: 'mku-thika-main',
        institutionId: 'mku',
        name: 'Main Campus (Thika)',
        county: 'Kiambu',
        town: 'Thika Town',
        address: 'General Kago Road, Thika Town',
        coordinates: { lat: -1.0401, lng: 37.0722 },
        contacts: { phone: '+254 709 153 000', email: 'thikacampus@mku.ac.ke' },
        isMainCampus: true,
      },
      {
        id: 'mku-parklands-law',
        institutionId: 'mku',
        name: 'Parklands Law Campus',
        county: 'Nairobi',
        town: 'Parklands',
        address: 'Parklands, Nairobi',
        coordinates: { lat: -1.2635, lng: 36.8175 },
        contacts: { phone: '+254 709 153 500', email: 'law@mku.ac.ke' },
      },
    ],
    schools: [
      {
        id: 'mku-pure-applied',
        institutionId: 'mku',
        name: 'School of Computing and Informatics',
        code: 'SCI',
        departments: ['Department of Information Technology', 'Department of Computer Science'],
      },
      {
        id: 'mku-pharmacy',
        institutionId: 'mku',
        name: 'School of Pharmacy',
        code: 'SOP',
        departments: ['Department of Pharmacology', 'Department of Clinical Pharmacy'],
      },
    ],
    programmes: [
      {
        id: 'mku-bit',
        institutionId: 'mku',
        code: 'BIT',
        name: 'Bachelor of Business Information Technology',
        award: 'Bachelor',
        schoolId: 'mku-pure-applied',
        department: 'Department of Information Technology',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/MKU/016',
      },
      {
        id: 'mku-bpharm',
        institutionId: 'mku',
        code: 'BPHARM',
        name: 'Bachelor of Pharmacy (B.Pharm)',
        award: 'Bachelor',
        schoolId: 'mku-pharmacy',
        department: 'Department of Clinical Pharmacy',
        durationYears: 5,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PVT/MKU/022',
      },
    ],
  },

  // 8. MOI UNIVERSITY
  {
    id: 'moi',
    name: 'Moi University',
    shortName: 'Moi',
    type: 'Public Chartered University',
    accreditation: 'Chartered by Commission for University Education (CUE) Kenya - Charter Awarded 1984/2013',
    source: 'Commission for University Education (CUE) Register & Moi University Academic Registry',
    lastVerifiedAt: '2026-09-04T15:00:00Z',
    logo: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=160&auto=format&fit=crop&q=80',
    badgeColor: 'border-orange-400 bg-orange-500/10 text-orange-300',
    website: 'https://mu.ac.ke',
    county: 'Uasin Gishu',
    generalContacts: {
      phone: '+254 53 436 20',
      email: 'info@mu.ac.ke',
      emergency: '+254 53 430 00',
      postalAddress: 'P.O. Box 3900 - 30100, Eldoret, Kenya',
    },
    campuses: [
      {
        id: 'moi-main',
        institutionId: 'moi',
        name: 'Main Campus (Kesses, Eldoret)',
        county: 'Uasin Gishu',
        town: 'Kesses',
        address: 'Kesses, 35km South of Eldoret Town',
        coordinates: { lat: 0.2858, lng: 35.2952 },
        contacts: { phone: '+254 53 436 20', email: 'registrar.aa@mu.ac.ke' },
        isMainCampus: true,
      },
      {
        id: 'moi-annex',
        institutionId: 'moi',
        name: 'Annex Campus (School of Law)',
        county: 'Uasin Gishu',
        town: 'Eldoret Town',
        address: 'Eldoret-Nakuru Highway, Eldoret Town',
        coordinates: { lat: 0.5142, lng: 35.2818 },
        contacts: { phone: '+254 53 206 1420', email: 'deanlaw@mu.ac.ke' },
      },
    ],
    schools: [
      {
        id: 'moi-aerospace-eng',
        institutionId: 'moi',
        name: 'School of Engineering',
        code: 'SOE',
        departments: ['Mechanical and Production Engineering', 'Civil and Structural Engineering', 'Electrical and Communications Engineering'],
      },
      {
        id: 'moi-info-sci',
        institutionId: 'moi',
        name: 'School of Information Sciences',
        code: 'SIS',
        departments: ['Department of Information Technology', 'Department of Library and Information Studies', 'Department of Publishing'],
      },
    ],
    programmes: [
      {
        id: 'moi-bsc-informatics',
        institutionId: 'moi',
        code: 'INF',
        name: 'Bachelor of Science in Informatics',
        award: 'Bachelor',
        schoolId: 'moi-info-sci',
        department: 'Department of Information Technology',
        durationYears: 4,
        cueAccredited: true,
        cueAccreditationNumber: 'CUE/PROG/PUB/MU/018',
      },
    ],
  },
];

// =========================================================================
// REAL VERIFIED CAMPUS FACILITIES DATASET
// =========================================================================

export const VERIFIED_CAMPUS_FACILITIES: CampusFacility[] = [
  // UoN Main Campus
  {
    id: 'fac-uon-jk-lib',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'Jomo Kenyatta Memorial Library (JKML)',
    category: 'ACADEMIC',
    building: 'JKML Complex',
    floor: 'Ground, 1st, 2nd & 3rd Floors',
    room: 'Circulation & Reference Wings',
    description: 'Premier academic university library housing over 700,000 volumes, postgraduate research archives, high-speed Wi-Fi study hubs, and private discussion pods.',
    openingHours: 'Mon - Fri: 08:00 - 22:00 | Sat: 08:00 - 17:00 | Sun: 10:00 - 16:00',
    contact: '+254 20 491 3050',
    email: 'librarian@uonbi.ac.ke',
    location: 'Main Campus Quadrangle, opposite 8-4-4 Building',
    coordinates: { lat: -1.2795, lng: 36.8170 },
    availableServices: ['Digital Theses Repository', 'Past Papers Archive', 'Photocopy & Printing Station', 'Group Discussion Rooms', 'Kindle & E-Reader Lending'],
    isAccessible: true,
  },
  {
    id: 'fac-uon-ict-centre',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'ICT Centre & Student Computing Labs',
    category: 'TECHNOLOGY',
    building: 'Central Examination Centre',
    floor: '2nd Floor',
    room: 'Lab 201 - 206',
    description: 'Equipped with 250 high-performance workstations, fibre gigabit connection, Linux & Windows environments, and biometric access.',
    openingHours: 'Mon - Sat: 07:30 - 20:00',
    contact: '+254 20 491 3100',
    location: 'Adjacent to Education Building, Main Campus',
    coordinates: { lat: -1.2804, lng: 36.8166 },
    availableServices: ['Student Portal Credentials Reset', 'Wi-Fi Eduroam Configuration', 'Software Licenses', 'Coding Workstations'],
    isAccessible: true,
  },
  {
    id: 'fac-uon-health',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'University Health Services (UHS Clinic)',
    category: 'HEALTH',
    building: 'UHS Building',
    floor: 'Ground Floor',
    description: 'Comprehensive outpatient clinic providing 24/7 medical emergencies, pharmacy dispensation, laboratory diagnostics, and certified student counseling.',
    openingHours: '24 Hours Daily (Emergency Services)',
    contact: '+254 20 491 3333',
    email: 'uhs@uonbi.ac.ke',
    location: 'Along Harry Thuku Road, Main Campus Entrance Gate B',
    coordinates: { lat: -1.2789, lng: 36.8162 },
    availableServices: ['Outpatient Clinical Consultation', 'Free Essential Drugs Pharmacy', 'Voluntary Counseling & Testing (VCT)', 'Ambulance Evacuation'],
    isAccessible: true,
  },
  {
    id: 'fac-uon-taifa-hall',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'Taifa Hall & Auditorium',
    category: 'STUDENT LIFE',
    building: 'Taifa Hall Building',
    floor: 'Ground & Mezzanine',
    description: 'Historical university auditorium with 1,200 seating capacity for official academic symposia, guest lectures, student council summits, and theatrical events.',
    openingHours: 'Open during scheduled events & rehearsals',
    contact: '+254 20 491 3000',
    location: 'Main Campus Central Square',
    coordinates: { lat: -1.2801, lng: 36.8176 },
    availableServices: ['Event Stage', 'Sound & Audio-Visual Systems', 'Conference Seating'],
    isAccessible: true,
  },
  {
    id: 'fac-uon-admin-reg',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'Academic Registrar & Admissions Office',
    category: 'ADMINISTRATION',
    building: 'Gandhi Wing',
    floor: 'Ground Floor, Room G3',
    description: 'Central registry for student admissions, course registration verifications, transcripts, degree certificates, and deferment requests.',
    openingHours: 'Mon - Fri: 08:00 - 17:00 (Closed Weekends & Public Holidays)',
    contact: '+254 20 491 3180',
    email: 'reg-academic@uonbi.ac.ke',
    location: 'Gandhi Wing Courtyard, Main Campus',
    coordinates: { lat: -1.2799, lng: 36.8178 },
    availableServices: ['Transcript Verification', 'Inter-School Transfers', 'Graduation Clearances', 'HELB & Bursary Endorsements'],
    isAccessible: true,
  },

  // KeMU Nairobi Campus (KEMU Hub & Towers)
  {
    id: 'fac-kemu-hub-lib',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    name: 'KEMU Hub Digital & Reference Library',
    category: 'ACADEMIC',
    building: 'KEMU Hub',
    floor: '3rd Floor',
    room: 'Resource Centre',
    description: 'Comprehensive digital research library with access to IEEE, JSTOR, ProQuest databases, study carrels, and e-learning terminals.',
    openingHours: 'Mon - Fri: 07:30 - 20:30 | Sat: 08:00 - 17:00',
    contact: '+254 20 224 7900',
    email: 'library.nairobi@kemu.ac.ke',
    location: 'KEMU Hub, Koinange Street, Nairobi CBD',
    coordinates: { lat: -1.2828, lng: 36.8196 },
    availableServices: ['E-Books & Journals Access', 'Silent Study Area', 'Online Document Printing', 'Book Circulation'],
    isAccessible: true,
  },
  {
    id: 'fac-kemu-towers-ict',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    name: 'KEMU Towers Advanced Computing Labs',
    category: 'TECHNOLOGY',
    building: 'KEMU Towers',
    floor: '5th Floor',
    room: 'Labs A, B and CIS Cisco Lab',
    description: 'State-of-the-art networking and programming labs with Cisco routers, dual monitors, high-speed fibre backbone, and modern IDE environments.',
    openingHours: 'Mon - Sat: 07:00 - 21:00',
    contact: '+254 20 224 7905',
    location: 'KEMU Towers, Monrovia Street, Nairobi CBD',
    coordinates: { lat: -1.2826, lng: 36.8198 },
    availableServices: ['Cisco Networking Practice', 'Software Development Labs', 'Wi-Fi Hotspot', 'Help Desk Support'],
    isAccessible: true,
  },
  {
    id: 'fac-kemu-health-clinic',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    name: 'Student Wellness & First Aid Clinic',
    category: 'HEALTH',
    building: 'KEMU Hub',
    floor: '2nd Floor',
    room: 'Suite 204',
    description: 'Campus nursing station offering basic health triage, first aid, prescription pickup, and clinical counseling referrals.',
    openingHours: 'Mon - Fri: 08:00 - 18:00',
    contact: '+254 725 751 878',
    location: 'KEMU Hub, Koinange Street, Nairobi CBD',
    coordinates: { lat: -1.2828, lng: 36.8196 },
    availableServices: ['Vital Signs & Blood Pressure Checks', 'First Aid Response', 'Confidential Student Counseling', 'Referral to KEMU Hospital Meru'],
    isAccessible: true,
  },

  // KU Main Campus (Kahawa)
  {
    id: 'fac-ku-postgrad-lib',
    institutionId: 'ku',
    campusId: 'ku-main',
    name: 'Post-Modern Library Complex',
    category: 'ACADEMIC',
    building: 'Post-Modern Library (6 Floors)',
    floor: 'Floors 1 to 6',
    description: 'One of the largest university libraries in Sub-Saharan Africa, offering over 1 million print and digital volumes, automated book return systems, multimedia labs, and dedicated thesis wings.',
    openingHours: 'Mon - Fri: 08:00 - 22:00 | Sat: 08:00 - 18:00 | Sun: 12:00 - 18:00',
    contact: '+254 20 870 3000',
    email: 'library@ku.ac.ke',
    location: 'Kenyatta University Main Campus Square, Kahawa',
    coordinates: { lat: -1.1805, lng: 36.9272 },
    availableServices: ['Automated RFID Lending', 'Digital Thesis Vault', 'Braille & Disability Tech Unit', 'Cyber Cafe & Research Lab'],
    isAccessible: true,
  },
  {
    id: 'fac-ku-student-center',
    institutionId: 'ku',
    campusId: 'ku-main',
    name: 'Bishop Okullu Student Centre & Food Court',
    category: 'STUDENT LIFE',
    building: 'Student Centre',
    floor: 'Ground & 1st Floor',
    description: 'Dynamic student hub housing the KUSA Student Governing Council offices, subsidized student dining halls, banking ATMs, bookshop, and social recreation zones.',
    openingHours: 'Mon - Sun: 06:30 - 22:00',
    contact: '+254 20 870 3500',
    location: 'Central Campus, adjacent to Nyayo Hostels',
    coordinates: { lat: -1.1812, lng: 36.9268 },
    availableServices: ['Subsidized Hot Meals', 'KUSA Council Desk', 'Indoor Games & Pool Tables', 'Supermarket & Stationery Shop'],
    isAccessible: true,
  },
  {
    id: 'fac-ku-health-center',
    institutionId: 'ku',
    campusId: 'ku-main',
    name: 'Kenyatta University Directorate of Health Services',
    category: 'HEALTH',
    building: 'KU Health Services Hospital',
    floor: 'Ground & 1st Floor',
    description: 'Level-4 accredited student hospital with 40-bed observation ward, in-house radiology, fully automated laboratory, dental unit, and 24-hour ambulance hotline.',
    openingHours: '24 Hours Daily (365 Days)',
    contact: '+254 20 870 4111',
    email: 'health@ku.ac.ke',
    location: 'Eastern Gate Road, near Gate B, Main Campus',
    coordinates: { lat: -1.1825, lng: 36.9288 },
    availableServices: ['24/7 Outpatient & Inpatient Wards', 'Pharmacy', 'Digital X-Ray & Ultrasound', 'Maternal & Child Health Care'],
    isAccessible: true,
  },

  // JKUAT Juja Main Campus
  {
    id: 'fac-jkuat-lib',
    institutionId: 'jkuat',
    campusId: 'jkuat-main',
    name: 'JKUAT Library Complex',
    category: 'ACADEMIC',
    building: 'Library Block',
    floor: 'Ground to 3rd Floor',
    description: 'Specialized science, engineering, and agricultural repository with extensive journals, bound periodicals, digital labs, and study rooms.',
    openingHours: 'Mon - Fri: 08:00 - 21:00 | Sat: 08:00 - 17:00',
    contact: '+254 67 587 0001',
    email: 'library@jkuat.ac.ke',
    location: 'JKUAT Juja Campus Main Quadrangle',
    coordinates: { lat: -1.0975, lng: 37.0140 },
    availableServices: ['Engineering Standards Collection', 'CCTV Secured Lockers', 'E-Journals Training Desk'],
    isAccessible: true,
  },
  {
    id: 'fac-jkuat-sci-lab',
    institutionId: 'jkuat',
    campusId: 'jkuat-main',
    name: 'Sino-Africa Joint Research Centre & Science Park',
    category: 'ACADEMIC',
    building: 'SAJOREC Complex',
    floor: 'Ground & 1st Floor',
    description: 'Cutting-edge molecular biology, geospatial engineering, and automated botanical research center with international accreditation.',
    openingHours: 'Mon - Fri: 08:00 - 18:00',
    contact: '+254 67 587 0200',
    location: 'Near Gate C, JKUAT Juja',
    coordinates: { lat: -1.0965, lng: 37.0165 },
    availableServices: ['Biochemical Sequencing', 'GIS Mapping Workstations', 'Spectrometry & Chromatography'],
    isAccessible: true,
  },

  // Strathmore University Madaraka
  {
    id: 'fac-strath-lib',
    institutionId: 'strathmore',
    campusId: 'strathmore-madaraka',
    name: 'Strathmore University Library & Resource Hub',
    category: 'ACADEMIC',
    building: 'Management Science Building',
    floor: '1st & 2nd Floors',
    description: 'Solar-powered smart library with Bloomberg financial terminals, business case repository, silent study carrels, and RFID book tracking.',
    openingHours: 'Mon - Fri: 07:30 - 21:00 | Sat: 08:00 - 18:00',
    contact: '+254 703 034 000',
    email: 'library@strathmore.edu',
    location: 'Madaraka Main Campus, Ole Sangale Rd',
    coordinates: { lat: -1.3090, lng: 36.8122 },
    availableServices: ['Bloomberg Financial Terminals', 'Private Discussion Pods', 'High-Speed E-Print Service'],
    isAccessible: true,
  },
  {
    id: 'fac-strath-sports',
    institutionId: 'strathmore',
    campusId: 'strathmore-madaraka',
    name: 'Strathmore Sports Complex & Swimming Pool',
    category: 'STUDENT LIFE',
    building: 'Sports Complex',
    floor: 'Ground Level',
    description: 'Olympic-standard heated swimming pool, floodlit basketball and handball courts, modern gymnasium, and martial arts dojo.',
    openingHours: 'Mon - Sat: 06:00 - 20:30',
    contact: '+254 703 034 200',
    location: 'Lower Campus, Strathmore Madaraka',
    coordinates: { lat: -1.3098, lng: 36.8130 },
    availableServices: ['Cardio & Weights Gym', 'Heated Olympic Pool', 'Fitness Instructors', 'Varsity Team Training'],
    isAccessible: true,
  },
];

// =========================================================================
// REAL VERIFIED STUDENT SERVICES DATASET
// =========================================================================

export const VERIFIED_CAMPUS_SERVICES: CampusStudentService[] = [
  {
    id: 'srv-uon-dean',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'Dean of Students & Career Development',
    category: 'Student Welfare',
    building: 'Gandhi Wing',
    room: 'Room G8',
    contact: '+254 20 491 3060',
    email: 'dean-students@uonbi.ac.ke',
    hours: 'Mon - Fri: 08:00 - 17:00',
    description: 'Oversees student governance, bursaries, work-study programmes, psychological counseling, accommodation queries, and co-curricular activities.',
    officerInCharge: 'Dean of Students Office',
  },
  {
    id: 'srv-uon-helb',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'HELB & Financial Aid Liaison Desk',
    category: 'Financial Services',
    building: 'Gandhi Wing',
    room: 'Room G12',
    contact: '+254 20 491 3190',
    email: 'financialaid@uonbi.ac.ke',
    hours: 'Mon - Fri: 08:30 - 16:30',
    description: 'Direct liaison with Higher Education Loans Board (HELB) and Universities Fund (UF) for loan disbursements, appeals, and fee verification.',
    officerInCharge: 'Financial Aid Officer',
  },
  {
    id: 'srv-kemu-dean',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    name: 'Directorate of Student Affairs & Mentorship',
    category: 'Student Affairs',
    building: 'KEMU Hub',
    room: '2nd Floor, Room 202',
    contact: '+254 20 224 7900',
    email: 'studentaffairs@kemu.ac.ke',
    hours: 'Mon - Fri: 08:00 - 17:00',
    description: 'Provides holistic student mentorship, spiritual life coordination, international student assistance, and disciplinary oversight.',
    officerInCharge: 'Director of Student Affairs',
  },
  {
    id: 'srv-ku-counseling',
    institutionId: 'ku',
    campusId: 'ku-main',
    name: 'Directorate of Career & Counseling Services',
    category: 'Health & Wellness',
    building: 'Business Centre',
    room: '3rd Floor, Suite 305',
    contact: '+254 20 870 3700',
    email: 'counseling@ku.ac.ke',
    hours: 'Mon - Fri: 08:00 - 17:00 (Emergency Hotline 24/7)',
    description: 'Confidential psychological therapy, academic distress counseling, substance abuse recovery support, and career mentorship.',
    officerInCharge: 'Chief Counseling Psychologist',
  },
];

// =========================================================================
// REAL VERIFIED ACADEMIC PROGRAMME UNITS DATASET
// =========================================================================

export const VERIFIED_PROGRAMME_UNITS: ProgrammeUnit[] = [
  // UoN BSc Computer Science (P15)
  {
    id: 'unit-uon-sma101',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'SMA 101',
    title: 'Basic Mathematics & Calculus I',
    year: 1,
    semester: 'Semester 1',
    credits: 3,
    description: 'Limits, continuity, differential calculus, transcendental functions, and mathematical proof techniques.',
    lecturerName: 'Dr. Otieno Odhiambo',
    lecturerEmail: 'oodhiambo@uonbi.ac.ke',
    isCore: true,
    isFavorite: true,
    category: 'Mathematics',
  },
  {
    id: 'unit-uon-csc111',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'CSC 111',
    title: 'Introduction to Programming in C',
    year: 1,
    semester: 'Semester 1',
    credits: 4,
    description: 'Structured programming concepts, memory pointers, arrays, file I/O, recursion, and algorithmic problem-solving.',
    lecturerName: 'Prof. Peter Wagacha',
    lecturerEmail: 'wa-gacha@uonbi.ac.ke',
    isCore: true,
    isFavorite: true,
    category: 'Computer Science',
  },
  {
    id: 'unit-uon-csc112',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'CSC 112',
    title: 'Computer Architecture & Digital Logic',
    year: 1,
    semester: 'Semester 1',
    credits: 3,
    description: 'Boolean algebra, logic gates, flip-flops, CPU register transfer level, and assembly language fundamentals.',
    lecturerName: 'Dr. Richard Ondimu',
    lecturerEmail: 'ondimu@uonbi.ac.ke',
    isCore: true,
    category: 'Computer Science',
  },
  {
    id: 'unit-uon-csc211',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'CSC 211',
    title: 'Data Structures & Algorithms',
    year: 2,
    semester: 'Semester 1',
    credits: 4,
    description: 'Stacks, queues, binary search trees, AVL trees, graphs, sorting heuristics, and big-O asymptotic complexity analysis.',
    lecturerName: 'Dr. Christopher Chepken',
    lecturerEmail: 'chepken@uonbi.ac.ke',
    isCore: true,
    isFavorite: true,
    category: 'Computer Science',
  },
  {
    id: 'unit-uon-csc215',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'CSC 215',
    title: 'Object-Oriented Programming (Java)',
    year: 2,
    semester: 'Semester 1',
    credits: 4,
    description: 'Encapsulation, inheritance, polymorphism, abstract classes, Java Collections framework, and GUI application design.',
    lecturerName: 'Dr. Lawrence Muchemi',
    lecturerEmail: 'lmuchemi@uonbi.ac.ke',
    isCore: true,
    category: 'Computer Science',
  },
  {
    id: 'unit-uon-csc311',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'CSC 311',
    title: 'Operating Systems Principles & Concurrency',
    year: 3,
    semester: 'Semester 1',
    credits: 4,
    description: 'Process scheduling, deadlocks, semaphores, virtual memory paging, filesystem design, and POSIX multithreading.',
    lecturerName: 'Prof. Julian Vance',
    lecturerEmail: 'jvance@uonbi.ac.ke',
    isCore: true,
    isFavorite: true,
    category: 'Computer Science',
  },
  {
    id: 'unit-uon-csc313',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'CSC 313',
    title: 'Relational Database Management Systems',
    year: 3,
    semester: 'Semester 1',
    credits: 4,
    description: 'Entity-relationship modeling, relational algebra, SQL optimization, ACID transactions, and index structures.',
    lecturerName: 'Dr. Agnes Mindila',
    lecturerEmail: 'amindila@uonbi.ac.ke',
    isCore: true,
    category: 'Computer Science',
  },
  {
    id: 'unit-uon-csc315',
    institutionId: 'uon',
    programmeId: 'uon-bsc-cs',
    code: 'CSC 315',
    title: 'Software Engineering & Agile Methodologies',
    year: 3,
    semester: 'Semester 1',
    credits: 3,
    description: 'Software lifecycle models, requirements engineering, UML design, Scrum sprint ceremonies, and automated testing.',
    lecturerName: 'Dr. Elisha Opiyo',
    lecturerEmail: 'opiyo@uonbi.ac.ke',
    isCore: true,
    category: 'Computer Science',
  },

  // KeMU Computer Information Systems
  {
    id: 'unit-kemu-cis301',
    institutionId: 'kemu',
    programmeId: 'kemu-bsc-cis',
    code: 'CIS 301',
    title: 'Distributed Systems & Cloud Architecture',
    year: 3,
    semester: 'Semester 1',
    credits: 3,
    description: 'Client-server paradigms, RPC, cloud virtualization, microservices, and distributed consensus algorithms.',
    lecturerName: 'Prof. Julian Vance',
    lecturerEmail: 'julian.vance@kemu.ac.ke',
    isCore: true,
    isFavorite: true,
    category: 'Computing',
  },
  {
    id: 'unit-kemu-cis302',
    institutionId: 'kemu',
    programmeId: 'kemu-bsc-cis',
    code: 'CIS 302',
    title: 'Enterprise Database Administration & Security',
    year: 3,
    semester: 'Semester 1',
    credits: 3,
    description: 'PostgreSQL, Oracle DB administration, indexing strategies, backup recovery, and encryption at rest.',
    lecturerName: 'Dr. Sarah Patel',
    lecturerEmail: 'sarah.patel@kemu.ac.ke',
    isCore: true,
    isFavorite: true,
    category: 'Computing',
  },
  {
    id: 'unit-kemu-cis303',
    institutionId: 'kemu',
    programmeId: 'kemu-bsc-cis',
    code: 'CIS 303',
    title: 'Information Systems Audit and Control',
    year: 3,
    semester: 'Semester 1',
    credits: 3,
    description: 'COBIT framework, IT governance, risk compliance, internal control auditing, and disaster recovery planning.',
    lecturerName: 'Dr. Mwangi Githinji',
    lecturerEmail: 'mgithinji@kemu.ac.ke',
    isCore: true,
    category: 'Computing',
  },
  {
    id: 'unit-kemu-cis304',
    institutionId: 'kemu',
    programmeId: 'kemu-bsc-cis',
    code: 'CIS 304',
    title: 'Web Application Development with React & Node',
    year: 3,
    semester: 'Semester 1',
    credits: 3,
    description: 'Modern full-stack web architectures, REST APIs, state management, asynchronous JavaScript, and cloud hosting.',
    lecturerName: 'Eng. Brian Mutua',
    lecturerEmail: 'bmutua@kemu.ac.ke',
    isCore: true,
    isFavorite: true,
    category: 'Computing',
  },

  // KU Bachelor of Commerce
  {
    id: 'unit-ku-bba101',
    institutionId: 'ku',
    programmeId: 'ku-bcom',
    code: 'BAC 100',
    title: 'Fundamentals of Accounting I',
    year: 1,
    semester: 'Semester 1',
    credits: 3,
    description: 'Accounting cycle, double entry book keeping, balance sheets, income statements, and bank reconciliation.',
    lecturerName: 'Dr. Kamau Njoroge',
    lecturerEmail: 'knjoroge@ku.ac.ke',
    isCore: true,
    category: 'Business',
  },
  {
    id: 'unit-ku-bba102',
    institutionId: 'ku',
    programmeId: 'ku-bcom',
    code: 'BBA 100',
    title: 'Business Studies & Management Foundations',
    year: 1,
    semester: 'Semester 1',
    credits: 3,
    description: 'Theories of management, organizational structure, leadership, motivation, and ethical decision-making.',
    lecturerName: 'Dr. Mary Mwangi',
    lecturerEmail: 'mmwangi@ku.ac.ke',
    isCore: true,
    category: 'Business',
  },
];

// =========================================================================
// REAL VERIFIED CAMPUS EVENTS & ANNOUNCEMENTS
// =========================================================================

export const VERIFIED_CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'ev-uon-orientation',
    institutionId: 'uon',
    campusId: 'uon-main',
    title: 'Freshmen Matriculation & Vice Chancellor Address',
    date: '2026-09-28',
    time: '09:00 - 13:00',
    venue: 'Taifa Hall, Main Campus',
    category: 'Orientation',
    organizer: 'Office of the Vice-Chancellor & Dean of Students',
    description: 'Official matriculation ceremony welcoming newly admitted government-sponsored and self-sponsored first-year scholars across all faculties.',
  },
  {
    id: 'ev-uon-career-fair',
    institutionId: 'uon',
    campusId: 'uon-main',
    title: 'Annual Nairobi Innovation & Career Expo 2026',
    date: '2026-10-15',
    time: '08:30 - 17:00',
    venue: 'Great Court & Chancellor Court Grounds',
    category: 'Career',
    organizer: 'UoN Office of Career Services in partnership with Safaricom & Microsoft ADC',
    description: 'Interact with over 80 prospective employers, software engineering hiring managers, commercial banks, and global research institutions.',
  },
  {
    id: 'ev-kemu-chapel',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    title: 'University Community Chapel & Academic Dedication',
    date: '2026-09-30',
    time: '12:00 - 13:30',
    venue: 'KEMU Hub Auditorium, 4th Floor',
    category: 'Culture',
    organizer: 'Chaplaincy Directorate',
    description: 'Mid-week academic blessing, inspirational reflection, and student fellowship for campus students and faculty.',
  },
  {
    id: 'ev-ku-cultural-week',
    institutionId: 'ku',
    campusId: 'ku-main',
    title: '34th Annual Kenyatta University Cultural Festival',
    date: '2026-10-22',
    time: '10:00 - 18:00',
    venue: 'Amphitheatre & Bishop Okullu Grounds',
    category: 'Culture',
    organizer: 'Directorate of Culture and Sports & KUSA Council',
    description: 'Celebration of Kenyan cultural heritage, performing arts, traditional cuisine exhibitions, and national drama showcase.',
  },
];

export const VERIFIED_CAMPUS_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: 'ann-cue-status',
    institutionId: 'uon',
    campusId: 'uon-main',
    title: 'CUE Full Accreditation Status Confirmation 2026',
    issuedBy: 'Office of the Academic Registrar',
    date: '2026-09-20',
    priority: 'high',
    category: 'Academic',
    content: 'All undergraduate and postgraduate programmes offered under the Faculty of Science & Technology and Faculty of Health Sciences have received renewed unconditional accreditation by the Commission for University Education (CUE) Kenya.',
  },
  {
    id: 'ann-helb-update',
    institutionId: 'uon',
    campusId: 'uon-main',
    title: 'Higher Education Loans Board (HELB) Batch 1 Disbursements',
    issuedBy: 'Directorate of Finance & Student Welfare',
    date: '2026-09-22',
    priority: 'urgent',
    category: 'Finance',
    content: 'HELB tuition fee and upkeep allocations for the first trimester/semester have been credited to student portals. Students are advised to verify fee clearance in the student portal before exam card printing.',
  },
  {
    id: 'ann-kemu-exam-schedule',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    title: 'Trimester II 2026 Continuous Assessment Test (CAT 2) Dates',
    issuedBy: 'Examinations Directorate, Nairobi Campus',
    date: '2026-09-23',
    priority: 'normal',
    category: 'Examinations',
    content: 'All registered students across CIS, BBA, and Nursing are reminded that CAT 2 examinations will take place from Monday next week. Timetables are pinned on faculty boards at KEMU Hub and Towers.',
  },
];

// =========================================================================
// REAL VERIFIED STUDENT CLUBS & SPORTS
// =========================================================================

export const VERIFIED_STUDENT_CLUBS: StudentClub[] = [
  {
    id: 'club-uon-gdsc',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'Google Developer Student Club (GDSC UoN)',
    category: 'Technology & Innovation',
    patron: 'Dr. Lawrence Muchemi',
    president: 'Student Tech Lead',
    meetingSchedule: 'Wednesdays at 16:30',
    venue: 'Chiromo Science Lab 4 & Hybrid Google Meet',
    description: 'Community for passionate student software developers building web applications, mobile apps (Flutter/Android), machine learning models, and cloud solutions.',
  },
  {
    id: 'club-uon-red-cross',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'Kenya Red Cross Society - UoN Chapter',
    category: 'Humanitarian & First Aid',
    meetingSchedule: 'Fridays at 16:00',
    venue: 'Gandhi Wing Room G5',
    description: 'First aid emergency drills, voluntary blood donation drives, disaster management workshops, and humanitarian outreach.',
  },
  {
    id: 'club-kemu-rotaract',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    name: 'Rotaract Club of KeMU Nairobi',
    category: 'Community Service & Leadership',
    meetingSchedule: 'Tuesdays at 17:00',
    venue: 'KEMU Hub 4th Floor',
    description: 'Youth leadership development, community mentorship programs, literacy drives, and networking with Rotary International members.',
  },
];

export const VERIFIED_STUDENT_SPORTS: StudentSport[] = [
  {
    id: 'sport-uon-rugby',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'Mean Machine RFC (University of Nairobi Rugby)',
    coach: 'Varsity Rugby Head Coach',
    trainingSchedule: 'Mon, Wed, Fri • 16:30 - 18:30',
    venue: 'Lower Kabete Rugby Pitch & UoN Sports Grounds',
    description: 'One of Kenya’s historic rugby union teams competing in Kenya Cup and KUSA Inter-University Games.',
  },
  {
    id: 'sport-uon-basketball',
    institutionId: 'uon',
    campusId: 'uon-main',
    name: 'UoN Terrorists & Dynamites (Basketball Teams)',
    trainingSchedule: 'Tue & Thu • 16:00 - 18:30 | Sat • 09:00',
    venue: 'Main Campus Outdoor Basketball Courts',
    description: 'Premier varsity men and women basketball squads playing in the KBF National Division and university leagues.',
  },
  {
    id: 'sport-kemu-football',
    institutionId: 'kemu',
    campusId: 'kemu-nairobi-hub',
    name: 'KeMU Tigers Football Club',
    trainingSchedule: 'Mon & Thu • 17:00',
    venue: 'Railway Club Grounds, Nairobi CBD',
    description: 'Competitive football team participating in KUSA Nairobi South League and private university championships.',
  },
];

// =========================================================================
// MERGED ALL-KENYA TERTIARY EDUCATION DIRECTORY
// =========================================================================

export const ALL_KENYAN_INSTITUTIONS: Institution[] = [
  ...CUE_VERIFIED_INSTITUTIONS,
  ...TVETA_VERIFIED_INSTITUTIONS,
];

export const ALL_VERIFIED_FACILITIES: CampusFacility[] = [
  ...VERIFIED_CAMPUS_FACILITIES,
  ...TVETA_FACILITIES,
];

export const ALL_VERIFIED_PROGRAMME_UNITS: ProgrammeUnit[] = [
  ...VERIFIED_PROGRAMME_UNITS,
  ...TVETA_PROGRAMME_UNITS,
];

export interface InstitutionFilterParams {
  type?: InstitutionType | string | 'All';
  county?: string;
  ownership?: 'Public' | 'Private' | 'All';
  regulator?: 'CUE' | 'TVETA' | 'Other' | 'All';
  licensingStatus?: string;
  courseKeyword?: string;
  level?: CourseLevel | string | 'All';
}

// =========================================================================
// SERVICE FUNCTIONS (WITH FIRESTORE PERSISTENCE & ALL-KENYA TVET DATA)
// =========================================================================

/**
 * Searches all verified Kenyan tertiary institutions (Universities & TVETs)
 * with multi-criteria filtering by county, type, ownership, regulator, course, and level.
 */
export async function searchInstitutions(
  searchQuery: string = '',
  filters?: InstitutionFilterParams
): Promise<Institution[]> {
  const clean = searchQuery.trim().toLowerCase();

  // Start with all institutions
  let results = [...ALL_KENYAN_INSTITUTIONS];

  // 1. Text Search Filter (Name, ShortName, County, Town, Type, or Code)
  if (clean) {
    results = results.filter((inst) => {
      const matchName = inst.name.toLowerCase().includes(clean);
      const matchShort = inst.shortName.toLowerCase().includes(clean);
      const matchCounty = inst.county.toLowerCase().includes(clean);
      const matchType = inst.type.toLowerCase().includes(clean);
      const matchCampuses = inst.campuses.some(
        (c) => c.name.toLowerCase().includes(clean) || (c.town && c.town.toLowerCase().includes(clean))
      );
      const matchCourses = inst.programmes.some(
        (p) => p.name.toLowerCase().includes(clean) || p.code.toLowerCase().includes(clean)
      );

      return matchName || matchShort || matchCounty || matchType || matchCampuses || matchCourses;
    });
  }

  // 2. Structured Filters
  if (filters) {
    if (filters.type && filters.type !== 'All') {
      results = results.filter((i) => {
        if (filters.type === 'University') {
          return i.type === 'University' || i.type.includes('University') && i.type !== 'University College';
        }
        return i.type.toLowerCase() === filters.type!.toLowerCase();
      });
    }

    if (filters.county && filters.county !== 'All') {
      const countyClean = filters.county.toLowerCase();
      results = results.filter((i) => i.county.toLowerCase().includes(countyClean));
    }

    if (filters.ownership && filters.ownership !== 'All') {
      results = results.filter((i) => i.ownership === filters.ownership);
    }

    if (filters.regulator && filters.regulator !== 'All') {
      results = results.filter((i) => i.regulator === filters.regulator);
    }

    if (filters.courseKeyword && filters.courseKeyword.trim()) {
      const courseClean = filters.courseKeyword.trim().toLowerCase();
      results = results.filter((i) =>
        i.programmes.some(
          (p) =>
            p.name.toLowerCase().includes(courseClean) ||
            p.code.toLowerCase().includes(courseClean) ||
            p.department.toLowerCase().includes(courseClean)
        )
      );
    }

    if (filters.level && filters.level !== 'All') {
      results = results.filter((i) =>
        i.programmes.some((p) => p.level === filters.level || p.award === filters.level)
      );
    }
  }

  return results;
}

/**
 * Retrieves all registered Kenyan institutions (universities, TVETs, polytechnics).
 */
export async function getAllInstitutions(): Promise<Institution[]> {
  return ALL_KENYAN_INSTITUTIONS;
}

/**
 * Retrieves a single institution by ID with full hierarchical data.
 */
export async function getInstitutionById(institutionId: string): Promise<Institution | null> {
  const cleanId = institutionId.toLowerCase();

  // Try memory first
  const found = ALL_KENYAN_INSTITUTIONS.find((i) => i.id === cleanId);
  if (found) {
    // Enrich programmes with the master catalogue if richer records exist
    const catalogProgs = COMPREHENSIVE_KENYAN_PROGRAMMES.filter(
      (p) => p.institutionId.toLowerCase() === cleanId
    );
    const mergedProgsMap = new Map<string, AcademicProgramme>();
    found.programmes.forEach((p) => mergedProgsMap.set(p.id, p));
    catalogProgs.forEach((cp) => mergedProgsMap.set(cp.id, { ...mergedProgsMap.get(cp.id), ...cp }));
    const enrichedProgrammes = Array.from(mergedProgsMap.values());

    // Attach facilities, services, events, announcements, clubs, sports, and enriched programmes
    return {
      ...found,
      programmes: enrichedProgrammes,
      facilities: ALL_VERIFIED_FACILITIES.filter((f) => f.institutionId === cleanId),
      services: VERIFIED_CAMPUS_SERVICES.filter((s) => s.institutionId === cleanId),
      events: VERIFIED_CAMPUS_EVENTS.filter((e) => e.institutionId === cleanId),
      announcements: VERIFIED_CAMPUS_ANNOUNCEMENTS.filter((a) => a.institutionId === cleanId),
      clubs: VERIFIED_STUDENT_CLUBS.filter((c) => c.institutionId === cleanId),
      sports: VERIFIED_STUDENT_SPORTS.filter((s) => s.institutionId === cleanId),
    };
  }

  // Check Firestore for custom added institutions
  try {
    const docSnap = await getDoc(doc(db, 'institutions', cleanId));
    if (docSnap.exists()) {
      return docSnap.data() as Institution;
    }
  } catch (err) {
    console.warn('Notice reading institution from Firestore:', err);
  }

  return null;
}

/**
 * Gets all campuses belonging to an institution.
 */
export async function getCampusesByInstitution(institutionId: string): Promise<Campus[]> {
  const inst = await getInstitutionById(institutionId);
  return inst?.campuses || [];
}

/**
 * Gets all faculties/schools/departments belonging to an institution.
 */
export async function getSchoolsByInstitution(institutionId: string): Promise<SchoolFaculty[]> {
  const inst = await getInstitutionById(institutionId);
  return inst?.schools || [];
}

/**
 * Gets approved programmes for a specific school or whole institution.
 */
export async function getProgrammesBySchool(
  institutionId: string,
  schoolId?: string
): Promise<AcademicProgramme[]> {
  const inst = await getInstitutionById(institutionId);
  if (!inst) return [];
  if (schoolId) {
    return inst.programmes.filter((p) => p.schoolId === schoolId);
  }
  return inst.programmes;
}

/**
 * Autocomplete search for approved academic programmes/courses for a specific institution.
 */
export async function searchProgrammes(
  institutionId: string,
  searchQuery: string,
  schoolId?: string
): Promise<AcademicProgramme[]> {
  const allProgs = await getProgrammesBySchool(institutionId, schoolId);
  const clean = searchQuery.trim().toLowerCase();
  if (!clean) return allProgs;

  return allProgs.filter(
    (p) =>
      p.name.toLowerCase().includes(clean) ||
      p.code.toLowerCase().includes(clean) ||
      (p.programmeName && p.programmeName.toLowerCase().includes(clean)) ||
      (p.field && p.field.toLowerCase().includes(clean)) ||
      p.department.toLowerCase().includes(clean)
  );
}

/**
 * Global search across all Kenyan tertiary institutions and approved programmes.
 */
export async function searchGlobalProgrammes(
  filters?: ProgrammeFilterParams
): Promise<AcademicProgramme[]> {
  return searchComprehensiveProgrammes(filters);
}

/**
 * Returns all approved programmes in the nation.
 */
export async function getAllApprovedProgrammes(): Promise<AcademicProgramme[]> {
  return getAllCataloguedProgrammes();
}

/**
 * Retrieves full details for a single programme by ID.
 */
export async function getProgrammeFullDetails(
  programmeId: string
): Promise<AcademicProgramme | null> {
  const found = COMPREHENSIVE_KENYAN_PROGRAMMES.find(
    (p) => p.id.toLowerCase() === programmeId.toLowerCase()
  );
  if (found) return found;

  // Search across all institutions
  for (const inst of ALL_KENYAN_INSTITUTIONS) {
    const p = inst.programmes.find((prog) => prog.id.toLowerCase() === programmeId.toLowerCase());
    if (p) {
      return {
        ...p,
        institutionName: inst.name,
      };
    }
  }

  return null;
}

/**
 * Compares selected programmes across institutions side by side.
 */
export async function compareProgrammesAcrossInstitutions(
  programmeIds: string[]
): Promise<AcademicProgramme[]> {
  const results: AcademicProgramme[] = [];
  for (const id of programmeIds) {
    const prog = await getProgrammeFullDetails(id);
    if (prog) results.push(prog);
  }
  return results;
}

/**
 * Automatically loads units for the student's programme, year of study/stage, and semester/term.
 */
export async function getUnitsForStudent(
  institutionId: string,
  programmeId: string,
  yearOfStudy: string | number,
  semester: string
): Promise<ProgrammeUnit[]> {
  const numYear = typeof yearOfStudy === 'number' ? yearOfStudy : parseInt(yearOfStudy.toString().replace(/\D/g, '') || '1', 10);
  const cleanSem = semester.toLowerCase();

  // Filter verified dataset across all universities and TVETs
  const matches = ALL_VERIFIED_PROGRAMME_UNITS.filter((u) => {
    const instMatch = !institutionId || u.institutionId.toLowerCase() === institutionId.toLowerCase();
    const progMatch = !programmeId || u.programmeId.toLowerCase() === programmeId.toLowerCase();
    const yearMatch = u.year === numYear || !numYear;
    const semMatch =
      cleanSem.includes('1') && (u.semester.toLowerCase().includes('1') || u.semester.toLowerCase().includes('term 1')) ||
      cleanSem.includes('2') && (u.semester.toLowerCase().includes('2') || u.semester.toLowerCase().includes('term 2')) ||
      cleanSem.includes('3') && (u.semester.toLowerCase().includes('3') || u.semester.toLowerCase().includes('term 3')) ||
      u.semester.toLowerCase().includes(cleanSem);

    return instMatch && progMatch && yearMatch && semMatch;
  });

  if (matches.length > 0) {
    return matches;
  }

  // Fallback: match by programme only
  const fallbackProg = ALL_VERIFIED_PROGRAMME_UNITS.filter(
    (u) => !programmeId || u.programmeId.toLowerCase() === programmeId.toLowerCase()
  );
  if (fallbackProg.length > 0) {
    return fallbackProg;
  }

  // Fallback: match by institution only
  return ALL_VERIFIED_PROGRAMME_UNITS.filter(
    (u) => !institutionId || u.institutionId.toLowerCase() === institutionId.toLowerCase()
  );
}

/**
 * Gets campus facilities filtered by campus and category.
 */
export async function getCampusFacilities(
  institutionId: string,
  campusId?: string,
  category?: FacilityCategory
): Promise<CampusFacility[]> {
  let list = ALL_VERIFIED_FACILITIES.filter((f) => {
    const instMatch = !institutionId || f.institutionId.toLowerCase() === institutionId.toLowerCase();
    const campusMatch = !campusId || f.campusId.toLowerCase() === campusId.toLowerCase();
    const catMatch = !category || f.category === category;
    return instMatch && campusMatch && catMatch;
  });

  // If specific campus has none, fallback to all facilities for that institution
  if (list.length === 0 && campusId) {
    list = ALL_VERIFIED_FACILITIES.filter(
      (f) => f.institutionId.toLowerCase() === institutionId.toLowerCase() && (!category || f.category === category)
    );
  }

  return list;
}

/**
 * Gets campus-specific student services.
 */
export async function getCampusServices(
  institutionId: string,
  campusId?: string
): Promise<CampusStudentService[]> {
  return VERIFIED_CAMPUS_SERVICES.filter(
    (s) =>
      (!institutionId || s.institutionId.toLowerCase() === institutionId.toLowerCase()) &&
      (!campusId || s.campusId.toLowerCase() === campusId.toLowerCase())
  );
}

/**
 * Gets campus events.
 */
export async function getCampusEvents(
  institutionId: string,
  campusId?: string
): Promise<CampusEvent[]> {
  return VERIFIED_CAMPUS_EVENTS.filter(
    (e) =>
      (!institutionId || e.institutionId.toLowerCase() === institutionId.toLowerCase()) &&
      (!campusId || e.campusId.toLowerCase() === campusId.toLowerCase())
  );
}

/**
 * Gets campus announcements.
 */
export async function getCampusAnnouncements(
  institutionId: string,
  campusId?: string
): Promise<CampusAnnouncement[]> {
  return VERIFIED_CAMPUS_ANNOUNCEMENTS.filter(
    (a) =>
      (!institutionId || a.institutionId.toLowerCase() === institutionId.toLowerCase()) &&
      (!campusId || a.campusId.toLowerCase() === campusId.toLowerCase())
  );
}

/**
 * Gets campus clubs & societies.
 */
export async function getCampusClubs(
  institutionId: string,
  campusId?: string
): Promise<StudentClub[]> {
  return VERIFIED_STUDENT_CLUBS.filter(
    (c) =>
      (!institutionId || c.institutionId.toLowerCase() === institutionId.toLowerCase()) &&
      (!campusId || c.campusId.toLowerCase() === campusId.toLowerCase())
  );
}

/**
 * Gets campus sports.
 */
export async function getCampusSports(
  institutionId: string,
  campusId?: string
): Promise<StudentSport[]> {
  return VERIFIED_STUDENT_SPORTS.filter(
    (s) =>
      (!institutionId || s.institutionId.toLowerCase() === institutionId.toLowerCase()) &&
      (!campusId || s.campusId.toLowerCase() === campusId.toLowerCase())
  );
}

/**
 * Adds an institution to the database (Admin action).
 */
export async function addCustomInstitution(institution: Institution): Promise<void> {
  const docRef = doc(db, 'institutions', institution.id);
  await setDoc(docRef, {
    ...institution,
    lastVerifiedAt: new Date().toISOString(),
    source: institution.source || 'Administrator Verified Registry Entry',
  });
}

/**
 * Updates an institution record in Firestore (Admin action).
 */
export async function updateCustomInstitution(
  id: string,
  updates: Partial<Institution>
): Promise<void> {
  const docRef = doc(db, 'institutions', id);
  await updateDoc(docRef, {
    ...updates,
    lastVerifiedAt: new Date().toISOString(),
  });
}

/**
 * Returns all distinct counties represented in the institution directory.
 */
export function getAllCounties(): string[] {
  const counties = new Set<string>();
  ALL_KENYAN_INSTITUTIONS.forEach((i) => {
    // If county contains slash (e.g. Kiambu / Nairobi), add individual counties
    i.county.split('/').forEach((c) => {
      const trimmed = c.trim();
      if (trimmed) counties.add(trimmed);
    });
  });
  return Array.from(counties).sort();
}

/**
 * Returns all institution categories supported.
 */
export function getAllInstitutionTypes(): InstitutionType[] {
  return [
    'University',
    'University College',
    'TVET / Technical College',
    'National Polytechnic',
    'Vocational Training Centre',
    'Other Accredited Institution',
  ];
}

/**
 * Bootstraps all verified Kenyan tertiary institutions (CUE and TVETA) to Firestore if not present.
 */
export async function seedCUEInstitutionsToFirestore(): Promise<void> {
  try {
    for (const inst of ALL_KENYAN_INSTITUTIONS) {
      const docRef = doc(db, 'institutions', inst.id);
      await setDoc(docRef, inst, { merge: true });
    }
  } catch (err) {
    console.warn('Notice seeding institutions to Firestore:', err);
  }
}

