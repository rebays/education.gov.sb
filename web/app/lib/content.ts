/**
 * Central mock content for the Resource Hub templates.
 *
 * Everything the page templates render comes from here, so wiring the site
 * to the Wagtail API later means replacing these arrays/helpers with fetch
 * calls — the shapes are chosen to mirror the CMS models (ResourceDocument,
 * publication pages, news pages).
 */

/* ------------------------------------------------------------------ */
/*  Resource library                                                   */
/* ------------------------------------------------------------------ */

export type CategorySlug =
  | "early-childhood"
  | "primary"
  | "junior-secondary"
  | "senior-secondary";

export type ResourceCategory = {
  slug: CategorySlug;
  title: string;
  shortTitle: string;
  description: string;
  image: string;
  count: string;
};

export const categories: ResourceCategory[] = [
  {
    slug: "early-childhood",
    title: "Early Childhood Education",
    shortTitle: "Early Childhood",
    description:
      "Play-based, language-rich resources for Solomon Islands children aged 3 to 5.",
    image: "/ece-classroom.png",
    count: "0 resources",
  },
  {
    slug: "primary",
    title: "Primary",
    shortTitle: "Primary",
    description:
      "Years 1–6 across English, Mathematics, Health, Christian Life Education, Arts and Culture and Physical Education.",
    image: "/primary-classroom.png",
    count: "74 resources",
  },
  {
    slug: "junior-secondary",
    title: "Junior Secondary",
    shortTitle: "Junior Secondary",
    description:
      "Years 7–9 across Agriculture, Arts and Culture, Business Studies, Christian Life Education, English, Health, Mathematics and Technology.",
    image: "/junior-secondary-classroom.png",
    count: "18 resources",
  },
  {
    slug: "senior-secondary",
    title: "Senior Secondary",
    shortTitle: "Senior Secondary",
    description:
      "Years 10–12 — preparing students for examinations and post-secondary study.",
    image: "/senior-secondary-classroom.png",
    count: "0 resources",
  },
];

export function getCategory(slug: string): ResourceCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

/**
 * There is no per-category page; category links land on the resource index
 * pre-filtered to the matching curriculum level.
 */
export function categoryHref(slug: CategorySlug): string {
  return `/resources?level=${slug}`;
}

export type Resource = {
  slug: string;
  title: string;
  category: CategorySlug;
  /** Short label shown in chips, e.g. Policy, Report, Video, Guide */
  kind: string;
  summary: string;
  format: string;
  /** File size, or duration for video */
  size: string;
  language: string;
  published: string;
  revised?: string;
  office: string;
  pages?: number;
};

