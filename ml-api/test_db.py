import psycopg2
from app.core.config import settings

def test_database_connection():
    try:
        # Test connection
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USERNAME,
            password=settings.DB_PASSWORD,
            database=settings.DB_DATABASE
        )
        
        cursor = conn.cursor()
        
        # Check if schema exists
        cursor.execute("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'server_api';")
        schema_exists = cursor.fetchone()
        
        if schema_exists:
            print("✅ Schema 'server_api' exists")
            
            # List tables in schema
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'server_api'
                ORDER BY table_name;
            """)
            
            tables = cursor.fetchall()
            print(f"📋 Tables in server_api schema:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Count posts  
            cursor.execute("SELECT COUNT(*) FROM server_api.post WHERE \"deletedAt\" IS NULL;")
            post_count = cursor.fetchone()[0]
            print(f"📊 Active posts: {post_count}")
            
            # Check editor table structure
            cursor.execute("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_schema = 'server_api' AND table_name = 'editor'
                ORDER BY ordinal_position;
            """)
            
            editor_columns = cursor.fetchall()
            print(f"📋 Columns in 'editor' table:")
            for col in editor_columns:
                print(f"  - {col[0]} ({col[1]})")
                
            # Sample editor data
            cursor.execute("SELECT * FROM server_api.editor LIMIT 5;")
            editor_data = cursor.fetchall()
            print(f"� Sample editor data:")
            for row in editor_data:
                print(f"  - {row}")
            
        else:
            print("❌ Schema 'server_api' does not exist")
        
        cursor.close()
        conn.close()
        print("✅ Database connection successful!")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

if __name__ == "__main__":
    test_database_connection()
