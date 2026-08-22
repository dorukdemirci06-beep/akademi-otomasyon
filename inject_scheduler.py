import sys

with open('main.py', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = 'from services.backup_service import backup_all_to_sheets\nfrom apscheduler.schedulers.background import BackgroundScheduler\n'
if import_statement not in content:
    content = content.replace('from services.whatsapp_service import send_whatsapp_message', 'from services.whatsapp_service import send_whatsapp_message\n' + import_statement)

scheduler_code = """
# --- GOOGLE SHEETS BACKUP SCHEDULER ---
try:
    scheduler = BackgroundScheduler()
    scheduler.add_job(backup_all_to_sheets, 'cron', hour=3, minute=0)
    scheduler.start()
    print("Background scheduler started for Google Sheets backup (runs daily at 03:00).")
except Exception as e:
    print("Failed to start background scheduler:", e)
"""

if 'GOOGLE SHEETS BACKUP SCHEDULER' not in content:
    content = content + '\n' + scheduler_code

with open('main.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Injected APScheduler into main.py')
