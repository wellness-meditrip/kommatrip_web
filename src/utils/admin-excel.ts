import * as XLSX from 'xlsx';
import type { ColInfo, WorkBook, WorkSheet } from 'xlsx';
import type { AdminCompanyDetail, AdminProgramListItem } from '@/models';

type ExcelCellValue = number | string;
type ExcelRow = ExcelCellValue[];

interface ExcelWorksheet {
  name: string;
  rows: ExcelRow[];
}

export interface AdminCompanyProgramsExportBundle {
  company: AdminCompanyDetail;
  programs: AdminProgramListItem[];
}

const FALLBACK_VALUE = '-';

const COMPANY_STATUS_LABELS: Record<string, string> = {
  active: '활성',
  pending: '승인 대기',
  suspended: '중지',
};

const PROGRAM_STATUS_LABELS: Record<string, string> = {
  active: '활성',
  inactive: '비활성',
  draft: '임시 저장',
  suspended: '중지',
};

const padNumber = (value: number) => String(value).padStart(2, '0');

const getDateStamp = (value = new Date()) =>
  `${value.getFullYear()}-${padNumber(value.getMonth() + 1)}-${padNumber(value.getDate())}`;

const sanitizeFileNamePart = (value: string) => {
  const sanitized = value
    .replace(/[\\/:*?"<>|]/g, '-')
    .trim()
    .replace(/\s+/g, '-');

  return sanitized.length ? sanitized : 'admin-export';
};

const sanitizeWorksheetName = (name: string, index: number) => {
  const sanitized = name
    .replace(/[\\/*?:[\]]/g, ' ')
    .trim()
    .slice(0, 31);

  return sanitized.length ? sanitized : `Sheet${index + 1}`;
};

const formatOptionalText = (value: string | null | undefined) => {
  if (typeof value !== 'string') return FALLBACK_VALUE;
  return value.trim().length ? value : FALLBACK_VALUE;
};

const formatListValue = (value: string[] | null | undefined) =>
  Array.isArray(value) && value.length ? value.join(', ') : FALLBACK_VALUE;

const formatBoolean = (value: boolean | null | undefined) => (value ? '예' : '아니오');

const formatDateTime = (value: string | null | undefined) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return FALLBACK_VALUE;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
};

const formatNumberOrFallback = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : FALLBACK_VALUE;

const formatCompanyStatus = (status: string) => COMPANY_STATUS_LABELS[status] ?? status;

const formatProgramStatus = (status: string) => PROGRAM_STATUS_LABELS[status] ?? status;

const toCellText = (value: ExcelCellValue) => String(value);

const getWorksheetColumnWidths = (rows: ExcelRow[]): ColInfo[] => {
  const widths: number[] = [];

  for (const row of rows) {
    row.forEach((cell, index) => {
      const cellWidth = toCellText(cell).length + 2;
      widths[index] = Math.max(widths[index] ?? 10, cellWidth);
    });
  }

  return widths.map((width) => ({
    wch: Math.min(Math.max(width, 10), 40),
  }));
};

const buildWorksheet = (worksheet: ExcelWorksheet): WorkSheet => {
  const sheet = XLSX.utils.aoa_to_sheet(worksheet.rows);
  sheet['!cols'] = getWorksheetColumnWidths(worksheet.rows);

  return sheet;
};

const downloadWorkbook = async (fileName: string, worksheets: ExcelWorksheet[]) => {
  if (typeof window === 'undefined') {
    throw new Error('엑셀 다운로드는 브라우저 환경에서만 지원됩니다.');
  }

  const workbook: WorkBook = XLSX.utils.book_new();

  worksheets.forEach((worksheet, index) => {
    XLSX.utils.book_append_sheet(
      workbook,
      buildWorksheet(worksheet),
      sanitizeWorksheetName(worksheet.name, index)
    );
  });

  XLSX.writeFile(workbook, fileName, {
    compression: true,
  });
};

const buildCompanyWorksheet = (bundles: AdminCompanyProgramsExportBundle[]): ExcelWorksheet => ({
  name: '업체 정보',
  rows: [
    [
      '업체 ID',
      '업체 코드',
      '업체명',
      '간략 위치',
      '주소',
      '연락처',
      '상태',
      '승인 여부',
      '독점 여부',
      '카테고리',
      '편의시설',
      '영업일',
      '평일 오픈',
      '평일 마감',
      '주말 오픈',
      '주말 마감',
      '웹사이트',
      '인스타그램',
      'WhatsApp',
      '카카오톡',
      '배지',
      '하이라이트',
      '업체 소개',
      '예약 안내',
      '환불 규정',
      '오시는 길',
      '위도',
      '경도',
      '조회수',
      '평점 평균',
      '대표 이미지',
      '이미지 수',
      '등록일',
      '수정일',
    ],
    ...bundles.map(({ company }) => [
      company.id,
      formatOptionalText(company.company_code),
      formatOptionalText(company.name),
      formatOptionalText(company.simpleplace),
      formatOptionalText(company.address),
      formatOptionalText(company.phone),
      formatOptionalText(formatCompanyStatus(company.status)),
      formatBoolean(company.is_verified),
      formatBoolean(company.is_exclusive),
      formatListValue(company.tags),
      formatListValue(company.facilities),
      formatListValue(company.business_days),
      formatOptionalText(company.weekday_open_time),
      formatOptionalText(company.weekday_close_time),
      formatOptionalText(company.weekend_open_time),
      formatOptionalText(company.weekend_close_time),
      formatOptionalText(company.website_url),
      formatOptionalText(company.instagram_url),
      formatOptionalText(company.whats_app_url),
      formatOptionalText(company.kakao_url),
      formatOptionalText(company.badge),
      formatOptionalText(company.highlights),
      formatOptionalText(company.description),
      formatOptionalText(company.booking_information),
      formatOptionalText(company.refund_regulation),
      formatOptionalText(company.getting_here),
      formatNumberOrFallback(company.latitude),
      formatNumberOrFallback(company.longitude),
      company.views_count,
      formatOptionalText(company.rating_average),
      formatOptionalText(company.primary_image_url),
      company.image_urls.length,
      formatDateTime(company.created_at),
      formatDateTime(company.updated_at),
    ]),
  ],
});

const buildProgramWorksheet = (bundles: AdminCompanyProgramsExportBundle[]): ExcelWorksheet => ({
  name: '프로그램 정보',
  rows: [
    [
      '업체 ID',
      '업체 코드',
      '업체명',
      '프로그램 ID',
      '프로그램명',
      '상태',
      '가격(KRW)',
      '가격(USD)',
      '소요 시간(분)',
      '프로세스',
      '조회수',
      '예약 수',
      '대표 이미지',
      '이미지 수',
      '등록일',
    ],
    ...bundles.flatMap(({ company, programs }) =>
      programs.map((program) => [
        company.id,
        formatOptionalText(company.company_code),
        formatOptionalText(company.name),
        program.id,
        formatOptionalText(program.name),
        formatOptionalText(formatProgramStatus(program.status)),
        formatNumberOrFallback(program.price_info?.krw),
        formatNumberOrFallback(program.price_info?.usd),
        formatNumberOrFallback(program.duration_minutes),
        formatListValue(program.process),
        formatNumberOrFallback(program.views_count),
        formatNumberOrFallback(program.reservations_count),
        formatOptionalText(program.primary_image_url),
        program.image_urls.length,
        formatDateTime(program.created_at),
      ])
    ),
  ],
});

export const downloadAdminCompaniesWorkbook = async (
  bundles: AdminCompanyProgramsExportBundle[]
) => {
  const worksheets = [buildCompanyWorksheet(bundles), buildProgramWorksheet(bundles)];

  await downloadWorkbook(`admin-companies-${getDateStamp()}.xlsx`, worksheets);
};

export const downloadAdminCompanyProgramsWorkbook = async (
  bundle: AdminCompanyProgramsExportBundle
) => {
  const worksheets = [buildProgramWorksheet([bundle])];
  const fileName = `${sanitizeFileNamePart(
    bundle.company.company_code || bundle.company.name
  )}-programs-${getDateStamp()}.xlsx`;

  await downloadWorkbook(fileName, worksheets);
};
