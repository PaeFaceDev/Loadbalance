-- Application user (ASP.NET / EF Core)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'warehouse_app') THEN
        CREATE ROLE warehouse_app LOGIN PASSWORD 'warehouse_app_secret';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE warehouse TO warehouse_app;
GRANT USAGE, CREATE ON SCHEMA public TO warehouse_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO warehouse_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO warehouse_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO warehouse_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO warehouse_app;

-- PostgREST roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'warehouse_authenticator') THEN
        CREATE ROLE warehouse_authenticator NOINHERIT LOGIN PASSWORD 'warehouse_authenticator_secret';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'warehouse_anon') THEN
        CREATE ROLE warehouse_anon NOLOGIN;
    END IF;
END
$$;

GRANT warehouse_anon TO warehouse_authenticator;
GRANT USAGE ON SCHEMA public TO warehouse_app, warehouse_anon;
