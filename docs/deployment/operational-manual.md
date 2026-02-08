# TAMV Manual Operativo de Despliegue (Producción)

> **Propósito:** definir operación técnica, seguridad, guardianía y continuidad para un despliegue real de TAMV.

---

## 1) Arquitectura Operativa (Resumen)

- **Capa L0-L7**: aplicada en servicios, registro y guardianía.
- **API Gateway**: Express + JWT + rate limiting.
- **Persistencia**: PostgreSQL + Redis + storage de assets.
- **Observabilidad**: métricas, logs, trazas, eventos XR.

---

## 2) Entorno Kubernetes

### 2.1 Namespaces sugeridos
- `tamv-core`
- `tamv-observability`
- `tamv-security`
- `tamv-xr`
- `tamv-economy`

### 2.2 Buckets y storage
- `tamv-assets-prod` (media, XR)
- `tamv-logs-prod` (archivos y exportaciones)
- `tamv-backups-prod` (snapshots DB y vault)

### 2.3 Hooks
- **pre-deploy**: validar migraciones, schema, secrets.
- **post-deploy**: health checks, smoke tests, snapshot inicial.

---

## 3) Observabilidad y registros

### 3.1 Métricas obligatorias
- `tamv_protocol_evaluations_total`
- `tamv_guardian_threat_level`
- `tamv_xr_gateway_connections`
- `tamv_eoct_risk_score`
- `tamv_isabella_decisions_total`

### 3.2 Registros (auditoría)
- **MSR**: registro inmutable de decisiones críticas.
- **BookPI**: narrativas de eventos para auditoría civil.
- **XR Events**: telemetría visual de guardianía.

---

## 4) Seguridad operativa

### 4.1 Políticas mínimas
- JWT con expiración corta + refresh tokens.
- RBAC para endpoints críticos (`/economy`, `/protocols`, `/dreamspaces`).
- WAF/Rate limiting activado.
- Encriptación de secretos en vault.

### 4.2 Plan ante vulnerabilidades
1. **Detectar** con alertas SIEM.
2. **Aislar** servicio afectado.
3. **Revocar** tokens activos.
4. **Parchear** y **rollback** si es necesario.
5. **Registrar en MSR y BookPI**.

---

## 5) Plan de emergencia y desastres

- **Backups** cada 6 horas.
- **Restore** probado semanalmente.
- **DR site** activo (región alterna).
- **Checklist de continuidad**:
  - DNS failover
  - rehidratación de datos
  - notificación pública de incidente

---

## 6) Blindaje legal y seguimiento internacional

- **Cumplimiento GDPR / CCPA / AI Act EU / NIST AI RMF**.
- **Registro de decisiones IA** en Isabella + EOCT.
- **Documentación legal** en repositorio y auditorías externas.
- **Jurisdicción principal**: México con expansión internacional controlada.

---

## 7) Navegación, paginación y UX APIs

- Todas las rutas listables deben soportar `limit` y `offset`.
- Orden por `created_at DESC`.
- Evitar sobrecarga: límites por IP / usuario.

---

## 8) Operación diaria (Runbook)

- **Revisar** métricas de guardianía (amenazas y rechazos).
- **Auditar** decisiones EOCT/Isabella.
- **Validar** estado de XR gateway.
- **Monitorear** consumo en storage y DB.

---

## 9) Checklist de despliegue

- [ ] Variables de entorno cargadas
- [ ] Migraciones aplicadas
- [ ] MSR/BookPI activos
- [ ] EOCT/Isabella habilitados
- [ ] XR Gateway con WebSocket activo
- [ ] Backups configurados
- [ ] Alertas de seguridad activas