export const resources: Resource[] = [
  /* ---- Policies & Documents ---- */
  {
    slug: "neap-2026-2030",
    title: "National Education Action Plan 2026–2030",
    category: "primary",
    kind: "Policy",
    summary:
      "The Ministry's five-year strategy for improving access, quality, and equity across the education sector.",
    format: "PDF",
    size: "3.2 MB",
    language: "English",
    published: "12 May 2026",
    revised: "12 May 2026",
    office: "Strategic Support Unit",
    pages: 96,
  },
  {
    slug: "curriculum-framework-primary",
    title: "National Curriculum Framework — Primary",
    category: "primary",
    kind: "Policy",
    summary:
      "Learning standards and subject outcomes for primary schools across the Solomon Islands.",
    format: "PDF",
    size: "2.4 MB",
    language: "English",
    published: "2 Mar 2026",
    office: "Curriculum Development Division",
    pages: 64,
  },
  {
    slug: "education-act-2023",
    title: "Education Act 2023 — Consolidated Edition",
    category: "junior-secondary",
    kind: "Legislation",
    summary:
      "The consolidated Education Act including amendments, governing the administration of education services.",
    format: "PDF",
    size: "1.8 MB",
    language: "English",
    published: "15 Aug 2023",
    revised: "10 Feb 2026",
    office: "Legal Services Unit",
    pages: 122,
  },
  {
    slug: "infrastructure-grants-guidelines",
    title: "School Infrastructure Grants — Guidelines",
    category: "primary",
    kind: "Guideline",
    summary:
      "Eligibility criteria and the application process for the 2026 school infrastructure grant round.",
    format: "PDF",
    size: "1.1 MB",
    language: "English",
    published: "18 Jan 2026",
    office: "Asset Management Division",
    pages: 28,
  },
  /* ---- Reports & Data ---- */
  {
    slug: "annual-performance-2025",
    title: "Education Sector Annual Performance Report 2025",
    category: "junior-secondary",
    kind: "Report",
    summary:
      "Enrolment, completion, and learning-outcome data measured against national education targets.",
    format: "PDF",
    size: "5.1 MB",
    language: "English",
    published: "28 Apr 2026",
    office: "Planning, Coordination & Research Division",
    pages: 148,
  },
  {
    slug: "ece-statistics-2025",
    title: "Early Childhood Education Statistics 2025",
    category: "early-childhood",
    kind: "Report",
    summary:
      "Provincial enrolment and access data for early childhood education providers.",
    format: "PDF",
    size: "4.7 MB",
    language: "English",
    published: "30 Jan 2026",
    office: "Planning, Coordination & Research Division",
    pages: 82,
  },
  {
    slug: "exam-results-analysis-2025",
    title: "National Examination Results Analysis 2025",
    category: "senior-secondary",
    kind: "Report",
    summary:
      "Analysis of SISE, SISC, and SINF examination outcomes by province, subject, and school type.",
    format: "PDF",
    size: "3.9 MB",
    language: "English",
    published: "12 Feb 2026",
    office: "National Examinations & Standards Unit",
    pages: 74,
  },
  {
    slug: "teacher-workforce-report-2025",
    title: "Teacher Workforce Report 2025",
    category: "junior-secondary",
    kind: "Report",
    summary:
      "Teacher numbers, qualifications, and deployment across all provinces and school levels.",
    format: "XLSX",
    size: "2.2 MB",
    language: "English",
    published: "5 Dec 2025",
    office: "Teaching Service Division",
  },
  /* ---- Videos & Media ---- */
  {
    slug: "tpd-series",
    title: "Teacher Professional Development Series",
    category: "primary",
    kind: "Video",
    summary:
      "Recorded training supporting classroom practice and the rollout of the national curriculum.",
    format: "MP4",
    size: "14 min",
    language: "English",
    published: "9 Mar 2026",
    office: "Teaching Service Division",
  },
  {
    slug: "curriculum-rollout-briefing",
    title: "Curriculum Rollout — Provincial Briefing",
    category: "primary",
    kind: "Video",
    summary:
      "Briefing for provincial education authorities on the phased rollout of the revised curriculum.",
    format: "MP4",
    size: "38 min",
    language: "English",
    published: "20 Feb 2026",
    office: "Curriculum Development Division",
  },
  {
    slug: "school-leaders-forum-2026",
    title: "National School Leaders Forum 2026 — Keynotes",
    category: "senior-secondary",
    kind: "Video",
    summary:
      "Keynote addresses from the annual forum for principals and school leaders in Honiara.",
    format: "MP4",
    size: "52 min",
    language: "English",
    published: "30 Jan 2026",
    office: "Strategic Support Unit",
  },
  {
    slug: "literacy-week-highlights",
    title: "National Literacy Week — Highlights",
    category: "primary",
    kind: "Video",
    summary:
      "Highlights from school events across the provinces during National Literacy Week.",
    format: "MP4",
    size: "9 min",
    language: "English",
    published: "14 Nov 2025",
    office: "Media & Communications Unit",
  },
  /* ---- Learning Resources ---- */
  {
    slug: "literacy-teacher-guide",
    title: "Early Grade Literacy — Teacher Guide",
    category: "primary",
    kind: "Guide",
    summary:
      "Structured lesson guidance for teaching early grade reading and writing, years 1–3.",
    format: "PDF",
    size: "6.8 MB",
    language: "English",
    published: "22 Apr 2026",
    office: "Curriculum Development Division",
    pages: 210,
  },
  {
    slug: "numeracy-workbook-y3",
    title: "Numeracy Workbook — Year 3",
    category: "primary",
    kind: "Workbook",
    summary:
      "Student practice workbook aligned to the Year 3 mathematics syllabus.",
    format: "PDF",
    size: "4.1 MB",
    language: "English",
    published: "10 Mar 2026",
    office: "Curriculum Development Division",
    pages: 88,
  },
  {
    slug: "science-kit-manual",
    title: "Primary Science Kit — Activity Manual",
    category: "primary",
    kind: "Manual",
    summary:
      "Hands-on activities using the standard primary science kit distributed to schools.",
    format: "PDF",
    size: "3.5 MB",
    language: "English",
    published: "18 Feb 2026",
    office: "Curriculum Development Division",
    pages: 56,
  },
  {
    slug: "phonics-flashcards",
    title: "Phonics Flashcards — Print Pack",
    category: "early-childhood",
    kind: "Print pack",
    summary:
      "Printable phonics flashcards and word-building cards for early grade classrooms.",
    format: "ZIP",
    size: "12.4 MB",
    language: "English",
    published: "2 Feb 2026",
    office: "Curriculum Development Division",
  },
];

export function getResourcesByCategory(slug: CategorySlug): Resource[] {
  return resources.filter((r) => r.category === slug);
}

export function getResource(
  category: string,
  slug: string,
): Resource | undefined {
  return resources.find((r) => r.category === category && r.slug === slug);
}

export function resourceHref(r: Resource): string {
  return `/resources/${r.category}/${r.slug}`;
}

/* ------------------------------------------------------------------ */
/*  Policies & publications (rich pages, not just files)               */
/* ------------------------------------------------------------------ */

