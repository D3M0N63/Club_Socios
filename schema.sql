-- ================================================================
-- Sistema de Socios - Club Deportivo y Social
-- Base de datos: NeonTech PostgreSQL
-- Ejecutar este script en: Neon Console → SQL Editor
-- ================================================================

-- ── USERS (autenticación) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'socio'
                CHECK (role IN ('admin', 'socio')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── SOCIOS ──────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS socios_numero_seq START 1;

CREATE TABLE IF NOT EXISTS socios (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  numero_socio     VARCHAR(20) NOT NULL UNIQUE
                   DEFAULT ('S-' || LPAD(nextval('socios_numero_seq')::TEXT, 4, '0')),
  nombre           VARCHAR(100) NOT NULL,
  apellido         VARCHAR(100) NOT NULL,
  dni              VARCHAR(20) UNIQUE,
  email            VARCHAR(255),
  telefono         VARCHAR(30),
  fecha_nacimiento DATE,
  fecha_alta       DATE        NOT NULL DEFAULT CURRENT_DATE,
  estado           VARCHAR(20) NOT NULL DEFAULT 'activo'
                   CHECK (estado IN ('activo', 'inactivo', 'moroso', 'suspendido')),
  categoria        VARCHAR(50) NOT NULL DEFAULT 'general',
  notas            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CUOTAS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cuotas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id       UUID         NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  periodo        VARCHAR(7)   NOT NULL,        -- formato: 'YYYY-MM'  ej: '2026-03'
  monto          NUMERIC(10,2) NOT NULL,
  fecha_pago     DATE         NOT NULL DEFAULT CURRENT_DATE,
  metodo_pago    VARCHAR(30)  NOT NULL DEFAULT 'efectivo'
                 CHECK (metodo_pago IN ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  comprobante    VARCHAR(100),
  registrado_por UUID REFERENCES users(id) ON DELETE SET NULL,
  notas          TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (socio_id, periodo)
);

-- ── EVENTOS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        VARCHAR(200) NOT NULL,
  descripcion   TEXT,
  fecha_inicio  TIMESTAMPTZ  NOT NULL,
  fecha_fin     TIMESTAMPTZ,
  lugar         VARCHAR(200),
  tipo          VARCHAR(50)  NOT NULL DEFAULT 'social'
                CHECK (tipo IN ('social', 'deportivo', 'reunion', 'torneo', 'otro')),
  capacidad_max INT,
  estado        VARCHAR(20)  NOT NULL DEFAULT 'programado'
                CHECK (estado IN ('programado', 'en_curso', 'finalizado', 'cancelado')),
  creado_por    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── ASISTENCIA ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS asistencia (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  socio_id       UUID        NOT NULL REFERENCES socios(id) ON DELETE CASCADE,
  evento_id      UUID        REFERENCES eventos(id) ON DELETE SET NULL,
  fecha          DATE        NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada   TIME        NOT NULL DEFAULT CURRENT_TIME,
  registrado_por UUID        REFERENCES users(id) ON DELETE SET NULL,
  notas          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (socio_id, evento_id, fecha)
);

-- ── ÍNDICES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_socios_estado    ON socios(estado);
CREATE INDEX IF NOT EXISTS idx_socios_numero    ON socios(numero_socio);
CREATE INDEX IF NOT EXISTS idx_cuotas_socio     ON cuotas(socio_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_periodo   ON cuotas(periodo);
CREATE INDEX IF NOT EXISTS idx_asistencia_socio ON asistencia(socio_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON asistencia(fecha);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha    ON eventos(fecha_inicio);

-- ── TRIGGER updated_at ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_socios_updated_at
  BEFORE UPDATE ON socios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_eventos_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ================================================================
-- NOTA: El primer usuario admin se crea desde la app en:
--   /setup  →  solo funciona si no existe ningún admin
-- ================================================================
