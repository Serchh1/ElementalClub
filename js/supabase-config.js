
// Configuración de Supabase
// Rellena estos valores con las credenciales de tu proyecto
const SUPABASE_URL = 'https://aveonbmcbopqqcambxoi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZW9uYm1jYm9wcXFjYW1ieG9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Mzg0MzksImV4cCI6MjA3MzAxNDQzOX0.wKhEMF4K6Zv6PuobxCwubmhNTyzk6qlmjKyGO7JqH9Y';

// Inicializar cliente
// Inicializar cliente
let client;

if (window.supabase && window.supabase.createClient) {
    // Supabase v2 CDN (exposes window.supabase.createClient)
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente Supabase inicializado');
} else if (typeof createClient !== 'undefined') {
    // Supabase v1 or other setup (exposes global createClient)
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Cliente Supabase inicializado');
} else {
    console.error('❌ La librería de Supabase no se ha cargado. Asegúrate de incluir el script CDN en tu HTML.');
}

// Exportar globalmente para que sea accesible
// Esto sobrescribe el objeto 'supabase' de la librería con la instancia del cliente, que es lo que espera el resto del código.
if (client) {
    window.supabase = client;
}
