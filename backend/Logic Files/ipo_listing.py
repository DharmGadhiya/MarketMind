import pandas as pd
import time
import os
import sys
from datetime import datetime
from curl_cffi import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

BASE_URL = "https://www.nseindia.com/market-data/all-upcoming-issues-ipo"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": BASE_URL
}

# Dictionary mapping each tab to its exact API endpoint and destination CSV file
IPO_TABS = {
    "Current": {
        "api_url": "https://www.nseindia.com/api/ipo-current-issue",
        "csv_file": "nse_ipo_current.csv"
    },
    "Upcoming": {
        "api_url": "https://www.nseindia.com/api/all-upcoming-issues?category=ipo",
        "csv_file": "nse_ipo_upcoming.csv"
    },
    "Past": {
        "api_url": "https://www.nseindia.com/api/public-past-issues",
        "csv_file": "nse_ipo_past.csv"
    }
}

def fetch_and_save_data():
    session = requests.Session(impersonate="chrome110", headers=HEADERS)
    
    try:
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"\n[{current_time}] Establishing session and fetching cookies...")
        
        # Step 1: Hit the main page ONCE to get the required security cookies
        session.get(BASE_URL, timeout=15)
        
        # Wait slightly before hitting the APIs to mimic human behavior
        time.sleep(2.5) 
        
        # Step 2: Loop through each tab's API endpoint
        for tab_name, config in IPO_TABS.items():
            print(f"--> Fetching '{tab_name}' IPOs...")
            
            response = session.get(config["api_url"], timeout=15)
            
            # Defensive check for 404s or blocks
            if response.status_code != 200:
                print(f"    ❌ Failed: Server returned status code {response.status_code}.")
                continue
                
            if 'application/json' not in response.headers.get('Content-Type', '').lower():
                print("    ❌ Failed: NSE returned something other than JSON.")
                continue
            
            # Step 3: Parse the JSON data
            data = response.json()
            
            # Check for standard NSE error string inside JSON
            if isinstance(data, str) and "missing params" in data.lower():
                 print(f"    ❌ API rejected the request for missing parameters.")
                 continue
                 
            # NSE sometimes wraps data in a 'data' key, sometimes just sends a list
            announcements = data if isinstance(data, list) else data.get('data', [])
            
            if announcements:
                df = pd.DataFrame(announcements)
                df['fetch_timestamp'] = current_time
                
                script_dir = os.path.dirname(os.path.abspath(__file__))
                csv_filename = os.path.join(script_dir, config["csv_file"])
                file_exists = os.path.isfile(csv_filename)
                
                # Step 4: Append to CSV (creates headers if file doesn't exist)
                df.to_csv(csv_filename, mode='a', index=False, header=not file_exists)
                print(f"    ✅ Success! Saved {len(df)} records to {csv_filename}.")
            else:
                print(f"    ⚠️ No IPOs found in the '{tab_name}' response (list is empty).")
            
            # Sleep for 2 seconds before requesting the next tab's data
            time.sleep(2)
            
    except Exception as e:
        print(f"Error scraping data: {e}")

if __name__ == "__main__":
    print("Starting Multi-Tab NSE IPOs Scraper. Press Ctrl+C to stop.")
    
    while True:
        fetch_and_save_data()
        
        print("\nWaiting 5 minutes before the next fetch...")
        # 300 seconds = 5 minutes
        time.sleep(300)