export type PublicationType = "Policy" | "Report" | "Guideline";

export type Publication = {
  slug: string;
  title: string;
  type: PublicationType;
  date: string;
  format: string;
  size: string;
  office: string;
  summary: string;
  /** "At a glance" bullets shown above the body, when provided */
  keyPoints?: string[];
  /** Body blocks; items starting with "## " render as section headings */
  body: string[];
};

export const publications: Publication[] = [
  {
    slug: "neap-2026-2030",
    title: "National Education Action Plan 2026–2030",
    type: "Policy",
    date: "12 May 2026",
    format: "PDF",
    size: "3.2 MB",
    office: "Strategic Support Unit",
    summary:
      "The Ministry's five-year strategy for improving access, quality, and equity across the education sector.",
    keyPoints: [
      "Three goals: equitable access, quality teaching and learning, and stronger system management.",
      "Developed through consultations across all nine provinces.",
      "Annual work plans, with a mid-term review scheduled for 2028.",
      "Progress reported publicly through the sector performance report.",
    ],
    body: [
      "## Three goals for the sector",
      "The National Education Action Plan (NEAP) 2026–2030 sets the direction for the education sector over the next five years. It is built around three goals: improving equitable access to education at all levels, raising the quality of teaching and learning, and strengthening the management of the education system.",
      "## Developed with the provinces",
      "The plan was developed through consultation with provincial education authorities, school leaders, churches, development partners, and communities across all nine provinces. It responds to the findings of the 2025 sector review and aligns with the National Development Strategy.",
      "## Implementation and reporting",
      "Implementation is coordinated by the Strategic Support Unit, with annual work plans and a mid-term review scheduled for 2028. Progress is reported publicly through the Education Sector Annual Performance Report.",
    ],
  },
  {
    slug: "annual-performance-2025",
    title: "Education Sector Annual Performance Report 2025",
    type: "Report",
    date: "28 Apr 2026",
    format: "PDF",
    size: "5.1 MB",
    office: "Planning, Coordination & Research Division",
    summary:
      "Enrolment, completion, and learning-outcome data measured against national education targets.",
    keyPoints: [
      "Early childhood enrolment continues to grow nationally.",
      "Primary completion rates improved on 2024.",
      "The gender gap in secondary enrolment is narrowing.",
      "Teacher deployment to remote schools remains the key challenge.",
    ],
    body: [
      "## What the report covers",
      "The Annual Performance Report presents the state of the education sector for the 2025 school year, drawing on data from the Solomon Islands Education Management Information System (SIEMIS) and the national examination results.",
      "## Key findings for 2025",
      "The 2025 report shows continued growth in early childhood enrolment, improved completion rates in primary education, and a narrowing gender gap in secondary enrolment. It also identifies persistent challenges in teacher deployment to remote schools and in the condition of school infrastructure.",
      "## How the report is used",
      "The report is the primary accountability document for the sector and informs the annual budget submission and the joint sector review with development partners.",
    ],
  },
  {
    slug: "curriculum-framework-primary",
    title: "National Curriculum Framework — Primary",
    type: "Policy",
    date: "2 Mar 2026",
    format: "PDF",
    size: "2.4 MB",
    office: "Curriculum Development Division",
    summary:
      "Learning standards and subject outcomes for primary schools across the Solomon Islands.",
    body: [
      "The National Curriculum Framework for primary education defines what learners are expected to know and be able to do at each year level, across all learning areas.",
      "The framework emphasises literacy and numeracy in the early grades, learning in familiar languages, and the integration of local culture and environment into classroom practice. Subject syllabuses, teacher guides, and student materials are all derived from this framework.",
      "Schools and education authorities should use the framework alongside the phased rollout schedule published by the Curriculum Development Division.",
    ],
  },
  {
    slug: "ece-statistics-2025",
    title: "Early Childhood Education Statistics 2025",
    type: "Report",
    date: "30 Jan 2026",
    format: "PDF",
    size: "4.7 MB",
    office: "Planning, Coordination & Research Division",
    summary:
      "Provincial enrolment and access data for early childhood education providers.",
    body: [
      "This statistical digest covers registered early childhood education (ECE) centres across all provinces, including enrolment by age and gender, teacher qualifications, and centre facilities.",
      "The 2025 data shows continued expansion of community-based ECE provision, with the largest growth in Malaita and Western provinces. Access remains lowest in remote and artificial-island communities.",
      "The digest supports provincial planning and the national target of universal access to two years of early childhood education before primary school.",
    ],
  },
  {
    slug: "infrastructure-grants-guidelines",
    title: "School Infrastructure Grants — Guidelines",
    type: "Guideline",
    date: "18 Jan 2026",
    format: "PDF",
    size: "1.1 MB",
    office: "Asset Management Division",
    summary:
      "Eligibility criteria and the application process for the 2026 school infrastructure grant round.",
    body: [
      "These guidelines set out how registered schools can apply for the 2026 round of school infrastructure grants, which fund classroom construction, water and sanitation facilities, and staff housing.",
      "Applications are made through provincial education authorities and are assessed against published criteria: enrolment pressure, the condition of existing facilities, disaster resilience, and community contribution.",
      "The guidelines include the application form, the assessment rubric, and the reporting requirements for schools that receive funding.",
    ],
  },
  {
    slug: "language-education-policy",
    title: "Language in Education Policy",
    type: "Policy",
    date: "8 Dec 2025",
    format: "PDF",
    size: "1.6 MB",
    office: "Curriculum Development Division",
    summary:
      "Policy on the use of vernacular languages, Pijin, and English in Solomon Islands classrooms.",
    body: [
      "The Language in Education Policy establishes when and how vernacular languages, Solomon Islands Pijin, and English are used in teaching and learning.",
      "Evidence from the Pacific and internationally shows that children learn to read most successfully in a language they speak and understand. The policy therefore supports the use of familiar languages in the early grades, with a structured transition to English as a language of instruction.",
      "The policy applies to all schools and is supported by teacher guides and orientation materials from the Curriculum Development Division.",
    ],
  },
];

