import * as XLSX from 'xlsx';

export interface ColumnMapping {
  case_black_no: string;
  case_red_no: string;
  hearing_date: string; // Will be parsed into date, month, year
  hearing_time: string;
  plaintiff_name: string;
  defendant_name: string;
  case_type: string;
  court_name: string;
  hearing_purpose: string;
  judge_name: string;
}

export interface CaseFormData {
  case_black_no: string;
  case_red_no: string;
  court_name: string;
  date: string;
  month: string;
  year: string;
  case_type: string;
  plaintiff_name: string;
  defendant_name: string;
  hearing_time: string;
  hearing_purpose: string;
  attendees_summary: string;
  paragraphs: string[];
  judge_1_name: string;
  judge_2_name: string;
  judge_๑_name?: string;
  judge_๒_name?: string;
  signatories: { position: string }[];
}

const THAI_MONTH_MAP: Record<string, string> = {
  'ม.ค.': 'มกราคม',
  'มกราคม': 'มกราคม',
  'ก.พ.': 'กุมภาพันธ์',
  'กุมภาพันธ์': 'กุมภาพันธ์',
  'มี.ค.': 'มีนาคม',
  'มีนาคม': 'มีนาคม',
  'เม.ย.': 'เมษายน',
  'เมษายน': 'เมษายน',
  'พ.ค.': 'พฤษภาคม',
  'พฤษภาคม': 'พฤษภาคม',
  'มิ.ย.': 'มิถุนายน',
  'มิถุนายน': 'มิถุนายน',
  'ก.ค.': 'กรกฎาคม',
  'กรกฎาคม': 'กรกฎาคม',
  'ส.ค.': 'สิงหาคม',
  'สิงหาคม': 'สิงหาคม',
  'ก.ย.': 'กันยายน',
  'กันยายน': 'กันยายน',
  'ต.ค.': 'ตุลาคม',
  'ตุลาคม': 'ตุลาคม',
  'พ.ย.': 'พฤศจิกายน',
  'พฤศจิกายน': 'พฤศจิกายน',
  'ธ.ค.': 'ธันวาคม',
  'ธันวาคม': 'ธันวาคม',
};

/**
 * Parses Thai date formats like "05 ต.ค. 69", "5 ตุลาคม 2569", "2026-10-05"
 */
export function parseThaiDate(rawDateStr: any): { date: string; month: string; year: string } {
  const result = {
    date: '5',
    month: 'ตุลาคม',
    year: '2569',
  };

  if (!rawDateStr) return result;
  const str = String(rawDateStr).trim();

  // Pattern 1: "05 ต.ค. 69" or "5 ตุลาคม 2569" or "05 ต.ค. 2569"
  const thaiTextMatch = str.match(/^(\d{1,2})\s*([^\d\s]+)\s*(\d{2,4})$/);
  if (thaiTextMatch && thaiTextMatch[1] && thaiTextMatch[2] && thaiTextMatch[3]) {
    const rawDay = parseInt(thaiTextMatch[1], 10);
    result.date = String(rawDay);

    const rawMonth = thaiTextMatch[2].trim();
    result.month = THAI_MONTH_MAP[rawMonth] || rawMonth;

    let rawYear = parseInt(thaiTextMatch[3], 10);
    if (rawYear < 100) {
      rawYear += 2500;
    }
    result.year = String(rawYear);
    return result;
  }

  // Pattern 2: "05/10/2569" or "05/10/69"
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch && slashMatch[1] && slashMatch[2] && slashMatch[3]) {
    result.date = String(parseInt(slashMatch[1], 10));
    const mNum = parseInt(slashMatch[2], 10);
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    result.month = months[mNum - 1] || 'ตุลาคม';
    let rawYear = parseInt(slashMatch[3], 10);
    if (rawYear < 100) rawYear += 2500;
    result.year = String(rawYear);
    return result;
  }

  return result;
}

