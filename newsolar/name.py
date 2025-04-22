import random
import time
import requests
from datetime import datetime

# ThingSpeak Ayarları
THINGSPEAK_API_KEY = 'ZZ1W4YWVWDKO0WD9'  # ThingSpeak kanalınızın WRITE API KEY'i
THINGSPEAK_URL = 'https://api.thingspeak.com/update'

# Başlangıç değerleri
initial_battery_soc = 50  # Akü şarjı başlangıçta %50
initial_battery_capacity_kWh = 10  # Akü kapasitesi 10 kWh
initial_daily_energy_production = 0  # Günlük toplam enerji üretimi
initial_daily_energy_consumption = 0  # Günlük toplam enerji tüketimi

def is_daytime():
    """
    Saat 07:00 ile 19:00 arasında gündüz olup olmadığını kontrol eder.
    """
    current_hour = datetime.now().hour
    return 7 <= current_hour < 19  # 07:00 - 19:00 arası gündüz

def simulate_power_generation(previous_daily_energy, solar_irradiance, panel_efficiency):
    """
    Güneş paneli güç üretimini simüle eder.
    Üretim, güneş ışınımı, panel verimliliği, saat ve rastgele faktörlere bağlıdır.
    """
    # Panel özellikleri
    panel_area = 10  # Panel alanı (m²)
    max_power = 5  # Maksimum güç kapasitesi (kW)
    
    # Saat faktörü (07:00-19:00 arası üretim eğrisi)
    current_hour = datetime.now().hour
    hour_factor = 0
    if 7 <= current_hour < 19:
        # Gün ortasında (13:00) maksimum üretim
        peak_hour = 13
        hour_diff = abs(current_hour - peak_hour)
        hour_factor = 1 - (hour_diff / 6) ** 2  # Parabolik eğri
    
    # Bulut etkisi (rastgele dalgalanmalar)
    cloud_factor = random.uniform(0.7, 1.0)
    
    # Temel güç hesaplama
    base_power = (solar_irradiance * panel_efficiency * panel_area) / 100000  # kW cinsinden
    
    # Faktörleri uygula
    instantaneous_power = base_power * hour_factor * cloud_factor
    
    # Güç sınırlaması (0 ile max_power kW arası)
    instantaneous_power = max(0, min(max_power, instantaneous_power))
    
    # Rastgele küçük dalgalanmalar ekle
    instantaneous_power += random.uniform(-0.1, 0.1)
    instantaneous_power = max(0, instantaneous_power)  # Negatif olmamasını sağla
    
    # Günlük toplam enerji üretimi güncelle (kWh)
    daily_total_energy = previous_daily_energy + (instantaneous_power * (1 / 60))  # 1 dakikada üretilen enerji

    return {
        "instantaneous_power_output_kW": round(instantaneous_power, 2),
        "daily_total_energy_production_kWh": round(daily_total_energy, 2)
    }

def simulate_panel_efficiency(panel_temp):
    # Panel Verimliliği (25°C'de %100 verimlilik varsayıyoruz)
    base_efficiency = 100  # 25°C'deki verimlilik

    # Sıcaklık artışına bağlı verimlilik kaybı (Her 1°C artış için %0.45 verimlilik kaybı)
    efficiency_loss = (panel_temp - 25) * 0.45  # 25°C üzerindeki her derece için %0.45 kayıp

    # Nihai verimlilik (minimum %10 verimlilik garantisi)
    efficiency = max(10, base_efficiency - efficiency_loss)

    return {
        "panel_efficiency_percent": round(efficiency, 2)
    }

def simulate_environmental_data(previous_panel_temp):
    # Güneş Işınımı (0 ile 1000 W/m² arasında rastgele, sadece gündüz saatlerinde)
    solar_irradiance = round(random.uniform(0, 1000), 2) if is_daytime() else 0

    # Ortam Sıcaklığı (10°C ile 40°C arasında rastgele, önceki değere yakın)
    ambient_temp = round(previous_panel_temp + random.uniform(-2, 2), 2)
    ambient_temp = max(10, min(40, ambient_temp))  # Sıcaklık 10°C ile 40°C arasında kalsın

    # Panel Sıcaklığı (ortam sıcaklığına ve güneş ışınımına bağlı)
    panel_temp = round(ambient_temp + (solar_irradiance / 100), 2)
    panel_temp = max(20, min(60, panel_temp))  # Panel sıcaklığı 20°C ile 60°C arasında kalsın

    return {
        "solar_irradiance_W_per_m2": solar_irradiance,
        "ambient_temperature_C": ambient_temp,
        "panel_temperature_C": panel_temp
    }

