const Database = require('sqlite3').Database;
const { open } = require('sqlite');

async function initializeAdminTables() {
  const db = await open({
    filename: './northwind.db',
    driver: Database
  });
  
  try {
    console.log('🔧 Creando tablas de administración...');
    
    // Crear tabla de roles de usuario
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(username)
      )
    `);
    console.log('✅ Tabla user_roles creada');

    // Crear tabla de logs de actividad
    await db.run(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
      )
    `);
    console.log('✅ Tabla activity_logs creada');

    // Crear tabla de estados de pedidos
    await db.run(`
      CREATE TABLE IF NOT EXISTS order_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        updated_by TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        notes TEXT,
        UNIQUE(orderId)
      )
    `);
    console.log('✅ Tabla order_status creada');

    // Verificar si existe el usuario admin en user_roles
    const adminExists = await db.get('SELECT * FROM user_roles WHERE username = ?', ['admin']);
    if (!adminExists) {
      await db.run(
        'INSERT INTO user_roles (username, role, created_at, updated_at) VALUES (?, ?, ?, ?)',
        ['admin', 'admin', new Date().toISOString(), new Date().toISOString()]
      );
      console.log('✅ Rol admin creado para usuario admin');
    } else {
      console.log('ℹ️  Rol admin ya existe para usuario admin');
    }

    await db.close();
    console.log('\n🎉 Tablas de administración inicializadas correctamente');
    
  } catch (error) {
    console.error('❌ Error creando tablas de administración:', error);
    await db.close();
    throw error;
  }
}

async function initializeAdminSystem() {
  console.log('🚀 INICIALIZANDO SISTEMA DE ADMINISTRACIÓN\n');
  
  try {
    // Inicializar tablas de administración
    await initializeAdminTables();
    
    console.log('\n📋 USUARIOS ADMINISTRADORES:');
    console.log('   - Usuario: admin');
    console.log('   - Contraseña: admin123 (debes cambiarla)');
    console.log('   - Rol: admin');
    
    console.log('\n🔧 FUNCIONALIDADES DISPONIBLES:');
    console.log('   - Panel de administración: /admin');
    console.log('   - Gestión de clientes');
    console.log('   - Gestión de pedidos');
    console.log('   - Análisis de ventas');
    console.log('   - Logs de actividad');
    
    console.log('\n🎉 ¡Sistema listo para usar!');
    
  } catch (error) {
    console.error('❌ Error inicializando sistema de administración:', error);
  }
}

// Ejecutar inicialización
initializeAdminSystem(); 