"use server";
import { Database } from 'sqlite3';
import { open } from 'sqlite';
import jwt from 'jsonwebtoken';


let db: any = null;

export async function getDb() {
    if (!db) {
        db = await open({
            filename: './northwind.db',
            driver: Database
        });
    }    
    return db;
}

export async function getAllProducts() {
    const db = await getDb();
    try {
        const products = await db.all(`
            SELECT p.*, c.CategoryName, c.Description as CategoryDescription
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            ORDER BY p.ProductName
        `);
        return products;
    } catch (error) {
        console.error('Error fetching all products:', error);
        throw error;
    }
}

export async function insertUser(username: string, password: string, acceptPolicy: boolean, acceptMarketing: boolean) {
    const db = await getDb();
    try {
        // Create the users table if it doesn't exist
        //Drop the users table if it exists

        await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        acceptPolicy BOOLEAN NOT NULL,
        acceptMarketing BOOLEAN NOT NULL
      );
    `);


        // Check if the username already exists
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Check if the customer exists in the Customers table
        const existingCustomer = await db.get('SELECT CustomerID FROM Customers WHERE CustomerID = ?', [username]);
        if (existingCustomer) {
            throw new Error('Customer  exist');
        }

        // Insert the new user
        const result = await db.run(
            'INSERT INTO users (username, password, acceptPolicy, acceptMarketing) VALUES (?, ?, ?, ?)',
            [username, password, acceptPolicy, acceptMarketing]
        );
        // insert into customers
        await db.run('INSERT INTO Customers (CustomerID) VALUES (?)', [username]);

        return result.lastID;
    } catch (error) {
        console.error('Error inserting user:', error);
        throw error;
    }
}

export async function getUser(username: string, password: string) {
    const db = await getDb();
    try {
        const user = await db.get(
            'SELECT id, username, password FROM users WHERE username = ?',
            [username]
        );

        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Verificar contraseña usando la nueva función
        const { verifyPassword } = await import('@/lib/utils');
        const isValidPassword = await verifyPassword(password, user.password);
        
        if (!isValidPassword) {
            throw new Error('Invalid username or password');
        }

        // Compute JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            secret,
            { expiresIn: '1h' }
        );
        
        // No retornar la contraseña en el objeto user
        const { password: _, ...userWithoutPassword } = user;
        userWithoutPassword.token = token;
        
        return userWithoutPassword;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}

export async function getCustomer(customerId: string) {
    const db = await getDb();
    const customer = await db.get('SELECT * FROM Customers WHERE CustomerID = ?', [customerId]);
    return customer;
}

export async function saveCustomer(customerId: string, values: any) {
    const db = await getDb();

    // Prepare the SQL query with all fields
    const updateQuery = `
        UPDATE Customers SET 
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
        WHERE CustomerID = ?
    `;

    // Extract values from the 'values' object
    const {
        CompanyName,
        ContactName,
        ContactTitle,
        Address,
        City,
        Region,
        PostalCode,
        Country,
        Phone,
        Fax
    } = values;

    // Execute the update query
    await db.run(updateQuery, [
        CompanyName,
        ContactName,
        ContactTitle,
        Address,
        City,
        Region,
        PostalCode,
        Country,
        Phone,
        Fax,
        customerId
    ]);

}

export async function getCustomerOrders(customerId: string) {
    const db = await getDb();
    try {
        const orders = await db.all(`
            SELECT o.*, 
                   SUM(od.UnitPrice * od.Quantity) as totalAmount,
                   os.status as orderStatus,
                   CASE WHEN cob.id IS NOT NULL THEN 'paid' ELSE 'pending' END as paymentStatus
            FROM Orders o
            LEFT JOIN "Order Details" od ON o.OrderID = od.OrderID
            LEFT JOIN order_status os ON o.OrderID = os.orderId
            LEFT JOIN cobro cob ON o.OrderID = cob.orderId
            WHERE o.CustomerID = ?
            GROUP BY o.OrderID
            ORDER BY o.OrderDate DESC
        `, [customerId]);
        return orders;
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        throw error;
    }
}

export async function getOrder(orderId: string) {
    const db = await getDb();
    const order = await db.get('SELECT * FROM Orders WHERE OrderID = ?', [orderId]);
    const details = await db.all(`
        SELECT od.*, p.ProductName 
        FROM "Order Details" od
        JOIN Products p ON od.ProductID = p.ProductID
        WHERE od.OrderID = ?
    `, [orderId]);
    // Compute total order amount
    const totalAmount = details.reduce((sum: number, detail: any) => {
        return sum + (detail.UnitPrice * detail.Quantity * (1 - detail.Discount));
    }, 0);

    // Add details and total amount to the order object
    order.Details = details;
    order.TotalAmount = parseFloat(totalAmount.toFixed(2));
    return order;
}

export async function getProduct(productId: string) {
    const db = await getDb();
    const product = await db.get(`
        SELECT p.*, c.CategoryName, c.Description as CategoryDescription
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        WHERE p.ProductID = ?
    `, [productId]);
    return product;
}


export async function associateCestaIdWithUsername(cestaId: string, username: string) {
    const db = await getDb();
    try {
        // Select distinct products and their quantities for the given username and cestaId
        // solo puede haber en la cesta un producto con una cantidad
        // por eso se agrupa por productId y se queda con la cantidad maxima
        const existingProducts = await db.all(`
            SELECT DISTINCT productId, cantidad
            FROM cesta
            WHERE username = ? OR cestaId = ?
            GROUP BY productId
            HAVING MAX(cantidad)
        `, [username, cestaId]);

        // Delete existing entries for the given username and cestaId
        await db.run(`
            DELETE FROM cesta
            WHERE username = ? OR cestaId = ?
        `, [username, cestaId]);

        // Insert the existing products into the cesta
        for (const product of existingProducts) {
            await db.run(`
                    INSERT OR REPLACE INTO cesta (productId, cestaId, username, cantidad)
                    VALUES (?, ?, ?, ?)
                `, [product.productId, cestaId, username, product.cantidad]);
        }
    } catch (error) {
        console.error('Error associating cestaId with username:', error);
        throw error;
    }
}






export async function cesta(productId: string, cestaId: string, username: string, cantidad: number) {
    const db = await getDb();
    try {
        // Drop the 'cesta' table if it exists
        // await db.run(`DROP TABLE IF EXISTS cesta`);
        // Create the 'cesta' table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS cesta (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                productId INTEGER NOT NULL,
                cestaId TEXT NOT NULL,
                username TEXT NULL,
                cantidad INTEGER NOT NULL,
                UNIQUE(productId, cestaId)
            )
        `);

        // Insert or update the quantity in the 'cesta' table
        await db.run(`
            INSERT INTO cesta (productId, cestaId, cantidad, username)
            VALUES (:productId, :cestaId, :cantidad, :username)
            ON CONFLICT(productId, cestaId) DO UPDATE SET
            cantidad =  :cantidad
        `, {
            ':productId': productId,
            ':username': username,
            ':cantidad': cantidad,
            ':cestaId': cestaId
        });

        // Delete records with cantidad = 0
        await db.run(`
            DELETE FROM cesta
            WHERE cestaId = :cestaId and cantidad = 0
        `, {
            ':cestaId': cestaId
        });

    } catch (error) {
        console.error('Error updating cesta:', error);
        throw error;
    }
}

