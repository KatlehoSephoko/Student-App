# Student-App
SafeguardCampusSentry — Enterprise Campus Safety & WLAN Telemetry Mesh
CampusSentry is a real-time, lightweight emergency dispatch and campus safety application. It transforms localized wireless network infrastructure (WLAN) into a precision indoor positioning and emergency reporting mesh, eliminating the blind spots of traditional GPS within multi-story academic buildings.
📌 Features
 * Zero-Install Progressive Web App (PWA): Students and couriers can trigger emergency broadcasts instantly via mobile browsers without app store downloads.
 * WLAN Infrastructure Triangulation (Simulated): Maps client requests to specific Wireless Access Points (BSSIDs/Subnets) to resolve exact building, floor, and zone contexts.
 * Zero-Lag Incident Dispatching: Utilizes persistent full-duplex WebSockets (Socket.io) to stream incoming distress telemetry directly to the Security Operations Console.
 * Incident Payload Enrichment: Automatically attaches incident identifiers, safety ratings, exact timestamps, and network telemetry on the server side.
 * Cross-Platform Compatibility: Designed to run across standard Linux distributions, cloud container hosts (Render, Railway, Fly.io), and mobile iOS sandboxes (iSH/Alpine Linux).
🏗️ Architecture Overview
[ Student Mobile View (/student.html) ]
                   │
                   ▼  (WebSocket Event: 'trigger-panic')
      [ Central Node.js Server ]
                   │
                   ├─► [ WLAN Resolution Matrix (Lookup) ]
                   │
                   ▼  (WebSocket Event: 'inbound-alert')
[ Security Dispatch Console (/security.html) ]

📁 Repository Structure
campus-sentry/
├── public/
│   ├── security.html    # Enterprise Security Operations Console
│   └── student.html     # Mobile-first Student/Courier Panic Interface
├── package.json         # Node.js dependencies and run scripts
├── server.js            # Express server, Socket.io pipeline & WLAN Matrix
└── README.md            # System documentation

🚀 Getting Started
Prerequisites
 * Node.js (v14.0.0 or higher)
 * npm
Installation
 * Clone the repository:
   git clone https://github.com/your-username/campus-sentry.git
cd campus-sentry

 * Install project dependencies:
   npm install

 * Start the application:
   npm start
# Or directly:
node server.js

 * Access the web interfaces:
   * Student Portal: http://localhost:3000/student.html
   * Security Console: http://localhost:3000/security.html
📱 Running in Constrained / Mobile Environments (iSH on iOS)
CampusSentry includes built-in polyfills (Object.hasOwn, String.prototype.replaceAll) to support execution inside older Node.js runtimes, such as Alpine Linux on iSH.
 * Install dependencies inside iSH:
   apk update
apk add nodejs npm

 * Bind to all local network interfaces:
   The server binds to 0.0.0.0, allowing other devices on the same Wi-Fi network to reach your iSH instance:
   http://<YOUR_DEVICE_LOCAL_IP>:3000/security.html

⚙️ Configuration & Customization
The WLAN location resolution matrix is defined inside server.js. You can modify or expand the Access Point definitions to reflect your campus or test network topology:
const MOCK_WLAN_MATRIX = {
    'ap-001-sci-floor2': { 
        building: 'Science Block', 
        floor: '2nd Floor', 
        wing: 'East Wing', 
        safetyRating: 'Safe Corridor' 
    },
    'ap-002-lib-basement': { 
        building: 'Central Library', 
        floor: 'Basement', 
        wing: 'Storage Lockers', 
        safetyRating: 'Caution Zone' 
    }
};

☁️ Cloud Deployment
This project can be deployed directly from GitHub to modern cloud PaaS providers:
| Platform | Deployment Type | Configuration |
|---|---|---|
| Render | Web Service | Build: npm install | Start: node server.js |
| Railway | Node.js App | Automatic detection via package.json |
| Fly.io | Container / Node | fly launch (Set internal port to 3000) |
📄 License
Distributed under the MIT License. See LICENSE for more information.
