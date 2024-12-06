// Retrieve announcements from localStorage
function getAnnouncements() {
    return JSON.parse(localStorage.getItem('announcements')) || [];
}

// Save announcements to localStorage
function saveAnnouncements(announcements) {
    localStorage.setItem('announcements', JSON.stringify(announcements));
}

// Render the list of announcements
function renderAnnouncements() {
    const announcementList = document.getElementById('announcementList');
    const announcements = getAnnouncements();

    announcementList.innerHTML = ''; // Clear the list

    announcements.forEach((announcement, index) => {
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '10px';

        const textSpan = document.createElement('span');
        textSpan.textContent = announcement;
        textSpan.style.marginRight = '10px';

        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.style.marginRight = '5px';
        editButton.onclick = () => {
            const newAnnouncement = prompt('Edit announcement:', announcement);
            if (newAnnouncement !== null) {
                announcements[index] = newAnnouncement;
                saveAnnouncements(announcements);
                renderAnnouncements();
                updateHomeScreenAnnouncements();
            }
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
            announcements.splice(index, 1);
            saveAnnouncements(announcements);
            renderAnnouncements();
            updateHomeScreenAnnouncements();
        };

        listItem.appendChild(textSpan);
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
        announcements.push(newAnnouncement);
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

function updateHomeScreenAnnouncements() {
    const homeAnnouncementList = document.getElementById('homeAnnouncementList');
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];

    homeAnnouncementList.innerHTML = ''; // Clear previous announcements

    announcements.forEach(announcement => {
        const listItem = document.createElement('li');
        listItem.textContent = announcement;
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