def simulate_energy_consumption(previous_daily_consumption):
    # Anlık Enerji Tüketimi (0 ile 5 kW arasında rastgele)
    instantaneous_consumption = round(random.uniform(0, 5), 2)

    # Günlük Toplam Enerji Tüketimi (anlık tüketimi ekleyerek güncelle)
    daily_total_consumption = previous_daily_consumption + (instantaneous_consumption * (1 / 60))  # 1 dakikada tüketilen enerji (kWh)

    return {
        "instantaneous_energy_consumption_kW": instantaneous_consumption,
        "daily_total_energy_consumption_kWh": round(daily_total_consumption, 2)
    }

def simulate_battery_status(battery_soc, battery_capacity, instantaneous_power, instantaneous_consumption):
    """
    Akü durumunu simüle eder.
    - Üretim > Tüketim: Fazla enerji aküyü şarj eder
    - Tüketim > Üretim: Eksik enerji aküden çekilir
    """
    # Enerji dengesi (kW)
    power_balance = instantaneous_power - instantaneous_consumption
    
    # Akünün şarj/deşarj gücü sınırları (kW)
    max_charge_power = 5.0  # Maksimum şarj gücü
    max_discharge_power = 5.0  # Maksimum deşarj gücü
    
    # Akü güç hesaplama
    if power_balance > 0:  # Fazla enerji var, akü şarj olabilir
        available_charge_capacity = (100 - battery_soc) * battery_capacity / 100  # kWh
        max_possible_charge = min(power_balance, max_charge_power, available_charge_capacity * 60)  # kW
        battery_power = max_possible_charge
    else:  # Enerji açığı var, aküden çekilebilir
        available_discharge_capacity = (battery_soc - 25) * battery_capacity / 100  # kWh (minimum %25 koruma)
        max_possible_discharge = min(abs(power_balance), max_discharge_power, available_discharge_capacity * 60)  # kW
        battery_power = -max_possible_discharge if battery_soc > 25 else 0

    # Akü şarj durumu güncelleme
    energy_change = battery_power * (1 / 60)  # kWh (1 dakikada)
    battery_soc += (energy_change / battery_capacity) * 100
    battery_soc = max(0, min(100, battery_soc))

    return {
        "battery_state_of_charge_percent": round(battery_soc, 2),
        "battery_temperature_C": round(20 + (abs(battery_power) * 0.1), 2),
        "battery_charge_discharge_power_kW": round(battery_power, 2)
    }, battery_soc

def simulate_grid_interaction(battery_soc, battery_capacity, excess_energy):
    """
    Şebeke etkileşimini simüle eder.
    - Üretim + Akü Deşarj > Tüketim: Fazla enerji şebekeye verilir
    - Üretim + Akü Deşarj < Tüketim: Eksik enerji şebekeden çekilir
    """
    # Akünün kullanılabilir kapasitesi
    available_discharge = ((battery_soc - 25) * battery_capacity / 100) if battery_soc > 25 else 0  # kWh
    
    if excess_energy > 0:  # Fazla enerji var
        # Önce aküyü şarj et, kalan enerjiyi şebekeye ver
        available_charge_space = (100 - battery_soc) * battery_capacity / 100  # kWh
        energy_to_battery = min(excess_energy, available_charge_space)
        energy_fed_to_grid = max(0, excess_energy - energy_to_battery)
        energy_drawn_from_grid = 0
    else:  # Enerji açığı var
        energy_needed = abs(excess_energy)
        # Önce aküden çek, yetmezse şebekeden al
        energy_from_battery = min(energy_needed, available_discharge)
        energy_drawn_from_grid = max(0, energy_needed - energy_from_battery)
        energy_fed_to_grid = 0

    return {
        "energy_fed_to_grid_kWh": round(energy_fed_to_grid, 3),
        "energy_drawn_from_grid_kWh": round(energy_drawn_from_grid, 3)
    }, battery_soc

