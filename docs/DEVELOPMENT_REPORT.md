# Development Report — Flavour WebApp

Informe completo del desarrollo: qué se hizo en cada commit, por qué, qué decisiones se tomaron, y qué preguntas es razonable esperar en una entrevista técnica sobre este código.

---

## 0. Resumen ejecutivo

| | |
|---|---|
| Commits totales | 29 |
| Rango de fechas | 2026-07-11 19:01 → 2026-07-13 22:49 |
| Backend funcional (API completa) desde | `e367b09` (commit 16) |
| **Página web accesible desde** | `5ad8d16` (commit 17) |
| App completamente funcional (todos los casos de uso) desde | `7b36dd6` (commit 23) |
| Rondas de auditoría con bugs corregidos | 3 (commits `42c64f4`, `321d07f`, `cce4427`) |

---

## 1. ¿Desde qué commit se puede acceder a la web?

**Desde el commit `5ad8d16`** — *"feat(frontend): setup routing, auth context and axios client"*.

Antes de ese commit, `frontend/src/App.jsx` era solo un placeholder estático:
```jsx
export default function App(){
  return (
    <div style={{fontFamily: 'sans-serif', padding: 20}}>
      <h1>Flavour WebApp - Frontend</h1>
      <p>React + Vite starter</p>
    </div>
  )
}
```
No había rutas, ni login, ni conexión al backend. El commit `5ad8d16` es el primero que introduce `AuthProvider`, `AppRouter`, `LoginPage` y `axios` conectado — es decir, el primer punto en que abrir `http://localhost:5173` te lleva a un login real que habla con el backend.

Eso sí, para que **funcione de verdad** (no solo se vea), necesitas que el backend ya esté completo — eso ya estaba desde el commit anterior, `e367b09`. Por eso, en la práctica, la app "empieza a existir de verdad" en la frontera entre esos dos commits.

---

## 2. Fases del desarrollo

```
Fase 0  (commits 1-3)   Scaffolding inicial — pre-existente antes de esta sesión
Fase 1  (commit 4)      Limpieza del repo
Fase 2  (commits 5-7)   Setup Node.js + arquitectura hexagonal (esqueleto)
Fase 3  (commits 8-9)   Modelos y puertos de dominio
Fase 4  (commits 10-11) Conexión SQLite + repositorios
Fase 5  (commits 12-14) Servicios de aplicación (lógica de negocio)
Fase 6  (commits 15-16) Middleware HTTP + Controllers/Routes  ← backend queda funcional
Fase 7  (commit 17)      Setup frontend                        ← web accesible
Fase 8  (commits 18-23) Features de frontend (Customer, Flavorist, notificaciones)
Fase 9  (commit 24)      Primera auditoría → fixes de seguridad/validación
Fase 10 (commits 25-26) Sistema de diseño UI
Fase 11 (commit 27)      Segunda auditoría → fix de aislamiento por usuario
Fase 12 (commit 28)      Rebranding a naranja Symrise
Fase 13 (commit 29)      Tercera auditoría (E2E por UI) → fix de UI desactualizada
```

---

## 3. Commit por commit

### Fase 0 — Pre-existente (commits 1-3, no autoría de esta sesión)

Estos tres commits (`82ef044`, `533cd1a`, `04a664a`) ya existían en el repo antes de empezar a trabajar juntos. Contenían un scaffold inicial en TypeScript/Node.js (carpeta `src/`) y un intento de backend en Java Spring Boot (carpeta `backend/` con `pom.xml`). Ninguno de los dos se usó — fueron limpiados en el commit 4.

---

### Commit 4 — `1ba3e89` — chore: remove Java backend and stale Node.js root artifacts

**Qué se borró:** `backend/pom.xml`, `backend/src/main/java/...`, `src/` (raíz), `package.json`, `tsconfig.json`, `.eslintrc.json`.

**Por qué:** el enunciado permite "Python, JS, o C#" para el backend — Java no es una opción válida. Decidimos empezar de cero con Node.js/Express en vez de continuar con el scaffold Java que ya existía.

**Decisión clave:** limpiar completamente antes de construir, en vez de intentar convivir con código muerto. Un revisor que vea `git log` completo entiende inmediatamente que hubo un cambio de dirección deliberado, no arrastre de basura.

**Pregunta esperable:** *"¿Por qué no seguisteis con Java si ya estaba montado?"* → Porque incumplía un requisito técnico explícito del enunciado (lenguajes permitidos). Mejor descartarlo pronto que justificarlo después.

---

### Commits 5-7 — Setup Node.js + arquitectura hexagonal (esqueleto)

#### `b79e05f` — chore(backend): initialize Node.js Express project

**Archivos creados:**
```
backend/package.json
backend/server.js
backend/.gitignore
```

