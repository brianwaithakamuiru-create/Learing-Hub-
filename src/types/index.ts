export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  username: string;
  normalizedUsername: string;
  country: string;
  // All-Kenya Tertiary Education Student Hierarchy (Universities & TVETs)
  institutionId?: string;
  institutionName?: string;
  institutionType?: InstitutionType;
  regulator?: 'CUE' | 'TVETA' | 'Other';
  campusId?: string;
  campusName?: string;
  schoolId?: string;
  schoolName?: string;
  departmentId?: string;
  departmentName?: string;
  programmeId?: string;
  programmeName?: string;
  programmeCode?: string;
  courseLevel?: string;
  examiningBody?: string;
  stageOrYear?: string;
  yearOfStudy?: string | number;
  semester?: string;
  currentSemester?: string;
  academicYear?: string;
  registrationNumber?: string;
  studentEmail?: string;
  personalEmail?: string;
  phoneNumber?: string;
  role: 'student' | 'researcher' | 'admin';
  accountStatus: 'ACTIVE' | 'DISABLED' | 'PENDING';
  emailVerified?: boolean;
  photoURL?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: {
    overlayStrength?: number;
    backgroundBlur?: number;
    clockAnimation?: boolean;
    backgroundPosition?: string;
  };
}

// =========================================================================
// ALL-KENYA TERTIARY EDUCATION & INSTITUTION MODELS (CUE & TVETA REGISTERS)
// =========================================================================

export type InstitutionType =
  | 'University'
  | 'University College'
  | 'TVET / Technical College'
  | 'National Polytechnic'
  | 'Vocational Training Centre'
  | 'Other Accredited Institution';

export type RegulatorType = 'CUE' | 'TVETA' | 'Other';

export type LicensingStatus =
  | 'Registered and Licensed'
  | 'Registered Only'
  | 'Licensed'
  | 'Chartered'
  | 'Constituent College'
  | 'Chartered Constituent College'
  | 'Accredited'
  | 'Interim Authority'
  | 'Expired License';

export type InstitutionOwnership = 'Public' | 'Private';

export type CourseLevel =
  | 'Doctorate (PhD)'
  | 'Master Degree'
  | 'Postgraduate Diploma'
  | 'Bachelor Degree'
  | 'Higher Diploma'
  | 'Diploma (Level 6)'
  | 'Certificate (Level 5)'
  | 'Artisan (Level 4)'
  | 'Grade III / Vocational';

export type ExaminingBody =
  | 'University Senate'
  | 'KNEC'
  | 'TVET-CDACC'
  | 'NITA'
  | 'KASNEB'
  | 'KIM'
  | 'Other';

export interface CampusCoordinates {
  lat: number;
  lng: number;
}

export interface CampusContacts {
  phone: string;
  email: string;
  emergency?: string;
  postalAddress?: string;
}

export interface Campus {
  id: string;
  institutionId: string;
  name: string;
  county: string;
  town?: string;
  address: string;
  coordinates: CampusCoordinates;
  contacts: CampusContacts;
  isMainCampus?: boolean;
}

export interface SchoolFaculty {
  id: string;
  institutionId: string;
  name: string;
  code?: string;
  dean?: string;
  departments: string[];
}

export interface ProgrammeEntryRequirements {
  minimumMeanGrade?: string;
  requiredClusterSubjects?: string[];
  alternativeRequirements?: string;
  specialConditions?: string;
}

export type StudyMode =
  | 'Full-time'
  | 'Part-time'
  | 'Evening'
  | 'Weekend'
  | 'Distance / Online'
  | 'Blended Learning';

export type AcademicStructure = 'Semester' | 'Term' | 'Trimester' | 'Modular CBET';

export interface CurriculumStageUnit {
  code: string;
  title: string;
  credits?: number;
  isCore?: boolean;
}

export interface CurriculumStage {
  stageNumber: number;
  stageName: string;
  units: CurriculumStageUnit[];
}

