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
      console.log('⚠️  El usuario admin ya existe en la tabla users');
      await db.close();
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

    // Crear cliente admin si no existe
    const existingCustomer = await db.get('SELECT CustomerID FROM Customers WHERE CustomerID = ?', ['admin']);
    if (!existingCustomer) {
      await db.run('INSERT INTO Customers (CustomerID) VALUES (?)', ['admin']);
      console.log('✅ Cliente admin creado');
    }

    await db.close();

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