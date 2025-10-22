// 검색어 정규화 함수
export const normalizeSearchTerm = (term: string) => {
  return term
    .trim()
    .replace(/\s+/g, '') // 모든 공백 제거
    .toLowerCase();
};

// 유연한 검색 매칭 함수
export const isFlexibleMatch = (text: string, searchTerm: string) => {
  if (text.includes(searchTerm)) return true;

  // 검색어의 각 문자를 순서대로 포함하는지 확인
  let searchIndex = 0;
  for (let i = 0; i < text.length && searchIndex < searchTerm.length; i++) {
    if (text[i] === searchTerm[searchIndex]) {
      searchIndex++;
    }
  }
  return searchIndex === searchTerm.length;
};

// 통합된 회사 타입 정의
type Company = {
  id: number;
  name: string;
  address: string;
  tags?: string[];
  rating_average?: string;
  views_count?: number;
};

// 클라이언트 사이드 필터링 함수
export const filterCompanies = (companies: Array<Company>, searchTerm: string) => {
  if (!searchTerm.trim()) return companies;

  const normalizedSearchTerm = normalizeSearchTerm(searchTerm);

  return companies.filter((company) => {
    const companyName = normalizeSearchTerm(company.name);
    const companyAddress = normalizeSearchTerm(company.address);
    const companyTags =
      company.tags?.map((tag: string) => normalizeSearchTerm(tag)).join(' ') || '';

    return (
      isFlexibleMatch(companyName, normalizedSearchTerm) ||
      isFlexibleMatch(companyAddress, normalizedSearchTerm) ||
      isFlexibleMatch(companyTags, normalizedSearchTerm)
    );
  });
};

// 정렬 함수
export const sortCompanies = (companies: Array<Company>, sortType: string) => {
  const sorted = [...companies];

  switch (sortType) {
    case 'rating_high':
      return sorted.sort(
        (a, b) => parseFloat(b.rating_average || '0') - parseFloat(a.rating_average || '0')
      );
    case 'rating_low':
      return sorted.sort(
        (a, b) => parseFloat(a.rating_average || '0') - parseFloat(b.rating_average || '0')
      );
    case 'review_count':
      return sorted.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    default:
      return sorted;
  }
};
