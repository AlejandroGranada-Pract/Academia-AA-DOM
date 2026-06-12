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
        {/* Acento de marca: azul AA + dorado DOM */}
        <div className="mt-2 flex h-1 w-14 overflow-hidden rounded-full">
          <span className="w-2/3 bg-primary" />
          <span className="w-1/3 bg-gold" />
        </div>
        {subtitle && (
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
