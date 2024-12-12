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
                mainSelect.style.width = '80%';
    
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
                dessertSelect.style.width = '80%';
    
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
            } else if (target == 'weekTwo') {
                renderWeekTwoTable();
            } else if (target == 'weekThree') {
                renderWeekThreeTable();
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
    const popupClassSelect = document.getElementById('popupClassSelect');
    const saveClassButton = document.getElementById('saveClassButton');
    const closePopup = document.getElementById('closePopup');

    // Load students from local storage
    let students = JSON.parse(localStorage.getItem("students"));

    // Render pupil profiles
    function renderProfiles() {
        profileContainer.innerHTML = ''; // Clear previous profiles

        students.forEach((student, index) => {
            // Create a profile box
            const profileBox = document.createElement('div');
            profileBox.className = 'profile-box';
            profileBox.textContent = `${student.name} (${student.class})`;

            // Add click event to show popup
            profileBox.addEventListener('click', () => {
                popupName.textContent = student.name;
                popupDetails.textContent = `Lunch Details: ${student.lunchDetails}`;
                popupClassSelect.value = student.class || ""; // Set the class dropdown value
                popup.dataset.index = index; // Store the index of the clicked student
                popup.style.display = 'block';
            });

            profileContainer.appendChild(profileBox);
        });
    }

    // Save class to the selected student
    saveClassButton.addEventListener('click', () => {
        const index = popup.dataset.index;
        const selectedClass = popupClassSelect.value;

        if (index !== undefined) {
            students[index].class = selectedClass; // Update the class in student data
            localStorage.setItem("students", JSON.stringify(students)); // Save to local storage
            //alert(`Class updated for ${students[index].name} to ${selectedClass}`);
            renderProfiles();
        }
        popup.style.display = 'none';
    });

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
                students = JSON.parse(localStorage.getItem("students")); // Reload students in case of updates
                renderProfiles();
            }
        });
    });

    // Render profiles initially
    renderProfiles();
});

function saveMenu(week) {
    const menu = {};

    // Days of the week to iterate over
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
        const mainsInput = document.getElementById(`${week}${day}_mains`);
        const dessertsInput = document.getElementById(`${week}${day}_desserts`);

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
document.addEventListener('DOMContentLoaded', updateLiveTally2);
document.addEventListener('DOMContentLoaded', updateLiveTally3);
const students = JSON.parse(localStorage.getItem('students')) || []; // Initialize students array

// Tally container at the top of the page
const tallyContainer = document.getElementById('tallyContainer');

// Function to calculate and update the tally
function updateLiveTally() {
    const menus = JSON.parse(localStorage.getItem('menus')) || {};
    const weekMenu = menus.week1 || {};
    const students = JSON.parse(localStorage.getItem('students')) || [];
    const swimmingClass = localStorage.getItem('swimmingClass') || 'Class A';

    const tally = calculateTally(weekMenu, students, swimmingClass);

    // Update the live tally display using the returned tally
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

        // Handle Thursday separately for swimming and non-swimming
        if (day === 'Thursday') {
            // Swimming Class
            const swimmingSection = document.createElement('div');
            swimmingSection.className = 'tally-section';
            const swimmingHeading = document.createElement('h4');
            swimmingHeading.textContent = 'Swimming Class:';
            swimmingSection.appendChild(swimmingHeading);
            const swimmingMainsList = document.createElement('ul');
            swimmingMainsList.className = 'tally-list';
            Object.keys(dayTally.swimming.mains).forEach(main => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${main} <span>${dayTally.swimming.mains[main]}</span>`;
                swimmingMainsList.appendChild(listItem);
            });
            swimmingSection.appendChild(swimmingMainsList);

            const swimmingDessertsList = document.createElement('ul');
            swimmingDessertsList.className = 'tally-list';
            Object.keys(dayTally.swimming.desserts).forEach(dessert => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${dessert} <span>${dayTally.swimming.desserts[dessert]}</span>`;
                swimmingDessertsList.appendChild(listItem);
            });
            swimmingSection.appendChild(swimmingDessertsList);
            daySection.appendChild(swimmingSection);

            // Non-Swimming Class
            const nonSwimmingSection = document.createElement('div');
            nonSwimmingSection.className = 'tally-section';
            const nonSwimmingHeading = document.createElement('h4');
            nonSwimmingHeading.textContent = 'Non-Swimming Class:';
            nonSwimmingSection.appendChild(nonSwimmingHeading);
            const nonSwimmingMainsList = document.createElement('ul');
            nonSwimmingMainsList.className = 'tally-list';
            Object.keys(dayTally.nonSwimming.mains).forEach(main => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${main} <span>${dayTally.nonSwimming.mains[main]}</span>`;
                nonSwimmingMainsList.appendChild(listItem);
            });
            nonSwimmingSection.appendChild(nonSwimmingMainsList);

            const nonSwimmingDessertsList = document.createElement('ul');
            nonSwimmingDessertsList.className = 'tally-list';
            Object.keys(dayTally.nonSwimming.desserts).forEach(dessert => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${dessert} <span>${dayTally.nonSwimming.desserts[dessert]}</span>`;
                nonSwimmingDessertsList.appendChild(listItem);
            });
            nonSwimmingSection.appendChild(nonSwimmingDessertsList);
            daySection.appendChild(nonSwimmingSection);
        } else {
            // General Mains
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

            // General Desserts
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
        }

        // Append day's section to the container
        tallyContainer.appendChild(daySection);
    });
}



