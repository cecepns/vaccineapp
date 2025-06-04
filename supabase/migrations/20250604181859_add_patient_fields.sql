-- Migration: Add new fields to patients table
ALTER TABLE patients
  ADD COLUMN sex VARCHAR(255) NOT NULL AFTER birth_date,
  ADD COLUMN nationality VARCHAR(255) NOT NULL AFTER sex,
  ADD COLUMN national_id VARCHAR(255) NULL AFTER nationality,
  ADD COLUMN doctor_name VARCHAR(255) NOT NULL AFTER national_id,
  ADD COLUMN vaccine_batch_number VARCHAR(255) NULL AFTER administration_location;
  ADD COLUMN disease_targeted VARCHAR(255) NULL AFTER vaccine_batch_number,
  ADD COLUMN disease_date VARCHAR(255) NULL AFTER disease_targeted,
  ADD COLUMN manufacture_brand_batch VARCHAR(255) NULL AFTER disease_date,
  ADD COLUMN next_booster_date VARCHAR(255) NULL AFTER manufacture_brand_batch,
  ADD COLUMN official_stamp_signature VARCHAR(255) NULL AFTER next_booster_date;

-- Rollback
-- ALTER TABLE patients
--   DROP COLUMN vaccine_batch_number,
--   DROP COLUMN doctor_name,
--   DROP COLUMN national_id,
--   DROP COLUMN nationality,
--   DROP COLUMN sex; 