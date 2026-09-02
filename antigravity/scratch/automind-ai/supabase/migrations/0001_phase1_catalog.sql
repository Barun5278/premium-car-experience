-- =====================================================================
-- AutoMind AI — Phase 1 Catalog Migration
-- File:        supabase/migrations/0001_phase1_catalog.sql
-- Target:      Supabase Cloud (managed PostgreSQL 15+)
-- Scope:       Catalog foundation only (brands, categories, features,
--              vehicles, vehicle_specs, vehicle_performance,
--              vehicle_dimensions, vehicle_media, vehicle_hotspots,
--              vehicle_features, vehicle_categories)
-- Out of scope: auth, profiles, favorites, chat, recommendations,
--               price predictions, admin roles, SQLAlchemy/asyncpg/Alembic,
--               new Python packages, Supabase CLI config, Docker.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- 2. Shared trigger function: set_updated_at
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------
-- 3. Lookup tables (no inter-lookup FKs)
-- ---------------------------------------------------------------------

-- 3.1 brands
CREATE TABLE public.brands (
  id          smallserial    PRIMARY KEY,
  slug        text           NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name        text           NOT NULL,
  country     text           NULL,
  logo_url    text           NULL,
  created_at  timestamptz    NOT NULL DEFAULT now()
);

-- 3.2 categories (self-referencing parent)
CREATE TABLE public.categories (
  id           smallserial   PRIMARY KEY,
  slug         text          NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name         text          NOT NULL,
  description  text          NULL,
  icon_key     text          NULL,
  parent_id    int           NULL REFERENCES public.categories(id) ON DELETE SET NULL,
  sort_order   int           NOT NULL DEFAULT 0,
  created_at   timestamptz   NOT NULL DEFAULT now()
);