export async function getCesta(idCesta: string) {
    const db = await getDb();
    try {
        // Fetch items from the 'cesta' table for the given cestaId with product details
        const cestaItems = await db.all(`
            SELECT 
                c.productId, 
                c.cantidad,
                p.ProductName,
                p.UnitPrice,
                p.UnitsInStock,
                p.Discontinued
            FROM cesta c
            JOIN Products p ON c.productId = p.ProductID
            WHERE c.cestaId = ?
            ORDER BY p.ProductName
        `, [idCesta]);

        return cestaItems;
    } catch (error) {
        console.error('Error fetching cesta:', error);
        throw error;
    }
}

export async function createOrder(username: string, idCesta: string) {
    const db = await getDb();
    try {
        await db.run('BEGIN TRANSACTION');

        // Get CustomerId from the username
        const customer = await db.get('SELECT CustomerID FROM Customers WHERE CustomerID = ?',
            [username]);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Insert into Orders table
        const orderDate = new Date().toISOString();
        const result = await db.run(`
            INSERT INTO Orders (CustomerID, OrderDate)
            VALUES (?, ?)
        `, [customer.CustomerID, orderDate]);

        const orderId = result.lastID;

        // Get cesta items
        const cestaItems = await db.all(`
            SELECT c.productId, c.cantidad, p.UnitPrice
            FROM cesta c
            JOIN Products p ON c.productId = p.ProductID
            WHERE c.username = ?
        `, [username]);
        // Insert into Order Details
        for (const item of cestaItems) {
            await db.run(`
                INSERT INTO "Order Details" (OrderID, ProductID, UnitPrice, Quantity, Discount)
                VALUES (?, ?, ?, ?, 0)
            `, [orderId, item.productId, item.UnitPrice, item.cantidad]);
        }

        // Compute total order amount
        const totalResult = await db.get(`
            SELECT SUM(UnitPrice * Quantity) as TotalAmount
            FROM "Order Details"
            WHERE OrderID = ?
        `, [orderId]);

        const totalAmount = totalResult.TotalAmount;
        // Clear the cesta
        await db.run('DELETE FROM cesta WHERE username = ?', [idCesta]);

        await db.run('COMMIT');

        return { orderId, totalAmount };
    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Error creating order:', error);
        throw error;
    }
}

