export interface MockReview {
  review_id: number;
  doctor_name: string;
  rating: number;
  content: string;
  created_at: string;
}

export const mockReviewData: MockReview[] = [
  {
    review_id: 1,
    doctor_name: '김수의',
    rating: 5,
    content:
      '정말 친절하고 전문적인 진료를 받았습니다. 우리 강아지가 무서워했는데 수의사님이 정말 잘 달래주셨어요. 시설도 깔끔하고 좋았습니다.',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    review_id: 2,
    doctor_name: '박동물',
    rating: 4,
    content:
      '진료비가 조금 비싸긴 하지만 의료진의 전문성은 확실합니다. 우리 고양이 수술을 성공적으로 해주셨어요.',
    created_at: '2024-01-10T14:20:00Z',
  },
  {
    review_id: 3,
    doctor_name: '이펫',
    rating: 5,
    content:
      '24시간 응급실이 있어서 밤에 응급상황이 생겼을 때 정말 도움이 되었습니다. 직원분들도 모두 친절하세요.',
    created_at: '2024-01-08T09:15:00Z',
  },
  {
    review_id: 4,
    doctor_name: '최애완',
    rating: 4,
    content: '주차장이 넓어서 좋았고, 대기시간도 그리 길지 않았습니다. 진료 결과도 만족스러웠어요.',
    created_at: '2024-01-05T16:45:00Z',
  },
  {
    review_id: 5,
    doctor_name: '정동물',
    rating: 5,
    content:
      '우리 강아지가 예방접종을 받았는데, 수의사님이 정말 자세히 설명해주셔서 좋았습니다. 다음에도 여기서 받을 예정이에요.',
    created_at: '2024-01-03T11:30:00Z',
  },
];

export const mockReviewSummary =
  '이 동물병원은 의료진의 전문성과 친절한 서비스로 높은 평가를 받고 있습니다. 특히 24시간 응급실 운영과 넓은 주차장, 깔끔한 시설이 장점으로 꼽히며, 진료비는 다소 높지만 그에 상응하는 의료 서비스를 제공합니다. 대부분의 리뷰에서 수의사들의 전문성과 친절함을 칭찬하고 있으며, 응급상황 대응 능력도 우수한 것으로 평가됩니다.';
