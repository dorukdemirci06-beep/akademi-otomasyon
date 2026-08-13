import requests
import os
from dotenv import load_dotenv

load_dotenv()

# (Global API_KEY removed, we use dynamic keys now)

def format_phone_number(phone_number: str) -> str:
    """Telefon numarasını uluslararası formata çevirir"""
    if not phone_number:
        return ""
    
    # Boşlukları ve gereksiz karakterleri temizle
    phone_number = phone_number.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    if phone_number.startswith("0"):
        return "+90" + phone_number[1:]
    elif not phone_number.startswith("+"):
        return "+90" + phone_number
        
    return phone_number

def send_whatsapp_message(phone_number: str, message: str, provider: str = "callmebot", api_key: str = None, phone_id: str = None) -> bool:
    """
    Belirtilen sağlayıcı üzerinden WhatsApp mesajı gönderir.
    Test modunda (api_key yoksa) sadece konsola çıktı verir.
    """
    formatted_phone = format_phone_number(phone_number)
    if not formatted_phone:
        return False
        
    if not api_key or api_key == "TEST_API_KEY":
        print(f"\n[{'-'*10} WHATSAPP (TEST MODU - {provider.upper()}) {'-'*10}]")
        print(f"Alıcı: {formatted_phone}")
        print(f"Mesaj: {message}")
        print(f"[{'-'*45}]\n")
        return True

    if provider == "meta":
        url = f"https://graph.facebook.com/v17.0/{phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        data = {
            "messaging_product": "whatsapp",
            "to": formatted_phone.replace("+", ""),
            "type": "text",
            "text": {"body": message}
        }
        try:
            response = requests.post(url, headers=headers, json=data, timeout=10)
            if response.status_code in [200, 201]:
                return True
            else:
                print(f"Meta WhatsApp Hatası: HTTP {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"Meta WhatsApp isteği başarısız oldu: {e}")
            return False
        
    else: # CallMeBot
        url = "https://api.callmebot.com/whatsapp.php"
        params = {
            "phone": formatted_phone,
            "text": message,
            "apikey": api_key
        }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code == 200:
            return True
        else:
            print(f"WhatsApp Hatası: HTTP {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"WhatsApp isteği başarısız oldu: {e}")
        return False