export async function saveCobro(customerId: string, orderId: number, amount: number, authorizationCode: string) {
    const db = await getDb();
    try {
        // Drop the cobro table if it exists
        // await db.run(`DROP TABLE IF EXISTS cobro`);
        // Create the cobro table if it doesn't exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS cobro (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId INTEGER NOT NULL,
                customerId TEXT NOT NULL,
                amount REAL NOT NULL,
                authorizationCode TEXT NOT NULL UNIQUE,
                fecha TEXT NOT NULL
            )
        `);

        // Insert the new cobro
        const fecha = new Date().toISOString();
        const result = await db.run(
            'INSERT INTO cobro (orderId, customerId, amount, fecha, authorizationCode) VALUES (?, ?, ?, ?, ?)',
            [orderId, customerId, amount, fecha, authorizationCode]
        );

        return result.lastID;
    } catch (error) {
        console.error('Error saving cobro:', error);
        throw error;
    }
}

export async function setPassword(customerId: string, currentPassword: string, newPassword: string) {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ? AND password = ?', [customerId, currentPassword]);
    if (!user) {
        throw new Error('Invalid username or password');
    }
    await db.run('UPDATE users SET password = ? WHERE username = ?', [newPassword, customerId]);
}

export async function getAllCategories() {
    const db = await getDb();
    try {
        const categories = await db.all(`
            SELECT c.*, COUNT(p.ProductID) as ProductCount
            FROM Categories c
            LEFT JOIN Products p ON c.CategoryID = p.CategoryID
            GROUP BY c.CategoryID
            ORDER BY c.CategoryName
        `);
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

export async function getProductsByCategory(categoryId?: string, searchQuery?: string) {
    const db = await getDb();
    try {
        let query = `
            SELECT p.*, c.CategoryName, c.Description as CategoryDescription
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            WHERE 1=1
        `;
        
        const params: any[] = [];
        
        if (categoryId && categoryId !== 'all') {
            query += ` AND p.CategoryID = ?`;
            params.push(categoryId);
        }
        
        if (searchQuery && searchQuery.trim()) {
            query += ` AND p.ProductName LIKE ?`;
            params.push(`%${searchQuery.trim()}%`);
        }
        
        query += ` ORDER BY p.ProductName`;
        
        const products = await db.all(query, params);
        return products;
    } catch (error) {
        console.error('Error fetching products by category:', error);
        throw error;
    }
}

export async function getProductsByCategoryPaginated(
  categoryId?: string, 
  searchQuery?: string, 
  page: number = 1, 
  limit: number = 10
) {
    const db = await getDb();
    try {
        let whereClause = 'WHERE 1=1';
        const params: any[] = [];
        
        if (categoryId && categoryId !== 'all') {
            whereClause += ` AND p.CategoryID = ?`;
            params.push(categoryId);
        }
        
        if (searchQuery && searchQuery.trim()) {
            whereClause += ` AND p.ProductName LIKE ?`;
            params.push(`%${searchQuery.trim()}%`);
        }
        
        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            ${whereClause}
        `;
        
        const countResult = await db.get(countQuery, params);
        const total = countResult.total;
        
        // Calculate pagination
        const offset = (page - 1) * limit;
        const totalPages = Math.ceil(total / limit);
        
        // Get paginated products
        const productsQuery = `
            SELECT p.*, c.CategoryName, c.Description as CategoryDescription
            FROM Products p
            LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
            ${whereClause}
            ORDER BY p.ProductName
            LIMIT ? OFFSET ?
        `;
        
        const products = await db.all(productsQuery, [...params, limit, offset]);
        
        return {
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        };
    } catch (error) {
        console.error('Error fetching paginated products:', error);
        throw error;
    }
}

