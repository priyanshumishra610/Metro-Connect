-- Metro Connect — real metro network data for Delhi (NCR), Bengaluru, Kochi
--
-- Replaces the single placeholder Delhi line (4 fake stations) that
-- 0001_schema.sql's design anticipated but never got real data for. Every
-- line/station below is a currently-*operational* corridor only — lines and
-- extensions still under construction as of Aug 2026 (e.g. Namma Metro Pink
-- & Blue, DMRC Phase IV) are deliberately left out rather than inserted as
-- inactive placeholders, per brief §6/§16/§19 ("a second city is a new row,
-- never a schema change") — activate them with the same upsert pattern once
-- they open instead of un-hiding rows seeded ahead of time.
--
-- Station names/sequences/interchanges are sourced from each line's own
-- Wikipedia article (cross-checked against official sites and, for
-- Bengaluru, OSM data tagged to bmrc.co.in) — not from the two fan sites
-- originally linked, which turned out to have only partial station lists.
-- Latitude/longitude is included where a source gave real coordinates
-- (all of Bengaluru) and left null elsewhere (Delhi, Kochi) rather than
-- guessed — nothing in the app currently reads these columns, so this is
-- safe to backfill later without touching matching logic.
--
-- Run this after 0001–0005 (see docs/SUPABASE_SETUP.md).

-- ─────────────────────────────────────────────────────────────────────────
-- Interchange linking — a real interchange is the same physical station
-- represented as two+ rows (one per line, per the existing
-- (city_id, metro_line_id, name) uniqueness). interchange_group is a shared
-- slug across those rows so discover_commuters/can_view_profile can treat
-- "both change trains at Rajiv Chowk" as route overlap, not just an exact
-- station_id match. Only set below for interchanges that are themselves
-- fully operational today — several stations already carry a *future*
-- interchange (e.g. Azadpur ↔ Magenta Phase IV) that isn't open yet, so
-- those are deliberately left ungrouped until that line opens.
-- ─────────────────────────────────────────────────────────────────────────

alter table stations add column if not exists interchange_group text;
create index if not exists idx_stations_interchange_group on stations(interchange_group) where interchange_group is not null;

-- ─────────────────────────────────────────────────────────────────────────
-- Cities, systems, lines
-- ─────────────────────────────────────────────────────────────────────────

insert into cities (name, country, timezone) values
  ('Delhi', 'India', 'Asia/Kolkata'),
  ('Bengaluru', 'India', 'Asia/Kolkata'),
  ('Kochi', 'India', 'Asia/Kolkata')
on conflict (name) do nothing;

insert into metro_systems (city_id, name)
select c.id, s.name from cities c
join (values ('Delhi', 'Delhi Metro'), ('Delhi', 'Noida Metro'), ('Bengaluru', 'Namma Metro'), ('Kochi', 'Kochi Metro')) as s(city, name)
  on s.city = c.name
on conflict (city_id, name) do nothing;

insert into metro_lines (metro_system_id, name, color_hex)
select ms.id, l.name, l.color from metro_systems ms
join cities c on c.id = ms.city_id
join (values
  ('Delhi', 'Delhi Metro', 'Red Line', '#E32636'),
  ('Delhi', 'Delhi Metro', 'Yellow Line', '#FDB913'),
  ('Delhi', 'Delhi Metro', 'Blue Line', '#0033A0'),
  ('Delhi', 'Delhi Metro', 'Blue Line Branch', '#0033A0'),
  ('Delhi', 'Delhi Metro', 'Green Line', '#00A650'),
  ('Delhi', 'Delhi Metro', 'Green Line Branch', '#00A650'),
  ('Delhi', 'Delhi Metro', 'Violet Line', '#92278F'),
  ('Delhi', 'Delhi Metro', 'Pink Line', '#EC008C'),
  ('Delhi', 'Delhi Metro', 'Pink Line Branch', '#EC008C'),
  ('Delhi', 'Delhi Metro', 'Magenta Line', '#9E005D'),
  ('Delhi', 'Delhi Metro', 'Grey Line', '#939598'),
  ('Delhi', 'Delhi Metro', 'Airport Express', '#F7941E'),
  ('Delhi', 'Noida Metro', 'Aqua Line', '#00AEEF'),
  ('Bengaluru', 'Namma Metro', 'Purple Line', '#800080'),
  ('Bengaluru', 'Namma Metro', 'Green Line', '#00A651'),
  ('Bengaluru', 'Namma Metro', 'Yellow Line', '#FDB813'),
  ('Kochi', 'Kochi Metro', 'Line 1', '#0072BC')
) as l(city, system, name, color)
  on l.city = c.name and l.system = ms.name
on conflict (metro_system_id, name) do update set color_hex = excluded.color_hex;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Red Line (Rithala ↔ Shaheed Sthal New Bus Adda)
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Red Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Shaheed Sthal (New Bus Adda)', null::double precision, null::double precision, 1, null::text),
  ('Hindon River', null, null, 2, null),
  ('Arthala', null, null, 3, null),
  ('Mohan Nagar', null, null, 4, null),
  ('Shyam Park', null, null, 5, null),
  ('Major Mohit Sharma Rajendra Nagar', null, null, 6, null),
  ('Raj Bagh', null, null, 7, null),
  ('Shaheed Nagar', null, null, 8, null),
  ('Dilshad Garden', null, null, 9, null),
  ('Jhilmil', null, null, 10, null),
  ('Mansarovar Park', null, null, 11, null),
  ('Shahdara', null, null, 12, null),
  ('Welcome', null, null, 13, 'delhi-welcome'),
  ('Seelampur', null, null, 14, null),
  ('Shastri Park', null, null, 15, null),
  ('Kashmere Gate', null, null, 16, 'delhi-kashmere-gate'),
  ('Tis Hazari', null, null, 17, null),
  ('Pulbangash', null, null, 18, null),
  ('Pratap Nagar', null, null, 19, null),
  ('Shastri Nagar', null, null, 20, null),
  ('Inderlok', null, null, 21, 'delhi-inderlok'),
  ('Kanhaiya Nagar', null, null, 22, null),
  ('Keshav Puram', null, null, 23, null),
  ('Netaji Subhash Place', null, null, 24, 'delhi-netaji-subhash-place'),
  ('Kohat Enclave', null, null, 25, null),
  ('Madhuban Chowk', null, null, 26, null),
  ('Rohini', null, null, 27, null),
  ('Dr. Baba Saheb Ambedkar Hospital', null, null, 28, null),
  ('Rithala', null, null, 29, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Yellow Line (Samaypur Badli ↔ Millennium City Centre Gurugram)
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Yellow Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Samaypur Badli', null::double precision, null::double precision, 1, null::text),
  ('Rohini Sector 18, 19', null, null, 2, null),
  ('Haiderpur Badli Mor', null, null, 3, null),
  ('Jahangirpuri', null, null, 4, null),
  ('Adarsh Nagar', null, null, 5, null),
  ('Azadpur', null, null, 6, 'delhi-azadpur'),
  ('Model Town', null, null, 7, null),
  ('Guru Tegh Bahadur Nagar', null, null, 8, null),
  ('Vishwavidyalaya', null, null, 9, null),
  ('Vidhan Sabha', null, null, 10, null),
  ('Civil Lines', null, null, 11, null),
  ('Kashmere Gate', null, null, 12, 'delhi-kashmere-gate'),
  ('Chandni Chowk', null, null, 13, null),
  ('Chawri Bazar', null, null, 14, null),
  ('New Delhi', null, null, 15, 'delhi-new-delhi'),
  ('Rajiv Chowk', null, null, 16, 'delhi-rajiv-chowk'),
  ('Patel Chowk', null, null, 17, null),
  ('Central Secretariat', null, null, 18, 'delhi-central-secretariat'),
  ('Seva Teerth', null, null, 19, null),
  ('Lok Kalyan Marg', null, null, 20, null),
  ('Jor Bagh', null, null, 21, null),
  ('Dilli Haat - INA', null, null, 22, 'delhi-ina'),
  ('AIIMS', null, null, 23, null),
  ('Green Park', null, null, 24, null),
  ('Hauz Khas', null, null, 25, 'delhi-hauz-khas'),
  ('Malviya Nagar', null, null, 26, null),
  ('Saket', null, null, 27, null),
  ('Qutab Minar', null, null, 28, null),
  ('Chhatarpur', null, null, 29, null),
  ('Sultanpur', null, null, 30, null),
  ('Ghitorni', null, null, 31, null),
  ('Arjan Garh', null, null, 32, null),
  ('Guru Dronacharya', null, null, 33, null),
  ('Sikanderpur', null, null, 34, null),
  ('MG Road', null, null, 35, null),
  ('IFFCO Chowk', null, null, 36, null),
  ('Millennium City Centre Gurugram', null, null, 37, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Blue Line (Dwarka Sector 21 ↔ Noida Electronic City)
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Blue Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Noida Electronic City', null::double precision, null::double precision, 1, null::text),
  ('Noida Sector 62', null, null, 2, null),
  ('Noida Sector 59', null, null, 3, null),
  ('Noida Sector 61', null, null, 4, null),
  ('Noida Sector 52', null, null, 5, 'delhi-noida-sector-52-aqua'),
  ('Noida Sector 34', null, null, 6, null),
  ('Noida City Centre', null, null, 7, null),
  ('Golf Course', null, null, 8, null),
  ('Botanical Garden', null, null, 9, 'delhi-botanical-garden'),
  ('Noida Sector 18', null, null, 10, null),
  ('Noida Sector 16', null, null, 11, null),
  ('Noida Sector 15', null, null, 12, null),
  ('New Ashok Nagar', null, null, 13, null),
  ('Mayur Vihar Extension', null, null, 14, null),
  ('Mayur Vihar-I', null, null, 15, 'delhi-mayur-vihar-1'),
  ('Akshardham', null, null, 16, null),
  ('Yamuna Bank', null, null, 17, 'delhi-yamuna-bank'),
  ('Indraprastha', null, null, 18, null),
  ('Supreme Court', null, null, 19, null),
  ('Mandi House', null, null, 20, 'delhi-mandi-house'),
  ('Barakhamba Road', null, null, 21, null),
  ('Rajiv Chowk', null, null, 22, 'delhi-rajiv-chowk'),
  ('Ramakrishna Ashram Marg', null, null, 23, null),
  ('Jhandewalan', null, null, 24, null),
  ('Karol Bagh', null, null, 25, null),
  ('Rajendra Place', null, null, 26, null),
  ('Patel Nagar', null, null, 27, null),
  ('Shadipur', null, null, 28, null),
  ('Kirti Nagar', null, null, 29, 'delhi-kirti-nagar'),
  ('Moti Nagar', null, null, 30, null),
  ('Ramesh Nagar', null, null, 31, null),
  ('Rajouri Garden', null, null, 32, 'delhi-rajouri-garden'),
  ('Tagore Garden', null, null, 33, null),
  ('Subhash Nagar', null, null, 34, null),
  ('Tilak Nagar', null, null, 35, null),
  ('Janakpuri East', null, null, 36, null),
  ('Janakpuri West', null, null, 37, 'delhi-janakpuri-west'),
  ('Uttam Nagar East', null, null, 38, null),
  ('Uttam Nagar West', null, null, 39, null),
  ('Nawada', null, null, 40, null),
  ('Dwarka Mor', null, null, 41, null),
  ('Dwarka-Kakrola', null, null, 42, 'delhi-dwarka-kakrola'),
  ('Dwarka Sector 14', null, null, 43, null),
  ('Dwarka Sector 13', null, null, 44, null),
  ('Dwarka Sector 12', null, null, 45, null),
  ('Dwarka Sector 11', null, null, 46, null),
  ('Dwarka Sector 10', null, null, 47, null),
  ('Dwarka Sector 9', null, null, 48, null),
  ('Dwarka Sector 8', null, null, 49, null),
  ('Dwarka Sector 21', null, null, 50, 'delhi-dwarka-sector-21')
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- Blue Line Branch (Yamuna Bank ↔ Vaishali)

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Blue Line Branch'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Yamuna Bank', null::double precision, null::double precision, 1, 'delhi-yamuna-bank'::text),
  ('Laxmi Nagar', null, null, 2, null),
  ('Nirman Vihar', null, null, 3, null),
  ('Preet Vihar', null, null, 4, null),
  ('Karkarduma', null, null, 5, 'delhi-karkarduma'),
  ('Anand Vihar', null, null, 6, 'delhi-anand-vihar'),
  ('Kaushambi', null, null, 7, null),
  ('Vaishali', null, null, 8, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Green Line (Inderlok ↔ Brigadier Hoshiyar Singh) + branch
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Green Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Inderlok', null::double precision, null::double precision, 1, 'delhi-inderlok'::text),
  ('Ashok Park Main', null, null, 2, 'delhi-ashok-park-main'),
  ('Punjabi Bagh', null, null, 3, null),
  ('Punjabi Bagh West', null, null, 4, 'delhi-punjabi-bagh-west'),
  ('Shivaji Park', null, null, 5, null),
  ('Madipur', null, null, 6, null),
  ('Paschim Vihar East', null, null, 7, null),
  ('Paschim Vihar West', null, null, 8, null),
  ('Peeragarhi', null, null, 9, null),
  ('Udyog Nagar', null, null, 10, null),
  ('Maharaja Surajmal Stadium', null, null, 11, null),
  ('Nangloi', null, null, 12, null),
  ('Nangloi Railway Station', null, null, 13, null),
  ('Rajdhani Park', null, null, 14, null),
  ('Mundka', null, null, 15, null),
  ('Mundka Industrial Area (MIA)', null, null, 16, null),
  ('Ghevra Metro Station', null, null, 17, null),
  ('Tikri Kalan', null, null, 18, null),
  ('Tikri Border', null, null, 19, null),
  ('Pandit Shree Ram Sharma', null, null, 20, null),
  ('Bahadurgarh City', null, null, 21, null),
  ('Brigadier Hoshiyar Singh', null, null, 22, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Green Line Branch'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Ashok Park Main', null::double precision, null::double precision, 1, 'delhi-ashok-park-main'::text),
  ('Satguru Ram Singh Marg', null, null, 2, null),
  ('Kirti Nagar', null, null, 3, 'delhi-kirti-nagar')
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Violet Line (Kashmere Gate ↔ Raja Nahar Singh)
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Violet Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Kashmere Gate', null::double precision, null::double precision, 1, 'delhi-kashmere-gate'::text),
  ('Lal Qila', null, null, 2, null),
  ('Jama Masjid', null, null, 3, null),
  ('Delhi Gate', null, null, 4, null),
  ('ITO', null, null, 5, null),
  ('Mandi House', null, null, 6, 'delhi-mandi-house'),
  ('Janpath', null, null, 7, null),
  ('Central Secretariat', null, null, 8, 'delhi-central-secretariat'),
  ('Khan Market', null, null, 9, null),
  ('Jawaharlal Nehru Stadium', null, null, 10, null),
  ('Jangpura', null, null, 11, null),
  ('Lajpat Nagar', null, null, 12, 'delhi-lajpat-nagar'),
  ('Moolchand', null, null, 13, null),
  ('Kailash Colony', null, null, 14, null),
  ('Nehru Place', null, null, 15, null),
  ('Kalkaji Mandir', null, null, 16, 'delhi-kalkaji-mandir'),
  ('Govindpuri', null, null, 17, null),
  ('Harkesh Nagar Okhla', null, null, 18, null),
  ('Jasola Apollo', null, null, 19, null),
  ('Sarita Vihar', null, null, 20, null),
  ('Mohan Estate', null, null, 21, null),
  ('Tughlakabad Station', null, null, 22, null),
  ('Badarpur Border', null, null, 23, null),
  ('Sarai', null, null, 24, null),
  ('NHPC Chowk', null, null, 25, null),
  ('Mewla Maharajpur', null, null, 26, null),
  ('Sector 28', null, null, 27, null),
  ('Badkhal Mor', null, null, 28, null),
  ('Old Faridabad', null, null, 29, null),
  ('Neelam Chowk Ajronda', null, null, 30, null),
  ('Bata Chowk', null, null, 31, null),
  ('Escorts Mujesar', null, null, 32, null),
  ('Sant Surdas - Sihi', null, null, 33, null),
  ('Raja Nahar Singh', null, null, 34, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Pink Line (Majlis Park/Maujpur loop) + Shiv Vihar branch
-- Note: "Soorghat" is carried here per two independent sources (Wikipedia's
-- Pink Line article and delhi.metroroute.co.in) listing it as part of the
-- opened Majlis Park–Maujpur extension, but one fetch flagged its status as
-- ambiguous — worth a quick manual check against DMRC's current list before
-- relying on it in production.
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Pink Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Maujpur-Babarpur', null::double precision, null::double precision, 1, 'delhi-maujpur-babarpur'::text),
  ('Yamuna Vihar', null, null, 2, null),
  ('Bhajanpura', null, null, 3, null),
  ('Khajuri Khas', null, null, 4, null),
  ('Nanaksar-Sonia Vihar', null, null, 5, null),
  ('Soorghat', null, null, 6, null),
  ('Jagatpur-Wazirabad', null, null, 7, null),
  ('Jharoda Majra', null, null, 8, null),
  ('Burari', null, null, 9, null),
  ('Majlis Park', null, null, 10, null),
  ('Azadpur', null, null, 11, 'delhi-azadpur'),
  ('Shalimar Bagh', null, null, 12, null),
  ('Netaji Subhash Place', null, null, 13, 'delhi-netaji-subhash-place'),
  ('Shakurpur', null, null, 14, null),
  ('Punjabi Bagh West', null, null, 15, 'delhi-punjabi-bagh-west'),
  ('ESI-Basaidarapur', null, null, 16, null),
  ('Rajouri Garden', null, null, 17, 'delhi-rajouri-garden'),
  ('Mayapuri', null, null, 18, null),
  ('Naraina Vihar', null, null, 19, null),
  ('Delhi Cantonment', null, null, 20, null),
  ('Durgabai Deshmukh South Campus', null, null, 21, null),
  ('Sir M. Vishweshwaraiah Moti Bagh', null, null, 22, null),
  ('Bhikaji Cama Place', null, null, 23, null),
  ('Sarojini Nagar', null, null, 24, null),
  ('Dilli Haat - INA', null, null, 25, 'delhi-ina'),
  ('South Extension', null, null, 26, null),
  ('Lajpat Nagar', null, null, 27, 'delhi-lajpat-nagar'),
  ('Vinobapuri', null, null, 28, null),
  ('Ashram', null, null, 29, null),
  ('Sarai Kale Khan-Nizamuddin', null, null, 30, null),
  ('Mayur Vihar-I', null, null, 31, 'delhi-mayur-vihar-1'),
  ('Shree Ram Mandir Mayur Vihar', null, null, 32, null),
  ('Trilokpuri-Sanjay Lake', null, null, 33, null),
  ('East Vinod Nagar-Mayur Vihar-II', null, null, 34, null),
  ('Mandawali-West Vinod Nagar', null, null, 35, null),
  ('IP Extension', null, null, 36, null),
  ('Anand Vihar', null, null, 37, 'delhi-anand-vihar'),
  ('Karkarduma', null, null, 38, 'delhi-karkarduma'),
  ('Karkarduma Court', null, null, 39, null),
  ('Krishna Nagar', null, null, 40, null),
  ('East Azad Nagar', null, null, 41, null),
  ('Welcome', null, null, 42, 'delhi-welcome'),
  ('Jaffrabad', null, null, 43, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Pink Line Branch'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Maujpur-Babarpur', null::double precision, null::double precision, 1, 'delhi-maujpur-babarpur'::text),
  ('Gokulpuri', null, null, 2, null),
  ('Johri Enclave', null, null, 3, null),
  ('Shiv Vihar', null, null, 4, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Magenta Line (Janakpuri West ↔ Botanical Garden)
-- Note: Wikipedia's live article currently conflates this operational line
-- with its own unbuilt Phase IV extension (Janakpuri West → Inderlok →
-- Majlis Park) in one combined station table. The 25 stations below are the
-- real, currently-running corridor only — cross-checked against the known
-- station count and the four interchanges DMRC has actually opened on this
-- line (Janakpuri West/Blue, Hauz Khas/Yellow, Kalkaji Mandir/Violet,
-- Botanical Garden/Blue).
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Magenta Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Janakpuri West', null::double precision, null::double precision, 1, 'delhi-janakpuri-west'::text),
  ('Dabri Mor-Janakpuri South', null, null, 2, null),
  ('Dashrathpuri', null, null, 3, null),
  ('Palam', null, null, 4, null),
  ('Sadar Bazar Cantonment', null, null, 5, null),
  ('Terminal 1-IGI Airport', null, null, 6, null),
  ('Shankar Vihar', null, null, 7, null),
  ('Vasant Vihar', null, null, 8, null),
  ('Munirka', null, null, 9, null),
  ('R. K. Puram', null, null, 10, null),
  ('IIT', null, null, 11, null),
  ('Hauz Khas', null, null, 12, 'delhi-hauz-khas'),
  ('Panchsheel Park', null, null, 13, null),
  ('Chirag Delhi', null, null, 14, null),
  ('Greater Kailash', null, null, 15, null),
  ('Nehru Enclave', null, null, 16, null),
  ('Kalkaji Mandir', null, null, 17, 'delhi-kalkaji-mandir'),
  ('Okhla NSIC', null, null, 18, null),
  ('Sukhdev Vihar', null, null, 19, null),
  ('Jamia Millia Islamia', null, null, 20, null),
  ('Okhla Vihar', null, null, 21, null),
  ('Jasola Vihar Shaheen Bagh', null, null, 22, null),
  ('Kalindi Kunj', null, null, 23, null),
  ('Okhla Bird Sanctuary', null, null, 24, null),
  ('Botanical Garden', null, null, 25, 'delhi-botanical-garden')
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Grey Line (Dhansa Bus Stand ↔ Dwarka-Kakrola)
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Grey Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Dhansa Bus Stand', null::double precision, null::double precision, 1, null::text),
  ('Najafgarh', null, null, 2, null),
  ('Nangli', null, null, 3, null),
  ('Dwarka-Kakrola', null, null, 4, 'delhi-dwarka-kakrola')
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Delhi Metro — Airport Express (New Delhi ↔ Yashobhoomi Dwarka Sector 25)
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Delhi Metro' and ml.name = 'Airport Express'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('New Delhi', null::double precision, null::double precision, 1, 'delhi-new-delhi'::text),
  ('Shivaji Stadium', null, null, 2, null),
  ('Dhaula Kuan', null, null, 3, null),
  ('Delhi Aerocity', null, null, 4, null),
  ('IGI Airport T3', null, null, 5, null),
  ('Dwarka Sector 21', null, null, 6, 'delhi-dwarka-sector-21'),
  ('Yashobhoomi Dwarka Sector 25', null, null, 7, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Noida Metro — Aqua Line (Sector 51 ↔ Depot Station). Interchanges with
-- Delhi Blue Line at Sector 51/Noida Sector 52 — same physical location,
-- different names, hence the shared interchange_group rather than a name
-- match.
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Delhi' and ms.name = 'Noida Metro' and ml.name = 'Aqua Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Sector 51', null::double precision, null::double precision, 1, 'delhi-noida-sector-52-aqua'::text),
  ('Noida Sector 50', null, null, 2, null),
  ('Noida Sector 76', null, null, 3, null),
  ('Noida Sector 101', null, null, 4, null),
  ('Noida Sector 81', null, null, 5, null),
  ('NSEZ', null, null, 6, null),
  ('Noida Sector 83', null, null, 7, null),
  ('Noida Sector 137', null, null, 8, null),
  ('Noida Sector 142', null, null, 9, null),
  ('Noida Sector 143', null, null, 10, null),
  ('Noida Sector 144', null, null, 11, null),
  ('Noida Sector 145', null, null, 12, null),
  ('Noida Sector 146', null, null, 13, null),
  ('Noida Sector 147', null, null, 14, null),
  ('Noida Sector 148', null, null, 15, null),
  ('Knowledge Park II', null, null, 16, null),
  ('Pari Chowk', null, null, 17, null),
  ('Alpha 1', null, null, 18, null),
  ('Delta 1', null, null, 19, null),
  ('GNIDA Office', null, null, 20, null),
  ('Depot Station', null, null, 21, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Namma Metro Bengaluru — Purple Line (Challaghatta ↔ Whitefield/Kadugodi)
-- Coordinates sourced from OSM data tagged operator=Bangalore Metro Rail
-- Corporation Limited (traced to bmrc.co.in).
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Bengaluru' and ms.name = 'Namma Metro' and ml.name = 'Purple Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Challaghatta', 12.897354::double precision, 77.461288::double precision, 1, null::text),
  ('Kengeri', 12.907910, 77.476578, 2, null),
  ('Kengeri Bus Terminal', 12.914689, 77.487856, 3, null),
  ('Pattanagere', 12.924250, 77.498351, 4, null),
  ('Jnanabharathi', 12.935436, 77.512406, 5, null),
  ('Rajarajeshwari Nagar', 12.936600, 77.519679, 6, null),
  ('Pantharapalya - Nayandahalli', 12.941671, 77.525117, 7, null),
  ('Mysuru Road', 12.946718, 77.530159, 8, null),
  ('Deepanjali Nagar', 12.952058, 77.537012, 9, null),
  ('Attiguppe', 12.961893, 77.533579, 10, null),
  ('Vijayanagar', 12.970956, 77.537404, 11, null),
  ('Sri Balagangadharanatha Swamiji Station, Hosahalli', 12.974293, 77.545621, 12, null),
  ('Magadi Road', 12.975632, 77.555352, 13, null),
  ('Krantivira Sangolli Rayanna Railway Station', 12.975877, 77.565377, 14, null),
  ('Nadaprabhu Kempegowda Station, Majestic', 12.975708, 77.572876, 15, 'blr-majestic'),
  ('Sir M. Visvesvaraya Station, Central College', 12.974520, 77.584220, 16, null),
  ('Dr. B.R. Ambedkar Station, Vidhana Soudha', 12.978742, 77.591639, 17, null),
  ('Cubbon Park', 12.980958, 77.597576, 18, null),
  ('Mahatma Gandhi Road', 12.975526, 77.606790, 19, null),
  ('Trinity', 12.973022, 77.617020, 20, null),
  ('Halasuru', 12.976499, 77.626686, 21, null),
  ('Indiranagar', 12.978333, 77.638661, 22, null),
  ('Swami Vivekananda Road', 12.985931, 77.644897, 23, null),
  ('Baiyappanahalli', 12.990759, 77.652361, 24, null),
  ('Benniganahalli', 12.996516, 77.668462, 25, null),
  ('Krishnarajapura', 12.999902, 77.677670, 26, null),
  ('Singayyanapalya', 12.996545, 77.692718, 27, null),
  ('Garudacharpalya', 12.993450, 77.703677, 28, null),
  ('Hoodi', 12.988803, 77.711326, 29, null),
  ('Seetharampalya', 12.980856, 77.708785, 30, null),
  ('Kundalahalli', 12.977594, 77.715559, 31, null),
  ('Nallurahalli', 12.976641, 77.724885, 32, null),
  ('Sri Sathya Sai Hospital', 12.981195, 77.727536, 33, null),
  ('Pattandur Agrahara', 12.987639, 77.737772, 34, null),
  ('Kadugodi Tree Park', 12.985650, 77.747012, 35, null),
  ('Hopefarm Channasandra', 12.987343, 77.753803, 36, null),
  ('Whitefield (Kadugodi)', 12.995743, 77.757949, 37, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, latitude = excluded.latitude, longitude = excluded.longitude,
  interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Namma Metro Bengaluru — Green Line (Madavara ↔ Silk Institute)
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Bengaluru' and ms.name = 'Namma Metro' and ml.name = 'Green Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Madavara', 13.057421::double precision, 77.472806::double precision, 1, null::text),
  ('Chikkabidarakallu', 13.052362, 77.487915, 2, null),
  ('Manjunathanagara', 13.050090, 77.494446, 3, null),
  ('Nagasandra', 13.047954, 77.500142, 4, null),
  ('Dasarahalli', 13.043261, 77.512553, 5, null),
  ('Jalahalli', 13.039410, 77.519735, 6, null),
  ('Peenya Industry', 13.036318, 77.525492, 7, null),
  ('Peenya', 13.033019, 77.533201, 8, null),
  ('Goraguntepalya', 13.028430, 77.540800, 9, null),
  ('Yeshwantpur', 13.023268, 77.549875, 10, null),
  ('Sandal Soap Factory', 13.014654, 77.553984, 11, null),
  ('Mahalakshmi', 13.008047, 77.548807, 12, null),
  ('Rajajinagar', 13.000525, 77.549657, 13, null),
  ('Mahakavi Kuvempu Road', 12.998530, 77.556899, 14, null),
  ('Srirampura', 12.996525, 77.563196, 15, null),
  ('Mantri Square Sampige Road', 12.990463, 77.570729, 16, null),
  ('Nadaprabhu Kempegowda Station, Majestic', 12.975708, 77.572876, 17, 'blr-majestic'),
  ('Chickpete', 12.966897, 77.574557, 18, null),
  ('Krishna Rajendra Market', 12.960879, 77.574658, 19, null),
  ('National College', 12.950527, 77.573690, 20, null),
  ('Lalbagh', 12.946526, 77.580016, 21, null),
  ('South End Circle', 12.938257, 77.580056, 22, null),
  ('Jayanagar', 12.929507, 77.580144, 23, null),
  ('Rashtreeya Vidyalaya Road', 12.921581, 77.580202, 24, 'blr-rv-road'),
  ('Banashankari', 12.915221, 77.573598, 25, null),
  ('Jaya Prakash Nagar', 12.907475, 77.573128, 26, null),
  ('Yelachenahalli', 12.896050, 77.570119, 27, null),
  ('Konanakunte Cross', 12.888967, 77.562667, 28, null),
  ('Doddakallasandra', 12.884643, 77.552755, 29, null),
  ('Vajarahalli', 12.877437, 77.544741, 30, null),
  ('Thalaghattapura', 12.871410, 77.538396, 31, null),
  ('Silk Institute', 12.861730, 77.529955, 32, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, latitude = excluded.latitude, longitude = excluded.longitude,
  interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Namma Metro Bengaluru — Yellow Line (RV Road ↔ Bommasandra), opened 2025
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Bengaluru' and ms.name = 'Namma Metro' and ml.name = 'Yellow Line'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, v.igroup
from line, (values
  ('Rashtreeya Vidyalaya Road', 12.921581::double precision, 77.580202::double precision, 1, 'blr-rv-road'::text),
  ('Ragigudda', 12.917081, 77.588302, 2, null),
  ('Jayadeva Hospital', 12.916731, 77.599966, 3, null),
  ('BTM Layout', 12.916588, 77.608118, 4, null),
  ('Central Silk Board', 12.916582, 77.620567, 5, null),
  ('Bommanahalli', 12.910616, 77.626478, 6, null),
  ('Hongasandra', 12.901695, 77.631986, 7, null),
  ('Kudlu Gate', 12.889926, 77.639216, 8, null),
  ('Singasandra', 12.880818, 77.644846, 9, null),
  ('Hosa Road', 12.870749, 77.652447, 10, null),
  ('Beratena Agrahara', 12.863878, 77.657904, 11, null),
  ('Electronic City', 12.856505, 77.663523, 12, null),
  ('Infosys Foundation Konappana Agrahara', 12.846440, 77.671187, 13, null),
  ('Huskur Road', 12.839157, 77.677372, 14, null),
  ('Biocon Hebbagodi', 12.829033, 77.681374, 15, null),
  ('Delta Electronics Bommasandra', 12.819394, 77.688345, 16, null)
) as v(name, lat, lng, seq, igroup)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, latitude = excluded.latitude, longitude = excluded.longitude,
  interchange_group = excluded.interchange_group, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Kochi Metro — Line 1 (Aluva ↔ Thrippunithura), single line, no interchanges
-- ─────────────────────────────────────────────────────────────────────────

with line as (
  select ml.id as line_id, ms.id as system_id, ms.city_id
  from metro_lines ml join metro_systems ms on ms.id = ml.metro_system_id join cities c on c.id = ms.city_id
  where c.name = 'Kochi' and ms.name = 'Kochi Metro' and ml.name = 'Line 1'
)
insert into stations (city_id, metro_system_id, metro_line_id, name, latitude, longitude, sequence_number, is_active, interchange_group)
select line.city_id, line.system_id, line.line_id, v.name, v.lat, v.lng, v.seq, true, null
from line, (values
  ('Aluva', null::double precision, null::double precision, 1),
  ('Pulinchodu', null, null, 2),
  ('Companypady', null, null, 3),
  ('Ambattukavu', null, null, 4),
  ('Muttom', null, null, 5),
  ('Kalamassery', null, null, 6),
  ('Cochin University (CUSAT)', null, null, 7),
  ('Pathadipalam', null, null, 8),
  ('Edapally', null, null, 9),
  ('Changampuzha Park', null, null, 10),
  ('Palarivattom', null, null, 11),
  ('JLN Stadium', null, null, 12),
  ('Kaloor', null, null, 13),
  ('Town Hall', null, null, 14),
  ('M.G Road', null, null, 15),
  ('Maharaja''s College', null, null, 16),
  ('Ernakulam South', null, null, 17),
  ('Kadavanthra', null, null, 18),
  ('Elamkulam', null, null, 19),
  ('Vyttila', null, null, 20),
  ('Thaikoodam', null, null, 21),
  ('Petta', null, null, 22),
  ('Vadakkekotta', null, null, 23),
  ('SN Junction', null, null, 24),
  ('Thrippunithura', null, null, 25)
) as v(name, lat, lng, seq)
on conflict (city_id, metro_line_id, name) do update set
  sequence_number = excluded.sequence_number, is_active = true;

-- ─────────────────────────────────────────────────────────────────────────
-- Matching — extend discover_commuters/can_view_profile (0002_functions.sql)
-- to treat a shared interchange_group as route overlap, not just an exact
-- station_id match. Pure additions: when interchange_group is null (every
-- station today except the ones grouped above), behavior is identical to
-- before this migration.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function discover_commuters(
  requesting_user uuid,
  result_limit integer default 20,
  result_offset integer default 0
)
returns table (
  user_id uuid,
  display_name text,
  avatar_url text,
  profession text,
  bio text,
  is_identity_verified boolean,
  is_commute_verified boolean,
  home_station_id uuid,
  destination_station_id uuid,
  metro_line_id uuid,
  start_time time,
  same_line boolean,
  same_home_station boolean,
  same_destination boolean,
  same_interchange boolean,
  similar_time boolean,
  shared_interest_count integer
) as $$
begin
  return query
  with me as (
    select city_id from profiles where id = requesting_user
  ),
  my_commute as (
    select * from commute_preferences
    where user_id = requesting_user and is_active = true
  ),
  my_interests as (
    select interest_id from user_interests where user_id = requesting_user
  ),
  my_stations as (
    select home_station_id, destination_station_id, home.interchange_group as home_group, dest.interchange_group as dest_group
    from my_commute
    left join stations home on home.id = my_commute.home_station_id
    left join stations dest on dest.id = my_commute.destination_station_id
  )
  select
    p.id,
    p.display_name,
    p.avatar_url,
    p.profession,
    p.bio,
    p.is_identity_verified,
    p.is_commute_verified,
    cp.home_station_id,
    cp.destination_station_id,
    cp.metro_line_id,
    cp.start_time,
    (cp.metro_line_id = mc.metro_line_id) as same_line,
    (cp.home_station_id = ms.home_station_id
      or (their_home.interchange_group is not null and their_home.interchange_group = ms.home_group)) as same_home_station,
    (cp.destination_station_id = ms.destination_station_id
      or (their_dest.interchange_group is not null and their_dest.interchange_group = ms.dest_group)) as same_destination,
    (cp.home_station_id <> ms.home_station_id and their_home.interchange_group is not null and their_home.interchange_group = ms.home_group)
      or (cp.destination_station_id <> ms.destination_station_id and their_dest.interchange_group is not null and their_dest.interchange_group = ms.dest_group)
      as same_interchange,
    (abs(extract(epoch from (cp.start_time - mc.start_time))) <= 1800) as similar_time,
    (select count(*)::integer from user_interests ui
       where ui.user_id = p.id and ui.interest_id in (select interest_id from my_interests)) as shared_interest_count
  from profiles p
  join commute_preferences cp on cp.user_id = p.id and cp.is_active = true
  left join stations their_home on their_home.id = cp.home_station_id
  left join stations their_dest on their_dest.id = cp.destination_station_id
  cross join my_commute mc
  cross join my_stations ms
  cross join me
  where p.id <> requesting_user
    and p.is_profile_complete = true
    and p.city_id = me.city_id
    and not exists (
      select 1 from blocks b
      where (b.blocker_id = requesting_user and b.blocked_id = p.id)
         or (b.blocker_id = p.id and b.blocked_id = requesting_user)
    )
    and (cp.metro_line_id = mc.metro_line_id
         or cp.home_station_id = ms.home_station_id
         or cp.destination_station_id = ms.destination_station_id
         or (their_home.interchange_group is not null and their_home.interchange_group = ms.home_group)
         or (their_dest.interchange_group is not null and their_dest.interchange_group = ms.dest_group))
  order by
    (cp.home_station_id = ms.home_station_id) desc,
    (cp.destination_station_id = ms.destination_station_id) desc,
    shared_interest_count desc,
    (abs(extract(epoch from (cp.start_time - mc.start_time)))) asc
  limit result_limit offset result_offset;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function can_view_profile(viewer uuid, target uuid)
returns boolean as $$
  select viewer = target
  or exists (
    select 1 from connections
    where (requester_id = viewer and addressee_id = target)
       or (requester_id = target and addressee_id = viewer)
  )
  or exists (
    select 1 from conversation_members cm1
    join conversation_members cm2 on cm1.conversation_id = cm2.conversation_id
    where cm1.user_id = viewer and cm2.user_id = target
  )
  or exists (
    select 1
    from commute_preferences mine
    join stations mine_home on mine_home.id = mine.home_station_id
    join stations mine_dest on mine_dest.id = mine.destination_station_id
    join commute_preferences theirs
      on theirs.user_id = target and theirs.is_active = true
    join stations their_home on their_home.id = theirs.home_station_id
    join stations their_dest on their_dest.id = theirs.destination_station_id
    join profiles me on me.id = viewer
    join profiles them on them.id = target and them.city_id = me.city_id and them.is_profile_complete = true
    where mine.user_id = viewer and mine.is_active = true
      and (theirs.metro_line_id = mine.metro_line_id
           or theirs.home_station_id = mine.home_station_id
           or theirs.destination_station_id = mine.destination_station_id
           or (their_home.interchange_group is not null and their_home.interchange_group = mine_home.interchange_group)
           or (their_dest.interchange_group is not null and their_dest.interchange_group = mine_dest.interchange_group))
  );
$$ language sql security definer set search_path = public stable;
