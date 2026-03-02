-- KITA SurrealQL Schema for Multi-Tenancy

-- 1. Tenants (Stores)
DEFINE TABLE tenant SCHEMAFULL;
DEFINE FIELD name ON TABLE tenant TYPE string;
DEFINE FIELD created_at ON TABLE tenant TYPE datetime DEFAULT time::now();

-- 2. Users (Belong to a tenant)
DEFINE TABLE user SCHEMAFULL;
DEFINE FIELD username ON TABLE user TYPE string;
DEFINE FIELD password_hash ON TABLE user TYPE string;
DEFINE FIELD tenant_id ON TABLE user TYPE record<tenant>;

-- 3. Items (Belong to a tenant)
DEFINE TABLE item SCHEMAFULL
    PERMISSIONS 
        FOR select, create, update, delete 
        WHERE tenant_id = $auth.tenant_id;

DEFINE FIELD name ON TABLE item TYPE string;
DEFINE FIELD price ON TABLE item TYPE number ASSERT $value >= 0;
DEFINE FIELD stock ON TABLE item TYPE number ASSERT $value >= 0;
DEFINE FIELD tenant_id ON TABLE item TYPE record<tenant>;
DEFINE FIELD created_at ON TABLE item TYPE datetime DEFAULT time::now();

-- 4. Transactions / POS (SUKI module)
DEFINE TABLE transaction SCHEMAFULL
    PERMISSIONS 
        FOR select, create, update, delete 
        WHERE tenant_id = $auth.tenant_id;

DEFINE FIELD total_amount ON TABLE transaction TYPE number ASSERT $value >= 0;
DEFINE FIELD tenant_id ON TABLE transaction TYPE record<tenant>;
DEFINE FIELD created_by ON TABLE transaction TYPE record<user>;
DEFINE FIELD created_at ON TABLE transaction TYPE datetime DEFAULT time::now();
