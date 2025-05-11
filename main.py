# Project: Tornado Call Stats App
# Description: Tornado backend with metrics API and HTML frontend using Tailwind CSS

import tornado.ioloop
import tornado.web
import os
import json
from db import get_connection

# Main page handler
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

# API handler for fetching metrics
class MetricsHandler(tornado.web.RequestHandler):
    def get(self):
        try:
            conn = get_connection()
            cur = conn.cursor()

            # Extract query parameters
            customer = self.get_argument("customer", default=None)
            supplier = self.get_argument("supplier", default=None)
            destination = self.get_argument("destination", default=None)
            time_from = self.get_argument("from", default=None)
            time_to = self.get_argument("to", default=None)

            where_clauses = []
            params = {}

            if customer:
                where_clauses.append("customer = %(customer)s")
                params["customer"] = customer
            if supplier:
                where_clauses.append("supplier = %(supplier)s")
                params["supplier"] = supplier
            if destination:
                where_clauses.append("destination = %(destination)s")
                params["destination"] = destination
            if time_from:
                where_clauses.append('"time" >= %(from)s')
                params["from"] = time_from
            if time_to:
                where_clauses.append('"time" <= %(to)s')
                params["to"] = time_to

            where_sql = "WHERE " + " AND ".join(where_clauses) if where_clauses else ""

            cur.execute(f"""
                SELECT
                    time,
                    customer,
                    supplier,
                    destination,
                    seconds,
                    start_nuber,
                    start_attempt,
                    start_uniq_attempt,
                    answer_time,
                    pdd,
                    src_lost_per,
                    dst_lost_per,
                    avg_duration
                FROM public.sonus_aggregation_new
                {where_sql}
                ORDER BY time DESC
                LIMIT 100
            """, params)

            rows = cur.fetchall()
            self.set_header("Content-Type", "application/json")
            self.write(json.dumps(rows, default=str))

            cur.close()
            conn.close()

        except Exception as e:
            self.set_status(500)
            self.write({"error": str(e)})

# Application setup with routes
def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/api/metrics", MetricsHandler),
    ], template_path=os.path.join(os.path.dirname(__file__), "templates"))

# Entry point
if __name__ == "__main__":
    app = make_app()
    app.listen(8888)
    print("✅ Tornado server running at http://localhost:8888")
    tornado.ioloop.IOLoop.current().start()