export async function getPaidOrders() {
    const db = await getDb();
    try {
        const paidOrders = await db.all(`
            SELECT o.*, c.amount as PaidAmount, c.authorizationCode, c.fecha as PaymentDate
            FROM Orders o
            JOIN cobro c ON o.OrderID = c.orderId
            ORDER BY c.fecha DESC
        `);
        return paidOrders;
    } catch (error) {
        console.error('Error fetching paid orders:', error);
        throw error;
    }
}

export async function initializeAdminTables() {
    const db = await getDb();
    try {
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

        // Insertar admin por defecto si no existe
        const adminExists = await db.get('SELECT * FROM user_roles WHERE username = ?', ['admin']);
        if (!adminExists) {
            await db.run(
                'INSERT INTO user_roles (username, role, created_at, updated_at) VALUES (?, ?, ?, ?)',
                ['admin', 'admin', new Date().toISOString(), new Date().toISOString()]
            );
        }

        console.log('✅ Tablas de administración inicializadas');
    } catch (error) {
        console.error('Error initializing admin tables:', error);
        throw error;
    }
}

export async function getUserRole(username: string) {
    const db = await getDb();
    try {
        const role = await db.get('SELECT role FROM user_roles WHERE username = ?', [username]);
        return role ? role.role : 'user';
    } catch (error) {
        console.error('Error getting user role:', error);
        return 'user';
    }
}

export async function isAdmin(username: string) {
    const role = await getUserRole(username);
    return role === 'admin';
}

export async function getAllCustomers() {
    const db = await getDb();
    try {
        const customers = await db.all(`
            SELECT c.*, 
                   COUNT(o.OrderID) as totalOrders,
                   SUM(od.UnitPrice * od.Quantity) as totalSpent
            FROM Customers c
            LEFT JOIN Orders o ON c.CustomerID = o.CustomerID
            LEFT JOIN "Order Details" od ON o.OrderID = od.OrderID
            GROUP BY c.CustomerID
            ORDER BY c.CompanyName
        `);
        return customers;
    } catch (error) {
        console.error('Error fetching all customers:', error);
        throw error;
    }
}

export async function getRecentOrders(limit: number = 10) {
    const db = await getDb();
    try {
        const orders = await db.all(`
            SELECT o.*, c.CompanyName, c.ContactName,
                   SUM(od.UnitPrice * od.Quantity) as totalAmount,
                   os.status as orderStatus,
                   CASE WHEN cob.id IS NOT NULL THEN 'paid' ELSE 'pending' END as paymentStatus
            FROM Orders o
            LEFT JOIN Customers c ON o.CustomerID = c.CustomerID
            LEFT JOIN "Order Details" od ON o.OrderID = od.OrderID
            LEFT JOIN order_status os ON o.OrderID = os.orderId
            LEFT JOIN cobro cob ON o.OrderID = cob.orderId
            GROUP BY o.OrderID
            ORDER BY o.OrderDate DESC
            LIMIT ?
        `, [limit]);
        return orders;
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        throw error;
    }
}

