// Retrieve announcements from localStorage
function getAnnouncements() {
    return JSON.parse(localStorage.getItem('announcements')) || [];
}

// Save announcements to localStorage
function saveAnnouncements(announcements) {
    localStorage.setItem('announcements', JSON.stringify(announcements));
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Render the list of announcements
// Render the list of announcements
function renderAnnouncements() {
    const announcementList = document.getElementById('announcementList');
    const announcements = getAnnouncements();

    announcementList.innerHTML = ''; // Clear the list

    announcements.forEach((announcementObj, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('announcement-item');

        const textSpan = document.createElement('span');
        textSpan.textContent = announcementObj.text;
        textSpan.classList.add('announcement-text');

        const timestampSpan = document.createElement('span');
        timestampSpan.textContent = `Posted at: ${formatTimestamp(announcementObj.timestamp)}`;
        timestampSpan.classList.add('announcement-timestamp'); // Added class

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('announcement-button', 'edit-button');
        editButton.onclick = () => {
            const newAnnouncement = prompt('Edit announcement:', announcementObj.text);
            if (newAnnouncement !== null) {
                announcements[index].text = newAnnouncement;
                saveAnnouncements(announcements);
                renderAnnouncements();
                updateHomeScreenAnnouncements();
            }
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('announcement-button', 'delete-button');
        deleteButton.onclick = () => {
            announcements.splice(index, 1);
            saveAnnouncements(announcements);
            renderAnnouncements();
            updateHomeScreenAnnouncements();
        };

        listItem.appendChild(textSpan);
        listItem.appendChild(timestampSpan);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        announcementList.appendChild(listItem);
    });
}


// Add a new announcement
document.getElementById('addAnnouncementButton').addEventListener('click', () => {
    const announcementInput = document.getElementById('announcementInput');
    const newAnnouncement = announcementInput.value.trim();

    if (newAnnouncement) {
        const announcements = getAnnouncements();
        const newAnnouncementObj = {
            text: newAnnouncement,
            timestamp: Date.now() // Store the current time
        };
        announcements.push(newAnnouncementObj);
        saveAnnouncements(announcements);
        announcementInput.value = ''; // Clear the input field
        renderAnnouncements();
        updateHomeScreenAnnouncements();
    } else {
        alert('Please enter an announcement.');
    }
});

// Initialize the announcements section
renderAnnouncements();

// Render the list of announcements on the home screen
function updateHomeScreenAnnouncements() {
    const homeAnnouncementList = document.getElementById('homeAnnouncementList');
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];

    homeAnnouncementList.innerHTML = ''; // Clear previous announcements

    announcements.forEach(announcementObj => {
        const listItem = document.createElement('li');
        listItem.classList.add('announcement-item');

        const textSpan = document.createElement('span');
        textSpan.textContent = announcementObj.text;
        textSpan.classList.add('announcement-text');

        const timestampSpan = document.createElement('span');
        timestampSpan.textContent = `Posted at: ${formatTimestamp(announcementObj.timestamp)}`;
        timestampSpan.classList.add('announcement-timestamp'); // Added class for timestamp

        listItem.appendChild(textSpan);
        listItem.appendChild(timestampSpan);

        homeAnnouncementList.appendChild(listItem);
    });
}


// Load announcements on home screen load
updateHomeScreenAnnouncements();



document.getElementById('exportDataButton').addEventListener('click', () => {
    const localStorageData = JSON.stringify(localStorage);
    const blob = new Blob([localStorageData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'localStorageData.json';
    a.click();

    URL.revokeObjectURL(url); // Clean up the object URL
});

document.getElementById('importDataButton').addEventListener('click', () => {
    const importInput = document.getElementById('importDataInput');
    importInput.click(); // Trigger the hidden file input

    importInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    Object.keys(importedData).forEach((key) => {
                        localStorage.setItem(key, importedData[key]);
                    });
                    alert('Local storage restored successfully.');
                    location.reload(); // Reload to apply changes
                } catch (error) {
                    alert('Error: Invalid file format.');
                }
            };

            reader.readAsText(file);
        }
    });
});

// Load the saved swimming class on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedClass = localStorage.getItem('swimmingClass');
    const swimmingClassSelect = document.getElementById('swimmingClassSelect');

    if (savedClass) {
        swimmingClassSelect.value = savedClass;
    }
});

// Save the selected swimming class to localStorage
document.getElementById('saveSwimmingClassButton').addEventListener('click', () => {
    const swimmingClassSelect = document.getElementById('swimmingClassSelect');
    const selectedClass = swimmingClassSelect.value;

    if (selectedClass) {
        localStorage.setItem('swimmingClass', selectedClass);
        alert(`Swimming class updated to ${selectedClass}`);
    } else {
        alert('Please select a class before saving.');
    }
});

// Get the swimming class on Thursday
const swimmingClass = localStorage.getItem('swimmingClass');

// Example usage in a tally or rendering function
if (swimmingClass) {
    console.log(`On Thursday, ${swimmingClass} goes swimming.`);
    document.getElementById('swimmingClass').innerHTML =swimmingClass;
}

document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("darkModeToggle");
    const body = document.body;
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".nav-links");

    // Check for saved preference
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
        body.classList.add("dark-mode");
        navbar.classList.add("dark-mode");
        navLinks.forEach(link => link.classList.add("dark-mode"));
        toggle.checked = true;
    }

    // Toggle dark mode
    toggle.addEventListener("change", function () {
        body.classList.toggle("dark-mode");
        navbar.classList.toggle("dark-mode");
        navLinks.forEach(link => link.classList.toggle("dark-mode"));
        localStorage.setItem("darkMode", toggle.checked);
    });
});


