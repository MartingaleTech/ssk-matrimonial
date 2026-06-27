import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  User,
  Profile,
  ProfileManager,
  ProfileBasicDetails,
  ProfileEducationCareer,
  ProfileFamilyInfo,
  ProfileLifestyle,
  ProfileLocation,
  ProfilePhoto,
  ProfilePartnerPreferences,
  ProfilePrivacySettings,
  ProfileKundali,
  Verification,
  Connection,
  ChatThread,
  ChatMessage,
} from '../entities';

const PASSWORD = 'Test@1234';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'ssk_matrimonial',
    entities: [
      User,
      Profile,
      ProfileManager,
      ProfileBasicDetails,
      ProfileEducationCareer,
      ProfileFamilyInfo,
      ProfileLifestyle,
      ProfileLocation,
      ProfilePhoto,
      ProfilePartnerPreferences,
      ProfilePrivacySettings,
      ProfileKundali,
      Verification,
      Connection,
      ChatThread,
      ChatMessage,
    ],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected. Seeding...');

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const userRepo = dataSource.getRepository(User);
  const profileRepo = dataSource.getRepository(Profile);
  const managerRepo = dataSource.getRepository(ProfileManager);
  const basicRepo = dataSource.getRepository(ProfileBasicDetails);
  const eduRepo = dataSource.getRepository(ProfileEducationCareer);
  const familyRepo = dataSource.getRepository(ProfileFamilyInfo);
  const lifestyleRepo = dataSource.getRepository(ProfileLifestyle);
  const locationRepo = dataSource.getRepository(ProfileLocation);
  const photoRepo = dataSource.getRepository(ProfilePhoto);
  const prefRepo = dataSource.getRepository(ProfilePartnerPreferences);
  const privacyRepo = dataSource.getRepository(ProfilePrivacySettings);
  const kundaliRepo = dataSource.getRepository(ProfileKundali);
  const verificationRepo = dataSource.getRepository(Verification);
  const connectionRepo = dataSource.getRepository(Connection);
  const threadRepo = dataSource.getRepository(ChatThread);
  const messageRepo = dataSource.getRepository(ChatMessage);

  // ── Users ──────────────────────────────────────────────────────────
  const usersData = [
    { email: 'rahul.sharma@example.com', phone: '+919876543201' },
    { email: 'priya.patel@example.com', phone: '+919876543202' },
    { email: 'amit.verma@example.com', phone: '+919876543203' },
    { email: 'sneha.reddy@example.com', phone: '+919876543204' },
    { email: 'vikram.singh@example.com', phone: '+919876543205' },
    { email: 'ananya.iyer@example.com', phone: '+919876543206' },
    { email: 'karthik.nair@example.com', phone: '+919876543207' },
    { email: 'meera.joshi@example.com', phone: '+919876543208' },
  ];

  const users: User[] = [];
  for (const u of usersData) {
    const user = userRepo.create({
      email: u.email,
      phone: u.phone,
      password_hash: passwordHash,
      is_active: true,
    });
    users.push(await userRepo.save(user));
  }
  console.log(`Created ${users.length} users`);

  // ── Profiles ───────────────────────────────────────────────────────
  const profilesData = [
    {
      display_name: 'Rahul Sharma',
      gender: 'male',
      date_of_birth: '1995-03-15',
      height_cm: 178,
      marital_status: 'never_married',
      about_me:
        'Software engineer at a top tech company. Love hiking, photography, and exploring new cuisines. Looking for a life partner who values family and has a positive outlook.',
      profile_status: 'active',
      email_verified: true,
      phone_verified: true,
    },
    {
      display_name: 'Priya Patel',
      gender: 'female',
      date_of_birth: '1997-08-22',
      height_cm: 163,
      marital_status: 'never_married',
      about_me:
        'Doctor by profession, artist at heart. I enjoy painting, yoga, and weekend getaways. Seeking someone who is ambitious yet grounded.',
      profile_status: 'active',
      email_verified: true,
      phone_verified: true,
    },
    {
      display_name: 'Amit Verma',
      gender: 'male',
      date_of_birth: '1993-11-05',
      height_cm: 175,
      marital_status: 'never_married',
      about_me:
        'Chartered Accountant running my own practice. Passionate about cricket, classical music, and community service.',
      profile_status: 'active',
      email_verified: true,
      phone_verified: true,
    },
    {
      display_name: 'Sneha Reddy',
      gender: 'female',
      date_of_birth: '1996-05-18',
      height_cm: 160,
      marital_status: 'never_married',
      about_me:
        'Product manager at a fintech startup. Love reading, travelling, and trying street food. Looking for an honest and caring partner.',
      profile_status: 'active',
      email_verified: true,
      phone_verified: true,
    },
    {
      display_name: 'Vikram Singh',
      gender: 'male',
      date_of_birth: '1991-01-30',
      height_cm: 182,
      marital_status: 'divorced',
      about_me:
        'Army officer, now in the private sector. Fitness enthusiast, dog lover. Believe in second chances and finding happiness.',
      profile_status: 'active',
      email_verified: true,
      phone_verified: false,
    },
    {
      display_name: 'Ananya Iyer',
      gender: 'female',
      date_of_birth: '1998-12-10',
      height_cm: 157,
      marital_status: 'never_married',
      about_me:
        'Classical dancer and MBA graduate. Currently working in consulting. Value tradition with a modern outlook.',
      profile_status: 'active',
      email_verified: true,
      phone_verified: true,
    },
    {
      display_name: 'Karthik Nair',
      gender: 'male',
      date_of_birth: '1994-07-25',
      height_cm: 172,
      marital_status: 'never_married',
      about_me:
        'Data scientist who enjoys trekking and board games. Looking for someone curious and kind.',
      profile_status: 'pending_verification',
      email_verified: false,
      phone_verified: false,
    },
    {
      display_name: 'Meera Joshi',
      gender: 'female',
      date_of_birth: '1999-02-14',
      height_cm: 165,
      marital_status: 'never_married',
      about_me:
        'Architect with a love for sustainable design. Enjoy gardening, baking, and weekend road trips.',
      profile_status: 'draft',
      email_verified: false,
      phone_verified: false,
    },
  ];

  const profiles: Profile[] = [];
  for (const p of profilesData) {
    const profile = profileRepo.create(p);
    profiles.push(await profileRepo.save(profile));
  }
  console.log(`Created ${profiles.length} profiles`);

  // ── Profile Managers (1 owner per profile) ─────────────────────────
  for (let i = 0; i < users.length; i++) {
    const pm = managerRepo.create({
      user_id: users[i].id,
      profile_id: profiles[i].id,
      role: 'owner',
      is_primary: true,
    });
    await managerRepo.save(pm);
  }
  console.log('Created profile managers');

  // ── Basic Details ──────────────────────────────────────────────────
  const basicData = [
    {
      first_name: 'Rahul',
      last_name: 'Sharma',
      community: 'Hindu',
      mother_tongue: 'Hindi',
      religion: 'Hindu',
      caste_subgroup: 'Brahmin',
      gotra: 'Bharadwaj',
    },
    {
      first_name: 'Priya',
      last_name: 'Patel',
      community: 'Hindu',
      mother_tongue: 'Gujarati',
      religion: 'Hindu',
      caste_subgroup: 'Patidar',
      gotra: 'Kashyap',
    },
    {
      first_name: 'Amit',
      last_name: 'Verma',
      community: 'Hindu',
      mother_tongue: 'Hindi',
      religion: 'Hindu',
      caste_subgroup: 'Kayastha',
      gotra: 'Shandilya',
    },
    {
      first_name: 'Sneha',
      last_name: 'Reddy',
      community: 'Hindu',
      mother_tongue: 'Telugu',
      religion: 'Hindu',
      caste_subgroup: 'Reddy',
      gotra: 'Atri',
    },
    {
      first_name: 'Vikram',
      last_name: 'Singh',
      community: 'Sikh',
      mother_tongue: 'Punjabi',
      religion: 'Sikh',
      caste_subgroup: 'Jat',
      gotra: 'Sandhu',
    },
    {
      first_name: 'Ananya',
      last_name: 'Iyer',
      community: 'Hindu',
      mother_tongue: 'Tamil',
      religion: 'Hindu',
      caste_subgroup: 'Iyer',
      gotra: 'Vasishtha',
    },
    {
      first_name: 'Karthik',
      last_name: 'Nair',
      community: 'Hindu',
      mother_tongue: 'Malayalam',
      religion: 'Hindu',
      caste_subgroup: 'Nair',
      gotra: 'Vishwamitra',
    },
    {
      first_name: 'Meera',
      last_name: 'Joshi',
      community: 'Hindu',
      mother_tongue: 'Marathi',
      religion: 'Hindu',
      caste_subgroup: 'Brahmin',
      gotra: 'Gautam',
    },
  ];

  for (let i = 0; i < profiles.length; i++) {
    const bd = basicRepo.create({
      profile_id: profiles[i].id,
      ...basicData[i],
    });
    await basicRepo.save(bd);
  }
  console.log('Created basic details');

  // ── Education & Career ─────────────────────────────────────────────
  const eduData = [
    {
      highest_education: 'Masters',
      education_details: 'M.Tech from IIT Delhi',
      occupation: 'Software Engineer',
      company_name: 'Google',
      annual_income_range: '25-50 LPA',
      work_location_city: 'Bangalore',
      work_location_country: 'India',
    },
    {
      highest_education: 'Doctorate',
      education_details: 'MBBS, MD from AIIMS',
      occupation: 'Doctor',
      company_name: 'Apollo Hospitals',
      annual_income_range: '15-25 LPA',
      work_location_city: 'Mumbai',
      work_location_country: 'India',
    },
    {
      highest_education: 'Masters',
      education_details: 'CA, CFA',
      occupation: 'Chartered Accountant',
      company_name: 'Verma & Associates',
      annual_income_range: '15-25 LPA',
      work_location_city: 'Delhi',
      work_location_country: 'India',
    },
    {
      highest_education: 'Masters',
      education_details: 'MBA from ISB Hyderabad',
      occupation: 'Product Manager',
      company_name: 'Razorpay',
      annual_income_range: '25-50 LPA',
      work_location_city: 'Bangalore',
      work_location_country: 'India',
    },
    {
      highest_education: 'Bachelors',
      education_details: 'B.Tech from NIT Jalandhar',
      occupation: 'Operations Manager',
      company_name: 'Tata Motors',
      annual_income_range: '10-15 LPA',
      work_location_city: 'Pune',
      work_location_country: 'India',
    },
    {
      highest_education: 'Masters',
      education_details: 'MBA from IIM Ahmedabad',
      occupation: 'Consultant',
      company_name: 'McKinsey',
      annual_income_range: '25-50 LPA',
      work_location_city: 'Mumbai',
      work_location_country: 'India',
    },
    {
      highest_education: 'Masters',
      education_details: 'M.Sc Data Science from IISc',
      occupation: 'Data Scientist',
      company_name: 'Flipkart',
      annual_income_range: '15-25 LPA',
      work_location_city: 'Bangalore',
      work_location_country: 'India',
    },
    {
      highest_education: 'Masters',
      education_details: 'M.Arch from SPA Delhi',
      occupation: 'Architect',
      company_name: 'Foster + Partners',
      annual_income_range: '10-15 LPA',
      work_location_city: 'Delhi',
      work_location_country: 'India',
    },
  ];

  for (let i = 0; i < profiles.length; i++) {
    const ec = eduRepo.create({ profile_id: profiles[i].id, ...eduData[i] });
    await eduRepo.save(ec);
  }
  console.log('Created education/career details');

  // ── Family Info ────────────────────────────────────────────────────
  const familyData = [
    {
      family_type: 'nuclear',
      father_occupation: 'Retired Professor',
      mother_occupation: 'Homemaker',
      siblings_brothers: 1,
      siblings_sisters: 0,
      family_status: 'upper_middle',
      family_values: 'moderate',
    },
    {
      family_type: 'joint',
      father_occupation: 'Business Owner',
      mother_occupation: 'Teacher',
      siblings_brothers: 0,
      siblings_sisters: 1,
      family_status: 'affluent',
      family_values: 'traditional',
    },
    {
      family_type: 'nuclear',
      father_occupation: 'Government Officer',
      mother_occupation: 'Bank Manager',
      siblings_brothers: 1,
      siblings_sisters: 1,
      family_status: 'upper_middle',
      family_values: 'moderate',
    },
    {
      family_type: 'nuclear',
      father_occupation: 'Doctor',
      mother_occupation: 'Lawyer',
      siblings_brothers: 0,
      siblings_sisters: 0,
      family_status: 'affluent',
      family_values: 'liberal',
    },
    {
      family_type: 'joint',
      father_occupation: 'Farmer',
      mother_occupation: 'Homemaker',
      siblings_brothers: 2,
      siblings_sisters: 1,
      family_status: 'middle_class',
      family_values: 'traditional',
    },
    {
      family_type: 'nuclear',
      father_occupation: 'Engineer',
      mother_occupation: 'Professor',
      siblings_brothers: 1,
      siblings_sisters: 0,
      family_status: 'upper_middle',
      family_values: 'moderate',
    },
    {
      family_type: 'joint',
      father_occupation: 'Retired Army',
      mother_occupation: 'Homemaker',
      siblings_brothers: 0,
      siblings_sisters: 2,
      family_status: 'middle_class',
      family_values: 'traditional',
    },
    {
      family_type: 'nuclear',
      father_occupation: 'Architect',
      mother_occupation: 'Interior Designer',
      siblings_brothers: 1,
      siblings_sisters: 0,
      family_status: 'upper_middle',
      family_values: 'liberal',
    },
  ];

  for (let i = 0; i < profiles.length; i++) {
    const fi = familyRepo.create({
      profile_id: profiles[i].id,
      ...familyData[i],
    });
    await familyRepo.save(fi);
  }
  console.log('Created family info');

  // ── Lifestyle ──────────────────────────────────────────────────────
  const lifestyleData = [
    {
      diet: 'vegetarian',
      smoking: 'never',
      drinking: 'occasionally',
      hobbies: ['hiking', 'photography', 'cooking', 'reading'],
    },
    {
      diet: 'vegetarian',
      smoking: 'never',
      drinking: 'never',
      hobbies: ['painting', 'yoga', 'travel', 'music'],
    },
    {
      diet: 'vegetarian',
      smoking: 'never',
      drinking: 'occasionally',
      hobbies: ['cricket', 'classical music', 'chess'],
    },
    {
      diet: 'non_vegetarian',
      smoking: 'never',
      drinking: 'occasionally',
      hobbies: ['reading', 'travel', 'street food', 'movies'],
    },
    {
      diet: 'non_vegetarian',
      smoking: 'never',
      drinking: 'occasionally',
      hobbies: ['fitness', 'running', 'dogs', 'camping'],
    },
    {
      diet: 'vegetarian',
      smoking: 'never',
      drinking: 'never',
      hobbies: ['bharatanatyam', 'meditation', 'books', 'cooking'],
    },
    {
      diet: 'non_vegetarian',
      smoking: 'never',
      drinking: 'occasionally',
      hobbies: ['trekking', 'board games', 'coding', 'movies'],
    },
    {
      diet: 'vegetarian',
      smoking: 'never',
      drinking: 'never',
      hobbies: ['gardening', 'baking', 'road trips', 'sketching'],
    },
  ];

  for (let i = 0; i < profiles.length; i++) {
    const ls = lifestyleRepo.create({
      profile_id: profiles[i].id,
      ...lifestyleData[i],
    });
    await lifestyleRepo.save(ls);
  }
  console.log('Created lifestyle details');

  // ── Location ───────────────────────────────────────────────────────
  const locationData = [
    {
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      pincode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
    },
    {
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400001',
      latitude: 19.076,
      longitude: 72.8777,
    },
    {
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110001',
      latitude: 28.6139,
      longitude: 77.209,
    },
    {
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
    },
    {
      country: 'India',
      state: 'Maharashtra',
      city: 'Pune',
      pincode: '411001',
      latitude: 18.5204,
      longitude: 73.8567,
    },
    {
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400050',
      latitude: 19.0596,
      longitude: 72.8295,
    },
    {
      country: 'India',
      state: 'Karnataka',
      city: 'Bangalore',
      pincode: '560078',
      latitude: 12.9141,
      longitude: 77.6411,
    },
    {
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110021',
      latitude: 28.5494,
      longitude: 77.2001,
    },
  ];

  for (let i = 0; i < profiles.length; i++) {
    const loc = locationRepo.create({
      profile_id: profiles[i].id,
      ...locationData[i],
    });
    await locationRepo.save(loc);
  }
  console.log('Created locations');

  // ── Photos ─────────────────────────────────────────────────────────
  const photoData = [
    [
      'https://randomuser.me/api/portraits/men/1.jpg',
      'https://randomuser.me/api/portraits/men/11.jpg',
    ],
    [
      'https://randomuser.me/api/portraits/women/2.jpg',
      'https://randomuser.me/api/portraits/women/12.jpg',
    ],
    ['https://randomuser.me/api/portraits/men/3.jpg'],
    [
      'https://randomuser.me/api/portraits/women/4.jpg',
      'https://randomuser.me/api/portraits/women/14.jpg',
    ],
    ['https://randomuser.me/api/portraits/men/5.jpg'],
    [
      'https://randomuser.me/api/portraits/women/6.jpg',
      'https://randomuser.me/api/portraits/women/16.jpg',
    ],
    ['https://randomuser.me/api/portraits/men/7.jpg'],
    ['https://randomuser.me/api/portraits/women/8.jpg'],
  ];

  for (let i = 0; i < profiles.length; i++) {
    for (let j = 0; j < photoData[i].length; j++) {
      const photo = photoRepo.create({
        profile_id: profiles[i].id,
        url: photoData[i][j],
        is_primary: j === 0,
        visibility: 'public',
      });
      await photoRepo.save(photo);
    }
  }
  console.log('Created photos');

  // ── Partner Preferences ────────────────────────────────────────────
  const prefData = [
    {
      age_min: 23,
      age_max: 30,
      height_min_cm: 155,
      height_max_cm: 170,
      marital_status_allowed: ['never_married'],
      education_levels: ['Bachelors', 'Masters', 'Doctorate'],
      occupations: ['Doctor', 'Engineer', 'Teacher', 'Consultant'],
      locations: ['Bangalore', 'Mumbai', 'Delhi'],
      diet_preferences: ['vegetarian'],
      smoking_preference: 'never',
      drinking_preference: 'never',
    },
    {
      age_min: 26,
      age_max: 33,
      height_min_cm: 170,
      height_max_cm: 185,
      marital_status_allowed: ['never_married'],
      education_levels: ['Masters', 'Doctorate'],
      occupations: ['Engineer', 'Doctor', 'CA', 'Consultant'],
      locations: ['Mumbai', 'Bangalore', 'Pune'],
      diet_preferences: ['vegetarian'],
      smoking_preference: 'never',
      drinking_preference: 'occasionally',
    },
    {
      age_min: 22,
      age_max: 28,
      height_min_cm: 155,
      height_max_cm: 168,
      marital_status_allowed: ['never_married'],
      education_levels: ['Bachelors', 'Masters'],
      locations: ['Delhi', 'Mumbai', 'Bangalore'],
      diet_preferences: ['vegetarian'],
      smoking_preference: 'never',
      drinking_preference: 'never',
    },
    {
      age_min: 25,
      age_max: 32,
      height_min_cm: 170,
      height_max_cm: 185,
      marital_status_allowed: ['never_married'],
      education_levels: ['Bachelors', 'Masters'],
      occupations: ['Engineer', 'Product Manager', 'Data Scientist'],
      locations: ['Bangalore', 'Mumbai'],
      smoking_preference: 'never',
      drinking_preference: 'occasionally',
    },
    {
      age_min: 24,
      age_max: 34,
      height_min_cm: 155,
      height_max_cm: 175,
      marital_status_allowed: ['never_married', 'divorced'],
      education_levels: ['Bachelors', 'Masters'],
      locations: ['Pune', 'Mumbai', 'Bangalore'],
      smoking_preference: 'never',
      drinking_preference: 'occasionally',
    },
    {
      age_min: 27,
      age_max: 33,
      height_min_cm: 170,
      height_max_cm: 183,
      marital_status_allowed: ['never_married'],
      education_levels: ['Masters', 'Doctorate'],
      occupations: ['Engineer', 'Consultant', 'Doctor'],
      locations: ['Mumbai', 'Bangalore', 'Chennai'],
      diet_preferences: ['vegetarian'],
      smoking_preference: 'never',
      drinking_preference: 'never',
    },
    {
      age_min: 23,
      age_max: 29,
      height_min_cm: 155,
      height_max_cm: 168,
      marital_status_allowed: ['never_married'],
      education_levels: ['Bachelors', 'Masters'],
      locations: ['Bangalore', 'Mumbai'],
      smoking_preference: 'never',
      drinking_preference: 'occasionally',
    },
    {
      age_min: 26,
      age_max: 32,
      height_min_cm: 170,
      height_max_cm: 182,
      marital_status_allowed: ['never_married'],
      education_levels: ['Masters'],
      occupations: ['Architect', 'Engineer', 'Designer'],
      locations: ['Delhi', 'Mumbai', 'Bangalore'],
      diet_preferences: ['vegetarian'],
      smoking_preference: 'never',
      drinking_preference: 'never',
    },
  ];

  for (let i = 0; i < profiles.length; i++) {
    const pp = prefRepo.create({ profile_id: profiles[i].id, ...prefData[i] });
    await prefRepo.save(pp);
  }
  console.log('Created partner preferences');

  // ── Privacy Settings ───────────────────────────────────────────────
  for (const p of profiles) {
    const ps = privacyRepo.create({
      profile_id: p.id,
      show_full_name: true,
      show_work_details: true,
      show_location_city: true,
      show_kundali_public: false,
      allow_non_connected_chat_requests: false,
    });
    await privacyRepo.save(ps);
  }
  console.log('Created privacy settings');

  // ── Kundali (for 3 profiles) ───────────────────────────────────────
  const kundaliData = [
    {
      index: 0,
      birth_date: '1995-03-15',
      birth_time: '06:30',
      birth_place: 'Jaipur',
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: '+5:30',
      rashi: 'Meena',
      nakshatra: 'Uttara Bhadrapada',
      lagna: 'Meena',
      manglik_status: 'non_manglik',
      kundali_generated: true,
      kundali_source: 'system',
    },
    {
      index: 1,
      birth_date: '1997-08-22',
      birth_time: '14:15',
      birth_place: 'Ahmedabad',
      latitude: 23.0225,
      longitude: 72.5714,
      timezone: '+5:30',
      rashi: 'Simha',
      nakshatra: 'Purva Phalguni',
      lagna: 'Dhanu',
      manglik_status: 'non_manglik',
      kundali_generated: true,
      kundali_source: 'system',
    },
    {
      index: 5,
      birth_date: '1998-12-10',
      birth_time: '05:45',
      birth_place: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      timezone: '+5:30',
      rashi: 'Vrishchika',
      nakshatra: 'Anuradha',
      lagna: 'Vrishchika',
      manglik_status: 'manglik',
      kundali_generated: true,
      kundali_source: 'system',
    },
  ];

  for (const kd of kundaliData) {
    const { index, ...data } = kd;
    const k = kundaliRepo.create({
      profile_id: profiles[index].id,
      ...data,
      generated_at: new Date(),
    });
    await kundaliRepo.save(k);
    await profileRepo.update(profiles[index].id, { has_kundali: true });
  }
  console.log('Created kundali data');

  // ── Verifications (for active profiles) ────────────────────────────
  const activeProfiles = profiles.filter((p) => p.profile_status === 'active');
  for (let i = 0; i < activeProfiles.length; i++) {
    const emailV = verificationRepo.create({
      profile_id: activeProfiles[i].id,
      type: 'email',
      status: 'verified',
      requested_at: new Date(),
      verified_at: new Date(),
      metadata: { email: usersData[i].email },
    });
    await verificationRepo.save(emailV);

    if (profilesData[i].phone_verified) {
      const phoneV = verificationRepo.create({
        profile_id: activeProfiles[i].id,
        type: 'phone',
        status: 'verified',
        requested_at: new Date(),
        verified_at: new Date(),
        metadata: { phone: usersData[i].phone },
      });
      await verificationRepo.save(phoneV);
    }
  }
  console.log('Created verifications');

  // ── Connections ────────────────────────────────────────────────────
  // Rahul -> Priya (accepted), Rahul -> Sneha (pending)
  // Amit -> Ananya (accepted), Vikram -> Priya (rejected)
  // Sneha -> Amit (pending)
  const connectionsData = [
    {
      from: 0,
      to: 1,
      status: 'accepted',
      message: 'Hi Priya, I liked your profile. Would love to connect!',
    },
    {
      from: 0,
      to: 3,
      status: 'pending',
      message: 'Hello Sneha, your profile interests me. Shall we connect?',
    },
    {
      from: 2,
      to: 5,
      status: 'accepted',
      message: 'Namaste Ananya, we share similar values. Let us connect.',
    },
    {
      from: 4,
      to: 1,
      status: 'rejected',
      message: 'Hi Priya, I found your profile very interesting.',
    },
    {
      from: 3,
      to: 2,
      status: 'pending',
      message:
        'Hi Amit, I came across your profile and would like to know more.',
    },
  ];

  const connections: Connection[] = [];
  for (const c of connectionsData) {
    const conn = connectionRepo.create({
      from_profile_id: profiles[c.from].id,
      to_profile_id: profiles[c.to].id,
      status: c.status,
      message: c.message,
      requested_at: new Date(),
      responded_at: c.status !== 'pending' ? new Date() : undefined,
    });
    connections.push(await connectionRepo.save(conn));
  }
  console.log(`Created ${connections.length} connections`);

  // ── Chat Threads & Messages (for accepted connections) ─────────────
  // Rahul <-> Priya
  const thread1 = threadRepo.create({
    profile1_id: profiles[0].id,
    profile2_id: profiles[1].id,
    last_message_at: new Date(),
  });
  await threadRepo.save(thread1);

  // Get manager IDs for chat messages
  const rahulManager = await managerRepo.findOne({
    where: { user_id: users[0].id, profile_id: profiles[0].id },
  });
  const priyaManager = await managerRepo.findOne({
    where: { user_id: users[1].id, profile_id: profiles[1].id },
  });

  if (rahulManager && priyaManager) {
    const chatMessages1 = [
      {
        thread_id: thread1.id,
        sender_profile_id: profiles[0].id,
        sender_manager_id: rahulManager.id,
        content: 'Hi Priya! Thanks for accepting my request. How are you?',
        message_type: 'text',
      },
      {
        thread_id: thread1.id,
        sender_profile_id: profiles[1].id,
        sender_manager_id: priyaManager.id,
        content:
          'Hi Rahul! I am doing well, thank you. Your profile is very impressive!',
        message_type: 'text',
      },
      {
        thread_id: thread1.id,
        sender_profile_id: profiles[0].id,
        sender_manager_id: rahulManager.id,
        content:
          'Thank you! I noticed you are a doctor. That is wonderful. What specialization?',
        message_type: 'text',
      },
      {
        thread_id: thread1.id,
        sender_profile_id: profiles[1].id,
        sender_manager_id: priyaManager.id,
        content:
          'I am in Cardiology. And I see you work at Google! How is Bangalore treating you?',
        message_type: 'text',
      },
    ];

    for (const msg of chatMessages1) {
      const m = messageRepo.create(msg);
      await messageRepo.save(m);
    }
  }

  // Amit <-> Ananya
  const thread2 = threadRepo.create({
    profile1_id: profiles[2].id,
    profile2_id: profiles[5].id,
    last_message_at: new Date(),
  });
  await threadRepo.save(thread2);

  const amitManager = await managerRepo.findOne({
    where: { user_id: users[2].id, profile_id: profiles[2].id },
  });
  const ananyaManager = await managerRepo.findOne({
    where: { user_id: users[5].id, profile_id: profiles[5].id },
  });

  if (amitManager && ananyaManager) {
    const chatMessages2 = [
      {
        thread_id: thread2.id,
        sender_profile_id: profiles[2].id,
        sender_manager_id: amitManager.id,
        content:
          'Namaste Ananya! I am Amit from Delhi. Nice to connect with you.',
        message_type: 'text',
      },
      {
        thread_id: thread2.id,
        sender_profile_id: profiles[5].id,
        sender_manager_id: ananyaManager.id,
        content:
          'Namaste Amit! Thank you for reaching out. I read you are into classical music — me too!',
        message_type: 'text',
      },
    ];

    for (const msg of chatMessages2) {
      const m = messageRepo.create(msg);
      await messageRepo.save(m);
    }
  }

  console.log('Created chat threads and messages');

  // ── Summary ────────────────────────────────────────────────────────
  console.log('\n=== Seed Complete ===');
  console.log(`Users:        ${users.length} (password for all: ${PASSWORD})`);
  console.log(
    `Profiles:     ${profiles.length} (6 active, 1 pending_verification, 1 draft)`,
  );
  console.log(
    `Connections:  ${connections.length} (2 accepted, 2 pending, 1 rejected)`,
  );
  console.log('Chat threads: 2 (with sample messages)');
  console.log('Kundali:      3 profiles have kundali data');
  console.log('\nLogin credentials:');
  for (let i = 0; i < users.length; i++) {
    console.log(
      `  ${profilesData[i].display_name.padEnd(20)} | ${usersData[i].email.padEnd(35)} | ${usersData[i].phone} | status: ${profilesData[i].profile_status}`,
    );
  }

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
