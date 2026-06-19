// Aplica el tema guardado ANTES del primer paint, evitando el parpadeo (FOUC).
// Se inyecta como <script> síncrono al inicio del <body>. Si no hay preferencia
// guardada, respeta la del sistema operativo.
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark')}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
