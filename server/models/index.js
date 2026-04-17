const sequelize = require('../config/db');

const AcademicYear = require('./AcademicYear');
const District = require('./District');
const Community = require('./Community');
const Caste = require('./Caste');
const College = require('./College');
const Course = require('./Course');
const User = require('./User');
const Student = require('./Student');
const Application = require('./Application');
const ApplicationCollege = require('./ApplicationCollege');
const Mark = require('./Mark');
const Payment = require('./Payment');
const Document = require('./Document');
const Notification = require('./Notification');
const FeeStructure = require('./FeeStructure');

// Community -> Caste
Community.hasMany(Caste, { foreignKey: 'community_id', as: 'castes' });
Caste.belongsTo(Community, { foreignKey: 'community_id', as: 'community' });

// College -> Course
College.hasMany(Course, { foreignKey: 'college_id', as: 'courses' });
Course.belongsTo(College, { foreignKey: 'college_id', as: 'college' });

// College -> District
District.hasMany(College, { foreignKey: 'district_id', as: 'colleges' });
College.belongsTo(District, { foreignKey: 'district_id', as: 'district' });

// User -> College
College.hasMany(User, { foreignKey: 'college_id', as: 'users' });
User.belongsTo(College, { foreignKey: 'college_id', as: 'college' });

// Student associations
Community.hasMany(Student, { foreignKey: 'community_id' });
Student.belongsTo(Community, { foreignKey: 'community_id', as: 'community' });

Caste.hasMany(Student, { foreignKey: 'caste_id' });
Student.belongsTo(Caste, { foreignKey: 'caste_id', as: 'caste' });

District.hasMany(Student, { foreignKey: 'comm_district_id', as: 'commStudents' });
Student.belongsTo(District, { foreignKey: 'comm_district_id', as: 'commDistrict' });

District.hasMany(Student, { foreignKey: 'perm_district_id', as: 'permStudents' });
Student.belongsTo(District, { foreignKey: 'perm_district_id', as: 'permDistrict' });

// Application associations
Student.hasMany(Application, { foreignKey: 'student_id', as: 'applications' });
Application.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

AcademicYear.hasMany(Application, { foreignKey: 'year_id', as: 'applications' });
Application.belongsTo(AcademicYear, { foreignKey: 'year_id', as: 'academicYear' });

// Application -> Colleges (N:M through ApplicationCollege)
Application.hasMany(ApplicationCollege, { foreignKey: 'application_id', as: 'collegePreferences' });
ApplicationCollege.belongsTo(Application, { foreignKey: 'application_id' });

College.hasMany(ApplicationCollege, { foreignKey: 'college_id' });
ApplicationCollege.belongsTo(College, { foreignKey: 'college_id', as: 'college' });

Course.hasMany(ApplicationCollege, { foreignKey: 'course_id' });
ApplicationCollege.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// Application -> Marks
Application.hasMany(Mark, { foreignKey: 'application_id', as: 'marks' });
Mark.belongsTo(Application, { foreignKey: 'application_id' });

// Application -> Payments
Application.hasMany(Payment, { foreignKey: 'application_id', as: 'payments' });
Payment.belongsTo(Application, { foreignKey: 'application_id' });

// Application -> Documents
Application.hasMany(Document, { foreignKey: 'application_id', as: 'documents' });
Document.belongsTo(Application, { foreignKey: 'application_id' });

// Student -> Notifications
Student.hasMany(Notification, { foreignKey: 'student_id', as: 'notifications' });
Notification.belongsTo(Student, { foreignKey: 'student_id' });

// AcademicYear -> FeeStructure
AcademicYear.hasMany(FeeStructure, { foreignKey: 'year_id', as: 'fees' });
FeeStructure.belongsTo(AcademicYear, { foreignKey: 'year_id' });

module.exports = {
  sequelize,
  AcademicYear, District, Community, Caste,
  College, Course, User, Student,
  Application, ApplicationCollege, Mark,
  Payment, Document, Notification, FeeStructure,
};
