from haversine import haversine, Unit

def calculate_distance(user_coordinates:tuple, stores_with_product:list):
    for store in stores_with_product:
        store_coordinates = (store['latitude'], store['longitude'])
        distance_km = haversine(user_coordinates, store_coordinates, unit=Unit.KILOMETERS)

        store['distance'] = distance_km

    return stores_with_product