export interface AcademicProgramme {
  id: string; // programmeId
  programmeId?: string;
  institutionId: string;
  institutionName?: string;
  code: string; // programmeCode
  programmeCode?: string;
  name: string; // programmeName
  programmeName?: string;
  award: 'Doctorate' | 'Master' | 'Postgraduate Diploma' | 'Bachelor' | 'Higher Diploma' | 'Diploma' | 'Certificate' | 'Artisan' | 'Vocational';
  level?: CourseLevel;
  qualificationLevel?: CourseLevel;
  specialization?: string;
  field?: string; // Academic Field: Computing & IT, Engineering, Health, Business, Law, etc.
  examiningBody?: ExaminingBody;
  schoolId: string;
  schoolName?: string;
  facultyId?: string;
  departmentId?: string;
  department: string;
  campusId?: string;
  campusIds?: string[];
  campus?: string;
  duration?: string;
  durationYears: number;
  durationTermsOrSemesters?: number;
  academicPeriod?: AcademicStructure;
  modeOfStudy?: StudyMode[] | string;
  studyModes?: string[];
  entryRequirements?: ProgrammeEntryRequirements | string;
  cueAccredited?: boolean;
  tvetaAccredited?: boolean;
  accreditationStatus?: string;
  registrationNumber?: string;
  cueAccreditationNumber?: string;
  tvetaCourseCode?: string;
  source?: string;
  sourceUrl?: string;
  lastVerifiedAt?: string;
  overview?: string;
  careerProspects?: string[];
  curriculumStages?: CurriculumStage[];
  intakes?: string[];
}

export interface DepartmentItem {
  id: string;
  name: string;
  institutionId: string;
  institutionName: string;
  schoolId?: string;
  schoolName?: string;
  description?: string;
  programmesCount: number;
  image?: string;
  logo?: string;
}

export interface StudentAcademicSelection {
  institutionId: string;
  institutionName: string;
  institutionType?: string;
  departmentId: string;
  departmentName: string;
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  courseLevel: string;
  studyMode: string;
  campusId?: string;
  campusName?: string;
  intake?: string;
  duration?: string;
  selectedAt: string;
}

export interface ProgrammeUnit {
  id: string;
  institutionId: string;
  programmeId: string;
  code: string;
  title: string;
  year: number;
  semester: string;
  credits: number;
  description?: string;
  lecturerName?: string;
  lecturerEmail?: string;
  isCore: boolean;
  isFavorite?: boolean;
  category?: string;
  revisionMaterialsCount?: number;
  pastPapersCount?: number;
  notesCount?: number;
}

export type FacilityCategory =
  | 'ACADEMIC'
  | 'STUDENT LIFE'
  | 'HEALTH'
  | 'ACCOMMODATION'
  | 'ADMINISTRATION'
  | 'TECHNOLOGY';

export interface CampusFacility {
  id: string;
  institutionId: string;
  campusId: string;
  name: string;
  category: FacilityCategory;
  building: string;
  floor?: string;
  room?: string;
  description: string;
  openingHours?: string;
  contact?: string;
  email?: string;
  location: string;
  coordinates: CampusCoordinates;
  availableServices: string[];
  isAccessible?: boolean;
  isSaved?: boolean;
}

export interface CampusStudentService {
  id: string;
  institutionId: string;
  campusId: string;
  name: string;
  category: string;
  building: string;
  room?: string;
  contact: string;
  email: string;
  hours: string;
  description: string;
  officerInCharge?: string;
}

export interface CampusEvent {
  id: string;
  institutionId: string;
  campusId: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  category: 'Academic' | 'Career' | 'Sports' | 'Culture' | 'Orientation' | 'Social';
  organizer: string;
  description: string;
  isRegistrationRequired?: boolean;
}

export interface CampusAnnouncement {
  id: string;
  institutionId: string;
  campusId: string;
  title: string;
  issuedBy: string;
  date: string;
  priority: 'high' | 'normal' | 'urgent';
  category: 'Academic' | 'Finance' | 'Examinations' | 'Library' | 'Hostels' | 'General';
  content: string;
  attachmentName?: string;
}

export interface StudentClub {
  id: string;
  institutionId: string;
  campusId: string;
  name: string;
  category: string;
  patron?: string;
  president?: string;
  meetingSchedule: string;
  venue: string;
  description: string;
  email?: string;
}

export interface StudentSport {
  id: string;
  institutionId: string;
  campusId: string;
  name: string;
  coach?: string;
  captain?: string;
  trainingSchedule: string;
  venue: string;
  description: string;
}

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: InstitutionType | string;
  ownership?: InstitutionOwnership;
  regulator?: RegulatorType;
  licensingStatus?: LicensingStatus;
  registrationNumber?: string;
  accreditation: string;
  source: string;
  lastVerifiedAt: string;
  logo: string;
  badgeColor?: string;
  website: string;
  county: string;
  generalContacts: CampusContacts;
  campuses: Campus[];
  schools: SchoolFaculty[];
  programmes: AcademicProgramme[];
  facilities?: CampusFacility[];
  services?: CampusStudentService[];
  events?: CampusEvent[];
  announcements?: CampusAnnouncement[];
  clubs?: StudentClub[];
  sports?: StudentSport[];
}

