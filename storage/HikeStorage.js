// // storage/HikeStorage.js
// import * as SQLite from 'expo-sqlite';

// let db = null;
// let useSQLite = false;

// try {
//   if (SQLite.openDatabase) {
//     db = SQLite.openDatabase("hikes.db");
//     useSQLite = true;
//     console.log("✅ SQLite loaded successfully");
//   }
// } catch (err) {
//   console.log("❌ SQLite not available, fallback to memory", err);
// }

// // check trạng thái
// export const isSQLiteEnabled = () => useSQLite;

// // fallback memory
// let memHikes = [];
// let memId = 1;

// export const initDatabase = async () => {
//   if (!useSQLite) {
//     console.log("⚠️ Using in-memory DB (SQLite unavailable)");
//     return;
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `CREATE TABLE IF NOT EXISTS hikes (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           name TEXT NOT NULL,
//           location TEXT NOT NULL,
//           date TEXT NOT NULL,
//           parking TEXT NOT NULL,
//           length TEXT NOT NULL,
//           difficulty TEXT NOT NULL,
//           description TEXT,
//           participants TEXT
//         );`,
//         [],
//         () => {
//           console.log("✅ Database initialized");
//           resolve(true);
//         },
//         (_, err) => {
//           console.log("❌ Error initializing DB", err);
//           reject(err);
//         }
//       );
//     });
//   });
// };

// // INSERT
// export const insertHikeSQLite = async (hike) => {
//   if (!useSQLite) {
//     const copy = { ...hike, id: memId++ };
//     memHikes.push(copy);
//     return copy;
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `INSERT INTO hikes (name, location, date, parking, length, difficulty, description, participants)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
//         [
//           hike.name,
//           hike.location,
//           hike.date,
//           hike.parking,
//           hike.length,
//           hike.difficulty,
//           hike.description,
//           hike.participants
//         ],
//         (_, result) => resolve(result),
//         (_, err) => reject(err)
//       );
//     });
//   });
// };

// // SELECT ALL
// export const getAllHikesSQLite = async () => {
//   if (!useSQLite) {
//     return [...memHikes].reverse();
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `SELECT * FROM hikes ORDER BY id DESC`,
//         [],
//         (_, result) => resolve(result.rows._array),
//         (_, err) => reject(err)
//       );
//     });
//   });
// };

// // UPDATE
// export const updateHikeSQLite = async (hike) => {
//   if (!useSQLite) {
//     const index = memHikes.findIndex(h => h.id === hike.id);
//     if (index !== -1) memHikes[index] = { ...hike };
//     return;
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `UPDATE hikes
//          SET name=?, location=?, date=?, parking=?, length=?, difficulty=?, description=?, participants=?
//          WHERE id = ?`,
//         [
//           hike.name,
//           hike.location,
//           hike.date,
//           hike.parking,
//           hike.length,
//           hike.difficulty,
//           hike.description,
//           hike.participants,
//           hike.id
//         ],
//         (_, result) => resolve(result),
//         (_, err) => reject(err)
//       );
//     });
//   });
// };

// // DELETE
// export const deleteHikeSQLite = async (id) => {
//   if (!useSQLite) {
//     memHikes = memHikes.filter(h => h.id !== id);
//     return;
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `DELETE FROM hikes WHERE id = ?`,
//         [id],
//         (_, result) => resolve(result),
//         (_, err) => reject(err)
//       );
//     });
//   });
// };

// // RESET
// export const resetHikesSQLite = async () => {
//   if (!useSQLite) {
//     memHikes = [];
//     memId = 1;
//     return;
//   }

//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       tx.executeSql(
//         `DELETE FROM hikes`,
//         [],
//         (_, result) => resolve(result),
//         (_, err) => reject(err)
//       );
//     });
//   });
// };

// storage/HikeStorage.js
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db = null;
let useSQLite = false;

try {
  // Bảo đảm chỉ bật trên native
  if ((Platform.OS === 'android' || Platform.OS === 'ios') && typeof SQLite.openDatabase === 'function') {
    db = SQLite.openDatabase('hikes.db');
    useSQLite = true;
    console.log('✅ SQLite loaded successfully on', Platform.OS);
  } else {
    console.log('⚠️ SQLite unavailable on', Platform.OS, '-> fallback to memory');
  }
} catch (err) {
  console.log('❌ SQLite not available, fallback to memory', err);
}

export const isSQLiteEnabled = () => useSQLite;

// Fallback in-memory
let memHikes = [];
let memId = 1;

export const initDatabase = async () => {
  if (!useSQLite) {
    console.log('⚠️ Using in-memory DB (SQLite unavailable)');
    return true;
  }
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS hikes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            date TEXT NOT NULL,
            parking TEXT NOT NULL,
            length TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            description TEXT,
            participants TEXT
          );`,
          [],
          () => console.log('✅ Database initialized')
        );
      },
      (err) => {
        console.log('❌ Error initializing DB', err);
        reject(err);
      },
      () => resolve(true)
    );
  });
};

// INSERT
export const insertHikeSQLite = async (hike) => {
  const participants = Array.isArray(hike?.participants)
    ? JSON.stringify(hike.participants)
    : (hike?.participants ?? '');

  if (!useSQLite) {
    const copy = { ...hike, id: memId++, participants };
    memHikes.push(copy);
    return copy;
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO hikes (name, location, date, parking, length, difficulty, description, participants)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            hike.name,
            hike.location,
            hike.date,
            hike.parking,
            hike.length,
            hike.difficulty,
            hike.description ?? '',
            participants,
          ],
          (_, result) => resolve(result)
        );
      },
      (err) => reject(err)
    );
  });
};

// SELECT ALL
export const getAllHikesSQLite = async () => {
  if (!useSQLite) {
    return [...memHikes].sort((a, b) => b.id - a.id);
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM hikes ORDER BY id DESC',
          [],
          (_, result) => resolve(result.rows._array)
        );
      },
      (err) => reject(err)
    );
  });
};

// UPDATE
export const updateHikeSQLite = async (hike) => {
  const participants = Array.isArray(hike?.participants)
    ? JSON.stringify(hike.participants)
    : (hike?.participants ?? '');

  if (!useSQLite) {
    const index = memHikes.findIndex((h) => h.id === hike.id);
    if (index !== -1) memHikes[index] = { ...hike, participants };
    return;
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `UPDATE hikes
           SET name=?, location=?, date=?, parking=?, length=?, difficulty=?, description=?, participants=?
           WHERE id = ?`,
          [
            hike.name,
            hike.location,
            hike.date,
            hike.parking,
            hike.length,
            hike.difficulty,
            hike.description ?? '',
            participants,
            hike.id,
          ],
          (_, result) => resolve(result)
        );
      },
      (err) => reject(err)
    );
  });
};

// DELETE
export const deleteHikeSQLite = async (id) => {
  if (!useSQLite) {
    memHikes = memHikes.filter((h) => h.id !== id);
    return;
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM hikes WHERE id = ?,'
          [id],
          (_, result) => resolve(result)
        );
      },
      (err) => reject(err)
    );
  });
};

// RESET
export const resetHikesSQLite = async () => {
  if (!useSQLite) {
    memHikes = [];
    memId = 1;
    return;
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM hikes',
          [],
          (_, result) => resolve(result)
        );
      },
      (err) => reject(err)
    );
  });
};