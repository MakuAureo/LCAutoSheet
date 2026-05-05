# LCAutoSheet

This is a pretty convoluted autosheet setup, but it's the best I can come up with that also allows me to easily modify it.
In short, you need to setup your google sheets api for OAuth and allow redirections from `http://localhost`.
You also need to make your own `config.js` file.

# Config File

```
const CLIENT_ID = "your_google_api_client_id";
const SPREADSHEET_ID = "your_sheet_id";
const ACTIVE_SHEET_NAME = "name_of_the_active_sheet_to_update";
const START_COLUMN = "D"; //There has to be at least 24 columns of empty space to be filled after this
const QUOTA_COLUMN = "B";
const SELL_COLUMN = "AB";
```

# Running LCAutoSheet

Any http server runner will work, but by far the simplest is running this python command on this directory
```python -m http.server port```
