const Database = require('sqlite3').Database;
const { open } = require('sqlite');

async function testCobroTable() {
  console.log('🧪 VERIFICANDO TABLA COBRO\n');
  
  try {
    const db = await open({
      filename: './northwind.db',
      driver: Database
    });
    
    // 1. Verificar que la tabla cobro existe
    const cobroTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='cobro'");
    if (cobroTable) {
      console.log('✅ Tabla cobro existe');
    } else {
      console.log('❌ Tabla cobro NO EXISTE');
      return;
    }
    
    // 2. Verificar estructura de la tabla cobro
    const columns = await db.all("PRAGMA table_info(cobro)");
    console.log('\n📋 Estructura de tabla cobro:');
    columns.forEach(col => {
      console.log(`   - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // 3. Verificar registros existentes
    const existingCobros = await db.all("SELECT * FROM cobro ORDER BY id DESC LIMIT 5");
    console.log('\n💰 Registros de cobro existentes:');
    if (existingCobros.length > 0) {
      existingCobros.forEach(cobro => {
        console.log(`   - ID: ${cobro.id}, OrderID: ${cobro.orderId}, CustomerID: ${cobro.customerId}, Amount: $${cobro.amount}, AuthCode: ${cobro.authorizationCode}, Fecha: ${cobro.fecha}`);
      });
    } else {
      console.log('   - No hay registros de cobro');
    }
    
    // 4. Probar inserción de un registro de prueba
    console.log('\n🧪 PROBANDO INSERCIÓN DE COBRO:');
    
    const testCobro = {
      orderId: 99999,
      customerId: 'TESTUSER',
      amount: 150.00,
      authorizationCode: 'TEST123456',
      fecha: new Date().toISOString()
    };
    
    try {
      const result = await db.run(
        'INSERT INTO cobro (orderId, customerId, amount, authorizationCode, fecha) VALUES (?, ?, ?, ?, ?)',
        [testCobro.orderId, testCobro.customerId, testCobro.amount, testCobro.authorizationCode, testCobro.fecha]
      );
      
      console.log(`✅ Registro de cobro insertado con ID: ${result.lastID}`);
      
      // Verificar que se insertó correctamente
      const insertedCobro = await db.get('SELECT * FROM cobro WHERE id = ?', [result.lastID]);
      if (insertedCobro) {
        console.log(`   - Verificado: OrderID=${insertedCobro.orderId}, Amount=$${insertedCobro.amount}, AuthCode=${insertedCobro.authorizationCode}`);
      }
      
      // Limpiar el registro de prueba
      await db.run('DELETE FROM cobro WHERE id = ?', [result.lastID]);
      console.log('   - Registro de prueba eliminado');
      
    } catch (error) {
      console.log('❌ Error insertando cobro:', error.message);
    }
    
    console.log('\n🎉 VERIFICACIÓN COMPLETADA');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

// Ejecutar verificación
testCobroTable(); 