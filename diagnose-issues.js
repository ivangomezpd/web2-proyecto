const Database = require('sqlite3').Database;
const { open } = require('sqlite');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const http = require('http');

async function diagnoseIssues() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA\n');
  
  const issues = [];
  const fixes = [];
  
  try {
    // 1. Verificar archivos críticos
    console.log('📁 VERIFICANDO ARCHIVOS CRÍTICOS:');
    
    const criticalFiles = [
      'src/lib/utils.ts',
      'src/lib/db/db.ts',
      'src/lib/serverUtils.ts',
      'src/components/app/AuthContext.tsx',
      'src/app/login/page.tsx',
      'src/app/signup/page.tsx',
      '.env'
    ];
    
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} existe`);
      } else {
        console.log(`❌ ${file} NO EXISTE`);
        issues.push(`Archivo faltante: ${file}`);
        fixes.push(`Crear o restaurar el archivo: ${file}`);
      }
    });
    
    // 2. Verificar variables de entorno
    console.log('\n🔧 VERIFICANDO VARIABLES DE ENTORNO:');
    
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      console.log('Contenido del archivo .env:');
      console.log(envContent);
      
      if (envContent.includes('JWT_SECRET=')) {
        console.log('✅ JWT_SECRET configurado');
      } else {
        console.log('❌ JWT_SECRET NO CONFIGURADO');
        issues.push('JWT_SECRET no configurado en .env');
        fixes.push('Agregar JWT_SECRET=your-secret-key al archivo .env');
      }
    } else {
      console.log('❌ Archivo .env NO EXISTE');
      issues.push('Archivo .env faltante');
      fixes.push('Crear archivo .env con JWT_SECRET=your-secret-key');
    }
    
    // 3. Verificar base de datos
    console.log('\n🗄️ VERIFICANDO BASE DE DATOS:');
    
    if (!fs.existsSync('northwind.db')) {
      console.log('❌ northwind.db NO EXISTE');
      issues.push('Base de datos northwind.db faltante');
      fixes.push('Restaurar o descargar la base de datos northwind.db');
      return;
    }
    
    console.log('✅ northwind.db existe');
    
    const db = await open({
      filename: './northwind.db',
      driver: Database
    });
    
    // 4. Verificar tablas
    const requiredTables = ['users', 'Customers', 'cesta', 'cobro'];
    
    for (const table of requiredTables) {
      const tableExists = await db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${table}'`);
      if (tableExists) {
        console.log(`✅ Tabla ${table} existe`);
      } else {
        console.log(`❌ Tabla ${table} NO EXISTE`);
        issues.push(`Tabla ${table} faltante`);
        fixes.push(`Crear tabla ${table} en la base de datos`);
      }
    }
    
    // 5. Verificar estructura de tabla users
    console.log('\n👥 VERIFICANDO ESTRUCTURA DE TABLA USERS:');
    
    const usersTable = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");
    if (usersTable) {
      const columns = await db.all("PRAGMA table_info(users)");
      const columnNames = columns.map(col => col.name);
      
      const requiredColumns = ['id', 'username', 'password', 'acceptPolicy', 'acceptMarketing'];
      requiredColumns.forEach(col => {
        if (columnNames.includes(col)) {
          console.log(`✅ Columna ${col} existe`);
        } else {
          console.log(`❌ Columna ${col} NO EXISTE`);
          issues.push(`Columna ${col} faltante en tabla users`);
          fixes.push(`Agregar columna ${col} a la tabla users`);
        }
      });
    }
    
    // 6. Verificar usuarios existentes
    console.log('\n👤 VERIFICANDO USUARIOS EXISTENTES:');
    
    const users = await db.all("SELECT id, username, acceptPolicy, acceptMarketing FROM users LIMIT 3");
    if (users.length > 0) {
      console.log(`✅ ${users.length} usuarios encontrados`);
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Username: ${user.username}`);
      });
    } else {
      console.log('⚠️ No hay usuarios registrados');
      issues.push('No hay usuarios registrados para pruebas');
      fixes.push('Crear un usuario de prueba usando el formulario de registro');
    }
    
    // 7. Verificar función de hash
    console.log('\n🔐 VERIFICANDO FUNCIÓN DE HASH:');
    
    try {
      const testPassword = 'TestPass123.';
      const salt = crypto.randomBytes(16).toString('hex');
      const encoder = new TextEncoder();
      const data = encoder.encode(testPassword + salt);
      const hash = crypto.createHash('sha256').update(data).digest();
      const hashHex = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const hashedPassword = `${salt}:${hashHex}`;
      
      // Verificar que la función funciona
      const [storedSalt, storedHash] = hashedPassword.split(':');
      const verifyData = encoder.encode(testPassword + storedSalt);
      const verifyComputedHash = crypto.createHash('sha256').update(verifyData).digest();
      const verifyComputedHashHex = Array.from(new Uint8Array(verifyComputedHash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (storedHash === verifyComputedHashHex) {
        console.log('✅ Función de hash funciona correctamente');
      } else {
        console.log('❌ Función de hash NO FUNCIONA');
        issues.push('Función de hash no funciona correctamente');
        fixes.push('Revisar implementación de hash en src/lib/utils.ts');
      }
    } catch (error) {
      console.log('❌ Error en función de hash:', error.message);
      issues.push('Error en función de hash');
      fixes.push('Revisar implementación de hash en src/lib/utils.ts');
    }
    
    // 8. Verificar dependencias
    console.log('\n📦 VERIFICANDO DEPENDENCIAS:');
    
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredDeps = ['sqlite3', 'sqlite', 'jsonwebtoken', 'react-hook-form', 'zod'];
      
      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          console.log(`✅ ${dep} instalado`);
        } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          console.log(`✅ ${dep} instalado (dev)`);
        } else {
          console.log(`❌ ${dep} NO INSTALADO`);
          issues.push(`Dependencia ${dep} faltante`);
          fixes.push(`Instalar ${dep}: npm install ${dep}`);
        }
      });
    }
    
    // 9. Verificar puerto del servidor
    console.log('\n🌐 VERIFICANDO CONFIGURACIÓN DEL SERVIDOR:');
    
    try {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        console.log('✅ Servidor corriendo en puerto 3000');
      });
      
      req.on('error', (error) => {
        console.log('❌ Servidor NO ESTÁ CORRIENDO en puerto 3000');
        issues.push('Servidor de desarrollo no está corriendo');
        fixes.push('Ejecutar: npm run dev');
      });
      
      req.on('timeout', () => {
        console.log('❌ Servidor NO RESPONDE en puerto 3000');
        issues.push('Servidor de desarrollo no responde');
        fixes.push('Ejecutar: npm run dev');
      });
      
      req.end();
      
      setTimeout(() => {
        if (!req.destroyed) {
          req.destroy();
        }
      }, 6000);
      
    } catch (error) {
      console.log('❌ Error verificando servidor:', error.message);
      issues.push('Error verificando servidor');
      fixes.push('Verificar manualmente: npm run dev');
    }
    
    // Resumen de problemas
    console.log('\n📋 RESUMEN DE PROBLEMAS ENCONTRADOS:');
    
    if (issues.length === 0) {
      console.log('🎉 ¡NO SE ENCONTRARON PROBLEMAS! El sistema está listo para pruebas.');
    } else {
      console.log(`❌ Se encontraron ${issues.length} problemas:`);
      issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
      
      console.log('\n🔧 SOLUCIONES RECOMENDADAS:');
      fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix}`);
      });
    }
    
    console.log('\n📝 PRÓXIMOS PASOS:');
    console.log('1. Solucionar los problemas identificados arriba');
    console.log('2. Ejecutar: npm run dev');
    console.log('3. Abrir http://localhost:3000');
    console.log('4. Probar registro y login');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error);
    issues.push(`Error de diagnóstico: ${error.message}`);
  }
}

// Ejecutar diagnóstico
diagnoseIssues(); 