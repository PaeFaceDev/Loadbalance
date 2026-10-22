# Warehouse Management Demo (Clean Architecture)

Demo ระบบจัดการคลังสินค้า สำหรับโชว์สกิล production-style development: **ASP.NET 8 (Clean Architecture)**, **PostgreSQL**, **Docker**, **Nginx Load Balancing**, และ **PostgREST** สำหรับ read API

## สถาปัตยกรรม

```text
Client
  │
  ▼
Nginx (:8080) ── least_conn ──┬── api-1 (ASP.NET)
                              ├── api-2 (ASP.NET)
                              └── api-3 (ASP.NET)
                                        │
                                        ▼
                                   PostgreSQL
                                        ▲
PostgREST (/rest/*) ── read views ──────┘
```

| ชั้น | โปรเจกต์ | หน้าที่ |
|------|----------|---------|
| Domain | `Warehouse.Domain` | Entity, business rules |
| Application | `Warehouse.Application` | MediatR, FluentValidation, use cases |
| Infrastructure | `Warehouse.Infrastructure` | EF Core, PostgreSQL, seed, PostgREST views |
| API | `Warehouse.Api` | REST controllers, middleware, health checks |

## ความสามารถหลัก

- จัดการสินค้า (SKU), ตำแหน่งจัดเก็บ (Location)
- รับเข้า / จ่ายออก / โอนย้าย / ปรับยอด stock พร้อม movement log
- ตรวจ reorder level (`belowReorderLevel`)
- Load balance 3 instance ผ่าน Nginx (`X-Instance-Id` header)
- PostgREST อ่าน view `api.stock_overview`, `api.recent_movements`

## Quick Start (Docker)

```bash
docker compose up --build
```

| URL | คำอธิบาย |
|-----|----------|
| http://localhost:8080/swagger | Swagger UI (ผ่าน Nginx) |
| http://localhost:8080/api/system/info | ดู instance ที่ตอบ request |
| http://localhost:8080/rest/stock_overview | PostgREST read model |

ทดสอบ load balance (PowerShell):

```powershell
1..12 | ForEach-Object {
  (Invoke-WebRequest http://localhost:8080/api/system/info).Headers['X-Instance-Id']
}
```

## Local Development (without Docker)

1. รัน PostgreSQL และสร้าง role ตาม `db/init/01-roles.sql`
2. อัปเดต connection string ใน `src/Warehouse.Api/appsettings.json`
3. รัน API:

```bash
cd src
dotnet run --project Warehouse.Api
```

Migration รันอัตโนมัติตอน startup

## โครงสร้างโฟลเดอร์

```text
Loadbalance/
├── docker-compose.yml
├── docker/Dockerfile
├── nginx/nginx.conf
├── db/init/01-roles.sql
├── postgrest/postgrest.conf
└── src/
    ├── WarehouseManagement.slnx
    ├── Warehouse.Domain/
    ├── Warehouse.Application/
    ├── Warehouse.Infrastructure/
    ├── Warehouse.Api/
    └── Warehouse.Tests/
```

## Tests

```bash
cd src
dotnet test
```

## หมายเหตุด้านความปลอดภัย

โปรเจกต์นี้เป็น **demo** — รหัสผ่าน DB อยู่ใน compose เพื่อความสะดวก ห้ามใช้แบบ copy-paste ใน production โดยไม่มี secret management, authentication และ network hardening
