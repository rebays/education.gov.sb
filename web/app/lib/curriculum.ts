/**
 * Curriculum Index — mock data for the Subject x Grade/Year coverage map.
 *
 * Separate from the general resource library (`content.ts`): this models
 * the Ministry's curriculum structure directly (subjects taught at each
 * level, grade/form years, and the materials published against each pair).
 * A handful of entries mirror real items in the "learning" category of the
 * library (see `libraryRef`); the rest is deterministically generated so
 * the map has realistic-looking coverage without hand-authoring hundreds
 * of rows. Generation avoids Math.random so server and client render the
 * same data.
 */

import type { CategorySlug } from "./content";

export type Level = "primary" | "secondary";

export type Grade = {
  id: string;
  label: string;
  level: Level;
  order: number;
};

export const grades: Grade[] = [
  { id: "y1", label: "Year 1", level: "primary", order: 1 },
  { id: "y2", label: "Year 2", level: "primary", order: 2 },
  { id: "y3", label: "Year 3", level: "primary", order: 3 },
  { id: "y4", label: "Year 4", level: "primary", order: 4 },
  { id: "y5", label: "Year 5", level: "primary", order: 5 },
  { id: "y6", label: "Year 6", level: "primary", order: 6 },
  { id: "f1", label: "Form 1", level: "secondary", order: 1 },
  { id: "f2", label: "Form 2", level: "secondary", order: 2 },
  { id: "f3", label: "Form 3", level: "secondary", order: 3 },
  { id: "f4", label: "Form 4", level: "secondary", order: 4 },
  { id: "f5", label: "Form 5", level: "secondary", order: 5 },
  { id: "f6", label: "Form 6", level: "secondary", order: 6 },
];

export function getGrades(level: Level): Grade[] {
  return grades.filter((g) => g.level === level).sort((a, b) => a.order - b.order);
}

export type Subject = {
  id: string;
  name: string;
  levels: Level[];
};

export const subjects: Subject[] = [
  { id: "english", name: "English", levels: ["primary", "secondary"] },
  { id: "mathematics", name: "Mathematics", levels: ["primary", "secondary"] },
  { id: "science", name: "Science", levels: ["primary", "secondary"] },
  { id: "social-studies", name: "Social Studies", levels: ["primary", "secondary"] },
  { id: "health-pe", name: "Health & Physical Education", levels: ["primary", "secondary"] },
  { id: "religious-education", name: "Christian Religious Education", levels: ["primary", "secondary"] },
  { id: "arts-crafts", name: "Arts & Crafts", levels: ["primary"] },
  { id: "design-technology", name: "Design & Technology", levels: ["secondary"] },
  { id: "business-studies", name: "Business Studies", levels: ["secondary"] },
  { id: "agriculture", name: "Agriculture", levels: ["secondary"] },
];

export function getSubjects(level: Level): Subject[] {
  return subjects.filter((s) => s.levels.includes(level));
}

export type ResourceType =
  | "Syllabus"
  | "Teacher Guide"
  | "Workbook"
  | "Assessment"
  | "Video"
  | "Print Pack";

export const resourceTypes: ResourceType[] = [
  "Syllabus",
  "Teacher Guide",
  "Workbook",
  "Assessment",
  "Video",
  "Print Pack",
];

export type CurriculumResource = {
  id: string;
  title: string;
  subjectId: string;
  gradeId: string;
  level: Level;
  type: ResourceType;
  summary: string;
  format: string;
  size: string;
  updated: string;
  /** Set when this mirrors a real item in the general resource library. */
  libraryRef?: { category: CategorySlug; slug: string };
  /** Embed URL for the previewer, when the format supports one (PDF/slide deck). */
  previewUrl?: string;
};

/* ---- Hand-curated items, cross-referencing the real "learning" resources ---- */