/**
 * Parses an Excel / CSV File or text into JSON rows and column headers with UTF-8 support
 * and intelligent detection of court metadata headers (such as "วันนัดพิจารณา...", "แผ่นที่ 1")
 */
export async function parseExcelFile(
  fileOrContent: File | string | ArrayBuffer
): Promise<{
  headers: string[];
  rows: Record<string, any>[];
}> {
  let workbook: XLSX.WorkBook;

  if (typeof fileOrContent === 'string') {
    workbook = XLSX.read(fileOrContent, { type: 'string', codepage: 874 });
  } else if (fileOrContent instanceof ArrayBuffer) {
    workbook = XLSX.read(fileOrContent, { type: 'array', codepage: 874 });
  } else {
    const arrayBuffer = await fileOrContent.arrayBuffer();
    // Decode with utf-8 / binary fallback
    workbook = XLSX.read(arrayBuffer, { type: 'array', codepage: 874 });
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('ไม่พบแผ่นงาน (Sheet) ในไฟล์ Excel');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    throw new Error('ไม่สามารถอ่านข้อมูลแผ่นงานได้');
  }

  // Read as raw 2D array matrix to locate true header row
  const matrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (matrix.length === 0) {
    throw new Error('ไฟล์ Excel ไม่มีข้อมูลหรือแถวว่าง');
  }

  // Court table header detection keywords
  const COURT_HEADER_KEYWORDS = ['เลขดำ', 'เลขคดี', 'โจทก์', 'จำเลย', 'วันที่นัด', 'ผู้พิพากษา', 'เวลา', 'เรื่อง'];

  let headerRowIndex = 0;
  let maxScore = -1;

  for (let i = 0; i < Math.min(matrix.length, 15); i++) {
    const row = matrix[i] || [];
    const nonEmptyCells = row.map((c) => String(c).trim()).filter(Boolean);
    if (nonEmptyCells.length < 3) continue;

    const rowText = nonEmptyCells.join(' ').toLowerCase();
    const matchedKeywords = COURT_HEADER_KEYWORDS.filter((kw) => rowText.includes(kw));
    const score = matchedKeywords.length * 10 + nonEmptyCells.length;

    if (matchedKeywords.length >= 2 && score > maxScore) {
      maxScore = score;
      headerRowIndex = i;
    }
  }

  const rawHeaders = matrix[headerRowIndex] || [];
  const headersWithDuplicates: string[] = [];
  const headerCounts: Record<string, number> = {};

  for (let colIdx = 0; colIdx < rawHeaders.length; colIdx++) {
    let hName = String(rawHeaders[colIdx] || '').trim();
    if (!hName) {
      headersWithDuplicates.push(`_COL_${colIdx}`);
      continue;
    }
    if (headerCounts[hName]) {
      headerCounts[hName]++;
      hName = `${hName}_${headerCounts[hName]}`;
    } else {
      headerCounts[hName] = 1;
    }
    headersWithDuplicates.push(hName);
  }

  const headers = headersWithDuplicates.filter((h) => !h.startsWith('_COL_'));

  // Parse rows below the header row
  const rows: Record<string, any>[] = [];
  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const rowData = matrix[r];
    if (!rowData) continue;

    const rowObj: Record<string, any> = {};
    for (let c = 0; c < headersWithDuplicates.length; c++) {
      const key = headersWithDuplicates[c];
      if (key && !key.startsWith('_COL_')) {
        rowObj[key] = rowData[c] !== undefined ? String(rowData[c]).trim() : '';
      }
    }

    // A row is valid if it has at least one identifying property
    const hasValues = Object.values(rowObj).some((val) => Boolean(val && String(val).trim()));
    if (hasValues) {
      rows.push(rowObj);
    }
  }

  if (rows.length === 0) {
    throw new Error('ไม่พบแถวข้อมูลคดีในไฟล์ Excel');
  }

  return { headers, rows };
}

