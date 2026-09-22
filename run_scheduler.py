from apscheduler.schedulers.blocking import BlockingScheduler
from services.backup_service import backup_all_to_sheets
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("Scheduler")

def start_scheduler():
    try:
        scheduler = BlockingScheduler()
        scheduler.add_job(backup_all_to_sheets, 'cron', hour=3, minute=0)
        logger.info("Scheduler started for Google Sheets backup (runs daily at 03:00).")
        scheduler.start()
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")

if __name__ == "__main__":
    start_scheduler()
