import {
  CategoryAllCare,
  CategorySpa,
  CategoryFacialCare,
  CategoryMedicine,
  CategoryMedicalBeauty,
  CategoryHeadSpa,
} from '@/icons';

export const CATEGORIES = [
  {
    id: 'all-care',
    name: 'All',
    nameKey: 'all',
    icon: <CategoryAllCare width="24px" height="24px" />,
  },
  {
    id: 'spa-therapy',
    name: 'Spa & Therapy',
    nameKey: 'spaTherapy',
    icon: <CategorySpa width="24px" height="24px" />,
  },
  {
    id: 'facial-care',
    name: 'Facial Care',
    nameKey: 'facialCare',
    icon: <CategoryFacialCare width="24px" height="24px" />,
  },
  {
    id: 'traditional-medicine',
    name: 'Traditional Medicine',
    nameKey: 'traditionalMedicine',
    icon: <CategoryMedicine width="24px" height="24px" />,
  },
  {
    id: 'medical-beauty',
    name: 'Medical Beauty',
    nameKey: 'medicalBeauty',
    icon: <CategoryMedicalBeauty width="24px" height="24px" />,
  },
  {
    id: 'head-spa',
    name: 'Head Spa',
    nameKey: 'headSpa',
    icon: <CategoryHeadSpa width="24px" height="24px" />,
  },
];