const curated: CurriculumResource[] = [
  ...["y1", "y2", "y3"].map((gradeId) => ({
    id: `literacy-teacher-guide-${gradeId}`,
    title: "Early Grade Literacy — Teacher Guide",
    subjectId: "english",
    gradeId,
    level: "primary" as const,
    type: "Teacher Guide" as const,
    summary:
      "Structured lesson guidance for teaching early grade reading and writing, years 1–3.",
    format: "PDF",
    size: "6.8 MB",
    updated: "22 Apr 2026",
    libraryRef: { category: "primary" as const, slug: "literacy-teacher-guide" },
  })),
  ...["y1", "y2"].map((gradeId) => ({
    id: `phonics-flashcards-${gradeId}`,
    title: "Phonics Flashcards — Print Pack",
    subjectId: "english",
    gradeId,
    level: "primary" as const,
    type: "Print Pack" as const,
    summary: "Printable phonics flashcards and word-building cards for early grade classrooms.",
    format: "ZIP",
    size: "12.4 MB",
    updated: "2 Feb 2026",
    libraryRef: { category: "primary" as const, slug: "phonics-flashcards" },
  })),
  {
    id: "numeracy-workbook-y3",
    title: "Numeracy Workbook — Year 3",
    subjectId: "mathematics",
    gradeId: "y3",
    level: "primary",
    type: "Workbook",
    summary: "Student practice workbook aligned to the Year 3 mathematics syllabus.",
    format: "PDF",
    size: "4.1 MB",
    updated: "10 Mar 2026",
    libraryRef: { category: "primary", slug: "numeracy-workbook-y3" },
    previewUrl: "https://documents.education.gov.sb/embed/numeracy-workbook-y3.pdf",
  },
  ...["y4", "y5", "y6"].map((gradeId) => ({
    id: `science-kit-manual-${gradeId}`,
    title: "Primary Science Kit — Activity Manual",
    subjectId: "science",
    gradeId,
    level: "primary" as const,
    type: "Teacher Guide" as const,
    summary: "Hands-on activities using the standard primary science kit distributed to schools.",
    format: "PDF",
    size: "3.5 MB",
    updated: "18 Feb 2026",
    libraryRef: { category: "primary" as const, slug: "science-kit-manual" },
  })),
  {
    id: "numeracy-warmups-slides-y2",
    title: "Numeracy Warm-Ups — Lesson Slides",
    subjectId: "mathematics",
    gradeId: "y2",
    level: "primary",
    type: "Teacher Guide",
    summary: "A slide deck of five-minute number warm-up activities for the start of every Year 2 maths lesson.",
    format: "PPTX",
    size: "3.0 MB",
    updated: "6 May 2026",
    previewUrl: "https://documents.education.gov.sb/embed/numeracy-warmups-y2/slides",
  },
];

/* ---- Deterministic filler, so every subject has some coverage ---- */

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

const fillerKinds: { type: ResourceType; format: string; size: string }[] = [
  { type: "Syllabus", format: "PDF", size: "1.2 MB" },
  { type: "Teacher Guide", format: "PDF", size: "3.4 MB" },
  { type: "Workbook", format: "PDF", size: "2.1 MB" },
  { type: "Assessment", format: "PDF", size: "0.8 MB" },
  { type: "Video", format: "MP4", size: "9 min" },
  { type: "Print Pack", format: "ZIP", size: "5.6 MB" },
];

const updateDates = [
  "14 Jan 2026", "3 Feb 2026", "22 Feb 2026", "9 Mar 2026",
  "30 Mar 2026", "18 Apr 2026", "5 May 2026", "27 May 2026",
];

function generatedFiller(): CurriculumResource[] {
  const items: CurriculumResource[] = [];
  for (const subject of subjects) {
    for (const level of subject.levels) {
      for (const grade of getGrades(level)) {
        const seed = hash(`${subject.id}:${grade.id}`);
        const count = seed % 4; // 0–3 filler items per subject/grade cell
        for (let i = 0; i < count; i++) {
          const kind = fillerKinds[(seed + i) % fillerKinds.length];
          items.push({
            id: `gen-${subject.id}-${grade.id}-${i}`,
            title: `${subject.name} — ${grade.label} ${kind.type}`,
            subjectId: subject.id,
            gradeId: grade.id,
            level,
            type: kind.type,
            summary: `${kind.type} materials supporting the ${subject.name} syllabus for ${grade.label}.`,
            format: kind.format,
            size: kind.size,
            updated: updateDates[(seed + i) % updateDates.length],
          });
        }
      }
    }
  }
  return items;
}

export const curriculumResources: CurriculumResource[] = [...curated, ...generatedFiller()];

export function getCurriculumResourceById(id: string): CurriculumResource | undefined {
  return curriculumResources.find((r) => r.id === id);
}

const MONTH_INDEX: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseUpdated(date: string): number {
  const [day, mon, year] = date.split(" ");
  const month = MONTH_INDEX[mon];
  if (month === undefined) return 0;
  return new Date(Number(year), month, Number(day)).getTime();
}

export function getCurriculumResources(filter: {
  level: Level;
  subjectId?: string | null;
  gradeId?: string | null;
  type?: ResourceType | null;
  query?: string | null;
}): CurriculumResource[] {
  const q = filter.query?.trim().toLowerCase();
  return curriculumResources
    .filter((r) => {
      if (r.level !== filter.level) return false;
      if (filter.subjectId && r.subjectId !== filter.subjectId) return false;
      if (filter.gradeId && r.gradeId !== filter.gradeId) return false;
      if (filter.type && r.type !== filter.type) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => parseUpdated(b.updated) - parseUpdated(a.updated));
}

export function coverageCount(level: Level, subjectId: string, gradeId: string): number {
  let n = 0;
  for (const r of curriculumResources) {
    if (r.level === level && r.subjectId === subjectId && r.gradeId === gradeId) n++;
  }
  return n;
}
