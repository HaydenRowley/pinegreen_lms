document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;

    

    const lunchForm = document.getElementById('lunchForm');
    const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const generateLabelsButton = document.getElementById('generateLabels');

    let students = [];
    let currentPage = 0; // Track the current page
    const rowsPerPage = 5; // Max rows per page

    // Load students from localStorage if available
    if (localStorage.getItem('students')) {
        students = JSON.parse(localStorage.getItem('students'));
        console.log('Loaded students:', students);
        // Update the total number of students
        document.getElementById('totalPupils').textContent = `${students.length}`;
        updateTable();
    }

    // Function to add or update student in the list
    lunchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const lunchDetails = document.getElementById('lunchDetails').value;

        // If we're editing, update the student
        const editingIndex = lunchForm.dataset.editingIndex;
        if (editingIndex !== undefined) {
            students[editingIndex] = { name, lunchDetails };
            delete lunchForm.dataset.editingIndex; // Remove editing flag
        } else {
            // Otherwise, add a new student
            students.push({ name, lunchDetails });
        }

        localStorage.setItem('students', JSON.stringify(students)); // Save to localStorage
        updateTable();

        // Clear form
        lunchForm.reset();
    });

    // Function to update table (for the current page)
    function updateTable() {
        dataTable.innerHTML = ''; // Clear existing rows
        const totalPages = Math.ceil(students.length / rowsPerPage);
        const startIndex = currentPage * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, students.length);
    
        for (let i = startIndex; i < endIndex; i++) {
            const student = students[i];
            const row = dataTable.insertRow();
            row.insertCell(0).textContent = student.name;
            row.insertCell(1).textContent = student.lunchDetails;
        
            const actionCell = row.insertCell(2);
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => {
                document.getElementById('name').value = student.name;
                document.getElementById('lunchDetails').value = student.lunchDetails;
                lunchForm.dataset.editingIndex = i;
            };
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => {
                students.splice(i, 1);
                localStorage.setItem('students', JSON.stringify(students));
                updateTable();
            };
        
            // Append the buttons with space between them
            actionCell.appendChild(editButton);
            actionCell.appendChild(document.createTextNode(' ')); // This adds a space between buttons
            actionCell.appendChild(deleteButton);
        }
        
    
        document.getElementById('pageIdentifier').textContent = `Page ${currentPage + 1} of ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 0;
        document.getElementById('nextPage').disabled = currentPage >= totalPages - 1;
    }
    

    // Function to change page (Next or Previous)
    function changePage(direction) {
        currentPage += direction;
        updateTable();
    }

    // Add event listener for Next/Previous buttons
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));

    // Function to generate label sheet with customized style
    generateLabelsButton.addEventListener('click', function () {
        const pdf = new jsPDF('p', 'mm', 'a4');
    
        const labelWidth = 63.5; // Label width in mm (Avery L7160)
        const labelHeight = 38.1; // Label height in mm (Avery L7160)
        const labelsPerRow = 3;  // 3 columns
        const labelsPerColumn = 7; // 7 rows
        const maxLabelsPerPage = labelsPerRow * labelsPerColumn; // Total labels per page
    
        const margin = 9; // Margin around the page
        const xStart = 9;  // Starting x position (horizontal)
        const yStart = 9;  // Starting y position (vertical)
        
        let x = xStart;  // Current x position
        let y = yStart;  // Current y position
        let labelCount = 0; // Track how many labels have been added
    
        students.forEach((student, i) => {
            // Draw the border for each label (optional)
            pdf.setDrawColor(200, 200, 200);
            pdf.rect(x, y, labelWidth, labelHeight);
    
            // Set custom text colors based on lunch details
            let textColor;
            if (student.lunchDetails.toLowerCase().includes('bus 1')) {
                textColor = [128, 0, 128]; // Purple
            } else if (student.lunchDetails.toLowerCase().includes('bus 2')) {
                textColor = [255, 0, 0]; // Red
            } else {
                textColor = [0, 128, 0]; // Green
            }
    
            pdf.setTextColor(...textColor);
    
            // Center the name in the label
            pdf.setFontSize(14);
            const nameWidth = pdf.getTextWidth(student.name);
            const nameX = x + (labelWidth / 2) - (nameWidth / 2);
            pdf.text(student.name, nameX, y + 16);
    
            // Center the lunch details in the label
            pdf.setFontSize(12);
            const details = student.lunchDetails.split('\n');
            details.forEach((line, index) => {
                const lineWidth = pdf.getTextWidth(line);
                const lineX = x + (labelWidth / 2) - (lineWidth / 2);
                pdf.text(line, lineX, y + 24 + (index * 6));
            });
    
            // Move to the next label's position
            x += labelWidth;
            labelCount++;
    
            // After filling 3 columns, reset x and move down to the next row
            if (labelCount % labelsPerRow === 0) {
                x = xStart; // Reset to the first column
                y += labelHeight;
            }
    
            // If we've filled the current page, add a new page
            if (labelCount % maxLabelsPerPage === 0 && labelCount < students.length) {
                pdf.addPage();
                x = xStart;
                y = yStart;
            }
        });
    
        // Save the PDF file
        pdf.save('lunch_labels.pdf');
    });
    

    // Menu functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.container');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const target = event.target.dataset.target;
            sections.forEach(section => section.style.display = 'none');
            document.getElementById(target).style.display = 'block';
        });
    });

    document.getElementById('home').style.display = 'block';

    const menuIcon = document.getElementById('menu-icon');
    const navbar = document.querySelector('.navbar');

    menuIcon.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    const weekOneSection = document.getElementById('weekOne');
    const weekOneTable = document.getElementById('weekOneTable').getElementsByTagName('tbody')[0];
    const addWeekOneButton = document.getElementById('addWeekOne');

    function renderWeekOne() {
        weekOneTable.innerHTML = ''; // Clear previous rows
    
        // Retrieve the menu for Week One from localStorage
        const menus = JSON.parse(localStorage.getItem('menus')) || {};
        const weekOneMenu = menus['week1'] || {}; // Menu for Week One
    
        students.forEach((student, index) => {
            const row = weekOneTable.insertRow();
            row.insertCell(0).textContent = student.name;
    
            // Add dropdowns for each day
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
                const cell = row.insertCell();
                const dayMenu = weekOneMenu[day] || { mains: [], desserts: [] };
                

    
                // Create a container for the dropdowns
                const dropdownContainer = document.createElement('div');
                dropdownContainer.className = 'dropdown-container'; // Attach class for styling
    
                // Main dishes dropdown
                const mainSelect = document.createElement('select');
                mainSelect.dataset.day = day;
                mainSelect.dataset.index = index;
                mainSelect.dataset.type = 'main';
                mainSelect.style.width = '60%';
    
                // Add placeholder and options for main dishes
                mainSelect.innerHTML = `<option value="">Select Main...</option>`;
                dayMenu.mains.forEach(dish => {
                    const opt = document.createElement('option');
                    opt.value = dish;
                    opt.textContent = dish;
                    mainSelect.appendChild(opt);
                });
    
                mainSelect.value = student[`${day}_main`] || ''; // Set selected value
    
                mainSelect.addEventListener('change', (event) => {
                    const studentIndex = event.target.dataset.index;
                    const day = event.target.dataset.day;
                    students[studentIndex][`${day}_main`] = event.target.value;
                    localStorage.setItem('students', JSON.stringify(students));
                });
    
                // Desserts dropdown
                const dessertSelect = document.createElement('select');
                dessertSelect.dataset.day = day;
                dessertSelect.dataset.index = index;
                dessertSelect.dataset.type = 'dessert';
                dessertSelect.style.width = '40%';
    
                // Add placeholder and options for desserts
                dessertSelect.innerHTML = `<option value="">Select Dessert...</option>`;
                dayMenu.desserts.forEach(dessert => {
                    const opt = document.createElement('option');
                    opt.value = dessert;
                    opt.textContent = dessert;
                    dessertSelect.appendChild(opt);
                });
    
                dessertSelect.value = student[`${day}_dessert`] || ''; // Set selected value
    
                dessertSelect.addEventListener('change', (event) => {
                    const studentIndex = event.target.dataset.index;
                    const day = event.target.dataset.day;
                    students[studentIndex][`${day}_dessert`] = event.target.value;
                    localStorage.setItem('students', JSON.stringify(students));
                });
    
                // Append dropdowns to the container
                dropdownContainer.appendChild(mainSelect);
                dropdownContainer.appendChild(dessertSelect);
    
                cell.appendChild(dropdownContainer);
            });
    
            // Add delete button
            const actionCell = row.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => {
                students.splice(index, 1); // Remove the student
                localStorage.setItem('students', JSON.stringify(students));
                renderWeekOne(); // Re-render the table
                updateLiveTally();
            };
            actionCell.appendChild(deleteButton);

            setupDropdownListeners(); // Attach event listeners
            updateLiveTally(); // Initialize the tally
        });
    }
    
    
    

    function handleLunchEdit(event) {
        const index = event.target.dataset.index;
        const day = event.target.dataset.day;
        students[index][day] = event.target.value;
        localStorage.setItem('students', JSON.stringify(students));
    }

    

    // Navigation to Week One
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const target = event.target.dataset.target;
            sections.forEach(section => section.style.display = 'none');
            document.getElementById(target).style.display = 'block';

            if (target === 'weekOne') {
                renderWeekOne();
            }
        });
    });

    function renderProfiles() {
        const profilesContainer = document.getElementById('profilesContainer');
        profilesContainer.innerHTML = ''; // Clear previous content
    
        students.forEach((student, index) => {
            // Create a profile box for each pupil
            const profileBox = document.createElement('div');
            profileBox.className = 'profile-box';
            profileBox.innerHTML = `
                <h3>${student.name}</h3>
                <button class="view-choices" data-index="${index}">View Dinner Choices</button>
            `;
            profilesContainer.appendChild(profileBox);
        });
    
        // Add event listeners to "View Dinner Choices" buttons
        document.querySelectorAll('.view-choices').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                showDinnerChoices(index);
            });
        });
    }
    
    function showDinnerChoices(index) {
        const student = students[index];
        alert(`Dinner choices for ${student.name}:\n\n${JSON.stringify(student, null, 2)}`);
    }
    
});

// Function to filter the table based on the search query
function filterTable(query) {
    const tableRows = dataTable.getElementsByTagName('tr');

    // Loop through all rows and hide those that don't match the query
    for (let row of tableRows) {
        const nameCell = row.cells[0]; // Assuming name is in the first column
        const lunchDetailsCell = row.cells[1]; // Assuming lunch details in the second column

        const name = nameCell.textContent.toLowerCase();
        const lunchDetails = lunchDetailsCell.textContent.toLowerCase();

        if (name.includes(query) || lunchDetails.includes(query)) {
            row.style.display = ''; // Show matching row
        } else {
            row.style.display = 'none'; // Hide non-matching row
        }
    }
}

function getCurrentWeek() {
    // Set the reset date for Week 1 (18th November 2023)
    const resetDate = new Date('2023-11-18');
    const today = new Date();

    // If today is before the reset date, calculate the week before reset
    if (today < resetDate) {
        // Find the difference between today and resetDate in days
        const daysUntilReset = Math.floor((resetDate - today) / (1000 * 60 * 60 * 24));
        
        // Determine the current week in reverse (Week 3, Week 2, Week 1)
        const weeksBeforeReset = 3 - (Math.floor(daysUntilReset / 7) % 3);
        return `Week: ${weeksBeforeReset}`;
    } else {
        // Calculate the difference in days after the reset date
        const daysSinceReset = Math.floor((today - resetDate) / (1000 * 60 * 60 * 24));
        
        // Calculate the current week in the 3-week rotation after reset date
        const currentWeek = ((Math.floor(daysSinceReset / 7) % 3) + 1);
        return `Week: ${currentWeek}`;
    }
}

// Display the current week under the element with id 'currentWeek'
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('currentWeek').textContent = getCurrentWeek();
});

document.addEventListener('DOMContentLoaded', () => {
    const savedStudents = JSON.parse(localStorage.getItem('students')) || [];
    students = savedStudents;
    updateTable();
});

// Profile Pages
document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.getElementById('profileContainer');
    const popup = document.getElementById('popup');
    const popupName = document.getElementById('popupName');
    const popupDetails = document.getElementById('popupDetails');
    const closePopup = document.getElementById('closePopup');

    // Render pupil profiles
    function renderProfiles() {
        profileContainer.innerHTML = ''; // Clear previous profiles

        students.forEach((student, index) => {
            // Create a profile box
            const profileBox = document.createElement('div');
            profileBox.className = 'profile-box';
            profileBox.textContent = student.name;

            // Add click event to show popup
            profileBox.addEventListener('click', () => {
                popupName.textContent = student.name;
                popupDetails.textContent = `Lunch Details: ${student.lunchDetails}`;
                popup.style.display = 'block';
            });

            profileContainer.appendChild(profileBox);
        });
    }

    // Close the popup
    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Show profiles when navigating to the profile page
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const target = event.target.dataset.target;

            if (target === 'profilePage') {
                renderProfiles();
            }
        });
    });
});

function saveMenu(week) {
    const menu = {};

    // Days of the week to iterate over
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
        const mainsInput = document.getElementById(`${week}${day}Mains`);
        const dessertsInput = document.getElementById(`${week}${day}Desserts`);

        if (mainsInput && dessertsInput) {
            const mains = mainsInput.value.split(',').map(main => main.trim());
            const desserts = dessertsInput.value.split(',').map(dessert => dessert.trim());

            menu[day] = { mains, desserts };
        }
    });

    // Retrieve existing menu data from localStorage
    const menus = JSON.parse(localStorage.getItem('menus')) || {};
    menus[week] = menu; // Update or add the week's menu

    // Save back to localStorage
    localStorage.setItem('menus', JSON.stringify(menus));

    alert(`${week} menu saved successfully!`);
}

function loadMenus() {
    const menus = JSON.parse(localStorage.getItem('menus')) || {};

    ['week1', 'week2', 'week3'].forEach(week => {
        const weekMenu = menus[week];
        if (weekMenu) {
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
                const mainsInput = document.getElementById(`${week}${day}Mains`);
                const dessertsInput = document.getElementById(`${week}${day}Desserts`);

                if (mainsInput && dessertsInput && weekMenu[day]) {
                    mainsInput.value = weekMenu[day].mains.join(', ');
                    dessertsInput.value = weekMenu[day].desserts.join(', ');
                }
            });
        }
    });
}

// Load menus when the page loads
document.addEventListener('DOMContentLoaded', loadMenus);
document.addEventListener('DOMContentLoaded', updateLiveTally);
const students = JSON.parse(localStorage.getItem('students')) || []; // Initialize students array

// Tally container at the top of the page
const tallyContainer = document.getElementById('tallyContainer');

// Function to calculate and update the tally
function updateLiveTally() {
    const menus = JSON.parse(localStorage.getItem('menus')) || {};
    const weekMenu = menus.week1 || {};

    const tally = {};

    // Initialize tally object with menu items for each day
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
        const dayMenu = weekMenu[day] || {};
        tally[day] = {
            mains: {},
            desserts: {}
        };

        // Initialize tally counts to 0
        dayMenu.mains.forEach(main => {
            tally[day].mains[main] = 0;
        });
        dayMenu.desserts.forEach(dessert => {
            tally[day].desserts[dessert] = 0;
        });
    });

    // Count selections
    students.forEach(student => {
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
            const mainChoice = student[`${day}_main`];
            const dessertChoice = student[`${day}_dessert`];

            if (mainChoice && tally[day].mains[mainChoice] !== undefined) {
                tally[day].mains[mainChoice]++;
            }
            if (dessertChoice && tally[day].desserts[dessertChoice] !== undefined) {
                tally[day].desserts[dessertChoice]++;
            }
        });
    });

    // Generate the tally table dynamically
    const tallyContainer = document.getElementById('tallyContainer');
    tallyContainer.innerHTML = ''; // Clear previous content

    Object.keys(tally).forEach(day => {
        const dayTally = tally[day];

        // Create a section for each day
        const daySection = document.createElement('div');
        daySection.className = 'day-tally';

        const dayHeading = document.createElement('h3');
        dayHeading.textContent = day;
        daySection.appendChild(dayHeading);

        // Add mains tally
        const mainsSection = document.createElement('div');
        mainsSection.className = 'tally-section';
        const mainsHeading = document.createElement('h4');
        mainsHeading.textContent = 'Mains:';
        mainsSection.appendChild(mainsHeading);
        const mainsList = document.createElement('ul');
        mainsList.className = 'tally-list';
        Object.keys(dayTally.mains).forEach(main => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${main} <span>${dayTally.mains[main]}</span>`;
            mainsList.appendChild(listItem);
        });
        mainsSection.appendChild(mainsList);
        daySection.appendChild(mainsSection);

        // Add desserts tally
        const dessertsSection = document.createElement('div');
        dessertsSection.className = 'tally-section';
        const dessertsHeading = document.createElement('h4');
        dessertsHeading.textContent = 'Desserts:';
        dessertsSection.appendChild(dessertsHeading);
        const dessertsList = document.createElement('ul');
        dessertsList.className = 'tally-list';
        Object.keys(dayTally.desserts).forEach(dessert => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${dessert} <span>${dayTally.desserts[dessert]}</span>`;
            dessertsList.appendChild(listItem);
        });
        dessertsSection.appendChild(dessertsList);
        daySection.appendChild(dessertsSection);

        // Append day's section to the container
        tallyContainer.appendChild(daySection);
    });
}



function setupDropdownListeners() {
    const dropdowns = document.querySelectorAll('select');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', event => {
            const { index, day, type } = event.target.dataset; // Read data attributes
            const value = event.target.value; // Get the selected value

            if (students[index]) {
                students[index][`${day}_${type}`] = value; // Update the student data
                localStorage.setItem('students', JSON.stringify(students)); // Save updated data
            }

            // Update the live tally
            updateLiveTally();
        });
    });
}


document.getElementById('printTallyButton').addEventListener('click', () => {
    const menus = JSON.parse(localStorage.getItem('menus')) || {};
    const weekMenu = menus.week1 || {};
    const tally = {};

    // Initialize tally
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
        tally[day] = { mains: {}, desserts: {} };
        const dayMenu = weekMenu[day] || {};
        dayMenu.mains.forEach(main => (tally[day].mains[main] = 0));
        dayMenu.desserts.forEach(dessert => (tally[day].desserts[dessert] = 0));
    });

    // Count choices
    students.forEach(student => {
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
            const mainChoice = student[`${day}Main`];
            const dessertChoice = student[`${day}Dessert`];

            if (mainChoice && tally[day].mains[mainChoice] !== undefined) {
                tally[day].mains[mainChoice]++;
            }
            if (dessertChoice && tally[day].desserts[dessertChoice] !== undefined) {
                tally[day].desserts[dessertChoice]++;
            }
        });
    });

    // Create printable table
    const printableContent = document.createElement('div');
    printableContent.style.fontFamily = 'Arial, sans-serif';
    printableContent.style.borderCollapse = 'collapse';
    printableContent.style.width = '100%';

    const headerRow = document.createElement('div');
    headerRow.style.backgroundColor = '#ffd700'; // Gold background
    headerRow.style.fontWeight = 'bold';
    headerRow.style.textAlign = 'center';
    headerRow.style.padding = '10px';
    headerRow.style.marginBottom = '10px';
    headerRow.textContent = 'WEEK 1';
    printableContent.appendChild(headerRow);

    ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
        const dayContainer = document.createElement('div');
        dayContainer.style.border = '1px solid #000';
        dayContainer.style.marginBottom = '10px';
        dayContainer.style.padding = '10px';

        // Add day name
        const dayHeader = document.createElement('h3');
        dayHeader.textContent = day.toUpperCase();
        dayHeader.style.textAlign = 'center';
        dayHeader.style.backgroundColor = '#ffd700';
        dayHeader.style.margin = '0';
        dayHeader.style.padding = '5px';
        dayContainer.appendChild(dayHeader);

        // Mains
        const mainsTitle = document.createElement('strong');
        mainsTitle.textContent = 'Mains:';
        dayContainer.appendChild(mainsTitle);

        const mainsList = document.createElement('ul');
        Object.keys(tally[day].mains).forEach(main => {
            const listItem = document.createElement('li');
            listItem.textContent = `${main}: ${tally[day].mains[main]}`;
            mainsList.appendChild(listItem);
        });
        dayContainer.appendChild(mainsList);

        // Desserts
        const dessertsTitle = document.createElement('strong');
        dessertsTitle.textContent = 'Desserts:';
        dayContainer.appendChild(dessertsTitle);

        const dessertsList = document.createElement('ul');
        Object.keys(tally[day].desserts).forEach(dessert => {
            const listItem = document.createElement('li');
            listItem.textContent = `${dessert}: ${tally[day].desserts[dessert]}`;
            dessertsList.appendChild(listItem);
        });
        dayContainer.appendChild(dessertsList);

        printableContent.appendChild(dayContainer);
    });

    // Open new window for printing
    const newWindow = window.open('', '_blank');
    newWindow.document.write('<html><head><title>Print Tally</title></head><body>');
    newWindow.document.write(printableContent.outerHTML);
    newWindow.document.write('</body></html>');
    newWindow.document.close();
    newWindow.print();
});
