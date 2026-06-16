export interface Patient {
  id: number;
  name: string;
  address: string;
  birth_date: string;
  vaccine_type: string;
  vaccine_date: string;
  valid_until: string;
  administration_location: string;
  slug: string;
  sex?: string;
  nationality?: string;
  national_id?: string;
  doctor_name?: string;
  vaccine_batch_number?: string;
  disease_targeted?: string;
  disease_date?: string;
  manufacture_brand_batch?: string;
  next_booster_date?: string;
  official_stamp_signature?: string;
}
