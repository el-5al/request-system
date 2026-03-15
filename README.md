# Request System

A simple web-based request management system that allows users to submit and track requests.

## Features

- Submit new requests with a title, category, priority, and description
- View all submitted requests in a table
- Filter requests by status and category
- Mark requests as In Progress or Resolved
- Persistent storage using the browser's localStorage

## Getting Started

No build step or server required. Open `index.html` directly in your browser.

```bash
# Clone the repository
git clone https://github.com/el-5al/request-system.git
cd request-system

# Open in browser
open index.html   # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

## Project Structure

```
request-system/
├── index.html       # Main application entry point
├── style.css        # Application styles
├── app.js           # Application logic
└── README.md        # Project documentation
```

## Usage

1. Fill in the **New Request** form and click **Submit Request**.
2. Your request appears in the **Requests** table with a *Pending* status.
3. Use the filter controls above the table to narrow down the list.
4. Click **Start** to move a request to *In Progress*, or **Resolve** to mark it *Resolved*.

## License

MIT