export interface AcademicDocument {
  documentId: string;
  ownerId: string;
  title: string;
  originalFileName: string;
  fileName?: string;
  storagePath: string;
  fileType: string;
  mimeType: string;
  fileSize: number;
  unitId?: string;
  unitName?: string;
  courseCode?: string;
  category: 'Lecture Notes' | 'Assignments' | 'Revision' | 'Past Papers' | 'Textbooks' | 'Research' | 'Class Materials' | 'Personal Notes' | 'Presentations' | 'Other';
  semester?: string;
  academicYear?: string;
  description?: string;
  tags: string[];
  isFavorite?: boolean;
  isImportant?: boolean;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AcademicClass {
  id: string;
  code: string;
  name: string;
  instructor: string;
  room: string;
  schedule: string;
  semester: string;
  color: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  courseCode: string;
  courseName: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Seminar' | 'Tutorial';
}

export type TimetableDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type TimetableBuildingOption = 'KEMU Hub' | 'KEMU Towers' | 'Other';

export interface TimetableEvent {
  eventId: string;
  ownerId: string;
  unitCode: string;
  unitName: string;
  day: TimetableDay;
  startTime: string;
  endTime: string;
  building: string;
  location?: string;
  roomNumber: string;
  lecturerName?: string;
  classType?: string;
  notes?: string;
  reminderMinutes?: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AssignmentStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Submitted'
  | 'Completed'
  | 'Overdue'
  | 'Pending';

export type AssignmentPriority = 'High' | 'Medium' | 'Low';

export interface Assignment {
  id: string;
  ownerId?: string;
  title: string;
  course: string; // Unit code e.g. CS 301
  unit?: string;
  description?: string;
  lecturer?: string;
  assignedDate?: string;
  dueDate: string;
  dueTime?: string;
  status: AssignmentStatus;
  priority?: AssignmentPriority;
  weight?: string;
  notes?: string;
  attachments?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type NoteCategory =
  | 'Quick'
  | 'Lecture'
  | 'Revision'
  | 'Assignment'
  | 'Personal';

export interface AcademicNote {
  id: string;
  ownerId?: string;
  title: string;
  course: string; // Unit code
  unit?: string;
  category?: NoteCategory;
  date: string;
  summary: string;
  content?: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  linkedDocId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type GoalCategory =
  | 'Semester'
  | 'Weekly'
  | 'Study'
  | 'Assignment'
  | 'Revision'
  | 'GPA'
  | 'Reading';

export interface AcademicGoal {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  target: string;
  progress: number;
  category: GoalCategory;
  completed: boolean;
  targetDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface FocusSession {
  id: string;
  ownerId: string;
  task: string;
  durationMinutes: number;
  completedAt: string;
  course?: string;
  notes?: string;
}

export interface AcademicExam {
  id: string;
  ownerId?: string;
  unitCode: string;
  courseCode?: string;
  unitName?: string;
  courseName?: string;
  title: string;
  examDate: string;
  time: string;
  building: string;
  room: string;
  durationMinutes?: number;
  lecturer?: string;
  topics?: string[];
  topicsCovered?: string[];
  notes?: string;
  readiness?: number;
  readinessPercentage?: number;
  status?: 'scheduled' | 'completed' | 'urgent';
  weight?: string;
  createdAt?: string;
}

export interface RevisionTopic {
  id: string;
  ownerId?: string;
  unitCode: string;
  topic: string;
  notes?: string;
  confidence: number;
  status?: 'not_started' | 'in_progress' | 'mastered' | 'weak';
  flashcards?: { id: string; question: string; answer: string }[];
  practiceQuestions?: {
    id: string;
    question: string;
    type: 'mcq' | 'short';
    options?: string[];
    answer: string;
  }[];
  lastRevisedAt?: string;
  createdAt?: string;
}

export interface KnowledgeEntry {
  id: string;
  ownerId?: string;
  topic: string;
  unitCode: string;
  explanation: string;
  example?: string;
  whatILearned?: string;
  relatedDocs?: string[];
  relatedNotes?: string[];
  tags: string[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type KnowledgeVaultItem = KnowledgeEntry;

export interface CalendarEvent {
  id: string;
  ownerId?: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'class' | 'assignment' | 'exam' | 'study' | 'personal';
  unitCode?: string;
  location?: string;
  notes?: string;
  createdAt?: string;
}

export interface AcademicNotification {
  id: string;
  ownerId: string;
  title: string;
  message: string;
  type:
    | 'class'
    | 'class_reminder'
    | 'assignment'
    | 'assignment_due'
    | 'overdue'
    | 'exam'
    | 'exam_alert'
    | 'document'
    | 'document_upload'
    | 'goal'
    | 'goal_reached'
    | 'system'
    | 'deadline';
  read: boolean;
  createdAt: string;
  linkRoute?: string;
  link?: string;
}