-- 3.3 features
CREATE TABLE public.features (
  id             serial       PRIMARY KEY,
  slug           text         NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  name           text         NOT NULL,
  feature_group  text         NOT NULL
                              CHECK (feature_group IN (
                                'Powertrain','Performance','Charging',
                                'Interior','Safety','Chassis',
                                'Exterior','Driver Aid'
                              )),
  sort_order     int          NOT NULL DEFAULT 0,
  created_at     timestamptz  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 4. Core entity: vehicles
-- ---------------------------------------------------------------------
CREATE TABLE public.vehicles (
  id              text         PRIMARY KEY,
  brand_id        int          NOT NULL REFERENCES public.brands(id) ON DELETE RESTRICT,
  model           text         NOT NULL,
  variant         text         NULL,
  year            smallint     NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  body_type       text         NOT NULL CHECK (body_type IN (
                                  'Sedan','SUV','Hatchback','Coupe',
                                  'Hypercar','Sports','Convertible','Crossover'
                                )),
  fuel_type       text         NOT NULL CHECK (fuel_type IN (
                                  'Electric','Hybrid','Plug-in Hybrid',
                                  'Petrol','Diesel'
                                )),
  transmission    text         NOT NULL CHECK (transmission IN (
                                  'Automatic','Manual','Dual-Clutch',
                                  'Direct-Drive','Single-Speed'
                                )),
  drivetrain      text         NOT NULL CHECK (drivetrain IN ('AWD','RWD','FWD')),
  price_usd       numeric(12,2) NOT NULL CHECK (price_usd > 0),
  currency        text         NOT NULL DEFAULT 'USD',
  mileage         int          NOT NULL CHECK (mileage >= 0),
  seating         smallint     NOT NULL CHECK (seating BETWEEN 1 AND 12),
  safety_rating   numeric(2,1) CHECK (safety_rating BETWEEN 0 AND 5),
  boot_space_liters int        NULL,
  engine          text         NULL,
  description     text         NULL,
  is_featured     boolean      NOT NULL DEFAULT false,
  tags            text[]       NOT NULL DEFAULT '{}',
  search_text     tsvector     NOT NULL,
  created_at      timestamptz  NOT NULL DEFAULT now(),
  updated_at      timestamptz  NOT NULL DEFAULT now()
);

-- 4a. Trigger function: maintain vehicles.search_text via JOIN to brands
CREATE OR REPLACE FUNCTION public.vehicles_search_text_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_brand_name text;
BEGIN
  SELECT b.name INTO v_brand_name
  FROM public.brands b
  WHERE b.id = NEW.brand_id;

  NEW.search_text :=
      setweight(to_tsvector('english', coalesce(v_brand_name, '')), 'A')
   || setweight(to_tsvector('english', coalesce(NEW.model, '')),    'A')
   || setweight(to_tsvector('english', coalesce(NEW.variant, '')),  'B')
   || setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C')
   || setweight(to_tsvector('english', coalesce(NEW.description, '')), 'D');

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vehicles_search_text_update
  BEFORE INSERT OR UPDATE OF brand_id, model, variant, tags, description
  ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.vehicles_search_text_update();

-- 4b. updated_at trigger on vehicles
CREATE TRIGGER trg_vehicles_set_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------
-- 5. 1:1 children of vehicles
-- ---------------------------------------------------------------------

-- 5.1 vehicle_specs
CREATE TABLE public.vehicle_specs (
  vehicle_id            text           PRIMARY KEY
                                          REFERENCES public.vehicles(id) ON DELETE CASCADE,
  horsepower            int            NOT NULL CHECK (horsepower >= 0),
  torque_lb_ft          int            NOT NULL CHECK (torque_lb_ft >= 0),
  battery_capacity_kwh  numeric(6,2)  NULL,
  voltage_architecture  smallint       NULL,
  dc_fast_charge_kw     int            NULL,
  epa_range_miles       int            NULL
);

-- 5.2 vehicle_performance
CREATE TABLE public.vehicle_performance (
  vehicle_id            text           PRIMARY KEY
                                          REFERENCES public.vehicles(id) ON DELETE CASCADE,
  zero_to_sixty_sec     numeric(4,2)   NOT NULL,
  top_speed_mph         int            NOT NULL,
  braking_distance_ft   int            NULL,
  lateral_g             numeric(3,2)   NULL,
  quarter_mile_sec      numeric(4,2)   NULL,
  nurburgring_time_sec  int            NULL
);

-- 5.3 vehicle_dimensions
CREATE TABLE public.vehicle_dimensions (
  vehicle_id   text   PRIMARY KEY
                          REFERENCES public.vehicles(id) ON DELETE CASCADE,
  length_mm    int    NULL,
  width_mm     int    NULL,
  height_mm    int    NULL,
  wheelbase_mm int    NULL,
  curb_weight_kg int  NULL
);

-- ---------------------------------------------------------------------
-- 6. 1:N children of vehicles
-- ---------------------------------------------------------------------

-- 6.1 vehicle_media
CREATE TABLE public.vehicle_media (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id    text         NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  kind          text         NOT NULL CHECK (kind IN ('image','model_3d','video','thumbnail')),
  storage_path  text         NULL,
  external_url  text         NULL,
  width         int          NULL,
  height        int          NULL,
  alt_text      text         NULL,
  is_primary    boolean      NOT NULL DEFAULT false,
  sort_order    int          NOT NULL DEFAULT 0,
  created_at    timestamptz  NOT NULL DEFAULT now(),
  CHECK (storage_path IS NOT NULL OR external_url IS NOT NULL)
);

-- 6.2 vehicle_hotspots
CREATE TABLE public.vehicle_hotspots (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id         text         NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  label              text         NOT NULL,
  description        text         NULL,
  position_x         numeric(5,3) NOT NULL CHECK (position_x BETWEEN 0 AND 1),
  position_y         numeric(5,3) NOT NULL CHECK (position_y BETWEEN 0 AND 1),
  position_z         numeric(5,3) NOT NULL CHECK (position_z BETWEEN 0 AND 1),
  linked_feature_id  int          NULL REFERENCES public.features(id) ON DELETE SET NULL,
  sort_order         int          NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 7. Junction tables (created last — reference all parent tables)
-- ---------------------------------------------------------------------

-- 7.1 vehicle_features
CREATE TABLE public.vehicle_features (
  vehicle_id  text  NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  feature_id  int   NOT NULL REFERENCES public.features(id)  ON DELETE RESTRICT,
  sort_order  int   NOT NULL DEFAULT 0,
  PRIMARY KEY (vehicle_id, feature_id)
);

-- 7.2 vehicle_categories
CREATE TABLE public.vehicle_categories (
  vehicle_id   text NOT NULL REFERENCES public.vehicles(id)     ON DELETE CASCADE,
  category_id  int  NOT NULL REFERENCES public.categories(id)  ON DELETE CASCADE,
  PRIMARY KEY (vehicle_id, category_id)
);

-- =====================================================================
-- 8. Indexes
-- =====================================================================

-- 8.1 B-tree
CREATE INDEX idx_vehicles_brand_id        ON public.vehicles (brand_id);
CREATE INDEX idx_vehicles_year            ON public.vehicles (year);
CREATE INDEX idx_vehicles_price_usd       ON public.vehicles (price_usd);
CREATE INDEX idx_vehicles_created_at      ON public.vehicles (created_at DESC);
CREATE INDEX idx_vehicles_is_featured     ON public.vehicles (is_featured) WHERE is_featured = true;

CREATE INDEX idx_vehicle_specs_horsepower        ON public.vehicle_specs (horsepower);
CREATE INDEX idx_vehicle_perf_zero_to_sixty      ON public.vehicle_performance (zero_to_sixty_sec);

CREATE INDEX idx_vehicle_media_vehicle_sort      ON public.vehicle_media (vehicle_id, sort_order);
CREATE INDEX idx_vehicle_hotspots_vehicle_sort   ON public.vehicle_hotspots (vehicle_id, sort_order);

CREATE INDEX idx_categories_parent_id            ON public.categories (parent_id);
CREATE INDEX idx_categories_sort_order           ON public.categories (sort_order);

-- 8.2 GIN
CREATE INDEX idx_vehicles_search_text    ON public.vehicles USING GIN (search_text);
CREATE INDEX idx_vehicles_tags           ON public.vehicles USING GIN (tags);

-- =====================================================================
-- 9. Row Level Security
-- =====================================================================

-- 9.1 Enable RLS on all 11 catalog tables
ALTER TABLE public.brands                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.features              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_specs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_performance   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_dimensions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_media         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_hotspots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_features      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_categories    ENABLE ROW LEVEL SECURITY;

-- 9.2 Public SELECT policy for anon and authenticated
-- (Defense-in-depth: FastAPI currently uses service-role which bypasses RLS,
--  but the policy is in place so a future direct-from-client read path works
--  without a schema change.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='brands'              AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.brands              FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='categories'          AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.categories          FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='features'            AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.features            FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicles'            AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicles            FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_specs'       AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicle_specs       FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_performance' AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicle_performance FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_dimensions'  AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicle_dimensions  FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_media'       AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicle_media       FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_hotspots'    AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicle_hotspots    FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_features'    AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicle_features    FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='vehicle_categories'  AND policyname='catalog_read_all') THEN
    CREATE POLICY catalog_read_all ON public.vehicle_categories  FOR SELECT TO anon, authenticated USING (true);
  END IF;
END$$;

-- =====================================================================
-- End of 0001_phase1_catalog.sql
-- =====================================================================
