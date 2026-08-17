// ==========================================
// 1. RUNTIME POLYFILLS
// ==========================================
if (!Object.hasOwn) {
    Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
}
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(str, newStr) {
        return this.replace(new RegExp(str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'), 'g'), newStr);
    };
}

// ==========================================
// 2. DEPENDENCIES & SETUP
// ==========================================
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/student.html');
});

// ==========================================
// 3. MOCK DATABASE MATRIX
// ==========================================
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
    },
    'ap-003-quad-north': { 
        building: 'North Quad', 
        floor: 'Ground Level', 
        wing: 'Pathway Alpha', 
        safetyRating: 'Safe Corridor' 
    }
};

let latestAlert = null;

// ==========================================
// 4. WEBSOCKET EVENT PIPELINE
// ==========================================
io.on('connection', (socket) => {
    socket.on('register-session', (role) => {
        socket.join(role);
        if (role === 'security-console' && latestAlert) {
            socket.emit('inbound-alert', latestAlert);
        }
    });

    socket.on('trigger-panic', (payload) => {
        const rawNetworkId = payload.simulatedNetworkId;
        const resolvedLocation = MOCK_WLAN_MATRIX[rawNetworkId] || {
            building: 'Unknown Campus Zone',
            floor: 'Unknown Level',
            wing: 'Out of Range',
            safetyRating: 'Unverified'
        };

        const profile = payload.studentProfile || {};

        const enrichedAlert = {
            studentNumber: profile.studentNumber || 'N/A',
            fullName: `${profile.firstName || 'Anonymous'} ${profile.surname || ''}`.trim(),
            phone: profile.phone || 'N/A',
            gpsCoordinates: payload.coords,
            networkLocation: resolvedLocation,
            timestamp: new Date().toISOString(),
            incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`
        };

        latestAlert = enrichedAlert;
        io.to('security-console').emit('inbound-alert', enrichedAlert);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on Port ${PORT}`);
});
