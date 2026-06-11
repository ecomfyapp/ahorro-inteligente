# Migracion de PopUp1 y /thanks/call2

## Objetivo

Este paquete permite reproducir en otro proyecto Next.js la version final de:

1. El popup pay-per-call `PopUp1`.
2. La pagina `/thanks/call2`.

Los archivos de codigo exportados son copias exactas de los componentes finales:

- `migraciones/01-pop-up1.tsx`
- `migraciones/02-thanks-call2-bench.tsx`

## Importante: es una modificacion, no una implementacion nueva

El proyecto destino ya tiene la misma estructura base, incluyendo:

- El componente `PopUp1`.
- La ruta `/thanks/call2`.
- Sus archivos cliente y wrappers.
- La integracion del popup dentro del funnel.
- Ringba, GTM, runtime config y atribucion.

Por lo tanto, el agente **no debe crear otro popup, otra ruta thank-you, otra carpeta
paralela ni componentes duplicados**.

Debe localizar los archivos equivalentes existentes y aplicar/reemplazar solamente las
modificaciones documentadas:

```text
components/pop-up1.tsx
app/thanks/call2/bench-call2-page.tsx
```

Los wrappers `page.tsx`, `thanks-call2-client.tsx`, la integracion en el funnel y el
endpoint de atribucion se documentan para verificar conexiones. Solo deben crearse si
realmente faltan en el proyecto destino. Si ya existen, deben conservarse y adaptarse,
sin duplicarlos.

No reemplazar archivos a ciegas si el proyecto destino tiene diferencias propias. El
agente debe comparar imports, aliases, APIs, nombres de variables, runtime config y
estructura, preservando cualquier logica exclusiva de ese proyecto.

## Assets obligatorios

Este paquete ya incluye una copia de todos los assets necesarios dentro de:

```text
migraciones/assets/best-money-assets/
```

Copiar el contenido completo de esa carpeta hacia:

```text
public/best-money-assets/
```

Es decir, colocar estos archivos junto a los demas assets existentes de Best Money.
No cambiar sus nombres ni crear una ruta distinta, porque el codigo los referencia desde
`/best-money-assets/...`.

Mapping de copia:

| Origen | Destino requerido | Uso |
|---|---|---|
| `migraciones/assets/best-money-assets/vT8DJ.gif` | `public/best-money-assets/vT8DJ.gif` | Spinner del popup y thank-you page |
| `migraciones/assets/best-money-assets/clipart2254363.png` | `public/best-money-assets/clipart2254363.png` | Icono de "Continuar con mi aplicacion" |
| `migraciones/assets/best-money-assets/logo-best-life.png` | `public/best-money-assets/logo-best-life.png` | Logo del header de `/thanks/call2` |

Dimensiones/peso observados:

- `vT8DJ.gif`: 58,889 bytes, fuente visual 300x300.
- `clipart2254363.png`: 58,039 bytes, proporcion 752x980.
- `logo-best-life.png`: 13,235 bytes.

El GIF usa `unoptimized` en `next/image` para conservar la animacion.

## Dependencias esperadas

Los componentes usan:

- Next.js App Router.
- React client components.
- Tailwind CSS con clases arbitrarias.
- `next/image`.
- `next/script`.
- Alias TypeScript `@/`.
- `@vercel/analytics` si se copia el tracker de thank-you.

Imports internos requeridos:

```ts
import { buildApplicationNumber } from "@/lib/application-number";
import {
  createEventId,
  getUtmParams,
  pushGtmEvent,
  type GtmEventPayload,
} from "@/lib/gtm-events";
```

Si el proyecto destino no tiene estas utilidades, copiar sus implementaciones desde:

- `lib/application-number.ts`
- `lib/gtm-events.ts`

`pushGtmEvent` escribe en `window.dataLayer`, reporta eventos Vercel del funnel y envia
eventos al endpoint `/api/facebook-events`. Si el destino no usa Facebook CAPI, el agente
debe adaptar esa utilidad, no eliminar silenciosamente el evento `Contact`.

## Variables de entorno

Ambos componentes usan:

```env
NEXT_PUBLIC_PAY_PER_CALL_PHONE_NUMBER=+18882882203
NEXT_PUBLIC_RINGBA_CAMPAIGN_ID=CA...
```

El numero puede llegar por props/query params y tiene prioridad sobre el fallback.
El campaign ID solo carga Ringba cuando coincide con:

```regex
^CA[a-zA-Z0-9]+$
```

## Archivo 1: PopUp1