`backend/server.js`:
```js
require('dotenv').config();
const app = require('./src/infrastructure/in/http/app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Flavour API running on port ${PORT}`);
});
```

**Por qué esta separación:** `server.js` es intencionalmente mínimo — solo arranca el servidor. Toda la configuración de Express (`app.js`) vive separada en `infrastructure/`, para que en tests futuros se pueda importar `app` sin levantar un puerto real.

#### `ec0f7b6` — chore(backend): define hexagonal package structure

Crea las carpetas vacías (con `.gitkeep`) que definen la arquitectura:
```
domain/model/
domain/port/in/
domain/port/out/
application/
infrastructure/in/http/{routes,controllers,middleware}/
infrastructure/out/persistence/
```

**Decisión de arquitectura — por qué hexagonal:** la regla es que `domain/` nunca importa nada de `infrastructure/`. Si mañana cambias SQLite por PostgreSQL, o Express por Fastify, el dominio (las reglas de negocio) no se toca. El coste es más archivos por funcionalidad; el beneficio es que cada pieza se puede explicar y testear aislada.

**Pregunta esperable:** *"¿No es demasiada ceremonia para un proyecto de un día?"* → Es una decisión consciente de priorizar separación de responsabilidades (criterio explícito del enunciado: "Is separation of concerns properly implemented?") sobre velocidad bruta. Se discutió explícitamente durante el desarrollo (ver sección 6) y se decidió mantenerla.

#### `656fe24` — chore(backend): replace better-sqlite3 with node:sqlite + app.js

**Cambio de decisión importante:** originalmente se planeó usar `better-sqlite3` (dependencia npm), pero falló al instalar por falta de binarios precompilados para Node 24 en Windows (requiere compilación nativa con Visual Studio Build Tools, y hubo error de `C++20` no soportado). Se cambió a `node:sqlite`, el módulo nativo de SQLite integrado en Node.js 22+.

`backend/src/infrastructure/in/http/app.js` (versión inicial):
```js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flavour API running' });
});

