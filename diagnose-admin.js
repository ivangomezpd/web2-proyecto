const Database = require('sqlite3').Database;
const { open } = require('sqlite');

async function diagnoseAdmin() {
  const db = await open({ filename: './northwind.db', driver: Database });
  console.log('🔎 Diagnóstico de tablas y usuario admin\n');

  // Verificar tablas
  const tables = [
    'user_roles',
    'activity_logs',
    'order_status',
    'users',
    'Customers'
  ];
  for (const table of tables) {
    try {
      await db.get(`SELECT 1 FROM ${table} LIMIT 1`);
      console.log(`✅ Tabla '${table}' existe.`);
    } catch (e) {
      console.log(`❌ Tabla '${table}' NO existe.`);
    }
  }

  // Verificar usuario admin
  const adminUser = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (adminUser) {
    console.log("\n✅ Usuario 'admin' existe en la tabla 'users'.");
  } else {
    console.log("\n❌ Usuario 'admin' NO existe en la tabla 'users'.");
  }

  // Verificar rol admin
  const adminRole = await db.get('SELECT * FROM user_roles WHERE username = ? AND role = ?', ['admin', 'admin']);
  if (adminRole) {
    console.log("✅ Usuario 'admin' tiene el rol 'admin' en 'user_roles'.");
  } else {
    console.log("❌ Usuario 'admin' NO tiene el rol 'admin' en 'user_roles'.");
  }

  await db.close();
  console.log('\nDiagnóstico finalizado.');
}

diagnoseAdmin(); 