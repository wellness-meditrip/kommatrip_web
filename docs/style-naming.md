# 스타일 네이밍 가이드

## 핵심 규칙

- **Wrapper**: 페이지/큰 섹션을 감싸는 최상위 컨테이너.
- **Container**: 정렬/배치 목적의 레이아웃 전용 컨테이너.
- **Section**: 타이틀 + 콘텐츠로 구성된 논리적 구획.
- **Card**: 배경/테두리/그림자가 있는 정보 블록.
- **Row / Col**: 수평/수직 라인 아이템 정렬.
- **Box**: 의미가 애매한 단순 래퍼(최대한 지양).
- **Group**: 관련 요소를 하나로 묶는 그룹.
- **List / Item**: 반복되는 목록 구조와 항목.
- **Icon**: 아이콘 사이즈 고정/정렬 래퍼.
- **Chip / Badge**: 작은 라벨 토큰.

## 예시

- `pageWrapper`, `modalWrapper`
- `contentContainer`, `buttonContainer`
- `paymentSection`, `programSection`
- `companyCard`, `infoCard`
- `infoRow`, `amountRow`
- `addressBox`
- `timeSelectionGroup`
- `tagList`, `tagItem`
- `addressIcon`

## 권장/비권장

- 의미가 명확하면 `Card/Section/Row` 우선 사용.
- 더 구체적인 이름이 있으면 `Box` 사용하지 않기.
- 동일 컴포넌트 안에서는 일관된 네이밍 유지 (예: `tagList` + `tagChip`).

## 추가 규칙

- Row / Col은 레이아웃 전용이며 도메인 의미를 담지 않는다.
- State(is/has)와 Variant(type/size)는 구조 네이밍과 분리한다.
- Card는 시각적 컨테이너(배경/패딩/경계)를 갖는 독립 단위로만 사용한다.