### Ubicacion final recomendada

Usar como fuente de cambios:

```text
migraciones/01-pop-up1.tsx
```

y aplicar sobre el archivo existente:

```text
components/pop-up1.tsx
```

### Props

```ts
type PopUp1Props = {
  open: boolean;
  firstName?: string;
  goal?: string;
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  leadId?: string;
  phoneNumber?: string;
  ringbaCampaignId?: string;
  ringbaTags?: Record<string, string>;
  continueUrl?: string;
  onClose?: () => void;
};
```

`firstName` y `goal` se conservan en la interfaz por compatibilidad con integraciones
existentes, aunque el diseño final ya no los usa visualmente.

### Integracion en la pagina del funnel

Import:

```tsx
import PopUp1 from "@/components/pop-up1";
```

Estado minimo:

```tsx
const [isPayPerCallPopupOpen, setIsPayPerCallPopupOpen] = useState(false);
```

Integracion final utilizada en `app/iul-v4/page.tsx`:

```tsx
<PopUp1
  open={isPayPerCallPopupOpen}
  firstName={submittedFirstName || answers.firstName}
  goal={submittedInsuranceGoal || answers.insuranceGoal}
  leadId={submittedLeadId}
  continueUrl={submittedContinueUrl || "/thanks/call2"}
  phoneNumber={runtimeConfig.payPerCallPhoneNumber}
  ringbaCampaignId={runtimeConfig.ringbaCampaignId}
  ringbaTags={{
    funnel_id: "iul-v4",
    lead_id: submittedLeadId,
    iul_v4_age_group: answers.ageGroup,
    iul_v4_insurance_goal:
      submittedInsuranceGoal || answers.insuranceGoal,
  }}
  onClose={() => setIsPayPerCallPopupOpen(false)}
/>
```

El popup se abre con:

```ts
setIsPayPerCallPopupOpen(true);
```

En este proyecto ocurre despues de enviar/reconocer el lead y confirmar que la ventana
pay-per-call esta abierta.

### Preview local

Se agrego este efecto en `app/iul-v4/page.tsx`:

```tsx
useEffect(() => {
  if (process.env.NODE_ENV !== "development") return;

  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("preview_popup1") === "1") {
    setSubmittedFirstName("Antony");
    setSubmittedInsuranceGoal("Ahorrar e invertir");
    setIsPayPerCallPopupOpen(true);
  }
}, []);
```

URL:

```text
http://localhost:3000/iul-v4?preview_popup1=1
```

La condicion `NODE_ENV === "development"` evita activar el preview en produccion.

### Secuencia visual del popup

1. Modal blanco, casi cuadrado, sobre overlay negro translucido.
2. GIF `vT8DJ.gif` durante la verificacion.
3. Titulo fijo `Verificando elegibilidad` con puntos animados `.`, `..`, `...`.
4. Los puntos cambian cada 800 ms dentro de un ancho reservado para que el titulo no se mueva.
5. Lista acumulativa:
   - Edad: check verde.
   - Elegibilidad por estado y ciudad: check verde.
   - Beneficio estimado: check verde.
   - Beneficiario en caso de fallecimiento: X roja.
6. Cada paso se resuelve a los 1,150 ms dentro de una separacion de 1,900 ms.
7. Al terminar:
   - Fondo radial rojo muy suave en bordes; centro blanco.
   - X grande roja dentro de circulo rojo claro.
   - Warning triangular amarillo con `!`.
   - Texto `No se agregó un beneficiario.`
   - Aparecen los CTAs.
8. CTA verde `Hablar con un asesor`, con telefono y tres ondas animadas.
9. CTA secundario como texto subrayado `Continuar con mi aplicación`, con PNG pequeño.

### Ringba en el popup

Al cargar el popup se empujan todos los query params, `lead_id`, `ringbaTags` y:

```ts
btn_source: "pop_up"
```

Al hacer clic en llamar se vuelve a empujar:

```ts
window._rgba_tags.push({ btn_source: "pop_up" });
```

Esto refuerza el origen justo antes de abrir `tel:`.

El componente:

- Inserta el script `//b-js.ringba.com/{campaignId}`.
- Usa nodos `data-popup1-ringba-phone`.
- Observa mutaciones del DOM cada 250 ms.
- Detecta el printed number valido.
- Actualiza el `href` del CTA.
- Guarda el numero en:
  - `bf_last_printed_number`
  - `bf_printed_number_{leadId}`
- Reporta atribucion a `/api/call-attribution`.

### GTM/Contact en el popup