/**
 * Guesses the best column mapping based on standard Thai court column names
 */
export function guessColumnMapping(headers: string[]): ColumnMapping {
  const findMatch = (candidates: string[]) => {
    for (const c of candidates) {
      const match = headers.find((h) => h.toLowerCase().includes(c.toLowerCase()));
      if (match) return match;
    }
    return '';
  };

  return {
    case_black_no: findMatch(['เลขดำที่', 'เลขดำ', 'คดีดำ', 'black_no']),
    case_red_no: findMatch(['เลขที่แดง', 'เลขแดง', 'คดีแดง', 'red_no']),
    hearing_date: findMatch(['วันที่นัด', 'วันนัด', 'วันที่', 'date']),
    hearing_time: findMatch(['เวลา', 'เวลานัด', 'time']),
    plaintiff_name: findMatch(['โจทก์/ผู้ร้อง', 'โจทก์', 'ผู้ร้อง', 'plaintiff']),
    defendant_name: findMatch(['จำเลย', 'ผู้ถูกร้อง', 'defendant']),
    case_type: findMatch(['ประเภทความ', 'ความ', 'ประเภทคดี', 'case_type']),
    court_name: findMatch(['ศาล', 'court']),
    hearing_purpose: findMatch(['นัดมาทำไม', 'นัดเพื่อ', 'นัด']),
    judge_name: findMatch(['ผู้พิพากษา', 'องค์คณะ', 'judge']),
  };
}

/**
 * Helper to parse comma/space separated attendees string into string array of positions
 */
export function parseAttendeesList(input: any): string[] {
  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === 'object' && item?.position ? item.position : String(item)))
      .map((s) => s.trim().replace(/^และ\s*/, '').trim())
      .filter(Boolean);
  }
  if (typeof input === 'string' && input.trim()) {
    const text = input.trim();
    const raw = (text.includes(',') || text.includes('\n')) ? text.split(/[,\n]+/) : text.split(/\s+/);
    return raw.map((s) => s.trim().replace(/^และ\s*/, '').trim()).filter(Boolean);
  }
  return [];
}

/**
 * Format positions array into natural Thai summary string: "ทนายโจทก์ โจทก์ ทนายจำเลย และจำเลย"
 */
export function formatAttendeesSummary(positions: string[]): string {
  const cleaned = positions.map((p) => p.trim()).filter(Boolean);
  if (cleaned.length === 0) return '';
  if (cleaned.length === 1) return cleaned[0];
  return `${cleaned.slice(0, -1).join(' ')} และ${cleaned[cleaned.length - 1]}`;
}

/**
 * Convert string array of positions into signatories array for docx loop: [{ position: 'ทนายโจทก์' }, ...]
 */
export function positionsToSignatories(positions: string[]): { position: string }[] {
  return positions
    .map((p) => p.trim())
    .filter(Boolean)
    .map((position) => ({ position }));
}

export const COMMON_CASE_TYPES = [
  'แพ่ง',
  'อาญา',
  'ผู้บริโภค',
  'ล้มละลาย',
  'แรงงาน',
  'เยาวชนและครอบครัว',
  'ภาษีอากร',
  'ทรัพย์สินทางปัญญา',
  'มโนสาเร่',
  'ไม่มีข้อพิพาท',
];

/**
 * Resolves appropriate Thai court case category (ความ)
 * Never uses claim/offense text (เรื่อง) as case_type
 */
