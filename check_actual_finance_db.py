import pyodbc

def check_actual_finance_database():
    """Check the actual Finance database tables without Django"""
    print("🔍 Checking your actual Finance database tables...")
    print("=" * 60)

    try:
        # Connect directly to your Finance database
        conn = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=LAPTOP-UTBP1DTD\SQLEXPRESS;'
            'DATABASE=Finance;'
            'Trusted_Connection=yes;'
        )

        cursor = conn.cursor()

        # Get current database name
        cursor.execute("SELECT DB_NAME() as current_db")
        db_name = cursor.fetchone()[0]
        print(f"📊 Connected to database: {db_name}")

        # Get all user-created tables (excluding system tables)
        cursor.execute("""
            SELECT TABLE_NAME, TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            AND TABLE_NAME NOT LIKE 'django_%'
            AND TABLE_NAME NOT LIKE 'auth_%'
            AND TABLE_NAME NOT LIKE 'authtoken_%'
            ORDER BY TABLE_NAME
        """)

        tables = cursor.fetchall()

        if tables:
            print(f"\n📋 Your actual tables in Finance database ({len(tables)}):")
            for table in tables:
                print(f"  - {table[0]} ({table[1]})")

                # Get column information for each table
                cursor.execute(f"""
                    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = '{table[0]}'
                    ORDER BY ORDINAL_POSITION
                """)

                columns = cursor.fetchall()
                print("    Columns:")
                for col in columns:
                    nullable = "NULL" if col[2] == "YES" else "NOT NULL"
                    default = f"DEFAULT {col[3]}" if col[3] else ""
                    print(f"      - {col[0]} ({col[1]}) {nullable} {default}")
                print()
        else:
            print("\n❌ No user-created tables found in Finance database")
            print("This means the database exists but is empty or only has system tables")

        # Also show all tables including system ones
        cursor.execute("""
            SELECT TABLE_NAME, TABLE_TYPE
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        """)

        all_tables = cursor.fetchall()
        print(f"\n📋 All tables in Finance database (including system tables) ({len(all_tables)}):")
        for table in all_tables:
            print(f"  - {table[0]}")

        cursor.close()
        conn.close()

        return True

    except Exception as e:
        print(f"❌ Error connecting to Finance database: {e}")
        print("\nPossible solutions:")
        print("1. Make sure SQL Server is running")
        print("2. Check if ODBC Driver 17 for SQL Server is installed")
        print("3. Verify the server name is correct: LAPTOP-UTBP1DTD\\SQLEXPRESS")
        print("4. Try installing missing dependencies: pip install pyodbc django-mssql-backend")
        return False

if __name__ == '__main__':
    check_actual_finance_database()