Al hacer clic se envia:

```ts
pushGtmEvent("Contact", {
  event_id: createEventId("contact"),
  funnel_id: ringbaTags.funnel_id || "popup",
  lead_id: leadId || undefined,
  external_id: leadId || undefined,
  ringba_phone_number: printedNumber,
  country: "us",
  ...getUtmParams(),
});
```

## Archivo 2: /thanks/call2

### Estructura requerida

Usar como fuente de cambios:

```text
migraciones/02-thanks-call2-bench.tsx
```

y aplicar sobre el archivo existente:

```text
app/thanks/call2/bench-call2-page.tsx
```

Los siguientes wrappers normalmente ya existen en el proyecto destino. Verificarlos y
modificarlos solo si les faltan estas conexiones; no crear duplicados:

```tsx
// app/thanks/call2/page.tsx
import { Suspense } from "react";
import ThanksCall2Client from "./thanks-call2-client";
import VercelThankYouTracker from "../vercel-thank-you-tracker";

export default function ThanksCall2Page() {
  return (
    <Suspense fallback={null}>
      <VercelThankYouTracker thankYouType="call" />
      <ThanksCall2Client />
    </Suspense>
  );
}
```

```tsx
// app/thanks/call2/thanks-call2-client.tsx
"use client";

import { useSearchParams } from "next/navigation";
import BenchCall2Page from "./bench-call2-page";

export default function ThanksCall2Client() {
  const searchParams = useSearchParams();

  return (
    <BenchCall2Page
      funnelId={searchParams.get("funnel_id") || ""}
      ageGroup={searchParams.get("age_group") || ""}
      insuranceGoal={searchParams.get("insurance_goal") || ""}
      leadId={searchParams.get("lead_id") || ""}
      firstName={searchParams.get("first_name") || ""}
      applicationNumber={searchParams.get("application_number") || ""}
      phoneNumber={searchParams.get("ppc_phone") || ""}
      ringbaCampaignId={searchParams.get("ringba_campaign_id") || ""}
    />
  );
}
```

El `Suspense` es necesario por `useSearchParams`.

### Query params consumidos

| Parametro | Prop | Uso |
|---|---|---|
| `funnel_id` | `funnelId` | GTM y Ringba |
| `age_group` | `ageGroup` | Tag Ringba `call2_age_group` |
| `insurance_goal` | `insuranceGoal` | Tag Ringba y texto inferior |
| `lead_id` | `leadId` | Atribucion, storage, GTM |
| `first_name` | `firstName` | Primer nombre capitalizado |
| `application_number` | `applicationNumber` | ID mostrado y atribucion |
| `ppc_phone` | `phoneNumber` | Fallback/numero pay-per-call |
| `ringba_campaign_id` | `ringbaCampaignId` | Script number pool |

### Nombre

Solo usa la primera palabra:

```text
juan carlos -> Juan
```

En desarrollo local, si no hay nombre, muestra `Antony`. En produccion no inventa nombre.

### Beneficios animados

Texto:

```text
Al llamar puedes solicitar beneficios adicionales como:
```

Lista final:

1. Mortgage Protection.
2. Death Benefits.
3. Final Expenses.
4. Cash Value for Retirement.

`Life Insurance Policy` fue eliminado para evitar empujar el bloque telefonico fuera del
viewport movil.

Cada beneficio:

- Aparece despues del anterior.
- Muestra `Calculando` con spinner.
- Cambia a check verde + `Aplica`.
- El siguiente aparece solo despues de resolverse el anterior.
- La duracion usa `1200 + index * 1050` ms.

Los iconos son SVG locales dentro del componente:

- Casa solida.
- Lazo de luto.
- Ataud con cruz.
- Tres pilas de monedas.

### Header

- Logo a la izquierda.
- Boton verde `Llamar ahora` a la derecha.
- Telefono con tres ondas blancas secuenciales.
- El boton usa el numero dinamico y participa en Ringba/GTM.

### Bloque telefonico

El cuadro azul oscuro se mantuvo funcionalmente intacto:

- Numero Ringba visible.
- CTA verde.
- Halo expansivo detras del boton.
- Boton inmovil.
- SVG interno con vibracion periodica.

### Otros cambios visuales

- El check inicial fue reemplazado por `vT8DJ.gif`.
- El numero de aplicacion usa `#f2382e`.
- Temporizador de 180 segundos.
- Texto de expiracion al llegar a cero.

### Ringba en /thanks/call2

Tags iniciales:

```ts
{
  ...queryParams,
  funnel_id: funnelId,
  call2_age_group: ageGroup,
  call2_insurance_goal: insuranceGoal,
  lead_id: leadId,
  btn_source: "thanks",
}
```

En cada clic telefonico:

```ts
window._rgba_tags.push({ btn_source: "thanks" });
```

Los tres enlaces telefonicos usan `data-call2-ringba-phone`:

1. Header.
2. Numero dentro del cuadro.
3. Boton principal.

El observer detecta reemplazos del printed number y persiste el resultado en sessionStorage.

### Atribucion de llamada

Ambos componentes llaman:

```text
POST /api/call-attribution
```

Payload:

```ts
{
  leadId,
  applicationId,
  printedNumber,
  page,
}
```

El endpoint actual:

- Valida UUID de lead.
- Normaliza telefono a 11 digitos US.
- Actualiza `application_id` en metadata si existe.
- Actualiza o inserta `printed_number_captured` en `ringba_call_events`.

El destino necesita:

- `app/api/call-attribution/route.ts`.
- `lib/supabase/admin`.
- Tabla `ringba_call_events`.
- Tabla configurable `SUPABASE_LEAD_METADATA_TABLE` o `lead_metadata`.
- Credenciales server-side de Supabase.

Si el otro proyecto no usa Supabase, conservar el contrato HTTP y adaptar solo la
persistencia del endpoint.

## Vercel thank-you tracker

El wrapper usa:

```tsx
<VercelThankYouTracker thankYouType="call" />
```

El componente registra:

- `v4_thankyou_call`
- virtual page `/iul-v4/v4_thankyou_call`

Solo lo hace si `funnel_id=iul-v4`.

Si el proyecto destino no usa `@vercel/analytics`, eliminar este tracker del wrapper o
adaptarlo conscientemente. No afecta Ringba ni la UI.

## Mapping: antes -> despues

| Area | Antes | Despues |
|---|---|---|
| Popup icono | Candado animado | GIF durante proceso; X final |
| Popup texto | Descripcion estatica | Verificacion acumulativa |
| Popup titulo | Nombre + solicitud lista | `Verificando elegibilidad...` |
| Popup final | Dos botones grandes | CTA verde + enlace secundario |
| Popup CTA | Telefono simple | Telefono con 3 ondas |
| Popup Ringba | Tags existentes | Tags existentes + `btn_source=pop_up` |
| Thanks icono | Check verde | GIF |
| Thanks descripcion | Texto de beneficiario | Beneficios calculados |
| Thanks header | Logo centrado | Logo izquierda + CTA derecha |
| Thanks CTA | Boton sin halo contextual | Halo expansivo + icono animado |
| Thanks ID | Color oscuro | `#f2382e` |
| Thanks Ringba | Tags existentes | Tags existentes + `btn_source=thanks` |

## Orden de implementacion recomendado

1. Copiar todos los archivos de `migraciones/assets/best-money-assets/` dentro de
   `public/best-money-assets/`, junto a los demas assets existentes.
2. Verificar `@/lib/gtm-events` y `@/lib/application-number`.
3. Verificar o adaptar `/api/call-attribution`.
4. Comparar `01-pop-up1.tsx` con el `components/pop-up1.tsx` existente y aplicar los cambios.
5. Verificar las props y el estado del popup ya integrados en la pagina del funnel.
6. Comparar `02-thanks-call2-bench.tsx` con el archivo existente y aplicar los cambios.
7. Verificar los wrappers existentes `page.tsx` y `thanks-call2-client.tsx`; no duplicarlos.
8. Confirmar que `continueUrl` apunte a `/thanks/call2`.
9. Configurar variables de entorno.
10. Probar preview local del popup.
11. Probar `/thanks/call2` con query params.
12. Ejecutar lint y build.

## URLs de prueba

Popup:

```text
http://localhost:3000/iul-v4?preview_popup1=1
```

Thank-you:

```text
http://localhost:3000/thanks/call2?funnel_id=iul-v4&first_name=juan%20carlos&age_group=35%20a%2044&insurance_goal=Ahorrar%20e%20invertir&lead_id=UUID&application_number=AP-8372&ppc_phone=18882882203&ringba_campaign_id=CA...
```

## Checklist funcional