def generate_solar_data(previous_data):
    # Önceki değerleri al
    previous_daily_energy = previous_data["power_generation"]["daily_total_energy_production_kWh"]
    previous_daily_consumption = previous_data["energy_consumption"]["daily_total_energy_consumption_kWh"]
    previous_panel_temp = previous_data["environmental_data"]["panel_temperature_C"]
    previous_battery_soc = previous_data["battery_status"]["battery_state_of_charge_percent"]

    # Yeni verileri üret
    environmental_data = simulate_environmental_data(previous_panel_temp)
    panel_efficiency = simulate_panel_efficiency(environmental_data["panel_temperature_C"])
    power_generation = simulate_power_generation(
        previous_daily_energy,
        environmental_data["solar_irradiance_W_per_m2"],
        panel_efficiency["panel_efficiency_percent"]
    )
    energy_consumption = simulate_energy_consumption(previous_daily_consumption)
    battery_status, new_battery_soc = simulate_battery_status(
        previous_battery_soc, initial_battery_capacity_kWh,
        power_generation["instantaneous_power_output_kW"],
        energy_consumption["instantaneous_energy_consumption_kW"]
    )
    excess_energy = (power_generation["instantaneous_power_output_kW"] - energy_consumption["instantaneous_energy_consumption_kW"]) * (1 / 60)
    grid_interaction, new_battery_soc = simulate_grid_interaction(new_battery_soc, initial_battery_capacity_kWh, excess_energy)

    # Tüm verileri birleştir
    data = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "power_generation": power_generation,
        "panel_efficiency": panel_efficiency,
        "environmental_data": environmental_data,
        "energy_consumption": energy_consumption,
        "grid_interaction": grid_interaction,
        "battery_status": battery_status
    }
    return data

def send_to_thingspeak(data):
    """
    Verileri ThingSpeak'a gönderir.
    """
    # Şebekeye verilen/çekilen enerjiyi tek bir alanda birleştir
    net_grid_energy = data['grid_interaction']['energy_fed_to_grid_kWh'] - data['grid_interaction']['energy_drawn_from_grid_kWh']

    params = {
        'api_key': THINGSPEAK_API_KEY,
        'field1': data['power_generation']['instantaneous_power_output_kW'],  # Anlık Güç
        'field2': data['environmental_data']['panel_temperature_C'],  # Anlık Panel Sıcaklığı
        'field3': data['panel_efficiency']['panel_efficiency_percent'],  # Anlık Panel Verimliliği
        'field4': data['environmental_data']['solar_irradiance_W_per_m2'],  # Anlık Işınım
        'field5': data['battery_status']['battery_state_of_charge_percent'],  # Akü Şarj Durumu
        'field6': data['battery_status']['battery_charge_discharge_power_kW'],  # Anlık Aküye Giren/Çıkan Enerji
        'field7': data['energy_consumption']['instantaneous_energy_consumption_kW'],  # Anlık Enerji Tüketimi
        'field8': net_grid_energy  # Şebekeye Verilen/Çekilen Net Enerji
    }

    try:
        response = requests.get(THINGSPEAK_URL, params=params)
        if response.status_code == 200:
            print("Veri ThingSpeak'a başarıyla gönderildi!")
        else:
            print(f"Hata: ThingSpeak'a veri gönderilemedi. Status Code: {response.status_code}")
    except Exception as e:
        print(f"Bağlantı hatası: {e}")

# Ana döngü
if __name__ == "__main__":
    # Başlangıç verileri
    solar_data = {
        "power_generation": {"daily_total_energy_production_kWh": initial_daily_energy_production},
        "energy_consumption": {"daily_total_energy_consumption_kWh": initial_daily_energy_consumption},
        "environmental_data": {"panel_temperature_C": 25},
        "battery_status": {"battery_state_of_charge_percent": initial_battery_soc}
    }

    while True:
        solar_data = generate_solar_data(solar_data)
        print("Üretilen Veri:", solar_data)
        send_to_thingspeak(solar_data)  # Veriyi ThingSpeak'a gönder
        time.sleep(15)  # 60 saniyede bir veri gönder