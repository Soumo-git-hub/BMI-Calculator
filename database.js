// Database operations for HealthTrack application
// This uses SQLite for local storage, but can be replaced with a server-based solution

class HealthDatabase {
  constructor() {
    this.db = null;
    this.initDatabase();
  }

  // Initialize the database
  async initDatabase() {
    try {
      // Check if SQLite is available (using SQL.js for client-side)
      if (window.SQL) {
        this.db = new SQL.Database();
        await this.createTables();
        console.log("Database initialized successfully");
      } else {
        console.error("SQL.js not loaded. Using localStorage fallback.");
        // Fallback to localStorage if SQL.js is not available
        this.db = null;
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      this.db = null;
    }
  }

  // Create necessary tables
  async createTables() {
    if (!this.db) return;

    try {
      // Users table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // User profiles table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id INTEGER PRIMARY KEY,
          age INTEGER,
          gender TEXT,
          height REAL,
          weight REAL,
          activity_level REAL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Health metrics table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS health_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          metric_type TEXT NOT NULL,
          metric_value REAL NOT NULL,
          metric_unit TEXT,
          recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      // Daily logs table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS daily_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          log_type TEXT NOT NULL,
          log_value TEXT NOT NULL,
          log_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

      console.log("Tables created successfully");
    } catch (error) {
      console.error("Error creating tables:", error);
    }
  }

  // User authentication methods
  async registerUser(name, email, password) {
    if (this.db) {
      try {
        // Hash password in a real application
        const hashedPassword = password; // In a real app, use bcrypt or similar
        
        const stmt = this.db.prepare(`
          INSERT INTO users (name, email, password)
          VALUES (?, ?, ?)
        `);
        
        stmt.run([name, email, hashedPassword]);
        stmt.free();
        
        // Get the user ID
        const result = this.db.exec(`SELECT id FROM users WHERE email = '${email}'`);
        if (result.length > 0 && result[0].values.length > 0) {
          return { success: true, userId: result[0].values[0][0] };
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error registering user:", error);
        return { success: false, error: "Email already exists or database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const users = JSON.parse(localStorage.getItem('healthtrack_users') || '[]');
        
        // Check if email already exists
        if (users.some(user => user.email === email)) {
          return { success: false, error: "Email already exists" };
        }
        
        const userId = Date.now();
        users.push({
          id: userId,
          name,
          email,
          password, // In a real app, use proper hashing
          created_at: new Date().toISOString()
        });
        
        localStorage.setItem('healthtrack_users', JSON.stringify(users));
        return { success: true, userId };
      } catch (error) {
        console.error("Error registering user (localStorage):", error);
        return { success: false, error: "Error saving user data" };
      }
    }
  }

  async loginUser(email, password) {
    if (this.db) {
      try {
        const result = this.db.exec(`
          SELECT id, name, email FROM users 
          WHERE email = '${email}' AND password = '${password}'
        `);
        
        if (result.length > 0 && result[0].values.length > 0) {
          const userData = {
            id: result[0].values[0][0],
            name: result[0].values[0][1],
            email: result[0].values[0][2]
          };
          
          return { success: true, user: userData };
        }
        
        return { success: false, error: "Invalid email or password" };
      } catch (error) {
        console.error("Error logging in:", error);
        return { success: false, error: "Database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const users = JSON.parse(localStorage.getItem('healthtrack_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
          const userData = {
            id: user.id,
            name: user.name,
            email: user.email
          };
          
          return { success: true, user: userData };
        }
        
        return { success: false, error: "Invalid email or password" };
      } catch (error) {
        console.error("Error logging in (localStorage):", error);
        return { success: false, error: "Error retrieving user data" };
      }
    }
  }

  // Profile methods
  async saveUserProfile(userId, profileData) {
    if (this.db) {
      try {
        // Check if profile exists
        const result = this.db.exec(`SELECT user_id FROM user_profiles WHERE user_id = ${userId}`);
        
        if (result.length > 0 && result[0].values.length > 0) {
          // Update existing profile
          const stmt = this.db.prepare(`
            UPDATE user_profiles
            SET age = ?, gender = ?, height = ?, weight = ?, activity_level = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `);
          
          stmt.run([
            userId,
            profileData.age,
            profileData.gender,
            profileData.height,
            profileData.weight,
            profileData.activityLevel
          ]);
          stmt.free();
        }
        
        return { success: true };
      } catch (error) {
        console.error("Error saving user profile:", error);
        return { success: false, error: "Database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const profiles = JSON.parse(localStorage.getItem('healthtrack_profiles') || '{}');
        
        profiles[userId] = {
          age: profileData.age,
          gender: profileData.gender,
          height: profileData.height,
          weight: profileData.weight,
          activityLevel: profileData.activityLevel,
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem('healthtrack_profiles', JSON.stringify(profiles));
        return { success: true };
      } catch (error) {
        console.error("Error saving user profile (localStorage):", error);
        return { success: false, error: "Error saving profile data" };
      }
    }
  }

  async getUserProfile(userId) {
    if (this.db) {
      try {
        const result = this.db.exec(`
          SELECT age, gender, height, weight, activity_level, updated_at
          FROM user_profiles
          WHERE user_id = ${userId}
        `);
        
        if (result.length > 0 && result[0].values.length > 0) {
          const profileData = {
            age: result[0].values[0][0],
            gender: result[0].values[0][1],
            height: result[0].values[0][2],
            weight: result[0].values[0][3],
            activityLevel: result[0].values[0][4],
            updatedAt: result[0].values[0][5]
          };
          
          return { success: true, profile: profileData };
        }
        
        return { success: false, error: "Profile not found" };
      } catch (error) {
        console.error("Error retrieving user profile:", error);
        return { success: false, error: "Database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const profiles = JSON.parse(localStorage.getItem('healthtrack_profiles') || '{}');
        
        if (profiles[userId]) {
          return { success: true, profile: profiles[userId] };
        }
        
        return { success: false, error: "Profile not found" };
      } catch (error) {
        console.error("Error retrieving user profile (localStorage):", error);
        return { success: false, error: "Error retrieving profile data" };
      }
    }
  }

  // Health metrics methods
  async saveHealthMetric(userId, metricType, metricValue, metricUnit) {
    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO health_metrics (user_id, metric_type, metric_value, metric_unit)
          VALUES (?, ?, ?, ?)
        `);
        
        stmt.run([userId, metricType, metricValue, metricUnit]);
        stmt.free();
        
        return { success: true };
      } catch (error) {
        console.error("Error saving health metric:", error);
        return { success: false, error: "Database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const metrics = JSON.parse(localStorage.getItem('healthtrack_metrics') || '[]');
        
        metrics.push({
          id: Date.now(),
          user_id: userId,
          metric_type: metricType,
          metric_value: metricValue,
          metric_unit: metricUnit,
          recorded_at: new Date().toISOString()
        });
        
        localStorage.setItem('healthtrack_metrics', JSON.stringify(metrics));
        return { success: true };
      } catch (error) {
        console.error("Error saving health metric (localStorage):", error);
        return { success: false, error: "Error saving metric data" };
      }
    }
  }

  async getHealthMetrics(userId, metricType, limit = 10) {
    if (this.db) {
      try {
        let query = `
          SELECT metric_value, metric_unit, recorded_at
          FROM health_metrics
          WHERE user_id = ${userId}
        `;
        
        if (metricType) {
          query += ` AND metric_type = '${metricType}'`;
        }
        
        query += ` ORDER BY recorded_at DESC LIMIT ${limit}`;
        
        const result = this.db.exec(query);
        
        if (result.length > 0) {
          const metrics = result[0].values.map(row => ({
            value: row[0],
            unit: row[1],
            recordedAt: row[2]
          }));
          
          return { success: true, metrics };
        }
        
        return { success: true, metrics: [] };
      } catch (error) {
        console.error("Error retrieving health metrics:", error);
        return { success: false, error: "Database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const metrics = JSON.parse(localStorage.getItem('healthtrack_metrics') || '[]');
        
        let filteredMetrics = metrics.filter(m => m.user_id === userId);
        
        if (metricType) {
          filteredMetrics = filteredMetrics.filter(m => m.metric_type === metricType);
        }
        
        // Sort by recorded_at in descending order
        filteredMetrics.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
        
        // Limit the results
        filteredMetrics = filteredMetrics.slice(0, limit);
        
        const formattedMetrics = filteredMetrics.map(m => ({
          value: m.metric_value,
          unit: m.metric_unit,
          recordedAt: m.recorded_at
        }));
        
        return { success: true, metrics: formattedMetrics };
      } catch (error) {
        console.error("Error retrieving health metrics (localStorage):", error);
        return { success: false, error: "Error retrieving metric data" };
      }
    }
  }

  // Daily logs methods
  async saveDailyLog(userId, logType, logValue, logDate) {
    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO daily_logs (user_id, log_type, log_value, log_date)
          VALUES (?, ?, ?, ?)
        `);
        
        stmt.run([userId, logType, logValue, logDate]);
        stmt.free();
        
        return { success: true };
      } catch (error) {
        console.error("Error saving daily log:", error);
        return { success: false, error: "Database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const logs = JSON.parse(localStorage.getItem('healthtrack_logs') || '[]');
        
        logs.push({
          id: Date.now(),
          user_id: userId,
          log_type: logType,
          log_value: logValue,
          log_date: logDate,
          created_at: new Date().toISOString()
        });
        
        localStorage.setItem('healthtrack_logs', JSON.stringify(logs));
        return { success: true };
      } catch (error) {
        console.error("Error saving daily log (localStorage):", error);
        return { success: false, error: "Error saving log data" };
      }
    }
  }

  async getDailyLogs(userId, logType, logDate) {
    if (this.db) {
      try {
        let query = `
          SELECT log_type, log_value, created_at
          FROM daily_logs
          WHERE user_id = ${userId}
        `;
        
        if (logType) {
          query += ` AND log_type = '${logType}'`;
        }
        
        if (logDate) {
          query += ` AND log_date = '${logDate}'`;
        }
        
        query += ` ORDER BY created_at DESC`;
        
        const result = this.db.exec(query);
        
        if (result.length > 0) {
          const logs = result[0].values.map(row => ({
            type: row[0],
            value: row[1],
            createdAt: row[2]
          }));
          
          return { success: true, logs };
        }
        
        return { success: true, logs: [] };
      } catch (error) {
        console.error("Error retrieving daily logs:", error);
        return { success: false, error: "Database error" };
      }
    } else {
      // Fallback to localStorage
      try {
        const logs = JSON.parse(localStorage.getItem('healthtrack_logs') || '[]');
        
        let filteredLogs = logs.filter(l => l.user_id === userId);
        
        if (logType) {
          filteredLogs = filteredLogs.filter(l => l.log_type === logType);
        }
        
        if (logDate) {
          filteredLogs = filteredLogs.filter(l => l.log_date === logDate);
        }
        
        // Sort by created_at in descending order
        filteredLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        const formattedLogs = filteredLogs.map(l => ({
          type: l.log_type,
          value: l.log_value,
          createdAt: l.created_at
        }));
        
        return { success: true, logs: formattedLogs };
      } catch (error) {
        console.error("Error retrieving daily logs (localStorage):", error);
        return { success: false, error: "Error retrieving log data" };
      }
    }
  }

  // Check if user has profile data
  async hasUserProfile(userId) {
    const result = await this.getUserProfile(userId);
    return result.success;
  }
}

// Export the database class
window.HealthDatabase = HealthDatabase;

// Add these methods to your database class/object

// Save calculation to database
async function saveCalculation(userId, type, value, date) {
  try {
    // Make sure database is initialized
    if (!this.db) {
      await this.initDB();
    }
    
    // Insert calculation into database
    this.db.run(`
      INSERT INTO calculations (user_id, calc_type, value, date)
      VALUES (?, ?, ?, ?)
    `, [userId, type, value, date]);
    
    return { success: true };
  } catch (error) {
    console.error('Error saving calculation:', error);
    return { success: false, error: error.message };
  }
}

// Get user calculations by type
async function getUserCalculations(userId, type = null) {
  try {
    // Make sure database is initialized
    if (!this.db) {
      await this.initDB();
    }
    
    let query = `SELECT * FROM calculations WHERE user_id = ?`;
    let params = [userId];
    
    if (type) {
      query += ` AND calc_type = ?`;
      params.push(type);
    }
    
    query += ` ORDER BY date ASC`;
    
    const results = this.db.exec(query, params);
    
    if (results && results.length > 0) {
      return { 
        success: true, 
        data: results[0].values.map(row => ({
          id: row[0],
          userId: row[1],
          type: row[2],
          value: row[3],
          date: row[4]
        }))
      };
    }
    
    return { success: true, data: [] };
  } catch (error) {
    console.error('Error getting calculations:', error);
    return { success: false, error: error.message };
  }
}

// Add these methods to your database initialization
function initDB() {
  return new Promise((resolve, reject) => {
    initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    }).then(SQL => {
      try {
        // Create a database
        this.db = new SQL.Database();
        
        // Create tables if they don't exist
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
          )
        `);
        
        this.db.run(`
          CREATE TABLE IF NOT EXISTS calculations (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            calc_type TEXT,
            value REAL,
            date TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    }).catch(error => {
      reject(error);
    });
  });
}