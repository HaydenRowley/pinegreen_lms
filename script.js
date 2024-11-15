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
        dataTable.innerHTML = ''; // Clear the table first

        // Calculate total pages
        const totalPages = Math.ceil(students.length / rowsPerPage);

        // Ensure current page is within bounds
        if (currentPage >= totalPages) {
            currentPage = totalPages - 1;
        }
        if (currentPage < 0) {
            currentPage = 0;
        }

        // Calculate the start and end indices for the current page
        const startIndex = currentPage * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, students.length);

        // Loop through students on the current page
        for (let i = startIndex; i < endIndex; i++) {
            const student = students[i];
            const row = dataTable.insertRow();
            row.insertCell(0).textContent = student.name;
            row.insertCell(1).textContent = student.lunchDetails;

            // Create a cell for the Edit and Delete buttons
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

            actionCell.appendChild(editButton);
            actionCell.appendChild(deleteButton);
            editButton.style.marginRight = '5px';
        }

        // Update pagination controls and page identifier
        const pageIdentifier = document.getElementById('pageIdentifier');
        pageIdentifier.textContent = `Page ${currentPage + 1} of ${totalPages}`;

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
});


// Add event listener for the search functionality (auto-complete)
const searchInput = document.getElementById('searchInput');
const resetSearch = document.getElementById('resetSearch');

searchInput.addEventListener('input', function () {
    const query = searchInput.value.toLowerCase().trim();
    filterTable(query);
});

resetSearch.addEventListener('click', function () {
    searchInput.value = ''; // Clear the search input
    filterTable(''); // Reset the table to show all students
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



document.addEventListener('DOMContentLoaded', () => {
    const { jsPDF } = window.jspdf;

    // After loading students from localStorage, update the home page
    if (localStorage.getItem('students')) {
        students = JSON.parse(localStorage.getItem('students'));
        updateTable();

        // Update the total number of students
        document.getElementById('totalStudents').textContent = `Total Students: ${students.length}`;

        // Assuming you have a week variable set somewhere
        const currentWeek = getCurrentWeek(); // replace with your actual method to get the week
        document.getElementById('currentWeek').textContent = `Week: ${currentWeek}`;
    }

});
