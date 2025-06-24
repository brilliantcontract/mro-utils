# Serper.dev Caller

Web application to run multiple searches against [serper.dev](https://serper.dev).

Open `serper-dev-caller/index.html` in a browser, enter your API key in the
password field and type queries line by line. Press **Start** to begin sending
requests. Progress and responses appear on the page. Press **Stop** to abort
processing. Use **Copy** to copy all returned JSON lines and **Clean** to clear
the query list.


To run the unit tests without installing packages, open `test/index.html` in a web browser.

Duplicate queries are automatically cached so repeated lines are not sent to the
remote API again. This reduces the number of requests made while still
displaying results for every entered line.
\nNew webapp fix-invalid-google-ids added.
