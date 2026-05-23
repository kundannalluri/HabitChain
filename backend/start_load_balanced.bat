@echo off
echo Starting HabitChain API with load balancing (4 workers)...
call venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