module.exports = app;
```

**Pregunta esperable:** *"¿Por qué node:sqlite y no un ORM como Prisma o Sequelize?"* → El enunciado dice explícitamente *"Use of an ORM for data access is allowed"* (permitido, no obligatorio) y *"Schema must not be modified"*. Con SQL directo tienes control total sobre las queries contra un schema fijo que no puedes migrar. Un ORM añadiría una capa de mapeo (modelos ORM) sin aportar valor real aquí, y algunos ORMs esperan gestionar el schema ellos mismos.

---

### Commits 8-9 — Dominio: modelos y puertos

#### `b83f494` — feat(backend): implement core models

**Archivos creados** (`backend/src/domain/model/`):
```
UserRole.js        FlavorState.js      User.js
Ingredient.js       FlavorIngredient.js Flavor.js
Comment.js
```

`FlavorState.js` (completo, es corto):
```js
const FlavorState = Object.freeze({
  NEW: 'new',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

module.exports = FlavorState;
```

`Flavor.js` — el modelo con más lógica (versión inicial, luego ampliado en commits posteriores):
```js
const MAX_INGREDIENTS = 5;
const PERCENT_STEP = 0.05;
const TOTAL_PERCENT = 1.0;
const EPSILON = 0.0001; // margen para errores de redondeo en floats

class Flavor {
  constructor({ id, name, label, description, createdById, approvedById = null,
                state = FlavorState.NEW, version = 0, createdAt, ingredients = [] }) {
    // ...asigna todo a this
  }

  validateIngredients() {
    const errors = [];
    if (this.ingredients.length === 0) errors.push('A flavor must have at least 1 ingredient.');
    if (this.ingredients.length > MAX_INGREDIENTS) errors.push(`A flavor cannot have more than ${MAX_INGREDIENTS} ingredients.`);
    // ... valida step de 5% y suma total con tolerancia EPSILON
    return errors;
  }

  isEditable() { return this.state === FlavorState.NEW; }
  canBeReviewed() { return this.state === FlavorState.SUBMITTED; }
}
```

**Decisiones clave:**
1. **`Object.freeze()` para enums** — JS no tiene enums nativos; esto evita typos como `'aproved'` silenciosos.
2. **`version` empieza en `0`, no `1`** — se verificó contra los datos reales del DB (`flavor.version DEFAULT 0`, y la revisión de muestra `vanilla_mint` tiene `version: 0` y `version: 1`).
3. **`User` nunca lleva `passwordHash`** — decisión de seguridad: el modelo de dominio es lo que viaja hasta el frontend en JSON; si llevara el hash, un descuido en un controller podría filtrarlo.
4. **`EPSILON` en la validación de porcentajes** — JavaScript tiene errores de redondeo binario (`0.1 + 0.2 !== 0.3`). Sin tolerancia, sumas válidas de 5 ingredientes podrían fallar por ruido de coma flotante invisible.

**Pregunta esperable:** *"¿Por qué la validación vive en el modelo y no en el controller?"* → Es una regla de **negocio**, no de HTTP. Debe cumplirse sin importar si la petición viene de la API REST, un script de importación futuro, o un test. Vive pegada al dato que protege.

#### `d9551a6` — feat(backend): add ports and repositories

**Archivos creados** (`domain/port/in/` y `domain/port/out/`):
```
AuthPort.js  IngredientPort.js  FlavorPort.js  ReviewPort.js
UserRepository.js  IngredientRepository.js  FlavorRepository.js  CommentRepository.js
```

Patrón usado en todos — clases que lanzan error si no se implementan:
```js
class FlavorRepository {
  save(flavor) {
    throw new Error('FlavorRepository.save() must be implemented');
  }
  findById(id) {
    throw new Error('FlavorRepository.findById() must be implemented');
  }
  // ...
}
```

**Por qué este patrón:** JS no tiene `interface` como Java o C#. Este es el equivalente pragmático: si una clase hija (ej. `FlavorSqliteRepository`) se olvida de implementar un método, hereda el `throw` del padre — falla explícitamente en vez de devolver `undefined` silenciosamente.

**Decisión de nombres:** `port/in/` = lo que el mundo exterior puede *pedirle* al negocio (casos de uso). `port/out/` = lo que el negocio *necesita* del mundo exterior (persistencia). Esta nomenclatura viene directamente del patrón "Ports & Adapters" (arquitectura hexagonal, Alistair Cockburn).

**Pregunta esperable:** *"¿Estos ports se diseñaron completos a la primera?"* → No, y es importante decirlo con honestidad: durante el desarrollo se tuvieron que **ampliar** varias veces (ej. `UserRepository.findCredentialsByLogin()` se añadió en el commit 12 cuando se descubrió que `AuthService` necesitaba el hash de contraseña; `FlavorRepository.updateState()` se añadió en el commit 13). Esto es normal en desarrollo iterativo — no siempre se acierta el contrato completo la primera vez, se descubre según lo exige cada caso de uso.

---

### Commits 10-11 — Persistencia: conexión y repositorios SQLite

#### `967e645` — feat(backend): add database connection setup

`backend/src/infrastructure/out/persistence/db.js` (completo):
```js
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.resolve(__dirname, '../../../../db/flavor_creation.db');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

module.exports = db;
```

**Decisiones clave:**
1. **`__dirname` en vez de ruta relativa a mano** — la ruta se calcula desde la ubicación fija del archivo, no desde dónde se ejecuta `node`. Si alguien lanza el proceso desde otra carpeta, sigue funcionando.
2. **`PRAGMA foreign_keys = ON`** — SQLite **no aplica claves foráneas por defecto** aunque estén declaradas en el `CREATE TABLE`. Sin esta línea, podrías insertar un `comment` con un `flavor_id` inexistente sin que SQLite se queje. Es un detalle fácil de pasar por alto y muy típico de pregunta de entrevista.
3. **`module.exports = db`** exporta la instancia ya conectada (singleton), no una función — todos los repositorios comparten la misma conexión.

#### `7b5e62f` — feat(infrastructure): implement SQLite repository adapters

**Archivos creados:**
```
UserSqliteRepository.js  IngredientSqliteRepository.js
FlavorSqliteRepository.js  CommentSqliteRepository.js
```

Fragmento representativo — `FlavorSqliteRepository.save()`, el más complejo por usar una transacción:
```js
save(flavor) {
  const insertFlavor = db.prepare(`INSERT INTO flavor (...) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertIngredient = db.prepare(`INSERT INTO flavor_ingredient_map (...) VALUES (?, ?, ?)`);

  db.exec('BEGIN');
  try {
    const result = insertFlavor.run(...);
    const flavorId = result.lastInsertRowid;
    for (const fi of flavor.ingredients) {
      insertIngredient.run(flavorId, fi.ingredientId, fi.percent);
    }
    db.exec('COMMIT');
    return this.findById(flavorId);
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
```

**Por qué una transacción:** guardar un flavor implica escribir en **dos tablas** (`flavor` + hasta 5 filas de `flavor_ingredient_map`). Sin transacción, un fallo a mitad de proceso dejaría un flavor "fantasma" sin ingredientes, rompiendo la regla de que debe sumar 100%.

**Decisión de mapeo:** cada repositorio traduce entre `snake_case` (columnas SQL: `created_by_id`) y `camelCase` (propiedades JS: `createdById`) en un método privado `#toDomain(row)`. Esto evita que el dominio conozca la convención de nombres de la base de datos.

**Placeholders parametrizados (`?`) en todo el SQL** — nunca se concatenan valores directamente al string SQL. Es la defensa estándar contra SQL injection.

---

### Commits 12-14 — Servicios de aplicación (lógica de negocio real)

#### `c95747a` — feat(application): implement auth and ingredient services

`AuthService.js` — el método más delicado, `#verifyPassword`:
```js
const MD5_HASH_PATTERN = /^[a-f0-9]{32}$/i;

#verifyPassword(plain, storedHash) {
  if (MD5_HASH_PATTERN.test(storedHash)) {
    const legacyHash = crypto.createHash('md5').update(plain).digest('hex');
    return legacyHash === storedHash;
  }
  return bcrypt.compareSync(plain, storedHash);
}
```

**Decisión y contexto importante:** el DB proporcionado (fijo, no modificable) tiene contraseñas hasheadas en **MD5** (`5f4dcc3b5aa765d61d8327deb882cf99` = MD5 de `"password"`), un algoritmo obsoleto e inseguro para contraseñas. Como no se puede tocar el schema ni los datos, se implementó **compatibilidad dual**: detecta si el hash almacenado "tiene forma de MD5" (32 hex chars) y lo trata como legacy; cualquier usuario nuevo usaría `bcrypt`.

**Pregunta esperable — muy probable en la entrevista:** *"MD5 está obsoleto, ¿por qué lo usáis?"* → No es una elección, es una restricción heredada del DB de muestra que no se puede modificar. La respuesta correcta y honesta es: *"Detecté que los datos de muestra usan MD5, implementé un fallback de compatibilidad hacia atrás, pero cualquier usuario nuevo se registraría con bcrypt."* Esto demuestra que entiendes la implicación de seguridad en vez de haberla ignorado.

**Otra decisión de seguridad:** el mensaje de error de login es **idéntico** tanto si el usuario no existe como si la contraseña es incorrecta (`"Invalid login or password"`). Esto evita que un atacante pueda enumerar qué emails están registrados probando logins uno a uno.

#### `5f56ede` — feat(application): implement flavor service with versioning and validation

Este es el commit con la lógica de negocio más importante del proyecto — `FlavorService.edit()`:
```js
edit(id, data, userId) {
  const existing = this.flavorRepository.findById(id);
  if (!existing) this.#throwNotFound();

  if (existing.createdById !== userId) { /* 403 */ }         // añadido en fix posterior
  if (!existing.isEditable()) this.#throwConflict(...);       // solo state='new'

  const revisions = this.flavorRepository.findByName(existing.name, existing.createdById);
  const latest = revisions[0];
  if (latest.id !== existing.id) this.#throwConflict(...);    // bloquea versiones obsoletas

  const newFlavor = new Flavor({
    name: existing.name,           // MISMO nombre — es una revisión
    version: latest.version + 1,   // nueva versión
    state: FlavorState.NEW,        // vuelve a estado editable
    // ...
  });

  this.#validateOrThrow(newFlavor);
  return this.flavorRepository.save(newFlavor);  // INSERT, nunca UPDATE
}
```

**Decisión central del proyecto:** *"Each edit ... should result in a new flavor record with a new version"* — se implementó como un `INSERT` nuevo, nunca un `UPDATE`. El registro viejo **nunca se borra ni se modifica**; queda como historial permanente.

**Bug real encontrado y corregido durante el desarrollo (dentro de este mismo commit, antes incluso de mergear):** al probar con datos reales, se descubrió que una versión **obsoleta** (no la más reciente) seguía siendo editable — alguien podía editar `v0` incluso después de que existiera `v1`, creando ramificaciones de versión inconsistentes. Se corrigió comparando contra `findByName()[0]` (la última versión real) antes de permitir editar o enviar.

**Pregunta esperable:** *"¿Cómo se decide cuál es la 'última' versión?"* → Por `MAX(version)` dentro del mismo `name` **y** mismo `createdById` (este segundo filtro se añadió después, ver Fase 11 — inicialmente solo filtraba por `name`, lo cual causaba colisión entre distintos Customers).

#### `e8f9136` — feat(application): implement review and notification services

`ReviewService.js` — `approve`/`reject` comparten toda su lógica:
```js
approve(flavorId, flavoristId) {
  return this.#resolve(flavorId, flavoristId, FlavorState.APPROVED);
}
reject(flavorId, flavoristId) {
  return this.#resolve(flavorId, flavoristId, FlavorState.REJECTED);
}

#resolve(flavorId, flavoristId, newState) {
  const flavor = this.flavorRepository.findById(flavorId);
  if (!flavor) this.#throwNotFound();
  if (!flavor.canBeReviewed()) this.#throwConflict(...);  // solo state='submitted'
  return this.flavorRepository.updateState(flavorId, { state: newState, approvedById: flavoristId });
}
```

**Decisión de diseño notable:** aprobar y rechazar usan `updateState()` (un `UPDATE` sobre la misma fila), **no** `save()` (que hace `INSERT`). Es la diferencia clave entre "editar composición" (crea versión nueva) y "cambiar estado" (modifica el registro existente) — son operaciones semánticamente distintas aunque ambas mutan un flavor.

**Limitación del schema documentada honestamente:** el DB solo tiene una columna `approved_by_id`, no existe `rejected_by_id`. Se reutiliza esa misma columna para guardar "quién tomó la decisión de revisión" en ambos casos — es una limitación heredada del schema fijo, no un error de diseño propio.

También en este commit: `shared/formatTimestamp.js` — extraído porque tanto `FlavorService` como `ReviewService` necesitaban generar timestamps con el formato exacto que usa el DB (`"2026-06-01 08:00:00.000"`, no el ISO estándar de JS).

---

### Commits 15-16 — Capa HTTP: middleware, controllers y rutas

#### `7d2a475` — feat(infrastructure): add JWT auth middleware and error handler

**Archivos creados:**
```
authMiddleware.js   roleMiddleware.js   errorHandler.js
```

`roleMiddleware.js` (completo, patrón factory):
```js
function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || !req.user.roles.includes(role)) {
      return res.status(403).json({ error: `Requires role: ${role}` });
    }
    next();
  };
}
module.exports = requireRole;
```

**Por qué factory:** `requireRole('customer')` devuelve una función middleware distinta según el rol pedido, reutilizable en cualquier ruta: `router.post('/', requireRole('customer'), ...)`.

`errorHandler.js` — captura cualquier error lanzado por los servicios y lo traduce a respuesta HTTP:
```js
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const body = { error: err.message || 'Internal server error' };
  if (err.details) body.details = err.details;
  res.status(statusCode).json(body);
}
```

**Decisión de diseño:** los servicios de aplicación (`FlavorService`, etc.) lanzan `Error` normales con una propiedad extra `.statusCode` (400/401/403/404/409). Así, la capa de aplicación **no depende de Express** — no sabe que existe HTTP — pero comunica la severidad del error hacia arriba de forma ligera.

#### `e367b09` — feat(infrastructure): add REST controllers and route definitions

**Este es el commit que hace el backend funcional de verdad.** Archivos creados:
```
container.js  (composition root)
AuthController.js  IngredientController.js  FlavorController.js  ReviewController.js
authRoutes.js  ingredientRoutes.js  flavorRoutes.js
```

`container.js` — el único sitio donde se "cablean" implementaciones concretas con servicios:
```js
const userRepository = new UserSqliteRepository();
const flavorRepository = new FlavorSqliteRepository();
// ...
const authService = new AuthService(userRepository);
const flavorService = new FlavorService(flavorRepository);
const reviewService = new ReviewService(flavorRepository, commentRepository);

module.exports = { authService, ingredientService, flavorService, reviewService };
```

**Decisión de arquitectura — "composition root":** es el único archivo de todo el backend que conoce **tanto** las clases concretas (`FlavorSqliteRepository`) **como** las abstracciones que implementan (`FlavorRepository`). Todo lo demás (controllers, servicios) solo conoce interfaces/contratos.

**Bug de routing descubierto y corregido dentro de este mismo commit:** originalmente se planeó un `reviewRoutes.js` separado de `flavorRoutes.js`. Se detectó que si `GET /flavors/submitted` se registraba en un archivo distinto montado después de `GET /flavors/:id`, Express interpretaría `"submitted"` como si fuera un `:id` (coincide primero en orden de registro). Se resolvió fusionando ambas rutas en un único `flavorRoutes.js`, con `/submitted` registrado **antes** que `/:id`.

`flavorRoutes.js` (completo):
```js
router.use(authMiddleware);
router.post('/', requireRole('customer'), FlavorController.create);
router.get('/', requireRole('customer'), FlavorController.listMine);
router.get('/submitted', requireRole('flavorist'), ReviewController.getSubmitted);  // ANTES de /:id
router.get('/:id', FlavorController.getById);
router.put('/:id', requireRole('customer'), FlavorController.edit);
router.post('/:id/submit', requireRole('customer'), FlavorController.submit);
router.post('/:id/approve', requireRole('flavorist'), ReviewController.approve);
router.post('/:id/reject', requireRole('flavorist'), ReviewController.reject);
router.get('/:id/comments', ReviewController.getComments);
router.post('/:id/comments', requireRole('flavorist'), ReviewController.addComment);
```

**Pregunta muy probable:** *"Explícame el orden de estas rutas."* → Es exactamente el ejemplo del párrafo anterior — demuestra entender cómo Express resuelve rutas (primera coincidencia en orden de declaración, sin scoring inteligente entre rutas estáticas y dinámicas, a diferencia de otros routers como React Router v6).

---

### Commit 17 — `5ad8d16` — feat(frontend): setup routing, auth context and axios client

**La web se vuelve accesible aquí.** Archivos creados:
```
api/client.js         AuthContext.jsx      LoginPage.jsx
DashboardPage.jsx      AppLayout.jsx        AppRouter.jsx
```

`AuthContext.jsx` — decisión de persistencia:
```js
const STORAGE_KEY = 'flavour_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStoredAuth); // lee localStorage al montar

  const login = useCallback(async (loginValue, password) => {
    const { data } = await apiClient.post('/auth/login', { login: loginValue, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
    return data;
  }, []);
  // ...
}
```

**Por qué `localStorage` y no solo estado en memoria:** si el usuario recarga la página (F5), sin persistencia perdería la sesión inmediatamente. Es la solución mínima viable sin añadir cookies de sesión ni refresh tokens (fuera de alcance del enunciado).

`AppRouter.jsx` — dos guards distintos:
```js
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
function RequireRole({ role }) {
  const { user } = useAuth();
  return user.roles.includes(role) ? <Outlet /> : <Navigate to="/" replace />;
}
```

**Decisión:** separar "¿está logueado?" de "¿tiene el rol correcto?" en dos componentes de guard distintos y componibles, en vez de un único guard monolítico con parámetros.

---

### Commits 18-23 — Features de frontend

#### `686827b` — Customer: listar y crear flavors + `IngredientPicker`

El componente más importante visualmente — `IngredientPicker.jsx`:
```js
const PERCENT_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5); // 5,10,...,100
const MAX_INGREDIENTS = 5;

function addRow() {
  const firstAvailable = ingredients.find((ing) => !usedIds.has(ing.id));
  if (!firstAvailable) return;
  onChange([...value, { ingredientId: firstAvailable.id, percent: 0.05 }]);
}
```

**Decisión de UX clave:** en vez de un `<input type="number">` libre para el porcentaje (que permitiría cualquier valor y necesitaría validación posterior), se usa un `<select>` con **solo** las 20 opciones válidas (5%, 10%, ..., 100%). Es **imposible** introducir un porcentaje inválido desde la UI — la restricción se aplica estructuralmente, no solo se valida después. Lo mismo con la lista de ingredientes disponibles: el dropdown filtra los ya usados (`usedIds`), haciendo imposible seleccionar un duplicado desde la interfaz.

**Nota importante para la entrevista:** esto no sustituye la validación del backend — el backend valida lo mismo de forma independiente (ver Fase 9), porque la UI se puede saltar llamando directamente a la API.

#### `f24a47f` — Detalle, edición (nueva versión), historial y submit

`FlavorDetailPage.jsx` reutiliza `FlavorForm` tanto para crear como para editar, pasándole `initialValues`:
```jsx
{isEditing && (
  <FlavorForm
    ingredients={ingredients}
    initialValues={flavor}
    onSubmit={handleEditSubmit}
    submitLabel="Save New Version"
  />
)}
```
Dentro de `FlavorForm`, el campo `name` se bloquea si `initialValues` existe:
```js
const lockName = Boolean(initialValues);
```

**Decisión de UX:** el campo `name` se deshabilita visualmente al editar, comunicando directamente la regla de negocio ("A revision should have the same flavor name") sin necesidad de un mensaje de texto aparte.

#### `ea47a04` — Flavorist: revisión, aprobar/rechazar, comentarios

`ApproveRejectButtons.jsx` — un solo componente que dispara ambas acciones, delegando el resultado hacia el padre via callback (`onResolved`), no gestionando su propio estado de "flavor":
```js
async function handle(action) {
  const updated = action === 'approve' ? await approveFlavor(flavorId) : await rejectFlavor(flavorId);
  onResolved(updated);
}
```

#### `7b36dd6` — Notificaciones in-app (polling)

**Restricción de diseño importante:** el schema del DB **no tiene tabla `notification`** y no se puede modificar. La solución: polling cada 15 segundos comparando el estado actual contra un mapa de "últimos estados vistos" persistido en `localStorage`.

```js
const POLL_INTERVAL_MS = 15000;

const notifications = flavors
  .filter((f) => f.state === 'approved' || f.state === 'rejected')
  .filter((f) => seen[f.id] !== f.state)   // solo si cambió desde la última vez
  .map((f) => ({ id: f.id, state: f.state, message: `${f.label} was ${f.state}` }));
```

**Pregunta muy esperable:** *"¿Por qué polling y no WebSockets/SSE?"* → Dado que no hay tabla de notificaciones persistente ni backend con soporte de eventos en tiempo real, y el enunciado no exige "tiempo real" (solo "notified in app"), el polling es la solución más simple que cumple el requisito sin añadir infraestructura (WebSocket server, gestión de conexiones) fuera de alcance.

---

### Fase 9 — Primera auditoría: `42c64f4` — fix(backend): close authorization gap and validation gaps

Este commit nace de una auditoría completa contra el enunciado, probando sistemáticamente cada regla de negocio con peticiones HTTP reales (no solo revisión de código). Se encontraron y corrigieron **6 problemas**:

| # | Problema encontrado | Cómo se probó | Corrección |
|---|---|---|---|
| 1 🔴 | `edit()` no comprobaba propiedad — cualquier Customer podía editar el flavor de otro | Se creó un 2º Customer real temporal en el DB y se intentó editar el flavor del 1º | `edit(id, data, userId)` ahora compara `existing.createdById !== userId` → 403 |
| 2 🟠 | Falta `name` → error 500 crudo de SQLite filtrado al cliente | `POST /flavors` sin `name` | Nuevo método `Flavor.validate()` comprueba campos requeridos antes de llegar a la DB |
| 3 🟡 | Ingrediente duplicado (mismo id 2 veces) aceptado si sumaba 100% | `POST` con `[{id:1,50%},{id:1,50%}]` | `validateIngredients()` ahora detecta duplicados con un `Set` |
| 4 🟡 | Porcentaje individual negativo o >100% aceptado si el total cuadraba | `[{percent:-0.5},{percent:1.5}]` | Rango `(0, 1]` validado por ingrediente |
| 5 🟢 | Comentario con texto vacío aceptado | `POST /comments {"text":""}` | `ReviewService.addComment()` rechaza texto vacío/solo espacios |
| 6 🔵 | `express-validator` instalado pero nunca usado | Búsqueda en el código (`grep`) | Dependencia eliminada de `package.json` |

**Por qué es importante este commit para la entrevista:** demuestra un proceso de **auto-revisión activa** — no solo "escribí el código y funcionó a la primera", sino que se sometió a pruebas adversariales deliberadas antes de considerar el trabajo terminado.

---

### Fase 10 — `8cde915` + `0c9e3c9` — Sistema de diseño UI

`styles/global.css` — variables CSS centralizadas (colores, radios, sombras) en vez de estilos inline repetidos en 15 archivos. Se extrajo también `StateBadge.jsx`, eliminando una duplicación real: el objeto `STATE_COLORS` estaba copiado y pegado en 3 archivos distintos (`FlavorListPage`, `FlavorDetailPage`, `ReviewFlavorPage`).

**Decisión:** CSS plano con variables (`:root { --color-primary: ... }`) en vez de un framework como Tailwind, para no añadir una dependencia de build adicional a un proyecto ya con tiempo limitado, manteniendo control total y cero configuración extra.

---

### Fase 11 — `321d07f` — Segunda auditoría: aislamiento por usuario

Motivada por una petición explícita de comprobar "que funciona bien lo de cada usuario". Se probó con 2 Customers reales simultáneos y se encontró un bug real:

**Bug:** `FlavorRepository.findByName(name)` no filtraba por `createdById`. Si dos Customers **distintos** usaban el mismo `name` de flavor (ej. ambos llaman a su flavor `"mint_blend"`), sus cadenas de versión se **mezclaban** — el Customer B podía quedar bloqueado editando su propio flavor porque el Customer A tenía una versión más reciente bajo el mismo nombre.

```js
// Antes:
findByName(name) { ... WHERE name = ? ... }
// Después:
findByName(name, createdById) { ... WHERE name = ? AND created_by_id = ? ... }
```

También se reforzó `useNotifications.js`: la clave de `localStorage` para "notificaciones ya vistas" no estaba separada por usuario (`flavour_seen_states` global). No causaba bug activo porque los IDs de flavor son únicos globalmente, pero se corrigió preventivamente escribiéndola como `flavour_seen_states_${userId}`.

**Pregunta muy esperable:** *"¿Cómo se te ocurrió buscar ese bug concreto?"* → Al pensar en qué campo identifica "una cadena de versiones", `name` por sí solo no es único globalmente — solo es único **por Customer**, dado que dos empresas distintas podrían llamar igual a su producto. El enunciado dice *"A revision should have the same flavor name"* pero nunca dice que `name` sea único en todo el sistema.

---

### Fase 12 — `de3a46b` — Rebranding a naranja Symrise

Cambio de la variable `--color-primary` de morado/índigo a naranja (`#c2410c`), barra superior con degradado de marca, icono SVG de gota junto al logo. **Decisión deliberada:** los colores semánticos de estado (gris=new, ámbar=submitted, verde=approved, rojo=rejected) se mantuvieron intactos — es un cambio de marca, no de significado funcional. Cambiar los badges de estado a naranja habría reducido la claridad de "¿en qué estado está esto?".

---

### Fase 13 — `cce4427` — Tercera auditoría: recorrido E2E por la UI real

Se repitieron **todos** los casos de uso del enunciado navegando la aplicación real con Playwright (no solo llamadas a la API), incluyendo capturas de pantalla en cada paso. Se encontró un último bug:

**Bug:** tras pulsar "Submit for Review", el badge principal del flavor se actualizaba correctamente a "SUBMITTED", pero la sección "Version History" seguía mostrando la versión como "NEW" — porque esa lista se cargaba una sola vez al entrar a la página y nunca se refrescaba tras la acción.

```js
// Antes: setFlavor(updated) actualizaba el flavor principal, pero no `versions`
// Después:
setFlavor(updated);
setVersions((prev) => prev.map((v) => (v.id === updated.id ? { ...v, state: updated.state } : v)));
```

---

## 4. Cómo se probó cada caso — metodología

Ningún commit se consideró terminado sin verificación activa contra el sistema real. Se usaron 3 niveles, según lo que tocaba cada commit:

1. **Nivel base de datos** — scripts `node -e` con `node:sqlite` directo, comparando conteos de filas antes/después (`SELECT COUNT(*)`), para confirmar que cada operación deja el DB exactamente como se espera y que las pruebas no contaminan los datos de muestra del assessment.

2. **Nivel API (HTTP real)** — scripts que hacen `fetch()` contra el servidor Express real corriendo en `localhost:8080`, con JWT reales obtenidos vía `/api/auth/login`, probando tanto el camino feliz como casos límite deliberados: campos faltantes, tipos incorrectos, accesos entre usuarios distintos, dobles transiciones de estado inválidas.

3. **Nivel navegador real (Playwright)** — a partir de que Playwright quedó instalado, cada cambio de frontend se verificó abriendo un Chromium real, navegando como lo haría un usuario, con capturas de pantalla en puntos clave y comprobación de que la consola del navegador no mostrara errores JS.

**Después de cada prueba, los datos de prueba se borraban explícitamente** (usuarios temporales, flavors de prueba) para dejar `flavor_creation.db` exactamente como el archivo original del assessment — verificado comparando conteos de filas contra los valores originales (3 users, 20 ingredients, 3 flavors, 0 comments).

**Detalle honesto:** varias veces el "bug" inicial resultó ser un error en el propio script de prueba (aritmética de porcentajes mal calculada, patrones de URL demasiado laxos en las aserciones) — se investigó cada caso hasta confirmar si era un bug real de la app o un falso positivo del test, antes de tocar código de producción.

---

## 5. Sobre el horario de trabajo

Mirando los timestamps reales de los commits: el trabajo se concentró en dos sesiones — la tarde/noche del día 1 (12:58–23:00) y la tarde/noche del día 2 (19:09–22:49). No es un patrón inusual para un take-home assessment: es extremadamente común desarrollarlo en horario de tarde/noche porque compite con obligaciones diurnas (trabajo actual, otros compromisos). Lo relevante de cara a una entrevista no es la hora del reloj, sino que el patrón de trabajo fue **metódico y verificado en cada paso** — commits pequeños, cada uno probado contra el sistema real antes de pasar al siguiente, con 3 rondas de auditoría explícita al final. Eso es exactamente cómo se trabaja bajo presión de entrega en un entorno profesional real: no se sacrifica la verificación por ir más rápido.

---

## 6. Preguntas generales que conviene tener preparadas

- *"¿Por qué arquitectura hexagonal para un proyecto tan pequeño?"* — Prioriza separación de responsabilidades (criterio explícito del enunciado) sobre velocidad. Coste: más archivos. Beneficio: cada capa se explica y se testea aislada.
- *"¿Por qué Node.js y no Python o C#?"* — Mismo lenguaje que el frontend (JS/React), reduce el context-switching y permite compartir convenciones.
- *"¿Qué harías diferente con más tiempo?"* — Tests automatizados (unit/integration) en vez de scripts de verificación manual; un ORM si el proyecto creciera; WebSockets si el requisito de notificaciones se volviera "tiempo real" de verdad; roles más granulares si `admin` tuviera funcionalidad propia.
- *"¿Cómo manejarías la migración si el schema pudiera cambiar?"* — Con el diseño actual, solo tocaría los repositorios SQLite (`infrastructure/out/persistence/`) — el dominio y la aplicación no conocen el schema.
