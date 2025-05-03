import random
import time
import requests
from datetime import datetime

THINGSPEAK_API_KEY = 'ZZ1W4YWVWDKO0WD9'
THINGSPEAK_URL = 'https://api.thingspeak.com/update'

# Başlangıç Değerleri
battery_soc = 50.0  # %50
panel_temp = 25.0    # Başlangıç panel sıcaklığı
ambient_temp = 25.0  # Ortam sıcaklığı

def calculate_panel_temp(irradiance):
    global ambient_temp
    ambient_temp += random.uniform(-0.3, 0.3)
    ambient_temp = max(15, min(35, ambient_temp))
    return ambient_temp + (irradiance * 0.015)

def calculate_efficiency(panel_temp):
    temp_diff = panel_temp - 25.0
    efficiency = 100 - (abs(temp_diff) * 0.8)
    return max(80, min(100, efficiency))

def calculate_power(irradiance, efficiency):
    return (irradiance / 1000) * 5 * (efficiency / 100)

def manage_battery(net_power):
    global battery_soc
    
    max_rate = 3  # kW
    capacity = 10  # kWh
    
    # Akü gücünü sınırla
    battery_power = max(-max_rate, min(max_rate, net_power))
    
    # Gerçek enerji akışı
    actual_power = battery_power
    
    # Şebeke etkileşimi (akünün alamadığı/veremediği kısım)
    grid = net_power - actual_power
    
    # SOC güncelleme (kWh cinsinden)
    soc_change = (actual_power * (1/60)) / capacity * 100
    new_soc = battery_soc + soc_change
    
    # SOC sınır kontrolleri
    if new_soc < 25.0:
        needed = (25.0 - new_soc)/100 * capacity / (1/60)
        grid += needed
        new_soc = 25.0
    elif new_soc > 100.0:
        excess = (new_soc - 100.0)/100 * capacity / (1/60)
        grid -= excess
        new_soc = 100.0
    
    battery_soc = round(new_soc, 2)
    return round(actual_power, 2), round(grid, 2)

def generate_data():
    global panel_temp, ambient_temp
    
    hour = datetime.now().hour
    irradiance = random.uniform(0, 1100) if 7 <= hour < 19 else 0
    
    panel_temp = calculate_panel_temp(irradiance)
    efficiency = calculate_efficiency(panel_temp)
    production = round(calculate_power(irradiance, efficiency), 2)
    consumption = round(random.uniform(0.5, 5.5), 2)
    
    # Enerji dengesi (kW cinsinden)
    net_power = production - consumption
    
    battery_power, grid = manage_battery(net_power)
    
    return {
        'field1': production,
        'field2': round(panel_temp, 2),
        'field3': round(efficiency, 2),
        'field4': round(irradiance, 2),
        'field5': battery_soc,
        'field6': battery_power,
        'field7': consumption,
        'field8': grid
    }

def send_to_thingspeak(data):
    params = {'api_key': THINGSPEAK_API_KEY}
    params.update({f'field{i+1}': v for i, (k, v) in enumerate(data.items())})
    try:
        requests.get(THINGSPEAK_URL, params=params)
    except Exception as e:
        print("Hata:", e)

while True:
    try:
        data = generate_data()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] "
              f"Üretim: {data['field1']}kW | "
              f"Tüketim: {data['field7']}kW | "
              f"Net: {data['field1']-data['field7']}kW | "
              f"Şebeke: {data['field8']}kW")
        send_to_thingspeak(data)
        time.sleep(15)
    except KeyboardInterrupt:
        print("Program durduruldu")
        break
