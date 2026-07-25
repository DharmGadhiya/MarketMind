import pandas as pd
import time
import os
import sys
from datetime import datetime
from curl_cffi import requests

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# The main webpage URL used to establish the session and cookies
BASE_URL = "https://www.nseindia.com/companies-listing/corporate-filings-announcements"

# The API endpoint for Equities corporate announcements
API_URL = "https://www.nseindia.com/api/corporate-announcements?index=equities"

def fetch_and_save_data():
    session = requests.Session(impersonate="chrome110")
    
    try:
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        print(f"[{current_time}] Establishing session and fetching cookies...")
        
        # Step 1: Hit the main page first to get the required security cookies
        session.get(BASE_URL, timeout=15)
        
        # Step 2: Hit the API endpoint with those cookies
        print("Fetching Corporate Announcements JSON data...")
        response = session.get(API_URL, timeout=15)
        response.raise_for_status()
        
        # Step 3: Parse the JSON
        data = response.json()
        
        # The API can return the list directly, or wrap it inside a 'data' key.
        announcements = data if isinstance(data, list) else data.get('data', [])
        
        if announcements:
            df = pd.DataFrame(announcements)
            
            # Add a timestamp column so you know exactly when each row was captured
            df['fetch_timestamp'] = current_time
            
            script_dir = os.path.dirname(os.path.abspath(__file__))
            csv_filename = os.path.join(script_dir, "nse_corporate_announcements.csv")
            file_exists = os.path.isfile(csv_filename)
            
            # Step 4: Append to CSV (creates a new file with headers if it doesn't exist)
            df.to_csv(csv_filename, mode='a', index=False, header=not file_exists)
            
            print(f"Success! Saved {len(df)} records to {csv_filename}.")
        else:
            print(f"No announcements found in the response. Raw response snippet: {str(data)[:200]}")
            
    except Exception as e:
        print(f"Error scraping data: {e}")

if __name__ == "__main__":
    print("Starting NSE Corporate Announcements Scraper. Press Ctrl+C to stop.")
    
    while True:
        fetch_and_save_data()
        
        print("Waiting 5 minutes before the next fetch...\n")
        # 300 seconds = 5 minutes
        time.sleep(300)