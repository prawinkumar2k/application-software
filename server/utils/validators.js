const Joi = require('joi');

const registerSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Enter a valid 10-digit Indian mobile number',
  }),
  email: Joi.string().email().optional().allow(''),
});

const otpVerifySchema = Joi.object({
  mobile: Joi.string().required(),
  otp: Joi.string().length(6).required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
  mobile: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().required(),
}).or('mobile', 'email');

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const collegeSchema = Joi.object({
  college_code: Joi.string().required(),
  college_name: Joi.string().required(),
  address: Joi.string().optional().allow(''),
  district_id: Joi.number().optional(),
  gender_type: Joi.string().valid('MALE','FEMALE','CO-ED').required(),
  hostel_available: Joi.number().valid(0,1).default(0),
  hostel_gender: Joi.string().valid('MALE','FEMALE','BOTH').optional().allow(null),
  college_type: Joi.string().valid('GOVERNMENT','AIDED','SELF_FINANCE').default('GOVERNMENT'),
  phone: Joi.string().optional().allow(''),
  email: Joi.string().email().optional().allow(''),
});

const applicationUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  dob: Joi.date().optional(),
  gender: Joi.string().valid('MALE','FEMALE','OTHER').optional(),
  aadhaar: Joi.string().length(12).optional().allow(''),
  religion: Joi.string().optional().allow(''),
  community_id: Joi.number().optional(),
  caste_id: Joi.number().optional(),
  comm_address: Joi.string().optional().allow(''),
  comm_city: Joi.string().optional().allow(''),
  comm_district_id: Joi.number().optional(),
  comm_pincode: Joi.string().optional().allow(''),
  perm_address: Joi.string().optional().allow(''),
  perm_city: Joi.string().optional().allow(''),
  perm_district_id: Joi.number().optional(),
  perm_pincode: Joi.string().optional().allow(''),
  alt_mobile: Joi.string().optional().allow(''),
  father_name: Joi.string().optional().allow(''),
  mother_name: Joi.string().optional().allow(''),
  parent_occupation: Joi.string().optional().allow(''),
  annual_income: Joi.number().optional(),
  board: Joi.string().optional().allow(''),
  register_no: Joi.string().optional().allow(''),
  last_school: Joi.string().optional().allow(''),
  admission_type: Joi.string().valid('FIRST_YEAR','LATERAL','PART_TIME').optional(),
  hostel_required: Joi.number().valid(0,1).optional(),
  is_differently_abled: Joi.number().valid(0,1).optional(),
  is_ex_servicemen: Joi.number().valid(0,1).optional(),
  is_sports_person: Joi.number().valid(0,1).optional(),
  is_govt_school: Joi.number().valid(0,1).optional(),
  marks: Joi.array().items(Joi.object({
    subject_name: Joi.string().required(),
    marks_obtained: Joi.number().required(),
    max_marks: Joi.number().default(100),
    exam_year: Joi.string().optional(),
  })).optional(),
  college_preferences: Joi.array().items(Joi.object({
    college_id: Joi.number().required(),
    course_id: Joi.number().optional(),
    preference_order: Joi.number().required(),
  })).optional(),
}).options({ allowUnknown: false });

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(d => d.message),
    });
  }
  next();
};

module.exports = { registerSchema, otpVerifySchema, loginSchema, adminLoginSchema, collegeSchema, applicationUpdateSchema, validate };
