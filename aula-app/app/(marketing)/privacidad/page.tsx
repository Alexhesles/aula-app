export const metadata = { title: "Aviso de privacidad" };

export default function PrivacidadPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-extrabold text-ink">
        Aviso de privacidad
      </h1>
      <p className="mt-4 text-ink-soft">
        Aula protege los datos de niñas, niños y adolescentes conforme a la Ley
        Federal de Protección de Datos Personales en Posesión de los
        Particulares (LFPDPPP). El contenido íntegro de este aviso se publicará
        antes de procesar datos de menores en producción.
      </p>
      <p className="mt-4 text-sm text-muted">
        Borrador · pendiente de validación legal (Bulk 4).
      </p>
    </main>
  );
}
