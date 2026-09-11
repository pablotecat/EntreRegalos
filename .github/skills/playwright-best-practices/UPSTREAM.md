# Origen

- **Repositorio upstream:** https://github.com/currents-dev/playwright-best-practices-skill
- **Ruta original:** `playwright-best-practices/`
- **Carpeta vendorizada:** `skills/playwright-best-practices/`
- **Commit de origen:** `283d5cbc5d11aac1abda058b16ad22c317d54dc0`
- **Fecha de vendorización:** 2026-08-26
- **Versión upstream:** 1.2 (según frontmatter del `SKILL.md`)
- **Licencia:** MIT
- **Autor:** currents.dev

## Cómo actualizar

Para sincronizar con el upstream:

```powershell
$tmp = Join-Path $env:TEMP "pwbp-update-$(Get-Date -Format yyyyMMddHHmmss)"
git clone --depth 1 --filter=blob:none --sparse https://github.com/currents-dev/playwright-best-practices-skill.git $tmp
git -C $tmp sparse-checkout set playwright-best-practices
# Copiar contenido de $tmp\playwright-best-practices\ sobre esta carpeta
# (excepto UPSTREAM.md — conservarlo y actualizar el SHA y la fecha)
```

Después de copiar:

1. Anota el nuevo `git -C $tmp rev-parse HEAD` y actualízalo en este archivo.
2. Verifica que el frontmatter del `SKILL.md` sigue intacto (`name`, `metadata.version`, `license`).
3. Ejecuta `npx qa-agents` en un directorio temporal limpio para confirmar que la skill se instala correctamente en `.agents/skills/playwright-best-practices/`.
