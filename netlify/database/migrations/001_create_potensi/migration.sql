CREATE TABLE IF NOT EXISTS potensi (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  kabupaten TEXT,
  sektor TEXT,
  luas TEXT,
  staf TEXT,
  deskripsi TEXT,
  tanggal TEXT,
  lat TEXT,
  lng TEXT,
  alamat TEXT,
  checklist JSONB DEFAULT '{}'::jsonb,
  uploaded_docs JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nota (
  potensi_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  catatan TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (potensi_id, item_id)
);

CREATE TABLE IF NOT EXISTS realisasi (
  tahun INT PRIMARY KEY,
  total NUMERIC,
  catatan TEXT,
  sektors JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS custom_sektor (
  nama TEXT PRIMARY KEY
);
