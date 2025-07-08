const Database = require('sqlite3').Database;
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('🔧 CREANDO USUARIO DE PRUEBA (ivan gomez)\n');
  
  try {
    const db = await open({
      filename: './northwind.db',
      driver: Database
    });

    // Verificar si el usuario ya existe
    const existingUser = await db.get('SELECT * FROM users WHERE username = ?', ['ivan gomez']);
    if (existingUser) {
      console.log('⚠️  El usuario "ivan gomez" ya existe en la tabla users');
      await db.close();
      return;
    }

    // Hash de la contraseña
    const password = '123456Dd.';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    await db.run(
      'INSERT INTO users (username, password, acceptPolicy, acceptMarketing) VALUES (?, ?, ?, ?)',
      ['ivan gomez', hashedPassword, true, false]
    );

    // Crear cliente si no existe
    const existingCustomer = await db.get('SELECT CustomerID FROM Customers WHERE CustomerID = ?', ['ivan gomez']);
    if (!existingCustomer) {
      await db.run('INSERT INTO Customers (CustomerID) VALUES (?)', ['ivan gomez']);
      console.log('✅ Cliente "ivan gomez" creado');
    }

    await db.close();

    console.log('✅ Usuario de prueba "ivan gomez" creado exitosamente');
    console.log('\n📋 CREDENCIALES DE ACCESO:');
    console.log('   - Usuario: ivan gomez');
    console.log('   - Contraseña: 123456Dd.');
    console.log('   - Rol: user');
    
    console.log('\n🔗 ACCESO AL PANEL:');
    console.log('   - URL: http://localhost:3000/dashboard/ivan%20gomez/profile');
    console.log('   - Login: http://localhost:3000/login');
    
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer acceso');
    
  } catch (error) {
    console.error('❌ Error creando usuario de prueba:', error);
  }
}

// Ejecutar creación
createAdminUser(); 