function updateLiveTally2(){
    const menus = JSON.parse(localStorage.getItem('menus')) || {};
    const weekMenu = menus.week2 || {};
    const weekTwoStudents = JSON.parse(localStorage.getItem('week2_students')) || [];

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
    weekTwoStudents.forEach(student => {
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
    const tallyContainer = document.getElementById('tallyContainerWeekTwo');
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

function calculateTally(weekMenu, students, swimmingClass) {
    const tally = {};

    // Initialize tally object with menu items for each day
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
        const dayMenu = weekMenu[day] || {};
        tally[day] = {
            mains: {},
            desserts: {},
            swimming: { mains: {}, desserts: {} },
            nonSwimming: { mains: {}, desserts: {} }
        };

        // Initialize tally counts
        if (dayMenu.mains) {
            dayMenu.mains.forEach(main => {
                tally[day].mains[main] = 0;
                tally[day].swimming.mains[main] = 0;
                tally[day].nonSwimming.mains[main] = 0;
            });
        }
        if (dayMenu.desserts) {
            dayMenu.desserts.forEach(dessert => {
                tally[day].desserts[dessert] = 0;
                tally[day].swimming.desserts[dessert] = 0;
                tally[day].nonSwimming.desserts[dessert] = 0;
            });
        }
    });

    // Count selections
    students.forEach(student => {
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
            const mainChoice = student[`${day}_main`];
            const dessertChoice = student[`${day}_dessert`];

            // Handle swimming class on Thursday
            if (day === 'Thursday') {
                if (student.class === swimmingClass) {
                    if (mainChoice && tally[day].swimming.mains[mainChoice] !== undefined) {
                        tally[day].swimming.mains[mainChoice]++;
                    }
                    if (dessertChoice && tally[day].swimming.desserts[dessertChoice] !== undefined) {
                        tally[day].swimming.desserts[dessertChoice]++;
                    }
                } else {
                    if (mainChoice && tally[day].nonSwimming.mains[mainChoice] !== undefined) {
                        tally[day].nonSwimming.mains[mainChoice]++;
                    }
                    if (dessertChoice && tally[day].nonSwimming.desserts[dessertChoice] !== undefined) {
                        tally[day].nonSwimming.desserts[dessertChoice]++;
                    }
                }
            } else {
                if (mainChoice && tally[day].mains[mainChoice] !== undefined) {
                    tally[day].mains[mainChoice]++;
                }
                if (dessertChoice && tally[day].desserts[dessertChoice] !== undefined) {
                    tally[day].desserts[dessertChoice]++;
                }
            }
        });
    });

    return tally;
}


