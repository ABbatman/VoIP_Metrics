import traceback
from db import get_connection

try:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM public.sonus_aggregation_new")
    result = cur.fetchone()
    print("Rows in sonus_aggregation_new:", result)
    cur.close()
    conn.close()
except Exception:
    print("❌ Database error:")
    traceback.print_exc()