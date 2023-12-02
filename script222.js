let allAvailability = {}; // Object to store all users' availability
let userPasswords = {};

function generateCalendar() {
    const calendar = document.getElementById('calendar');
    console.log("Generating calendar...");

    const dates = [
        '2024-01-11', '2024-01-12', // January 11-12, 2024
        '2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29', // February 26-29, 2024
        '2024-03-01', '2024-03-04', '2024-03-05', '2024-03-06', '2024-03-07', '2024-03-08', '2024-03-11', '2024-03-12', // March 1-12, 2024
    ];
    
    const times = [];
    // Generate 30-minute time slots from 9:00 AM to 6:00 PM
    for (let hour = 9; hour <= 18; hour++) {
        times.push(`${hour}:00`);
        if (hour < 18) {
            times.push(`${hour}:30`);
        }
    }
    
    // Create table and header row
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    const firstCell = document.createElement('th');
    headerRow.appendChild(firstCell);

    dates.forEach(dateString => {
        // Split the date string into components
        const [year, month, day] = dateString.split('-').map(num => parseInt(num));
        // Create a new Date object using local time zone
        const date = new Date(year, month - 1, day);
        const dateHeader = document.createElement('th');
        dateHeader.textContent = `${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
        headerRow.appendChild(dateHeader);

        console.log("Date string:", dateString, "Date object:", date.toString());
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
    console.log("Calendar generated.");
}

function setupDragSelect() {
    let isSelecting = false;
    const calendar = document.getElementById('calendar');
    calendar.addEventListener('mousedown', e => {
        if (e.target.classList.contains('time-slot')) {
            isSelecting = true;
            toggleSelect(e.target);
            console.log("Selection started at:", e.target.dataset.date, e.target.dataset.time);
        }
    });
    calendar.addEventListener('mouseover', e => {
        if (isSelecting && e.target.classList.contains('time-slot')) {
            toggleSelect(e.target);
            console.log("Selecting:", e.target.dataset.date, e.target.dataset.time);
        }
    });
    document.addEventListener('mouseup', () => {
        if (isSelecting) {
            console.log("Selection ended.");
            isSelecting = false;
        }
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

    if (userPasswords[userName] && userPasswords[userName] !== password) {
        alert("Username already exists with a different password. Please use a different username or enter the correct password.");
        return;
    }

    const selectedSlots = Array.from(document.querySelectorAll('.selected'));
    if (!isValidSelection(selectedSlots)) {
        alert("Please select at least 2.5 consecutive hours.");
        return;
    }

    const availability = selectedSlots.map(slot => `${slot.dataset.date} ${slot.dataset.time}`);
    allAvailability[userName] = availability;
    userPasswords[userName] = password;

    console.log("User submitted availability:", userName, availability);
    displayAllAvailability();
    clearSelection();
});

function isValidSelection(selectedSlots) {
    // Group slots by date
    const slotsByDate = selectedSlots.reduce((acc, slot) => {
        const date = slot.dataset.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(slot.dataset.time);
        return acc;
    }, {});

    // Check each date for a continuous selection of at least 2.5 hours
    return Object.values(slotsByDate).every(dateSlots => {
        // Sort times for each date
        dateSlots.sort();
        let continuousBlock = 0; // To track continuous time blocks

        for (let i = 0; i < dateSlots.length; i++) {
            // Calculate the time difference between adjacent slots
            if (i < dateSlots.length - 1) {
                const currentTime = convertToMinutes(dateSlots[i]);
                const nextTime = convertToMinutes(dateSlots[i + 1]);
                if (nextTime - currentTime === 30) {
                    continuousBlock += 30; // Increment the block size
                    if (continuousBlock >= 120) { // Check if the block is at least 2.5 hours
                        return true;
                    }
                } else {
                    continuousBlock = 0; // Reset if the block is interrupted
                }
            }
        }
        return false; // No continuous block of at least 2.5 hours found
    });
}

function convertToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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
    console.log("Selection cleared.");
}

function adminDeleteRecord() {
    const adminUsername = 'gingerlolipop'; // Example admin username
    const adminPassword = prompt('Enter admin password:');
    if (adminPassword === 'jingexcellent') { // Replace with a secure password
        const usernameToDelete = prompt('Enter username to delete:');
        if (usernameToDelete && allAvailability[usernameToDelete]) {
            delete allAvailability[usernameToDelete];
            delete userPasswords[usernameToDelete];
            displayAllAvailability();
            alert(`Record for '${usernameToDelete}' has been deleted.`);
            console.log(`Admin deleted record for: ${usernameToDelete}`);
        } else {
            alert("Username not found or invalid admin password.");
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        adminDeleteRecord();
    }
});
