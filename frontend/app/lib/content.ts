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

export type CategorySlug = "documents" | "reports" | "videos" | "learning";

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
    slug: "documents",
    title: "Policies & Documents",
    shortTitle: "Documents",
    description:
      "Education policies, acts, frameworks, circulars, and official ministry documents.",
    image: "/cat-documents.jpg",
    count: "320+ documents",
  },
  {
    slug: "reports",
    title: "Reports & Data",
    shortTitle: "Reports",
    description:
      "Annual reports, statistics, performance reviews, and education sector data.",
    image: "/cat-reports.jpg",
    count: "85+ reports",
  },
  {
    slug: "videos",
    title: "Videos & Media",
    shortTitle: "Videos",
    description:
      "Recorded events, training materials, announcements, and educational video content.",
    image: "/cat-videos.jpg",
    count: "140+ videos",
  },
  {
    slug: "learning",
    title: "Learning Resources",
    shortTitle: "Learning",
    description:
      "Curriculum materials, teacher guides, and resources for schools and learners.",
    image: "/cat-resources.jpg",
    count: "500+ resources",
  },
];

export function getCategory(slug: string): ResourceCategory | undefined {
  return categories.find((c) => c.slug === slug);
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
    category: "documents",
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
    category: "documents",
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
    category: "documents",
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
    category: "documents",
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
    category: "reports",
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
    category: "reports",
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
    category: "reports",
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
    category: "reports",
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
    category: "videos",
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
    category: "videos",
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
    category: "videos",
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
    category: "videos",
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
    category: "learning",
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
    category: "learning",
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
    category: "learning",
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
    category: "learning",
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
  image: string;
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
    image: "/soloclassroom.png",
    body: [
      "The Ministry of Education and Human Resources Development has officially launched the National Education Action Plan 2026–2030, the sector's guiding strategy for the next five years.",
      "Speaking at the launch, the Permanent Secretary thanked the provincial education authorities, churches, and development partners who contributed to the plan through consultations held across all nine provinces.",
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
