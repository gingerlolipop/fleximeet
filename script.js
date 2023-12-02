let allAvailability = {}; // Object to store all users' availability
let userPasswords = {};

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    // Corrected dates, including the correct weekdays
    const dates = [
        '2024-01-11', // January 11, 2024 (Thursday)
        '2024-01-12', // January 12, 2024 (Friday)
        '2024-03-01', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07', '2024-03-08', // March 1 and 4-8, 2024 (Weekdays)
        '2024-03-11', '2024-03-12', '2024-03-13', '2024-03-14'  // March 11-14, 2024 (Weekdays)
    ];

    const times = [];
    // Generate 30-minute time slots from 9:00 AM to 6:30 PM
    for (let hour = 9; hour < 19; hour++) {
        times.push(`${hour}:00`, `${hour}:30`);
    }

    // Create table and header row
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const firstCell = document.createElement('th');
    headerRow.appendChild(firstCell);

    dates.forEach(dateString => {
        const date = new Date(dateString);
        const dateHeader = document.createElement('th');
        dateHeader.textContent = `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        headerRow.appendChild(dateHeader);

        // Log the date string and its corresponding Date object
        console.log(dateString, date.toString());
    });
    
    table.appendChild(headerRow);

    // Create rows for each time slot
    times.forEach(time => {
        const row = document.createElement('tr');
        const timeCell = document.createElement('td');
        timeCell.textContent = time;
        row.appendChild(timeCell);

        dates.forEach(dateString => {
            const timeSlot = document.createElement('td');
            timeSlot.classList.add('time-slot');
            timeSlot.dataset.date = dateString;
            timeSlot.dataset.time = time;
            row.appendChild(timeSlot);
        });

        table.appendChild(row);
    });

    calendar.appendChild(table);
}


function setupDragSelect() {
    let isSelecting = false;
    const calendar = document.getElementById('calendar');
    calendar.addEventListener('mousedown', e => {
        if (e.target.classList.contains('time-slot')) {
            isSelecting = true;
            toggleSelect(e.target);
        }
    });
    calendar.addEventListener('mouseover', e => {
        if (isSelecting && e.target.classList.contains('time-slot')) {
            toggleSelect(e.target);
        }
    });
    document.addEventListener('mouseup', () => {
        isSelecting = false;
    });

    function toggleSelect(element) {
        element.classList.toggle('selected');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateCalendar();
    setupDragSelect();
});

document.getElementById('submit').addEventListener('click', () => {
    const userName = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    if (!userName || !password) {
        alert("Please enter your name and password.");
        return;
    }

    // Check for existing username and password match
    if (userPasswords[userName] && userPasswords[userName] !== password) {
        alert("Username already exists with a different password. Please use a different username or enter the correct password.");
        return;
    }

    const selectedSlots = Array.from(document.querySelectorAll('.selected'));
    const availability = selectedSlots.map(slot => `${slot.dataset.date} ${slot.dataset.time}`);

    // Check if the selected slots for each day total at least 2.5 hours
    const isValidAvailability = validateAvailability(availability);
    if (!isValidAvailability) {
        alert("Please select time slots totaling at least 2.5 hours for each day.");
        return;
    }

    allAvailability[userName] = availability;
    userPasswords[userName] = password; // Store or update the password

    displayAllAvailability();
    clearSelection();
});

// Function to validate if the selected slots for each day total at least 2.5 hours
function validateAvailability(availability) {
    const timeSlotsByDate = availability.reduce((acc, slot) => {
        const [date, time] = slot.split(' ');
        acc[date] = acc[date] || [];
        acc[date].push(time);
        return acc;
    }, {});

    return Object.values(timeSlotsByDate).every(slots => {
        if (slots.length < 5) return false; // Each slot is 30 minutes, so we need at least 5 slots for 2.5 hours
        // Additional logic can be added here to check for continuous time slots if needed
        return true;
    });
}
function displayAllAvailability() {
    const resultsDiv = document.getElementById('availability-results');
    resultsDiv.innerHTML = '<h3>Availability</h3>';
    const table = document.createElement('table');
    for (const [userName, slots] of Object.entries(allAvailability)) {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = userName;
        row.appendChild(nameCell);

        const slotsCell = document.createElement('td');
        slotsCell.textContent = slots.join(', ');
        row.appendChild(slotsCell);

        table.appendChild(row);
    }
    resultsDiv.appendChild(table);
}

function clearSelection() {
    document.querySelectorAll('.selected').forEach(slot => slot.classList.remove('selected'));
    document.getElementById('username').value = ''; // Clear the name input
}

// Admin functionality
function adminDeleteRecord() {
    const adminUsername = 'gingerlolipop';
    const adminPassword = prompt('Enter admin password:');
    if (adminPassword === 'jingexcellent') { // Replace with a secure password
        const usernameToDelete = prompt('Enter username to delete:');
        if (usernameToDelete && allAvailability[usernameToDelete]) {
            delete allAvailability[usernameToDelete];
            delete userPasswords[usernameToDelete];
            displayAllAvailability();
            alert(`Record for '${usernameToDelete}' has been deleted.`);
        } else {
            alert("Username not found or invalid admin password.");
        }
    }
}

// Listen for a specific key combination (e.g., Ctrl+Shift+D)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        adminDeleteRecord();
    }
});