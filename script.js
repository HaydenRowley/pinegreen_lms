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
    
        students.forEach((student, index) => {
            const row = weekOneTable.insertRow();
            row.insertCell(0).textContent = student.name;
    
            // Add textarea fields for each day
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday'].forEach(day => {
                const cell = row.insertCell();
                const textarea = document.createElement('textarea');
                textarea.value = student[day] || ''; // Set the current value or default to empty
                textarea.dataset.day = day;
                textarea.dataset.index = index;
    
                // Style the textarea
                textarea.rows = 3; // Set the visible number of rows
                textarea.style.width = '100%'; // Stretch to fit the cell
                textarea.style.resize = 'none'; // Allow vertical resizing only
                textarea.style.padding = '5px';
                textarea.style.boxSizing = 'border-box'; // Prevent overflow
                textarea.style.fontFamily = 'Arial, sans-serif';
                textarea.style.fontSize = '14px';
    
                // Save changes to localStorage on input
                textarea.addEventListener('input', (event) => {
                    const day = event.target.dataset.day;
                    const studentIndex = event.target.dataset.index;
                    students[studentIndex][day] = event.target.value;
                    localStorage.setItem('students', JSON.stringify(students)); // Save updated data
                });
    
                cell.appendChild(textarea);
            });
    
            // Add delete button
            const actionCell = row.insertCell();
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => {
                students.splice(index, 1); // Remove the student
                localStorage.setItem('students', JSON.stringify(students));
                renderWeekOne(); // Re-render the table
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

