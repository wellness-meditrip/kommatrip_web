export const PAGE_SIZE = 20 as const;

export const CLINIC_REVIEW_KEYWORDS: Record<string, string> = {
  // 진료/치료 (CARE)
  CUSTOMIZED_CARE: '맞춤 케어를 잘 해줘요',
  THOROUGH_TREATMENT: '진료/치료를 꼼꼼하게 해줘요',
  GOOD_EXPLANATION: '상담이 자세하고 설명을 잘 해줘요',
  NO_OVER_TREATMENT: '과잉 진료가 없어요',
  EFFECTIVE_TREATMENT: '치료 효과가 좋아요',
  KIND_DOCTOR: '원장님이 친절해요',

  // 서비스/가격 (SERVICE)
  INTERPRETER_AVAILABLE: '통역사가 상주해 있어 소통이 편해요',
  AFTERCARE_DETAIL: '사후 관리가 세심해요',
  REASONABLE_PRICE: '가격이 합리적이에요',
  NO_FORCEFUL_SELLING: '과도한 권유가 없어요',
  WORTH_THE_PRICE: '비싼 만큼 가치가 있어요',
  CLEAR_PRICE_GUIDE: '가격 안내가 명확해요',
  KIND_STAFF: '직원들이 친절해요',
  GUIDE_FOR_HERB_TRANSPORT: '한약 운반에 대한 가이드가 있어요',
  EASY_COMM_AFTER_RETURN: '귀국 후에도 소통하기 편해요',

  // 시설 (FACILITY)
  CLEAN_CLINIC: '병원이 위생적이에요',
  COMFORTABLE_ATMOSPHERE: '분위기가 편안해요',
  EASY_PARKING: '주차하기 편해요',
  WELL_DESIGNED_WAITING: '대기공간이 잘 되어 있어요',
  EASY_TO_FIND: '찾아가기 쉬워요',
} as const;