document.getElementById('printTallyButtonWeekTwo').addEventListener('click', () => {
    // Retrieve stored data for Week 2
    const menus = JSON.parse(localStorage.getItem('menus')) || {};
    const weekMenu = menus.week2 || {}; // Get week 2 menu
    const students = JSON.parse(localStorage.getItem('week2_students')) || []; // Get week 2 students
    const swimmingClass = localStorage.getItem('swimmingClass') || 'Class A';

    // Calculate tally using the shared function
    const tally = calculateTally(weekMenu, students, swimmingClass);

    // Log the tally data to check its structure
    console.log(tally);

    // Create printable content for Week 2
    const printableContent = `
        <style>
            @page {
                size: A3;
                margin: 1cm;
                @top-center {
                    content: "Tally for Week 2 - Lunches and Desserts";
                    font-size: 16px;
                    color: #1d3557;
                    font-weight: bold;
                    padding: 5px;
                }
            }
            body {
                font-family: Arial, sans-serif;
                line-height: 1.2;
                margin: 0;
                padding: 0;
                color: #333;
            }
            header {
                text-align: center;
                margin: 20px 0;
            }
            header h1 {
                font-size: 2em;
                color: #457b9d;
                margin: 0;
            }
            h2 {
                font-size: 1.5em;
                color: #457b9d;
                margin: 10px 0;
            }
            h3 {
                font-size: 1.2em;
                color: #1d3557;
                margin: 8px 0;
            }
            h4 {
                font-size: 1em;
                color: #457b9d;
                margin: 6px 0;
            }
            ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
                font-size: 0.9em;
            }
            li {
                margin: 2px 0;
                padding: 4px;
                border-bottom: 1px solid #e63946;
            }
            .day-section {
                margin-bottom: 20px;
                padding: 10px;
                border: 1px solid #457b9d;
                border-radius: 5px;
                background: #f1faee;
            }
            .swimming-section {
                padding: 10px;
                border: 1px dashed #457b9d;
                background: #e9f5f5;
            }
            .column-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: space-between;
            }
            .column {
                flex: 1;
                min-width: calc(50% - 10px);
            }
        </style>
        <header>
            <h1>Primary Lunches - Week 2</h1>
        </header>
        <div class="column-container">
            ${Object.keys(tally).map(day => {
                const dayTally = tally[day];

                // Ensure mains and desserts exist for each category
                const generalMains = dayTally.mains || {};
                const generalDesserts = dayTally.desserts || {};

                const swimmingMains = dayTally.swimming && dayTally.swimming.mains ? dayTally.swimming.mains : {};
                const swimmingDesserts = dayTally.swimming && dayTally.swimming.desserts ? dayTally.swimming.desserts : {};

                const nonSwimmingMains = dayTally.nonSwimming && dayTally.nonSwimming.mains ? dayTally.nonSwimming.mains : {};
                const nonSwimmingDesserts = dayTally.nonSwimming && dayTally.nonSwimming.desserts ? dayTally.nonSwimming.desserts : {};

                if (day === 'Thursday') {
                    // Special layout for Thursday (with Swimming and Non-Swimming Classes)
                    return ` 
                        <div class="column">
                            <div class="day-section">
                                <h2>${day}</h2>
                                <div class="swimming-section">
                                    <h3>Swimming Class - 12:00 Eat</h3>
                                    <h4>Mains</h4>
                                    <ul>
                                        ${Object.keys(swimmingMains).length > 0 ? 
                                          Object.keys(swimmingMains).map(main => `
                                            <li>${main}: ${swimmingMains[main]}</li>
                                          `).join('') : 
                                          '<li>No mains available</li>'
                                        }
                                    </ul>
                                    <h4>Desserts</h4>
                                    <ul>
                                        ${Object.keys(swimmingDesserts).length > 0 ? 
                                          Object.keys(swimmingDesserts).map(dessert => `
                                            <li>${dessert}: ${swimmingDesserts[dessert]}</li>
                                          `).join('') : 
                                          '<li>No desserts available</li>'
                                        }
                                    </ul>
                                    <h3>Rest of Primary - Normal Time</h3>
                                    <h4>Mains</h4>
                                    <ul>
                                        ${Object.keys(nonSwimmingMains).length > 0 ? 
                                          Object.keys(nonSwimmingMains).map(main => `
                                            <li>${main}: ${nonSwimmingMains[main]}</li>
                                          `).join('') : 
                                          '<li>No mains available</li>'
                                        }
                                    </ul>
                                    <h4>Desserts</h4>
                                    <ul>
                                        ${Object.keys(nonSwimmingDesserts).length > 0 ? 
                                          Object.keys(nonSwimmingDesserts).map(dessert => `
                                            <li>${dessert}: ${nonSwimmingDesserts[dessert]}</li>
                                          `).join('') : 
                                          '<li>No desserts available</li>'
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Default layout for other days
                    return ` 
                        <div class="column">
                            <div class="day-section">
                                <h2>${day}</h2>
                                <h3>Mains</h3>
                                <ul>
                                    ${Object.keys(generalMains).length > 0 ? 
                                      Object.keys(generalMains).map(main => `
                                        <li>${main}: ${generalMains[main]}</li>
                                      `).join('') : 
                                      '<li>No mains available</li>'
                                    }
                                </ul>
                                <h3>Desserts</h3>
                                <ul>
                                    ${Object.keys(generalDesserts).length > 0 ? 
                                      Object.keys(generalDesserts).map(dessert => `
                                        <li>${dessert}: ${generalDesserts[dessert]}</li>
                                      `).join('') : 
                                      '<li>No desserts available</li>'
                                    }
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;

    // Open the print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.body.innerHTML = printableContent;
        printWindow.document.close();
        printWindow.print();
    } else {
        alert('Unable to open print window.');
    }
});




document.getElementById('printTallyButtonWeekOne').addEventListener('click', () => {
    // Retrieve stored data for Week 1
    const menus = JSON.parse(localStorage.getItem('menus')) || {};
    const weekMenu = menus.week1 || {}; // Get week 1 menu
    const students = JSON.parse(localStorage.getItem('week1_students')) || []; // Get week 1 students
    const swimmingClass = localStorage.getItem('swimmingClass') || 'Class A';

    // Calculate tally using the shared function
    const tally = calculateTally(weekMenu, students, swimmingClass);

    // Log the tally data to check its structure
    console.log(tally);

    // Create printable content for Week 1
    const printableContent = `
        <style>
            @page {
                size: A3;
                margin: 1cm;
                @top-center {
                    content: "Tally for Week 1 - Lunches and Desserts";
                    font-size: 16px;
                    color: #1d3557;
                    font-weight: bold;
                    padding: 5px;
                }
            }
            body {
                font-family: Arial, sans-serif;
                line-height: 1.2;
                margin: 0;
                padding: 0;
                color: #333;
            }
            header {
                text-align: center;
                margin: 20px 0;
            }
            header h1 {
                font-size: 2em;
                color: #457b9d;
                margin: 0;
            }
            h2 {
                font-size: 1.5em;
                color: #457b9d;
                margin: 10px 0;
            }
            h3 {
                font-size: 1.2em;
                color: #1d3557;
                margin: 8px 0;
            }
            h4 {
                font-size: 1em;
                color: #457b9d;
                margin: 6px 0;
            }
            ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
                font-size: 0.9em;
            }
            li {
                margin: 2px 0;
                padding: 4px;
                border-bottom: 1px solid #e63946;
            }
            .day-section {
                margin-bottom: 20px;
                padding: 10px;
                border: 1px solid #457b9d;
                border-radius: 5px;
                background: #f1faee;
            }
            .swimming-section {
                padding: 10px;
                border: 1px dashed #457b9d;
                background: #e9f5f5;
            }
            .column-container {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: space-between;
            }
            .column {
                flex: 1;
                min-width: calc(50% - 10px);
            }
        </style>
        <header>
            <h1>Primary Lunches - Week 1</h1>
        </header>
        <div class="column-container">
            ${Object.keys(tally).map(day => {
                const dayTally = tally[day];

                // Ensure mains and desserts exist for each category
                const generalMains = dayTally.mains || {};
                const generalDesserts = dayTally.desserts || {};

                const swimmingMains = dayTally.swimming && dayTally.swimming.mains ? dayTally.swimming.mains : {};
                const swimmingDesserts = dayTally.swimming && dayTally.swimming.desserts ? dayTally.swimming.desserts : {};

                const nonSwimmingMains = dayTally.nonSwimming && dayTally.nonSwimming.mains ? dayTally.nonSwimming.mains : {};
                const nonSwimmingDesserts = dayTally.nonSwimming && dayTally.nonSwimming.desserts ? dayTally.nonSwimming.desserts : {};

                if (day === 'Thursday') {
                    // Special layout for Thursday (with Swimming and Non-Swimming Classes)
                    return ` 
                        <div class="column">
                            <div class="day-section">
                                <h2>${day}</h2>
                                <div class="swimming-section">
                                    <h3>Swimming Class - 12:00 Eat</h3>
                                    <h4>Mains</h4>
                                    <ul>
                                        ${Object.keys(swimmingMains).length > 0 ? 
                                          Object.keys(swimmingMains).map(main => `
                                            <li>${main}: ${swimmingMains[main]}</li>
                                          `).join('') : 
                                          '<li>No mains available</li>'
                                        }
                                    </ul>
                                    <h4>Desserts</h4>
                                    <ul>
                                        ${Object.keys(swimmingDesserts).length > 0 ? 
                                          Object.keys(swimmingDesserts).map(dessert => `
                                            <li>${dessert}: ${swimmingDesserts[dessert]}</li>
                                          `).join('') : 
                                          '<li>No desserts available</li>'
                                        }
                                    </ul>
                                    <h3>Rest of Primary - Normal Time</h3>
                                    <h4>Mains</h4>
                                    <ul>
                                        ${Object.keys(nonSwimmingMains).length > 0 ? 
                                          Object.keys(nonSwimmingMains).map(main => `
                                            <li>${main}: ${nonSwimmingMains[main]}</li>
                                          `).join('') : 
                                          '<li>No mains available</li>'
                                        }
                                    </ul>
                                    <h4>Desserts</h4>
                                    <ul>
                                        ${Object.keys(nonSwimmingDesserts).length > 0 ? 
                                          Object.keys(nonSwimmingDesserts).map(dessert => `
                                            <li>${dessert}: ${nonSwimmingDesserts[dessert]}</li>
                                          `).join('') : 
                                          '<li>No desserts available</li>'
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // Default layout for other days
                    return ` 
                        <div class="column">
                            <div class="day-section">
                                <h2>${day}</h2>
                                <h3>Mains</h3>
                                <ul>
                                    ${Object.keys(generalMains).length > 0 ? 
                                      Object.keys(generalMains).map(main => `
                                        <li>${main}: ${generalMains[main]}</li>
                                      `).join('') : 
                                      '<li>No mains available</li>'
                                    }
                                </ul>
                                <h3>Desserts</h3>
                                <ul>
                                    ${Object.keys(generalDesserts).length > 0 ? 
                                      Object.keys(generalDesserts).map(dessert => `
                                        <li>${dessert}: ${generalDesserts[dessert]}</li>
                                      `).join('') : 
                                      '<li>No desserts available</li>'
                                    }
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }).join('')}
        </div>
    `;

    // Open the print dialog
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.body.innerHTML = printableContent;
        printWindow.document.close();
        printWindow.print();
    } else {
        alert('Unable to open print window.');
    }
});



    const weekTwoSection = document.getElementById('weekTwo');
    const weekTwoTable = document.getElementById('weekTwoTable').getElementsByTagName('tbody')[0];
    const addWeekTwoButton = document.getElementById('addWeekTwo');

    function renderWeekTwoTable() {
        weekTwoTable.innerHTML = '';
    
        // Retrieve menus and students from local storage
        const menus = JSON.parse(localStorage.getItem('menus')) || {};
        const weekTwoMenu = menus['week2'] || {};
        const weekTwoStudents = JSON.parse(localStorage.getItem('week2_students')) || students; // Use week2_students key
    
        weekTwoStudents.forEach((student, index) => {
            const row = weekTwoTable.insertRow();
            row.insertCell(0).textContent = student.name;
    
            // Dropdowns for each day
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
                const cell = row.insertCell();
                const dayMenu = weekTwoMenu[day] || { mains: [], desserts: [] };
    
                const dropdownContainer = document.createElement('div');
                dropdownContainer.className = 'dropdown-container';
    
                // Main dishes dropdown
                const mainSelect = document.createElement('select');
                mainSelect.dataset.day = day;
                mainSelect.dataset.index = index;
                mainSelect.dataset.type = 'main';
                mainSelect.style.width = '80%';
    
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
                    weekTwoStudents[studentIndex][`${day}_main`] = event.target.value;
                    localStorage.setItem('week2_students', JSON.stringify(weekTwoStudents)); // Save week 2 data
                    updateLiveTally2();
                });
    
                // Desserts dropdown
                const dessertSelect = document.createElement('select');
                dessertSelect.dataset.day = day;
                dessertSelect.dataset.index = index;
                dessertSelect.dataset.type = 'dessert';
                dessertSelect.style.width = '80%';
    
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
                    weekTwoStudents[studentIndex][`${day}_dessert`] = event.target.value;
                    localStorage.setItem('week2_students', JSON.stringify(weekTwoStudents)); // Save week 2 data
                    updateLiveTally2();
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
                weekTwoStudents.splice(index, 1); // Remove the student
                localStorage.setItem('week2_students', JSON.stringify(weekTwoStudents)); // Save updated week 2 data
                renderWeekTwoTable(); // Re-render the table
                
            };
            actionCell.appendChild(deleteButton);
            
        });
    
        
    }    
    
    
    

    function handleLunchEdit(event) {
        const index = event.target.dataset.index;
        const day = event.target.dataset.day;
        students[index][day] = event.target.value;
        localStorage.setItem('students', JSON.stringify(students));
    }

    

    

    function initializeTally(weekMenu) {
        const tally = {};
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
            const dayMenu = weekMenu[day] || {};
            tally[day] = {
                mains: {},
                desserts: {},
                swimming: { mains: {}, desserts: {} },
                nonSwimming: { mains: {}, desserts: {} }
            };
    
            if (dayMenu.mains) {
                dayMenu.mains.forEach(main => {
                    tally[day].mains[main] = 0;
                    tally[day].swimming.mains[main] = 0;
                    tally[day].nonSwimming.mains[main] = 0;
                });
            }
    
            if (dayMenu.desserts) {
                dayMenu.desserts.forEach(dessert => {
                    tally[day].desserts[dessert] = 0;
                    tally[day].swimming.desserts[dessert] = 0;
                    tally[day].nonSwimming.desserts[dessert] = 0;
                });
            }
        });
        return tally;
    }
    
    const weekThreeSection = document.getElementById('weekThree');
    const weekThreeTable = document.getElementById('weekThreeTable').getElementsByTagName('tbody')[0];
    const addWeekThreeButton = document.getElementById('addWeekThree');
    
    // Render Week Three Table
    function renderWeekThreeTable() {
        weekThreeTable.innerHTML = '';
    
        // Retrieve menus and students from local storage
        const menus = JSON.parse(localStorage.getItem('menus')) || {};
        const weekThreeMenu = menus['week3'] || {};
        const weekThreeStudents = JSON.parse(localStorage.getItem('week3_students')) || students;
    
        weekThreeStudents.forEach((student, index) => {
            const row = weekThreeTable.insertRow();
            row.insertCell(0).textContent = student.name;
    
            // Dropdowns for each day
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
                const cell = row.insertCell();
                const dayMenu = weekThreeMenu[day] || { mains: [], desserts: [] };
    
                const dropdownContainer = document.createElement('div');
                dropdownContainer.className = 'dropdown-container';
    
                // Main dishes dropdown
                const mainSelect = document.createElement('select');
                mainSelect.dataset.day = day;
                mainSelect.dataset.index = index;
                mainSelect.dataset.type = 'main';
                mainSelect.style.width = '80%';
    
                mainSelect.innerHTML = `<option value="">Select Main...</option>`;
                dayMenu.mains.forEach(dish => {
                    const opt = document.createElement('option');
                    opt.value = dish;
                    opt.textContent = dish;
                    mainSelect.appendChild(opt);
                });
    
                mainSelect.value = student[`${day}_main`] || '';
                mainSelect.addEventListener('change', (event) => {
                    const studentIndex = event.target.dataset.index;
                    const day = event.target.dataset.day;
                    weekThreeStudents[studentIndex][`${day}_main`] = event.target.value;
                    localStorage.setItem('week3_students', JSON.stringify(weekThreeStudents));
                    updateLiveTally3();
                });
    
                // Desserts dropdown
                const dessertSelect = document.createElement('select');
                dessertSelect.dataset.day = day;
                dessertSelect.dataset.index = index;
                dessertSelect.dataset.type = 'dessert';
                dessertSelect.style.width = '80%';
    
                dessertSelect.innerHTML = `<option value="">Select Dessert...</option>`;
                dayMenu.desserts.forEach(dessert => {
                    const opt = document.createElement('option');
                    opt.value = dessert;
                    opt.textContent = dessert;
                    dessertSelect.appendChild(opt);
                });
    
                dessertSelect.value = student[`${day}_dessert`] || '';
                dessertSelect.addEventListener('change', (event) => {
                    const studentIndex = event.target.dataset.index;
                    const day = event.target.dataset.day;
                    weekThreeStudents[studentIndex][`${day}_dessert`] = event.target.value;
                    localStorage.setItem('week3_students', JSON.stringify(weekThreeStudents));
                    updateLiveTally3();
                });
    
                dropdownContainer.appendChild(mainSelect);
                dropdownContainer.appendChild(dessertSelect);
                cell.appendChild(dropdownContainer);
            });
    
            // Add delete button
            const actionCell = row.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => {
                weekThreeStudents.splice(index, 1);
                localStorage.setItem('week3_students', JSON.stringify(weekThreeStudents));
                renderWeekThreeTable();
                updateLiveTally3();
            };
            actionCell.appendChild(deleteButton);
        });
    }
    
    // Update Live Tally for Week 3
    function updateLiveTally3() {
        const menus = JSON.parse(localStorage.getItem('menus')) || {};
        const weekMenu = menus.week3 || {}; // Changed to week3
        const weekThreeStudents = JSON.parse(localStorage.getItem('week3_students')) || []; // Changed to week3_students
    
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
        weekThreeStudents.forEach(student => {
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
        const tallyContainer = document.getElementById('tallyContainerWeekThree'); // Make sure this container exists
        tallyContainer.innerHTML = ''; // Clear previous content
    
        Object.keys(tally).forEach(day => {
            const dayTally = tally[day];
    
            // Create a section for each day
            const daySection = document.createElement('div');
            daySection.className = 'day-tally'; // Same class as previous weeks for styling
    
            const dayHeading = document.createElement('h3');
            dayHeading.textContent = day;
            daySection.appendChild(dayHeading);
    
            // Add mains tally
            const mainsSection = document.createElement('div');
            mainsSection.className = 'tally-section'; // Same class as previous weeks for styling
            const mainsHeading = document.createElement('h4');
            mainsHeading.textContent = 'Mains:';
            mainsSection.appendChild(mainsHeading);
            const mainsList = document.createElement('ul');
            mainsList.className = 'tally-list'; // Same class as previous weeks for styling
            Object.keys(dayTally.mains).forEach(main => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `${main} <span>${dayTally.mains[main]}</span>`;
                mainsList.appendChild(listItem);
            });
            mainsSection.appendChild(mainsList);
            daySection.appendChild(mainsSection);
    
            // Add desserts tally
            const dessertsSection = document.createElement('div');
            dessertsSection.className = 'tally-section'; // Same class as previous weeks for styling
            const dessertsHeading = document.createElement('h4');
            dessertsHeading.textContent = 'Desserts:';
            dessertsSection.appendChild(dessertsHeading);
            const dessertsList = document.createElement('ul');
            dessertsList.className = 'tally-list'; // Same class as previous weeks for styling
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
    
    
    
    // Print Tally for Week 3
    document.getElementById('printTallyButtonWeekThree').addEventListener('click', () => {
        // Retrieve stored data for Week 3
        const menus = JSON.parse(localStorage.getItem('menus')) || {};
        const weekMenu = menus.week3 || {}; // Get week 3 menu
        const students = JSON.parse(localStorage.getItem('week3_students')) || []; // Get week 3 students
        const swimmingClass = localStorage.getItem('swimmingClass') || 'Class A';
    
        // Calculate tally using the shared function
        const tally = calculateTally(weekMenu, students, swimmingClass);
    
        // Log the tally data to check its structure
        console.log(tally);
    
        // Create printable content for Week 3
        const printableContent = `
            <style>
                @page {
                    size: A3;
                    margin: 1cm;
                    @top-center {
                        content: "Tally for Week 3 - Lunches and Desserts";
                        font-size: 16px;
                        color: #1d3557;
                        font-weight: bold;
                        padding: 5px;
                    }
                }
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.2;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                header {
                    text-align: center;
                    margin: 20px 0;
                }
                header h1 {
                    font-size: 2em;
                    color: #457b9d;
                    margin: 0;
                }
                h2 {
                    font-size: 1.5em;
                    color: #457b9d;
                    margin: 10px 0;
                }
                h3 {
                    font-size: 1.2em;
                    color: #1d3557;
                    margin: 8px 0;
                }
                h4 {
                    font-size: 1em;
                    color: #457b9d;
                    margin: 6px 0;
                }
                ul {
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                    font-size: 0.9em;
                }
                li {
                    margin: 2px 0;
                    padding: 4px;
                    border-bottom: 1px solid #e63946;
                }
                .day-section {
                    margin-bottom: 20px;
                    padding: 10px;
                    border: 1px solid #457b9d;
                    border-radius: 5px;
                    background: #f1faee;
                }
                .swimming-section {
                    padding: 10px;
                    border: 1px dashed #457b9d;
                    background: #e9f5f5;
                }
                .column-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    justify-content: space-between;
                }
                .column {
                    flex: 1;
                    min-width: calc(50% - 10px);
                }
            </style>
            <header>
                <h1>Primary Lunches Week 3</h1>
            </header>
            <div class="column-container">
                ${Object.keys(tally).map(day => {
                    const dayTally = tally[day];
    
                    // Ensure mains and desserts exist for each category
                    const generalMains = dayTally.mains || {};
                    const generalDesserts = dayTally.desserts || {};
    
                    const swimmingMains = dayTally.swimming && dayTally.swimming.mains ? dayTally.swimming.mains : {};
                    const swimmingDesserts = dayTally.swimming && dayTally.swimming.desserts ? dayTally.swimming.desserts : {};
    
                    const nonSwimmingMains = dayTally.nonSwimming && dayTally.nonSwimming.mains ? dayTally.nonSwimming.mains : {};
                    const nonSwimmingDesserts = dayTally.nonSwimming && dayTally.nonSwimming.desserts ? dayTally.nonSwimming.desserts : {};
    
                    if (day === 'Thursday') {
                        // Special layout for Thursday (with Swimming and Non-Swimming Classes)
                        return ` 
                            <div class="column">
                                <div class="day-section">
                                    <h2>${day}</h2>
                                    <div class="swimming-section">
                                        <h3>Swimming Class - 12:00 Eat</h3>
                                        <h4>Mains</h4>
                                        <ul>
                                            ${Object.keys(swimmingMains).length > 0 ? 
                                              Object.keys(swimmingMains).map(main => `
                                                <li>${main}: ${swimmingMains[main]}</li>
                                              `).join('') : 
                                              '<li>No mains available</li>'
                                            }
                                        </ul>
                                        <h4>Desserts</h4>
                                        <ul>
                                            ${Object.keys(swimmingDesserts).length > 0 ? 
                                              Object.keys(swimmingDesserts).map(dessert => `
                                                <li>${dessert}: ${swimmingDesserts[dessert]}</li>
                                              `).join('') : 
                                              '<li>No desserts available</li>'
                                            }
                                        </ul>
                                        <h3>Rest of Primary - Normal Time</h3>
                                        <h4>Mains</h4>
                                        <ul>
                                            ${Object.keys(nonSwimmingMains).length > 0 ? 
                                              Object.keys(nonSwimmingMains).map(main => `
                                                <li>${main}: ${nonSwimmingMains[main]}</li>
                                              `).join('') : 
                                              '<li>No mains available</li>'
                                            }
                                        </ul>
                                        <h4>Desserts</h4>
                                        <ul>
                                            ${Object.keys(nonSwimmingDesserts).length > 0 ? 
                                              Object.keys(nonSwimmingDesserts).map(dessert => `
                                                <li>${dessert}: ${nonSwimmingDesserts[dessert]}</li>
                                              `).join('') : 
                                              '<li>No desserts available</li>'
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        // Default layout for other days
                        return ` 
                            <div class="column">
                                <div class="day-section">
                                    <h2>${day}</h2>
                                    <h3>Mains</h3>
                                    <ul>
                                        ${Object.keys(generalMains).length > 0 ? 
                                          Object.keys(generalMains).map(main => `
                                            <li>${main}: ${generalMains[main]}</li>
                                          `).join('') : 
                                          '<li>No mains available</li>'
                                        }
                                    </ul>
                                    <h3>Desserts</h3>
                                    <ul>
                                        ${Object.keys(generalDesserts).length > 0 ? 
                                          Object.keys(generalDesserts).map(dessert => `
                                            <li>${dessert}: ${generalDesserts[dessert]}</li>
                                          `).join('') : 
                                          '<li>No desserts available</li>'
                                        }
                                    </ul>
                                </div>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        `;
    
        // Open the print dialog
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.body.innerHTML = printableContent;
            printWindow.document.close();
            printWindow.print();
        } else {
            alert('Unable to open print window.');
        }
    });
    
    
    
    // Navigation to Week One
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const target = event.target.dataset.target;
            sections.forEach(section => section.style.display = 'none');
            document.getElementById(target).style.display = 'block';

            if (target === 'weekOne') {
                renderWeekOne();
            } else if (target == 'weekTwo') {
                renderWeekTwoTable();
            }
        });
    });

    function printSlipsForDay(day, week) {
        // Determine the correct localStorage key based on the week
        const weekKey = week === 1 ? 'students' : `week${week}_students`;
        const students = JSON.parse(localStorage.getItem(weekKey)) || [];
        
        if (students.length === 0) {
            alert(`No student data found for Week ${week}.`);
            return;
        }
    
        // Open a new printable window
        const printableWindow = window.open('', '_blank');
        
        if (!printableWindow) {
            alert("Unable to open print window. Please check your popup blocker settings.");
            return;
        }
    
        // Write the HTML structure into the new window
        printableWindow.document.write('<html><head><title>Slips</title><style>');
        printableWindow.document.write(`
            body {
                font-family: Arial, sans-serif;
            }
            table {
                border-collapse: collapse;
                width: 100%;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }
            th {
                background-color: #f4f4f4;
            }
            .Lions td {
                color: green;
            }
            .Jaguars td {
                color: red;
            }
            .Panthers td {
                color: black;
            }
        `);
        printableWindow.document.write('</style></head><body>');
    
        // Create the table structure
        printableWindow.document.write(`<h2>Dinners for ${day} - Week ${week}</h2>`);
        printableWindow.document.write('<table>');
        printableWindow.document.write(`
            <tr>
                <th>Name</th>
                <th>Choice</th>
            </tr>
        `);
    
        // Populate the table with student data
        students.forEach(student => {
            const main = student[`${day}_main`] || "No main selected";
            const dessert = student[`${day}_dessert`] || "No dessert selected";
    
            printableWindow.document.write(`
                <tr class="${student.class}">
                    <td>${student.name}</td>
                    <td>${main}, ${dessert}</td>
                </tr>
            `);
        });
    
        // Close the table
        printableWindow.document.write('</table>');
    
        // Close the document and print
        printableWindow.document.write('</body></html>');
        printableWindow.document.close();
        printableWindow.print();
    }
    
    
    
    
    
    