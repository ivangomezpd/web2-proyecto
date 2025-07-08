const Database = require('sqlite3').Database;
const { open } = require('sqlite');

async function updateCustomer() {
  const db = await open({
    filename: './northwind.db',
    driver: Database
  });

  const customerId = 'ivan gomez';
  const data = {
    CompanyName: 'Gomez Solutions S.L.',
    ContactName: 'Ivan Gomez',
    ContactTitle: 'CEO',
    Address: 'Calle Mayor 123',
    City: 'Madrid',
    Region: 'Comunidad de Madrid',
    PostalCode: '28013',
    Country: 'España',
    Phone: '+34 600 123 456',
    Fax: '+34 911 123 456'
  };

  try {
    await db.run(
      `UPDATE Customers SET 
        CompanyName = ?,
        ContactName = ?,
        ContactTitle = ?,
        Address = ?,
        City = ?,
        Region = ?,
        PostalCode = ?,
        Country = ?,
        Phone = ?,
        Fax = ?
      WHERE CustomerID = ?`,
      [
        data.CompanyName,
        data.ContactName,
        data.ContactTitle,
        data.Address,
        data.City,
        data.Region,
        data.PostalCode,
        data.Country,
        data.Phone,
        data.Fax,
        customerId
      ]
    );
    console.log('✅ Datos actualizados correctamente para ivan gomez');
  } catch (error) {
    console.error('❌ Error actualizando datos:', error);
  } finally {
    await db.close();
  }
}

updateCustomer(); 