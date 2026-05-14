# Ringba conversion webhook setup

## 1. Ejecutar SQL en Supabase

Ejecuta este archivo en el SQL Editor de Supabase:

```txt
supabase/sql/006_create_ringba_call_events.sql
```

Esto crea:

- `public.ringba_call_events`
- indices para busqueda por `lead_id`, `ringba_call_id` y fecha
- funcion `public.expire_pending_call_leads()`

La funcion de expiracion cambia a `ready_for_sell` los leads que siguen en `pending_call` despues de 5 minutos.

## 2. Configurar secrets de Supabase Edge Functions

En Supabase, agrega estos secrets para Edge Functions:

```bash
supabase secrets set RINGBA_WEBHOOK_SECRET=pon-un-token-largo-aqui
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

`SUPABASE_URL` normalmente ya existe en Edge Functions. Si tu proyecto no lo inyecta, agregalo tambien:

```bash
supabase secrets set SUPABASE_URL=https://TU_PROJECT_REF.supabase.co
```

## 3. Desplegar la Edge Function

La funcion esta en:

```txt
supabase/functions/ringba-conversion/index.ts
```

Despliegue:

```bash
supabase functions deploy ringba-conversion
```

El archivo `supabase/config.toml` contiene:

```toml
[functions.ringba-conversion]
verify_jwt = false
```

Esto es necesario porque Ringba llama como webhook externo y no envia JWT de Supabase.

## 4. URL para Ringba

La URL que se entrega a Ringba sera:

```txt
https://TU_PROJECT_REF.supabase.co/functions/v1/ringba-conversion
```

Metodo:

```txt
POST
```

Header requerido:

```txt
x-ringba-secret: EL_MISMO_VALOR_DE_RINGBA_WEBHOOK_SECRET
```

Body:

```txt
JSON
```

La funcion es tolerante: acepta JSON, form/urlencoded o texto plano. Siempre guarda todo en `raw_payload`; si Ringba no envia JSON valido, el body original queda en `raw_payload.__raw_body`.

Tambien intenta leer campos comunes como `lead_id`, `funnel_id`, `call_id`, duracion, payout y revenue.

La funcion solo marca el lead como vendido si detecta conversion real por alguna de estas senales:

- `conversion_status` igual a `converted`, `conversion`, `paid`, `sold` o `qualified`
- `event_name` contiene `converted` o `conversion`
- duracion mayor o igual a `RINGBA_MIN_CONVERSION_SECONDS` (default `30`)
- `payout` o `revenue` mayor a `0`

Un webhook que solo trae `lead_id` se guarda en `ringba_call_events`, pero no cambia el lead a `sold`.

## 5. Parametros que deben viajar a Ringba

La thank-you call debe seguir incluyendo en la URL:

```txt
lead_id
funnel_id
utm_source
utm_medium
utm_campaign
utm_content
utm_term
```

Ringba debe reenviar `lead_id` en el webhook para que Supabase pueda marcar:

```txt
lead_status = sold
sold_as = call
```

## 6. Expirar leads pending_call

Para ejecutar manualmente:

```sql
select public.expire_pending_call_leads();
```

Opcionalmente, cuando confirmes que `pg_cron` esta activo, puedes programarlo cada minuto con el bloque comentado al final de:

```txt
supabase/sql/006_create_ringba_call_events.sql
```

## 7. Estados esperados

Si el funnel termina en `/thanks/lead`:

```txt
lead_status = ready_for_sell
sold_as = null
```

Si el funnel termina en `/thanks/call`:

```txt
lead_status = pending_call
sold_as = null
```

Si Ringba confirma llamada convertida:

```txt
lead_status = sold
sold_as = call
```
