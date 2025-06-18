const Database = require('sqlite3').Database;
const { open } = require('sqlite');
const crypto = require('crypto');

async function testAuthSystem() {
  console.log('🧪 INICIANDO PRUEBAS DEL SISTEMA DE AUTENTICACIÓN\n');
  
  try {
    // Conectar a la base de datos
    const db = await open({
      filename: './northwind.db',
      driver: Database
    });
    
    console.log('✅ Conexión a base de datos establecida');
    
    // 1. Verificar que la tabla users existe
    const usersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (usersTable) {
      console.log('✅ Tabla users existe');
    } else {
      console.log('❌ Tabla users no existe');
      return;
    }
    
    // 2. Verificar estructura de la tabla users
    const usersColumns = await db.all("PRAGMA table_info(users)");
    console.log('📋 Estructura de tabla users:');
    usersColumns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type}`);
    });
    
    // 3. Verificar usuarios existentes
    const existingUsers = await db.all("SELECT id, username, acceptPolicy, acceptMarketing FROM users LIMIT 5");
    console.log('\n👥 Usuarios existentes:');
    if (existingUsers.length > 0) {
      existingUsers.forEach(user => {
        console.log(`   - ID: ${user.id}, Username: ${user.username}, Policy: ${user.acceptPolicy}, Marketing: ${user.acceptMarketing}`);
      });
    } else {
      console.log('   - No hay usuarios registrados');
    }
    
    // 4. Verificar tabla Customers
    const customersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Customers'");
    if (customersTable) {
      console.log('\n✅ Tabla Customers existe');
      
      // Verificar customers existentes
      const existingCustomers = await db.all("SELECT CustomerID, CompanyName, ContactName FROM Customers LIMIT 5");
      console.log('👥 Customers existentes:');
      if (existingCustomers.length > 0) {
        existingCustomers.forEach(customer => {
          console.log(`   - ID: ${customer.CustomerID}, Company: ${customer.CompanyName || 'N/A'}, Contact: ${customer.ContactName || 'N/A'}`);
        });
      } else {
        console.log('   - No hay customers registrados');
      }
    } else {
      console.log('\n❌ Tabla Customers no existe');
    }
    
    // 5. Verificar tabla cesta
    const cestaTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='cesta'");
    if (cestaTable) {
      console.log('\n✅ Tabla cesta existe');
    } else {
      console.log('\n❌ Tabla cesta no existe');
    }
    
    // 6. Verificar tabla cobro
    const cobroTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='cobro'");
    if (cobroTable) {
      console.log('\n✅ Tabla cobro existe');
    } else {
      console.log('\n❌ Tabla cobro no existe');
    }
    
    console.log('\n🎯 PRUEBAS DE FUNCIONES DE HASH:');
    
    // 7. Probar función de hash
    const testPassword = 'TestPass123.';
    const salt = crypto.randomBytes(16).toString('hex');
    const encoder = new TextEncoder();
    const data = encoder.encode(testPassword + salt);
    const hash = crypto.createHash('sha256').update(data).digest();
    const hashHex = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    const hashedPassword = `${salt}:${hashHex}`;
    
    console.log(`   - Password original: ${testPassword}`);
    console.log(`   - Salt generado: ${salt}`);
    console.log(`   - Hash resultante: ${hashHex.substring(0, 20)}...`);
    console.log(`   - Formato almacenado: ${hashedPassword.substring(0, 30)}...`);
    
    // 8. Probar verificación de contraseña
    const [storedSalt, storedHash] = hashedPassword.split(':');
    const verifyData = encoder.encode(testPassword + storedSalt);
    const verifyComputedHash = crypto.createHash('sha256').update(verifyData).digest();
    const verifyComputedHashHex = Array.from(new Uint8Array(verifyComputedHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const passwordValid = storedHash === verifyComputedHashHex;
    console.log(`   - Verificación exitosa: ${passwordValid ? '✅' : '❌'}`);
    
    console.log('\n🎉 PRUEBAS COMPLETADAS');
    console.log('\n📝 INSTRUCCIONES PARA PRUEBAS MANUALES:');
    console.log('1. Abrir http://localhost:3000');
    console.log('2. Ir a /signup y crear usuario TESTUSER001');
    console.log('3. Ir a /login y hacer login');
    console.log('4. Verificar redirección a dashboard');
    console.log('5. Probar edición de perfil');
    console.log('6. Probar logout');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
}

// Ejecutar las pruebas
testAuthSystem(); 