export async function updateOrderStatus(orderId: number, status: string, updatedBy: string, notes?: string) {
    const db = await getDb();
    try {
        await db.run(`
            INSERT OR REPLACE INTO order_status (orderId, status, updated_by, updated_at, notes)
            VALUES (?, ?, ?, ?, ?)
        `, [orderId, status, updatedBy, new Date().toISOString(), notes || null]);

        // Log the activity
        await logActivity(updatedBy, 'update_order_status', `Order ${orderId} status changed to ${status}`);

        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

export async function getSalesAnalytics(timeFrame: string, categoryId?: string) {
    const db = await getDb();
    try {
        let dateFormat = '';
        let groupBy = '';
        
        switch (timeFrame) {
            case 'hour':
                dateFormat = "strftime('%Y-%m-%d %H:00:00', o.OrderDate)";
                groupBy = "strftime('%Y-%m-%d %H:00:00', o.OrderDate)";
                break;
            case 'day':
                dateFormat = "date(o.OrderDate)";
                groupBy = "date(o.OrderDate)";
                break;
            case 'month':
                dateFormat = "strftime('%Y-%m', o.OrderDate)";
                groupBy = "strftime('%Y-%m', o.OrderDate)";
                break;
            case 'quarter':
                dateFormat = "strftime('%Y-Q%m/3', o.OrderDate)";
                groupBy = "strftime('%Y-Q%m/3', o.OrderDate)";
                break;
            case 'semester':
                dateFormat = "strftime('%Y-S%m/6', o.OrderDate)";
                groupBy = "strftime('%Y-S%m/6', o.OrderDate)";
                break;
            case 'year':
                dateFormat = "strftime('%Y', o.OrderDate)";
                groupBy = "strftime('%Y', o.OrderDate)";
                break;
            default:
                dateFormat = "date(o.OrderDate)";
                groupBy = "date(o.OrderDate)";
        }

        let query = `
            SELECT ${dateFormat} as time_period,
                   COUNT(DISTINCT o.OrderID) as total_orders,
                   SUM(od.UnitPrice * od.Quantity) as total_revenue,
                   COUNT(DISTINCT o.CustomerID) as unique_customers
        `;

        if (categoryId) {
            query += `, c.CategoryName`;
        }

        query += `
            FROM Orders o
            JOIN "Order Details" od ON o.OrderID = od.OrderID
            JOIN Products p ON od.ProductID = p.ProductID
        `;

        if (categoryId) {
            query += `JOIN Categories c ON p.CategoryID = c.CategoryID WHERE c.CategoryID = ?`;
        }

        query += `
            GROUP BY ${groupBy}
            ORDER BY time_period DESC
        `;

        const params = categoryId ? [categoryId] : [];
        const analytics = await db.all(query, params);
        return analytics;
    } catch (error) {
        console.error('Error fetching sales analytics:', error);
        throw error;
    }
}

export async function logActivity(username: string, action: string, details?: string, ipAddress?: string, userAgent?: string) {
    const db = await getDb();
    try {
        await db.run(`
            INSERT INTO activity_logs (username, action, details, ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [username, action, details || null, ipAddress || null, userAgent || null, new Date().toISOString()]);
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

export async function getActivityLogs(username?: string, limit: number = 100) {
    const db = await getDb();
    try {
        let query = `
            SELECT al.*, ur.role
            FROM activity_logs al
            LEFT JOIN user_roles ur ON al.username = ur.username
        `;
        
        const params: any[] = [];
        
        if (username) {
            query += ` WHERE al.username = ?`;
            params.push(username);
        }
        
        query += ` ORDER BY al.created_at DESC LIMIT ?`;
        params.push(limit);
        
        const logs = await db.all(query, params);
        return logs;
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
    }
}   