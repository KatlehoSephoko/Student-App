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
 * Simulates a campus WLAN infrastructure matching raw Network Access Point IDs 
 * (BSSIDs or localized subnet IPs) to human-readable physical locations.
 */
const MOCK_WLAN_MATRIX = {
    'ap-001-sci-floor2': { building: 'Science Block', floor: '2nd Floor', wing: 'East Wing', safetyRating: 'Safe Corridor' },
    'ap-002-lib-basement': { building: 'Central Library', floor: 'Basement', wing: 'Storage Lockers', safetyRating: 'Caution Zone' },
    'ap-003-quad-north': { building: 'North Quad', floor: 'Ground Level', wing: 'Pathway Alpha', safetyRating: 'Safe Corridor' }
};

// WebSocket Event Pipeline
io.on('connection', (socket) => {
    console.log(`[Network Link Established]: Connected ID -> ${socket.id}`);

    /**
     * Event: Register Session Identification
     * Places the socket into a specific communication room depending on their tier.
     */
    socket.on('register-session', (role) => {
        socket.join(role);
        console.log(`[Session Registered]: Socket ${socket.id} assigned to role: ${role}`);
    });

    /**
     * Event: Inbound Panic Trigger
     * Receives emergency data from the student mobile client, enriches it with 
     * network-level telemetry, and blasts it to the Security Operations room.
     */
    socket.on('trigger-panic', (payload) => {
        console.log(`\n[CRITICAL WARNING]: Panic received from client ${socket.id}`);
        
        // Network Layer Simulation: Resolving the location via the WLAN Matrix
        const rawNetworkId = payload.simulatedNetworkId;
        const resolvedLocation = MOCK_WLAN_MATRIX[rawNetworkId] || {
            building: 'Unknown Campus Zone',
            floor: 'Unknown Level',
            wing: 'Out of Range',
            safetyRating: 'Unverified'
        };

        // Enriching payload with server-side network resolution and timestamp
        const enrichedAlert = {
            studentName: payload.studentName || 'Anonymous Student',
            gpsCoordinates: payload.coords,
            networkLocation: resolvedLocation,
            timestamp: new Date().toISOString(),
            incidentId: `INC-${Math.floor(1000 + Math.random() * 9000)}`
        };

        console.log(`[WLAN Router Resolved Location]: ${resolvedLocation.building} - ${resolvedLocation.floor}`);
        
        // Dispatch alert immediately to the enterprise security dashboard group using zero-lag WebSockets
        io.to('security-console').emit('inbound-alert', enrichedAlert);
    });

    socket.on('disconnect', () => {
        console.log(`[Network Link Dropped]: Disconnected ID -> ${socket.id}`);
    });
});

// Run Enterprise Server Sandbox
server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CampusSentry Secure Engine Running on Port: ${PORT}`);
    console.log(` Local Sandbox Access URI: http://localhost:${PORT}`);
    console.log(`====================================================`);
});
