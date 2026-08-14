# EduTrack Dashboard — Guía de Agentes

Dashboard de gestión educativa. **React 19 + TypeScript + Vite + Supabase**, Tailwind (CDN) + lucide-react. Todo en **español** (UI, comentarios, commits).

## Comandos
- `npm run dev` — desarrollo (puerto 3000)
- `npm run build` — build de producción (úsalo para verificar que compila)
- No hay tests ni linter configurados.

## Estructura — dónde va cada cosa
| Ruta | Responsabilidad |
|---|---|
| `index.tsx` | Entry point. Solo monta `<App/>`. **No tocar.** |
| `App.tsx` | Estado global, handlers, layout (sidebar+header), routing por `activeView`. |
| `types.ts` | **Todos** los tipos e interfaces compartidos. |
| `config/supabase.ts` | Cliente Supabase único. |
| `services/*.ts` | Llamadas a Supabase (CRUD por tabla). Sin lógica de UI. |
| `views/*View.tsx` | Una vista por pantalla. Solo JSX + props. |
| `components/*.tsx` | Reutilizables: `Modal`, `StatCard`, `StatusBadge`, `ConfirmAlert`. |
| `utils/*.ts` | Funciones puras (fechas, imágenes, helpers de citas). |
| `img/bdimg.png` | Esquema de la BD (referencia, no borrar). |

## Reglas de desarrollo (mantener el orden)
1. **Nada de monolitos.** Archivo > ~400 líneas → partirlo.
2. **Estado y handlers viven en `App.tsx`**, se pasan a las views por props. No agregar Context/Zustand sin pedirlo.
3. **Las views NO llaman a Supabase directo** — usan `services/`.
4. **Tipos compartidos en `types.ts`.** Prohibido redefinir interfaces localmente.
5. **Reutilizar `components/`** — no redefinir Modal/StatCard/etc.
6. **Lógica pura → `utils/`**, no enterrarla en componentes.
7. **Sin credenciales hardcodeadas** fuera de `config/supabase.ts`.
8. **Feature nueva = archivo en su carpeta correcta** (view/service/util), no inflar `App.tsx`.
9. No agregar dependencias sin justificar.

## Al terminar un cambio
- `npm run build` debe pasar sin errores.
- Si es visual, revisar en `npm run dev`.
