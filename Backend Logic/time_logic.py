from datetime import datetime
from zoneinfo import ZoneInfo

def get_current_phil_time():
    current_phil_datetime = datetime.now(ZoneInfo("Asia/Manila"))
    current_phil_time = current_phil_datetime.time()
    
    return current_phil_time

def is_store_open(list_of_stores:list):
    for store in list_of_stores:
        opening_time = datetime.strptime(store["opening_time"], "%H:%M").time()
        closing_time = datetime.strptime(store["closing_time"], "%H:%M").time()

        current_phil_time = get_current_phil_time()

        if opening_time <= current_phil_time <= closing_time:
            store["is_open"] = True

    return list_of_stores

