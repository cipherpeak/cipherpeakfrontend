
import os
import django
import sys

# Setup Django environment - Pointing to the backend directory
BACKEND_DIR = r'c:\Users\HP\cipherpeak-backend'
sys.path.append(BACKEND_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cipher.settings')
django.setup()

from django.contrib.auth import get_user_model
from task.models import Task

User = get_user_model()

print("--- DEBUG TASK ASSIGNMENTS ---")
users = User.objects.all()
for u in users:
    tasks = Task.objects.filter(assignee=u, is_deleted=False)
    print(f"User: {u.username} (ID: {u.id}, Role: {u.role}) - Task Count: {tasks.count()}")

print("--- ALL TASKS ---")
all_tasks = Task.objects.filter(is_deleted=False)
print(f"Total non-deleted tasks: {all_tasks.count()}")
for t in all_tasks:
    print(f"Task: {t.title}, ID: {t.id}, Assignee: {t.assignee.username if t.assignee else 'None'}")
