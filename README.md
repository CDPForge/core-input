# Input Manager - Customer Data Platform

## Description
The **Input Manager** module is a key component of the Customer Data Platform (CDP). It is responsible for collecting, validating, and forwarding real-time tracking events, as well as managing the processing of CSV files containing user or product data. Rather than uploading files directly, users will provide URLs or FTP links to where the files are located, allowing for the efficient processing of large files.

### Main Features:
- **/events**: API to collect real-time tracking events.
- **/upload-users**: API to provide a URL/FTP location for a file containing user data.
- **/upload-products**: API to provide a URL/FTP location for a file containing product data.

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-user/input-manager.git
    cd input-manager
    ```

2. **Install dependencies**:
    Make sure you have **Node.js** and **npm** installed. Install the dependencies with the following command:
    ```bash
    npm install
    ```

3. **Start the server**:
    ```bash
    npm start
    ```

The server will be available at `http://localhost:3000`.

## API

### 1. **POST /events**
This API collects real-time tracking events. The events are forwarded to a processing pipeline, where they can be processed and stored.

#### Request
```json
POST /events
Content-Type: application/json

{
    "events": [{
        "client": 100,
        "instance": 100,
        "action": "view",
        "url": "http://mysite.com/testing.html",
        "pageTitle": "Pagina di Test",
        "referrer": "http://mysite.com/index.html",
        "date": "2025-02-05T12:18:29.270Z",
        "deviceid": "A1"
    }]
}