const Database = require('sqlite3').Database;
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('🔧 CREANDO USUARIO ADMINISTRADOR\n');
  
  try {
    const db = await open({
      filename: './northwind.db',
      driver: Database
    });

    // Verificar si el usuario admin ya existe
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
    if (existingUser) {
      console.log('⚠️  El usuario admin ya existe');
      return;
    }

    // Hash de la contraseña
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario admin
    await db.run(
      'INSERT INTO users (username, password, acceptPolicy, acceptMarketing) VALUES (?, ?, ?, ?)',
      ['admin', hashedPassword, true, false]
    );

    // Crear cliente admin
    await db.run('INSERT INTO Customers (CustomerID) VALUES (?)', ['admin']);

    // Asignar rol de admin
    await db.run(
      'INSERT INTO user_roles (username, role, created_at, updated_at) VALUES (?, ?, ?, ?)',
      ['admin', 'admin', new Date().toISOString(), new Date().toISOString()]
    );

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('   - Usuario: admin');
    console.log('   - Contraseña: admin123');
    console.log('   - Rol: admin');
    
    console.log('\n🔗 ACCESO AL PANEL:');
    console.log('   - URL: http://localhost:3000/admin');
    console.log('   - Login: http://localhost:3000/login');
    
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer acceso');
    
  } catch (error) {
    console.error('❌ Error creando usuario admin:', error);
  }
}

// Ejecutar creación
createAdminUser(); 