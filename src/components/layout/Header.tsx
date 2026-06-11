// Encabezado de página (equivalente al .page-header del prototipo).
// Cada pantalla lo usa con su propio título/subtítulo. El slot `children`
// sirve para acciones a la derecha (botones, filtros, etc.).
export function Header({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl leading-none text-foreground md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