export function resolveCaseType(rawType?: string, blackNo?: string): string {
  if (rawType && typeof rawType === 'string') {
    const trimmed = rawType.trim();
    const match = COMMON_CASE_TYPES.find((t) => trimmed === t || trimmed.startsWith(t));
    if (match) return match;

    const isClaimDesc =
      trimmed.length > 15 ||
      trimmed.includes('สัญญา') ||
      trimmed.includes('ละเมิด') ||
      trimmed.includes('กู้ยืม') ||
      trimmed.includes('ขับไล่') ||
      trimmed.includes('เช่า') ||
      trimmed.includes('บัตรเครดิต');

    if (!isClaimDesc && trimmed.length <= 10 && trimmed.length > 0) {
      return trimmed;
    }
  }

  if (blackNo && typeof blackNo === 'string') {
    const bn = blackNo.trim();
    if (/^(อ|อท|อม|อย|อช)/i.test(bn)) return 'อาญา';
    if (/^ล/i.test(bn)) return 'ล้มละลาย';
    if (/^ร/i.test(bn)) return 'แรงงาน';
    if (/^ผบ/i.test(bn)) return 'แพ่ง';
  }

  return 'แพ่ง';
}

/**
 * Converts a selected Excel row into CaseFormData using the active column mapping
 */
export function convertRowToFormData(
  row: Record<string, any>,
  mapping: ColumnMapping,
  defaultCourt = ''
): CaseFormData {
  const rawDate = row[mapping.hearing_date];
  const { date, month, year } = parseThaiDate(rawDate);

  const rawBlackNo = row[mapping.case_black_no];
  const rawRedNo = row[mapping.case_red_no];
  const rawTime = row[mapping.hearing_time];
  const rawPlaintiff = row[mapping.plaintiff_name];
  const rawDefendant = row[mapping.defendant_name];
  const rawTypeVal = mapping.case_type && row[mapping.case_type] ? row[mapping.case_type] : '';
  const caseType = resolveCaseType(rawTypeVal, rawBlackNo);
  const rawCourt = mapping.court_name && row[mapping.court_name] ? row[mapping.court_name] : defaultCourt;
  const rawPurpose = mapping.hearing_purpose && row[mapping.hearing_purpose] ? row[mapping.hearing_purpose] : 'พิจารณา';
  const rawJudge = mapping.judge_name && row[mapping.judge_name] ? row[mapping.judge_name] : 'นาย สมศักดิ์ ยุติธรรม';

  // Format time properly (e.g., "9" or "9.00" -> "09.00")
  let formattedTime = String(rawTime || '').trim();
  if (formattedTime === '9' || formattedTime === '9.0' || formattedTime === '9.00') {
    formattedTime = '09.00';
  } else if (/^\d{1,2}\.\d{1,2}$/.test(formattedTime)) {
    const [h, m] = formattedTime.split('.');
    formattedTime = `${h.padStart(2, '0')}.${m.padEnd(2, '0')}`;
  } else if (!formattedTime) {
    formattedTime = '09.00';
  }

  // Handle case_red_no: if blank, format with slash year e.g. "/2569"
  let formattedRedNo = rawRedNo ? String(rawRedNo).trim() : '';
  if (!formattedRedNo && year) {
    formattedRedNo = `/${year}`;
  }

  const defaultPositions = ['ทนายโจทก์', 'โจทก์', 'ทนายจำเลย', 'จำเลย'];

  return {
    case_black_no: rawBlackNo ? String(rawBlackNo).trim() : '',
    case_red_no: formattedRedNo,
    court_name: rawCourt ? String(rawCourt).trim() : defaultCourt,
    date,
    month,
    year,
    case_type: caseType,
    plaintiff_name: rawPlaintiff ? String(rawPlaintiff).trim() : '',
    defendant_name: rawDefendant ? String(rawDefendant).trim() : '',
    hearing_time: formattedTime,
    hearing_purpose: rawPurpose ? String(rawPurpose).trim() : 'พิจารณา',
    attendees_summary: formatAttendeesSummary(defaultPositions),
    paragraphs: [''],
    judge_1_name: String(rawJudge).trim(),
    judge_2_name: 'นางสาว ดวงใจ ซื่อตรง',
    judge_๑_name: String(rawJudge).trim(),
    judge_๒_name: 'นางสาว ดวงใจ ซื่อตรง',
    signatories: positionsToSignatories(defaultPositions)
  };
}
