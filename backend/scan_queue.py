import queue
import threading
from database import SessionLocal
from models import Scan

# ---------------- QUEUE ----------------
scan_queue = queue.Queue()

# ---------------- CONFIG ----------------
MAX_WORKERS = 2

# ---------------- SAFE FUNCTION HOOK ----------------
run_scan_func = None

# ---------------- WORKER ----------------
def worker(worker_id):
    print(f"⚡ Worker-{worker_id} started")

    while True:
        scan_id, target = scan_queue.get()

        try:
            print(f"[Worker-{worker_id}] Processing Scan ID: {scan_id}")

            db = SessionLocal()
            try:
                scan = db.query(Scan).filter(Scan.id == scan_id).first()
                if scan:
                    scan.status = "Running"
                    db.commit()
            finally:
                db.close()

            # 🔥 SAFE CALL (no circular import)
            if run_scan_func:
                run_scan_func(scan_id, target)

            print(f"[Worker-{worker_id}] Completed Scan ID: {scan_id}")

        except Exception as e:
            print(f"[Worker-{worker_id}] ERROR: {str(e)}")

        finally:
            scan_queue.task_done()


# ---------------- START WORKERS ----------------
def start_workers():
    print(f"🔥 Starting {MAX_WORKERS} workers...")

    for i in range(MAX_WORKERS):
        t = threading.Thread(target=worker, args=(i+1,), daemon=True)
        t.start()


# ---------------- ADD SCAN ----------------
def add_scan(scan_id, target):
    print(f"📥 Queue Scan ID {scan_id}")
    scan_queue.put((scan_id, target))


# ---------------- CONNECT RUN FUNCTION ----------------
def set_run_scan(func):
    global run_scan_func
    run_scan_func = func


# ---------------- DEBUG ----------------
def get_queue_size():
    return scan_queue.qsize()