// 1. Polyfills for iSH Alpine Node compatibility
if (!Object.hasOwn) {
    Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
}
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(str, newStr) {
        return this.replace(new RegExp(str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'), 'g'), newStr);
    };
}

// 2. Fixed casing: 'const' instead of 'Const'
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static web pages from a 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

/**
 * MOCK DATABASE MATRIX
 * Simulates campus WLAN infrastructure matching raw Access Point IDs 
 * to human-readable physical locations.
 */
const MOCK_WLAN_MATRIX = {
    'ap-001-sci-floor2': { building: 'Science Block', floor: '2nd Floor', wing: 'East Wing', safetyRating: 'Safe Corridor' },
    'ap-002-lib-basement': { building: 'Central Library', floor: 'Basement', wing: 'Storage Lockers', safetyRating: 'Caution Zone' },
    'ap-003-quad-north': { building: 'North Quad', floor: 'Ground Level', wing: 'Pathway Alpha', safetyRating: 'Safe Corridor' }
};

// WebSocket Event Pipeline
io.on('connection', (socket) => {
    console.log(`[Network Link Established]: Connected ID -> ${socket.id}`);

    // Register Session into Room
    socket.on('register-session', (role) => {
        socket.join(role);
        console.log(`[Session Registered]: Socket ${socket.id} assigned to role: ${role}`);
    });

    // Inbound Panic Trigger
    socket.on('trigger-panic', (payload) => {
        console.log(`\n[CRITICAL WARNING]: Panic received from client ${socket.id}`);
        
        const rawNetworkId = payload.simulatedNetworkId;
        const resolvedLocation = MOCK_WLAN_MATRIX[rawNetworkId] || {
            building: 'Unknown Campus Zone',
            floor: 'Unknown Level',
            wing: 'Out of Range',
            safetyRating: 'Unverified'
        };

        const enrichedAlert = {
            studentName: payload.studentName || 'Anonymous Student',
            gpsCoordinates: payload.coords,
            networkLocation: resolvedLocation,
            timestamp: new Date().toISOString(),
            incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`
        };

        console.log(`[WLAN Resolved]: ${resolvedLocation.building} - ${resolvedLocation.floor}`);
        
        // Broadcast directly to security dashboard listeners
        io.to('security-console').emit('inbound-alert', enrichedAlert);
    });

    socket.on('disconnect', () => {
        console.log(`[Network Link Dropped]: Disconnected ID -> ${socket.id}`);
    });
});

// Explicitly bind to '0.0.0.0' for LAN access across your devices
server.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` CampusSentry Secure Engine Running on Port: ${PORT}`);
    console.log(` Local Sandbox Access URI: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
