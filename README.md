# LCAutoSheet

This is a pretty convoluted autosheet setup, but it's the best I can come up with that also allows me to easily modify it.
In short, you need to setup your google sheets api for OAuth and allow redirections from `http://localhost`.
You also need to make your own `config.js` file.

# Running LCAutoSheet

### Pre-requisites

To run this you'll need:
- Any HTTP server runner (Python, Npx, etc...)
- A Google Sheets API OAuth client Key
- Allow Redirects from `http://localhost:port` for your API Key

Note: `port` here is just a number of your choosing, 8000 will be used as an example

### Step 1: Clone the Repository

Either run 

```git clone https://github.com/MakuAureo/LCAutoSheet.git```

or download the repository

### Step 2: Setup the Config File

Rename `config.example.js` to `config.js` and fill in the necessary fields

#### Config File
``` config.js
const CLIENT_ID = "put_your_google_api_client_id"; // <------ Api key
const SPREADSHEET_ID = "put_your_sheet_id"; // <------ SheetID, ie: https://docs.google.com/spreadsheets/d/ **THIS PART OF THE URL** /...
const ACTIVE_SHEET_NAME = "put_the_name_of_the_active_sheet_to_update"; // <------ The name of the sheet that the server will read and update
const START_COLUMN = "D"; // Warning: There needs to be at least **24** columns of empty space to be filled **AFTER** this cell
const QUOTA_COLUMN = "B";
const SELL_COLUMN = "AB";
```

### Step 3: Running the Server

Run the local server

``` run.py
python -m http.server 8000
```

### Step 4: Open the Server

Open `http://localhost:8000` in your browser

Autorize your Google Account, it has to have Editor permissions to the sheet you are trying to update

Hit `Connect`

And you're done!
