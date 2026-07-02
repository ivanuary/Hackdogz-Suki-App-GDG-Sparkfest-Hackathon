from datetime import datetime, timedelta, timezone

# Philippine Standard Time is a fixed UTC+8 offset, no DST, ever. Using this
# directly (instead of ZoneInfo("Asia/Manila")) avoids a real-world crash:
# Windows Python installs don't ship the IANA timezone database, so
# zoneinfo.ZoneInfo("Asia/Manila") raises ZoneInfoNotFoundError unless the
# separate "tzdata" pip package is installed. A fixed offset needs nothing
# extra and is exactly as correct for PH time.
PHT = timezone(timedelta(hours=8))


def get_current_phil_time():
    current_phil_datetime = datetime.now(PHT)
    current_phil_time = current_phil_datetime.time()

    return current_phil_time


def is_store_open(list_of_stores: list):
    current_phil_time = get_current_phil_time()

    for store in list_of_stores:
        opening_time = datetime.strptime(store["opening_time"], "%H:%M").time()
        closing_time = datetime.strptime(store["closing_time"], "%H:%M").time()

        store["is_open"] = opening_time <= current_phil_time <= closing_time

    return list_of_stores
