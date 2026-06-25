import sqlite3
import sys
import psycopg2

def migrate():
    if len(sys.argv) < 2:
        print("Usage: python migrate_data.py <POSTGRES_EXTERNAL_DATABASE_URL>")
        return

    postgres_url = sys.argv[1]
    
    print("Connecting to local SQLite database...")
    sqlite_conn = sqlite3.connect("habitchain.db")
    sqlite_cur = sqlite_conn.cursor()

    print("Connecting to remote PostgreSQL database...")
    try:
        pg_conn = psycopg2.connect(postgres_url)
        pg_cur = pg_conn.cursor()
    except Exception as e:
        print(f"Error connecting to Postgres: {e}")
        return

    try:
        # 1. Migrate Users
        print("Migrating users...")
        sqlite_cur.execute("SELECT id, username, email, hashed_password, points, level, bio, email_notifs, dark_mode, created_at FROM users")
        users = sqlite_cur.fetchall()
        for u in users:
            pg_cur.execute(
                """
                INSERT INTO users (id, username, email, hashed_password, points, level, bio, email_notifs, dark_mode, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """, u
            )
        
        # 2. Migrate Habits
        print("Migrating habits...")
        sqlite_cur.execute("SELECT id, user_id, name, description, category, priority, frequency, goal_value, unit, color, icon, reminder_time, is_archived, created_at FROM habits")
        habits = sqlite_cur.fetchall()
        for h in habits:
            pg_cur.execute(
                """
                INSERT INTO habits (id, user_id, name, description, category, priority, frequency, goal_value, unit, color, icon, reminder_time, is_archived, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """, h
            )

        # 3. Migrate Completions
        print("Migrating completions...")
        sqlite_cur.execute("SELECT id, habit_id, date, progress_value, notes FROM completions")
        completions = sqlite_cur.fetchall()
        for c in completions:
            pg_cur.execute(
                """
                INSERT INTO completions (id, habit_id, date, progress_value, notes)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """, c
            )

        # Sync PostgreSQL primary key sequences so new entries don't conflict
        print("Syncing primary key sequences...")
        pg_cur.execute("SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;")
        pg_cur.execute("SELECT setval(pg_get_serial_sequence('habits', 'id'), coalesce(max(id), 1)) FROM habits;")
        pg_cur.execute("SELECT setval(pg_get_serial_sequence('completions', 'id'), coalesce(max(id), 1)) FROM completions;")

        pg_conn.commit()
        print("🎉 Data migration completed successfully!")

    except Exception as e:
        pg_conn.rollback()
        print(f"❌ Migration failed: {e}")
    finally:
        sqlite_conn.close()
        pg_conn.close()

if __name__ == "__main__":
    migrate()
