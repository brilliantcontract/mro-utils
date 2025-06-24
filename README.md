# Serper.dev Caller

Web application to run multiple searches against [serper.dev](https://serper.dev).

Open `serper-dev-caller/index.html` in a browser, enter queries line by line and
press **Start** to begin sending requests. Progress and responses appear on the
page. Press **Stop** to abort processing.

Duplicate queries are automatically cached so repeated lines are not sent to the
remote API again. This reduces the number of requests made while still
displaying results for every entered line.