export function getPublication(slug: string): Publication | undefined {
  return publications.find((p) => p.slug === slug);
}

export function publicationYear(p: Publication): number {
  return Number(p.date.trim().split(/\s+/).pop());
}

/**
 * Official registry reference, e.g. MEHRD/2026/03 — numbered by publication
 * order within the year. Mirrors how the CMS will assign reference codes.
 */
export function publicationRef(p: Publication): string {
  const year = publicationYear(p);
  const ofYear = publications
    .filter((x) => publicationYear(x) === year)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const n = ofYear.findIndex((x) => x.slug === p.slug) + 1;
  return `MEHRD/${year}/${String(n).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  News                                                               */
/* ------------------------------------------------------------------ */

export type NewsCategory = "Announcement" | "Press release" | "Event";

export type NewsPost = {
  slug: string;
  title: string;
  category: NewsCategory;
  date: string;
  excerpt: string;
  /** Optional — stories without one get the designed deep-blue fallback */
  image?: string;
  /**
   * Body blocks. "## " prefix renders a section heading; "> " renders a
   * pull quote, with an optional attribution after a "|" separator.
   */
  body: string[];
};

export const news: NewsPost[] = [
  {
    slug: "neap-launch",
    title: "Ministry launches National Education Action Plan 2026–2030",
    category: "Press release",
    date: "14 May 2026",
    excerpt:
      "The five-year sector plan was launched in Honiara with provincial education authorities, partners, and school leaders in attendance.",
    image: "/sample.png",
    body: [
      "The Ministry of Education and Human Resources Development has officially launched the National Education Action Plan 2026–2030, the sector's guiding strategy for the next five years.",
      "Speaking at the launch, the Permanent Secretary thanked the provincial education authorities, churches, and development partners who contributed to the plan through consultations held across all nine provinces.",
      "> This plan belongs to every school, every community, and every child in the Solomon Islands.|Permanent Secretary, MEHRD",
      "The plan commits the Ministry to measurable improvements in access, quality, and system management, with progress reported annually. The full document and a summary version are available in the resource library.",
    ],
  },
  {
    slug: "exam-timetable-2026",
    title: "2026 national examination timetable released",
    category: "Announcement",
    date: "2 May 2026",
    excerpt:
      "Timetables for SISE, SISC, and SINF examinations are now available for schools and candidates.",
    image: "/svc-examinations.jpg",
    body: [
      "The National Examinations and Standards Unit has released the official timetable for the 2026 national examinations, covering the Solomon Islands Secondary Entrance (SISE), Solomon Islands School Certificate (SISC), and Solomon Islands National Form 6 (SINF) examinations.",
      "Principals are asked to display the timetable prominently and confirm candidate registrations with their provincial education authority by the published deadline.",
      "Candidates can find preparation resources, past papers, and study guides in the learning resources section of the hub.",
    ],
  },
  {
    slug: "teacher-training-expansion",
    title: "Teacher in-service training expands to three more provinces",
    category: "Press release",
    date: "20 Apr 2026",
    excerpt:
      "The school-based professional development programme will reach Temotu, Choiseul, and Rennell-Bellona this year.",
    image: "/svc-teachers.jpg",
    body: [
      "The Ministry's school-based in-service training programme for teachers will expand to Temotu, Choiseul, and Rennell-Bellona provinces in the 2026 school year.",
      "The programme supports teachers to strengthen literacy and numeracy instruction through structured lesson guides, classroom observation, and peer learning circles, without requiring travel away from their schools.",
      "Since the pilot began, more than 1,200 teachers have completed at least one module. Training materials and recorded sessions are available in the video library.",
    ],
  },
  {
    slug: "literacy-week-2026",
    title: "National Literacy Week 2026: 'Every child reading'",
    category: "Event",
    date: "8 Apr 2026",
    excerpt:
      "Schools across the country will celebrate reading with community events from 15–19 June.",
    image: "/cat-resources.jpg",
    body: [
      "National Literacy Week will run from 15 to 19 June 2026 under the theme 'Every child reading'. Schools, libraries, and communities are encouraged to hold reading events throughout the week.",
      "An activity pack for schools — including poster templates, reading challenge cards, and assembly ideas — is available for download from the learning resources section.",
      "Highlights from participating schools will be shared on the hub and the Ministry's media channels at the end of the week.",
    ],
  },
  {
    slug: "infrastructure-grants-open",
    title: "2026 school infrastructure grant round now open",
    category: "Announcement",
    date: "22 Jan 2026",
    excerpt:
      "Registered schools can apply for classroom, WASH, and staff-housing grants through their provincial education authority.",
    image: "/svc-registration.jpg",
    body: [
      "Applications are now open for the 2026 round of school infrastructure grants. Funding is available for classroom construction and repair, water and sanitation facilities, and staff housing.",
      "Schools apply through their provincial education authority using the forms attached to the published guidelines. The closing date for applications is 31 March 2026.",
      "Assessment criteria and reporting requirements are set out in the School Infrastructure Grants Guidelines, available in the document library.",
    ],
  },
  {
    slug: "digital-learning-pilot",
    title: "Digital learning pilot brings offline content to 40 schools",
    category: "Press release",
    date: "10 Dec 2025",
    excerpt:
      "Solar-powered content servers loaded with curriculum-aligned materials are being installed in pilot schools.",
    image: "/cat-videos.jpg",
    body: [
      "Forty schools in four provinces will take part in a digital learning pilot that provides offline access to curriculum-aligned videos, readers, and practice materials through low-power local servers.",
      "The pilot targets schools without reliable internet access. Content mirrors the materials available on this hub, so learners and teachers in pilot schools work from the same resources as connected schools.",
      "An evaluation in late 2026 will inform a decision on national rollout. Schools interested in future phases should contact the Ministry's ICT unit.",
    ],
  },
  {
    slug: "sise-results-2025",
    title: "SISE 2025 results released to schools",
    category: "Announcement",
    date: "28 Apr 2026",
    excerpt:
      "Results for the Solomon Islands Secondary Entrance examination are now with schools; candidates should contact their principal.",
    body: [
      "Results for the 2025 Solomon Islands Secondary Entrance (SISE) examination have been released to schools through provincial education authorities.",
      "Candidates should contact their school principal to receive their results. Certificates will follow through the usual provincial channels in the coming weeks.",
    ],
  },
  {
    slug: "new-classrooms-auki",
    title: "Twelve new classrooms handed over in Auki",
    category: "Press release",
    date: "24 Apr 2026",
    excerpt:
      "The double-storey classroom blocks will ease overcrowding for more than 400 students at two schools in Malaita's capital.",
    image: "/svc-registration.jpg",
    body: [
      "Two schools in Auki have received twelve new classrooms under the school infrastructure grants programme, easing overcrowding for more than 400 students.",
      "The buildings meet the national safe-schools standard, including cyclone-rated roofing and accessible ramps. Construction was completed by local contractors with community support.",
    ],
  },
  {
    slug: "world-book-day-2026",
    title: "Schools celebrate World Book Day with reading marathons",
    category: "Event",
    date: "23 Apr 2026",
    excerpt:
      "Students across the country marked World Book Day with reading marathons, storytelling, and book swaps.",
    image: "/cat-resources.jpg",
    body: [
      "Schools across the Solomon Islands celebrated World Book Day with reading marathons, storytelling sessions in vernacular languages, and student book swaps.",
      "The Ministry thanks the school libraries and community volunteers who organised events. Reading materials from the learning resources section remain free to download year-round.",
    ],
  },
  {
    slug: "teacher-graduation-2026",
    title: "Over 300 teachers graduate from in-service programme",
    category: "Press release",
    date: "15 Apr 2026",
    excerpt:
      "The latest cohort completed school-based professional development modules in literacy and numeracy instruction.",
    image: "/svc-teachers.jpg",
    body: [
      "More than 300 teachers have graduated from the school-based in-service training programme, completing modules in early grade literacy and numeracy instruction.",
      "Graduates received certificates at ceremonies held in their own provinces, avoiding the cost and disruption of travel to Honiara.",
    ],
  },
  {
    slug: "school-feeding-pilot",
    title: "School feeding pilot to begin in 20 rural schools",
    category: "Announcement",
    date: "12 Apr 2026",
    excerpt:
      "A locally sourced school meals pilot will run for two terms in selected rural primary schools.",
    body: [
      "Twenty rural primary schools will take part in a school feeding pilot from next term, serving meals prepared with locally sourced produce.",
      "The pilot tests whether regular school meals improve attendance and concentration, with results informing a national policy decision in 2027.",
    ],
  },
  {
    slug: "education-radio-program",
    title: "Education radio programme returns for term two",
    category: "Announcement",
    date: "1 Apr 2026",
    excerpt:
      "The weekly radio lessons for remote learners resume on SIBC with an expanded early grade line-up.",
    body: [
      "The Ministry's education radio programme returns for term two on SIBC, broadcasting weekly lessons for learners in remote communities.",
      "This term's line-up expands early grade literacy segments and adds a weekly quiz for upper primary students. Broadcast times are published in the resource library.",
    ],
  },
  {
    slug: "ict-labs-western",
    title: "Five ICT labs open in Western Province schools",
    category: "Press release",
    date: "28 Mar 2026",
    excerpt:
      "Solar-powered computer labs bring digital skills training to five community high schools.",
    image: "/cat-videos.jpg",
    body: [
      "Five community high schools in Western Province have opened solar-powered ICT labs equipped with laptops and offline learning servers.",
      "The labs support the digital skills strand of the revised curriculum and double as teacher resource centres after school hours.",
    ],
  },
  {
    slug: "inclusive-education-training",
    title: "Inclusive education training reaches 150 schools",
    category: "Press release",
    date: "25 Mar 2026",
    excerpt:
      "Teachers in three provinces completed training on supporting learners with disabilities in mainstream classrooms.",
    image: "/sample.png",
    body: [
      "Teachers from 150 schools have completed inclusive education training, learning practical strategies for supporting learners with disabilities in mainstream classrooms.",
      "The training was delivered with disability advocacy organisations and will expand to the remaining provinces in 2027.",
    ],
  },
  {
    slug: "registration-deadline-2026",
    title: "School registration renewals due 30 April",
    category: "Announcement",
    date: "20 Mar 2026",
    excerpt:
      "Schools with registrations expiring this year must submit renewal applications to their provincial authority by 30 April.",
    body: [
      "Schools whose registration expires in 2026 are reminded to submit renewal applications through their provincial education authority by 30 April.",
      "Late renewals may affect grant eligibility for the 2027 school year. The renewal checklist is available in the document library.",
    ],
  },
  {
    slug: "curriculum-materials-distribution",
    title: "New curriculum materials reach all nine provinces",
    category: "Press release",
    date: "15 Mar 2026",
    excerpt:
      "Shipments of revised primary syllabuses and teacher guides have arrived at provincial distribution points.",
    image: "/cat-documents.jpg",
    body: [
      "Shipments of the revised primary curriculum materials — syllabuses, teacher guides, and student readers — have now reached distribution points in all nine provinces.",
      "Education authorities will forward materials to schools before the start of term two. Digital copies remain available in the learning resources section.",
    ],
  },
  {
    slug: "science-fair-2026",
    title: "National science fair set for July in Honiara",
    category: "Event",
    date: "12 Mar 2026",
    excerpt:
      "Secondary students will present projects on climate, energy, and food security at the national science fair.",
    image: "/cat-reports.jpg",
    body: [
      "The national science fair returns this July at the Multipurpose Hall in Honiara, with secondary students presenting projects on climate, energy, and food security.",
      "Provincial rounds run through May; winning projects earn places at the national event and a share of the equipment prize pool.",
    ],
  },
  {
    slug: "siemis-training-provinces",
    title: "SIEMIS data training for provincial officers",
    category: "Announcement",
    date: "8 Mar 2026",
    excerpt:
      "Provincial education officers will complete refresher training on the education management information system.",
    body: [
      "Provincial education officers will complete refresher training on the Solomon Islands Education Management Information System (SIEMIS) over the coming month.",
      "Accurate school data underpins grant allocations, teacher deployment, and the annual performance report, and the training supports this year's census round.",
    ],
  },
  {
    slug: "tvet-expansion-malaita",
    title: "TVET expansion adds trades courses in Malaita",
    category: "Press release",
    date: "3 Mar 2026",
    excerpt:
      "Two rural training centres will offer new certificate courses in carpentry, plumbing, and small engine repair.",
    image: "/svc-registration.jpg",
    body: [
      "Two rural training centres in Malaita will offer new certificate courses in carpentry, plumbing, and small engine repair from term two.",
      "The expansion is part of the national skills strategy, matching training to employment demand in the provinces.",
    ],
  },
  {
    slug: "mobile-library-boat",
    title: "Mobile library boat begins service in Marovo Lagoon",
    category: "Press release",
    date: "26 Feb 2026",
    excerpt:
      "A library boat stocked with readers and teacher guides will visit island schools across the lagoon each fortnight.",
    image: "/cta-scholarships.jpg",
    body: [
      "A mobile library boat has begun fortnightly visits to island schools across Marovo Lagoon, carrying readers, teacher guides, and replacement curriculum materials.",
      "The service is a partnership between the Ministry, Western Province, and community donors, and will be evaluated for expansion to other lagoon communities.",
    ],
  },
  {
    slug: "ece-policy-consultation",
    title: "Early childhood policy consultation opens",
    category: "Announcement",
    date: "20 Feb 2026",
    excerpt:
      "Communities, churches, and providers are invited to comment on the draft early childhood education policy.",
    body: [
      "Public consultation has opened on the draft early childhood education policy, which sets standards for centres, teacher qualifications, and community management.",
      "Written submissions close 31 March. Consultation meetings will be held in each province through February and March.",
    ],
  },
  {
    slug: "rural-teacher-housing",
    title: "Sixty new teacher houses completed in remote schools",
    category: "Press release",
    date: "17 Feb 2026",
    excerpt:
      "The housing programme helps remote schools attract and keep qualified teachers.",
    image: "/svc-teachers.jpg",
    body: [
      "Sixty new teacher houses have been completed at remote schools across five provinces under the rural teacher housing programme.",
      "Adequate housing is one of the strongest factors in attracting and retaining qualified teachers at remote postings, a key challenge identified in the annual performance report.",
    ],
  },
  {
    slug: "education-forum-guadalcanal",
    title: "Guadalcanal education forum draws 200 school leaders",
    category: "Event",
    date: "12 Feb 2026",
    excerpt:
      "Principals and chairs of school boards met in Honiara to discuss the rollout of the new sector plan.",
    image: "/sample.png",
    body: [
      "More than 200 principals and school board chairs from Guadalcanal met in Honiara for the provincial education forum.",
      "Sessions covered the new sector plan, grant acquittals, and school improvement planning. Forums in the remaining provinces run through the first half of the year.",
    ],
  },
  {
    slug: "wash-grants-round",
    title: "WASH facilities grant round opens for applications",
    category: "Announcement",
    date: "5 Feb 2026",
    excerpt:
      "Grants for water, sanitation, and handwashing facilities are open to registered schools until 20 March.",
    body: [
      "Applications are open for the water, sanitation, and hygiene (WASH) facilities grant round, funding tanks, toilets, and handwashing stations.",
      "Registered schools apply through their provincial education authority by 20 March. Priority goes to schools without a protected water supply.",
    ],
  },
  {
    slug: "literacy-survey-results",
    title: "Early grade literacy survey shows steady gains",
    category: "Press release",
    date: "30 Jan 2026",
    excerpt:
      "The national early grade reading assessment records improvement for the third consecutive year.",
    image: "/cat-reports.jpg",
    body: [
      "Results from the national early grade reading assessment show a third consecutive year of improvement in reading fluency and comprehension.",
      "Gains are strongest in schools using the structured literacy teacher guides. The full report is available in the reports library.",
    ],
  },
  {
    slug: "scholarships-deadline-2026",
    title: "Scholarship applications close 28 February",
    category: "Announcement",
    date: "15 Jan 2026",
    excerpt:
      "Applicants for 2026 tertiary scholarships must complete their applications on the national portal by the closing date.",
    image: "/cta-scholarships.jpg",
    body: [
      "Applications for 2026 tertiary scholarships and study awards close on 28 February on the national scholarships portal.",
      "Applicants should confirm their documents are complete before submitting; incomplete applications cannot be assessed after the closing date.",
    ],
  },
  {
    slug: "new-ps-appointment",
    title: "New Permanent Secretary takes office at the Ministry",
    category: "Announcement",
    date: "12 Jan 2026",
    excerpt:
      "The incoming Permanent Secretary pledged continuity on the sector plan and closer work with the provinces.",
    body: [
      "The Ministry welcomed its new Permanent Secretary this week, following the retirement of the outgoing office holder after six years of service.",
      "Taking office, the incoming Permanent Secretary pledged continuity in implementing the sector plan and closer working relationships with provincial education authorities.",
    ],
  },
  {
    slug: "partnership-nz-launch",
    title: "New Zealand partnership renews support for basic education",
    category: "Press release",
    date: "8 Jan 2026",
    excerpt:
      "A renewed five-year partnership will support teacher training, learning materials, and school infrastructure.",
    image: "/cat-documents.jpg",
    body: [
      "The Solomon Islands Government and New Zealand have renewed their education partnership for a further five years.",
      "The partnership supports teacher professional development, learning materials production, and climate-resilient school infrastructure.",
    ],
  },
  {
    slug: "sports-competition-2025",
    title: "National schools athletics championship concludes",
    category: "Event",
    date: "5 Dec 2025",
    excerpt:
      "Western Province topped the medal table at the national schools athletics championship in Honiara.",
    image: "/cat-videos.jpg",
    body: [
      "The national schools athletics championship concluded at Lawson Tama Stadium, with Western Province topping the medal table.",
      "More than 600 student athletes competed across three days. The Ministry congratulates all provincial teams and the volunteer officials.",
    ],
  },
  {
    slug: "world-teachers-day-2025",
    title: "Solomon Islands honours teachers on World Teachers' Day",
    category: "Event",
    date: "5 Oct 2025",
    excerpt:
      "Ceremonies across the provinces recognised long-serving teachers and celebrated the profession.",
    image: "/svc-teachers.jpg",
    body: [
      "Ceremonies across all nine provinces marked World Teachers' Day, recognising long-serving teachers and celebrating the profession's contribution to national development.",
      "Forty teachers received long-service awards, including twelve who have taught for more than thirty years.",
    ],
  },
  {
    slug: "exam-prep-webinars",
    title: "Exam preparation broadcasts begin for Form 5 and 6",
    category: "Announcement",
    date: "26 Sep 2025",
    excerpt:
      "Weekly revision broadcasts on radio and the hub support candidates preparing for national examinations.",
    body: [
      "Weekly examination revision broadcasts for Form 5 and Form 6 candidates begin this week on radio, with recordings available in the video library.",
      "Sessions cover the core subjects, with past-paper walkthroughs from experienced examiners.",
    ],
  },
  {
    slug: "cyclone-recovery-schools",
    title: "All cyclone-affected schools reopen after recovery works",
    category: "Press release",
    date: "18 Sep 2025",
    excerpt:
      "Repairs to 28 schools damaged in the April cyclone season are complete, with all students back in class.",
    image: "/svc-registration.jpg",
    body: [
      "Repair works at the 28 schools damaged during the April cyclone season are complete, and all affected students are back in class.",
      "Rebuilt classrooms meet the safe-schools standard, and the Ministry thanks the communities and partners who supported the recovery programme.",
    ],
  },
  {
    slug: "library-week-2025",
    title: "National Library Week brings authors into classrooms",
    category: "Event",
    date: "8 Sep 2025",
    excerpt:
      "Local authors and storytellers visited schools across the country during National Library Week.",
    image: "/cat-resources.jpg",
    body: [
      "Local authors and traditional storytellers visited classrooms across the country during National Library Week.",
      "The week closed with the announcement of the national student writing competition winners, whose stories will be published as early readers.",
    ],
  },
  {
    slug: "unicef-ece-kits",
    title: "Early learning kits delivered to 300 ECE centres",
    category: "Press release",
    date: "28 Aug 2025",
    excerpt:
      "Play-based learning kits reached early childhood centres in partnership with UNICEF.",
    image: "/sample.png",
    body: [
      "Three hundred early childhood education centres have received play-based learning kits through a partnership with UNICEF.",
      "The kits support the early learning development standards and include materials for counting, letters, and fine motor play.",
    ],
  },
  {
    slug: "budget-briefing-2026",
    title: "Education budget briefing published for 2026",
    category: "Announcement",
    date: "15 Aug 2025",
    excerpt:
      "The Ministry has published a plain-language briefing on the 2026 education budget submission.",
    body: [
      "The Ministry has published a plain-language briefing on its 2026 budget submission, covering school grants, teacher payroll, and infrastructure priorities.",
      "The briefing is part of the Ministry's commitment to transparent public financial management and is available in the document library.",
    ],
  },
  {
    slug: "teacher-payroll-portal",
    title: "Teacher payroll enquiries move to new online portal",
    category: "Announcement",
    date: "4 Aug 2025",
    excerpt:
      "Teachers can now lodge and track payroll enquiries online using their registration number.",
    body: [
      "Teacher payroll enquiries can now be lodged and tracked through a new online portal, using the teacher's registration number and school code.",
      "Paper and phone channels remain open during the transition. The Teaching Service Division aims to resolve standard enquiries within ten working days.",
    ],
  },
];

export function getNewsPost(slug: string): NewsPost | undefined {
  return news.find((n) => n.slug === slug);
}

/* ------------------------------------------------------------------ */
/*  Search                                                             */
/* ------------------------------------------------------------------ */

export type SearchResult =
  | { kind: "resource"; item: Resource }
  | { kind: "publication"; item: Publication }
  | { kind: "news"; item: NewsPost };

export function searchContent(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  const matches = (...fields: string[]) => {
    const haystack = fields.join(" ").toLowerCase();
    return terms.every((t) => haystack.includes(t));
  };

  const results: SearchResult[] = [];
  for (const item of resources) {
    if (matches(item.title, item.summary, item.kind)) {
      results.push({ kind: "resource", item });
    }
  }
  for (const item of publications) {
    if (matches(item.title, item.summary, item.type, ...item.body)) {
      results.push({ kind: "publication", item });
    }
  }
  for (const item of news) {
    if (matches(item.title, item.excerpt, item.category, ...item.body)) {
      results.push({ kind: "news", item });
    }
  }
  return results;
}
