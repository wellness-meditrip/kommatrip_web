// export const CLINIC_REVIEW_KEYWORDS: Record<string, string> = {
//   // 진료/치료 (CARE)
//   CUSTOMIZED_CARE: '맞춤 케어를 잘 해줘요',
//   THOROUGH_TREATMENT: '진료/치료를 꼼꼼하게 해줘요',
//   GOOD_EXPLANATION: '상담이 자세하고 설명을 잘 해줘요',
//   NO_OVER_TREATMENT: '과잉 진료가 없어요',
//   EFFECTIVE_TREATMENT: '치료 효과가 좋아요',
//   KIND_DOCTOR: '원장님이 친절해요',

//   // 서비스/가격 (SERVICE)
//   INTERPRETER_AVAILABLE: '통역사가 상주해 있어 소통이 편해요',
//   AFTERCARE_DETAIL: '사후 관리가 세심해요',
//   REASONABLE_PRICE: '가격이 합리적이에요',
//   NO_FORCEFUL_SELLING: '과도한 권유가 없어요',
//   WORTH_THE_PRICE: '비싼 만큼 가치가 있어요',
//   CLEAR_PRICE_GUIDE: '가격 안내가 명확해요',
//   KIND_STAFF: '직원들이 친절해요',
//   GUIDE_FOR_HERB_TRANSPORT: '한약 운반에 대한 가이드가 있어요',
//   EASY_COMM_AFTER_RETURN: '귀국 후에도 소통하기 편해요',

//   // 시설 (FACILITY)
//   CLEAN_CLINIC: '병원이 위생적이에요',
//   COMFORTABLE_ATMOSPHERE: '분위기가 편안해요',
//   EASY_PARKING: '주차하기 편해요',
//   WELL_DESIGNED_WAITING: '대기공간이 잘 되어 있어요',
//   EASY_TO_FIND: '찾아가기 쉬워요',
// } as const;

export const CLINIC_REVIEW_KEYWORDS = [
  // CARE
  {
    keyword_code: 'CUSTOMIZED_CARE',
    keyword_name: '맞춤 케어를 잘 해줘요',
    category: 'CARE',
    is_positive: true,
  },
  {
    keyword_code: 'THOROUGH_TREATMENT',
    keyword_name: '진료/치료를 꼼꼼하게 해줘요',
    category: 'CARE',
    is_positive: true,
  },
  {
    keyword_code: 'GOOD_EXPLANATION',
    keyword_name: '상담이 자세하고 설명을 잘 해줘요',
    category: 'CARE',
    is_positive: true,
  },
  {
    keyword_code: 'NO_OVER_TREATMENT',
    keyword_name: '과잉 진료가 없어요',
    category: 'CARE',
    is_positive: true,
  },
  {
    keyword_code: 'EFFECTIVE_TREATMENT',
    keyword_name: '치료 효과가 좋아요',
    category: 'CARE',
    is_positive: true,
  },
  {
    keyword_code: 'KIND_DOCTOR',
    keyword_name: '원장님이 친절해요',
    category: 'CARE',
    is_positive: true,
  },

  // SERVICE
  {
    keyword_code: 'INTERPRETER_AVAILABLE',
    keyword_name: '통역사가 상주해 있어 소통이 편해요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'AFTERCARE_DETAIL',
    keyword_name: '사후 관리가 세심해요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'REASONABLE_PRICE',
    keyword_name: '가격이 합리적이에요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'NO_FORCEFUL_SELLING',
    keyword_name: '과도한 권유가 없어요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'WORTH_THE_PRICE',
    keyword_name: '비싼 만큼 가치가 있어요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'CLEAR_PRICE_GUIDE',
    keyword_name: '가격 안내가 명확해요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'KIND_STAFF',
    keyword_name: '직원들이 친절해요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'GUIDE_FOR_HERB_TRANSPORT',
    keyword_name: '한약 운반에 대한 가이드가 있어요',
    category: 'SERVICE',
    is_positive: true,
  },
  {
    keyword_code: 'EASY_COMM_AFTER_RETURN',
    keyword_name: '귀국 후에도 소통하기 편해요',
    category: 'SERVICE',
    is_positive: true,
  },

  // FACILITY
  {
    keyword_code: 'CLEAN_CLINIC',
    keyword_name: '병원이 위생적이에요',
    category: 'FACILITY',
    is_positive: true,
  },
  {
    keyword_code: 'COMFORTABLE_ATMOSPHERE',
    keyword_name: '분위기가 편안해요',
    category: 'FACILITY',
    is_positive: true,
  },
  {
    keyword_code: 'EASY_PARKING',
    keyword_name: '주차하기 편해요',
    category: 'FACILITY',
    is_positive: true,
  },
  {
    keyword_code: 'WELL_DESIGNED_WAITING',
    keyword_name: '대기공간이 잘 되어 있어요',
    category: 'FACILITY',
    is_positive: true,
  },
  {
    keyword_code: 'EASY_TO_FIND',
    keyword_name: '찾아가기 쉬워요',
    category: 'FACILITY',
    is_positive: true,
  },
];