- [ ] El GIF se anima y no fue optimizado como imagen estatica.
- [ ] El popup no aparece en produccion por `preview_popup1=1`.
- [ ] Los checks aparecen acumulativamente.
- [ ] Beneficiario termina con X.
- [ ] Los botones aparecen solo al final.
- [ ] Los puntos del titulo no desplazan el texto.
- [ ] El CTA del popup abre `tel:`.
- [ ] El enlace secundario navega a `/thanks/call2`.
- [ ] Ringba reemplaza el numero.
- [ ] `btn_source=pop_up` llega desde el popup.
- [ ] `btn_source=thanks` llega desde la thank-you page.
- [ ] El printed number se guarda en sessionStorage.
- [ ] `/api/call-attribution` responde correctamente.
- [ ] El evento GTM `Contact` se dispara.
- [ ] La pagina usa solo el primer nombre.
- [ ] En produccion no aparece `Antony` sin parametro.
- [ ] Los cuatro beneficios caben antes del bloque telefonico.
- [ ] `npm run build` termina sin errores.

## Notas de independencia

- El CSS de animaciones del popup vive dentro de `PopUp1`.
- El CSS de animaciones de `/thanks/call2` vive dentro de su componente.
- No comparten clases ni imports entre ellos.
- Modificar o borrar uno no debe romper el otro.
- Ambos si comparten deliberadamente utilidades globales, endpoint de atribucion y assets
  publicos.

## Protocolo para preguntas tecnicas

Si el agente que implementa esta migracion encuentra una diferencia, duda o bloqueo, debe
preguntar antes de inventar una nueva arquitectura o eliminar comportamiento existente.

El usuario actuara como intermediario: copiara la pregunta tecnica del agente y la llevara
al proyecto fuente para obtener una respuesta. Por eso, la pregunta debe incluir contexto
suficiente para responderla sin acceso directo al proyecto destino.

Cada pregunta debe indicar:

1. Ruta exacta del archivo involucrado.
2. Nombre del componente, funcion, hook, prop, variable o endpoint.
3. Fragmento de codigo relevante.
4. Que existe actualmente en el proyecto destino.
5. Que solicita esta guia o el archivo de migracion.
6. Conflicto o diferencia concreta encontrada.
7. Comportamiento observado.
8. Comportamiento esperado.
9. Error completo de TypeScript, ESLint, build, navegador o red, si existe.
10. Alternativas tecnicas que el agente considera, si hay mas de una.

Formato recomendado:

```md
### Pregunta tecnica de migracion

Archivo:
`app/thanks/call2/bench-call2-page.tsx`

Simbolo:
`trackContactClick`

Situacion actual:
El proyecto destino usa `window.ringbaTags` en vez de `window._rgba_tags`.

Cambio solicitado:
Agregar `btn_source: "thanks"` sin perder los tags actuales.

Conflicto:
No existe `_rgba_tags` y el script Ringba se inicializa desde otro helper.

Codigo relevante:
```ts
// Pegar solo el bloque necesario.
```

Comportamiento observado:
El telefono cambia, pero `btn_source` no aparece en la llamada.

Comportamiento esperado:
Ringba debe recibir todos los tags existentes y `btn_source=thanks`.

Error o evidencia:
Pegar consola, Network, TypeScript o logs.

Pregunta concreta:
¿Debo adaptar el tag al helper existente o crear `_rgba_tags` antes del clic?
```

Ejemplos de preguntas utiles:

- "En `components/pop-up1.tsx`, el proyecto destino no tiene
  `/api/call-attribution`. ¿Que contrato minimo debe conservar el endpoint?"
- "En `app/iul-v4/page.tsx`, el runtime config usa otros nombres. ¿Que prop debe mapearse
  a `phoneNumber` y cual a `ringbaCampaignId`?"
- "En `lib/gtm-events.ts`, `pushGtmEvent` tiene otra firma. ¿Que campos del evento
  `Contact` son obligatorios para esta migracion?"
- "En `app/thanks/call2/thanks-call2-client.tsx`, el destino recibe `phone` en vez de
  `ppc_phone`. ¿Se debe soportar ambos query params?"
- "El proyecto destino ya modifico el cuadro telefonico. ¿Que partes son funcionalmente
  intocables para conservar Ringba y atribucion?"

Evitar preguntas vagas como:

- "No funciona, ¿que hago?"
- "¿Copio todo?"
- "¿Cambio Ringba?"
- "Hay errores en el popup."

Mientras espera respuesta, el agente no debe:

- Crear una segunda ruta `/thanks/call2`.
- Duplicar `PopUp1`.
- Quitar Ringba, GTM o atribucion para hacer pasar el build.
- Renombrar query params sin documentarlo.
- Sustituir assets por otros nombres.
- Alterar APIs compartidas sin identificar su impacto.
