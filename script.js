
let students = [
    { id: 1, name: "Ankita", email: "ankita@gmail.com", marks: 85 },
    { id: 2, name: "Priya", email: "priya@gmail.com", marks: 72 },
    { id: 3, name: "Rahul", email: "rahul@gmail.com", marks: 42 },
    { id: 4, name: "Sneha", email: "sneha@gmail.com", marks: 91 }
];

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");
const filterStatus = document.getElementById("filterStatus");
const message = document.getElementById("message");

// Display students and update dashboard
function displayStudents() {
    const searchText = searchInput.value.toLowerCase();
    const status = filterStatus.value;

    // Array filtering and searching
    const filteredStudents = students.filter(function(student) {
        const matchesSearch =
            student.name.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText);

        const matchesStatus =
            status === "all" ||
            (status === "pass" && student.marks >= 50) ||
            (status === "fail" && student.marks < 50);

        return matchesSearch && matchesStatus;
    });

    studentTable.innerHTML = "";

    filteredStudents.forEach(function(student) {
        const row = document.createElement("tr");
        const result = student.marks >= 50 ? "Pass" : "Fail";
        const statusClass = student.marks >= 50 ? "pass" : "fail";

        // Safely display user-provided text
        [student.name, student.email].forEach(function(value, index) {
            const cell = document.createElement("td");
            cell.textContent = value;
            if (index === 0) {
                cell.style.fontWeight = "bold";
            }
            row.appendChild(cell);
        });

        const marksCell = document.createElement("td");
        marksCell.textContent = student.marks + "/100";
        row.appendChild(marksCell);

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");
        statusBadge.className = "status " + statusClass;
        statusBadge.textContent = result;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.dataset.id = student.id;
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        studentTable.appendChild(row);
    });

    document.getElementById("emptyMessage").textContent =
        filteredStudents.length === 0
            ? "No students found!"
            : "";

    updateDashboard();
}

// Update statistics
function updateDashboard() {
    const passed = students.filter(function(student) {
        return student.marks >= 50;
    });

    const totalMarks = students.reduce(function(sum, student) {
        return sum + student.marks;
    }, 0);

    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("passedStudents").textContent =
        passed.length;

    const average = students.length
        ? (totalMarks / students.length).toFixed(1)
        : "0";

    document.getElementById("averageMarks").textContent = average;
}

// Form submission event
studentForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const marks = Number(document.getElementById("studentMarks").value);

    if (!name || !email || marks < 0 || marks > 100) {
        message.style.color = "red";
        message.textContent = "Please enter valid student details.";
        return;
    }

    const emailExists = students.some(function(student) {
        return student.email.toLowerCase() === email.toLowerCase();
    });

    if (emailExists) {
        message.style.color = "red";
        message.textContent = "This email already exists!";
        return;
    }

    const newStudent = {
        id: Date.now(),
        name: name,
        email: email,
        marks: marks
    };

    students.push(newStudent);

    studentForm.reset();
    searchInput.value = "";
    filterStatus.value = "all";

    displayStudents();

    message.style.color = "green";
    message.textContent = "Student added successfully!";
});

// Search event
searchInput.addEventListener("input", displayStudents);

// Filter event
filterStatus.addEventListener("change", displayStudents);

// Button click event: Delete student
studentTable.addEventListener("click", function(event) {
    if (event.target.classList.contains("delete-btn")) {
        const studentId = Number(event.target.dataset.id);

        students = students.filter(function(student) {
            return student.id !== studentId;
        });

        displayStudents();
        message.textContent = "Student deleted successfully!";
    }
});

// Asynchronous API operation
async function loadApiData() {
    const apiMessage = document.getElementById("apiMessage");
    const apiButton = document.getElementById("loadApiBtn");

    apiButton.disabled = true;
    apiMessage.textContent = "Loading data from API...";

    try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        // Convert API response into student records
        const apiStudents = data.map(function(user, index) {
            return {
                id: 1000 + user.id,
                name: user.name,
                email: user.email,
                marks: 40 + ((index * 7 + 15) % 61)
            };
        });

        // Avoid duplicate API records on repeated clicks
        students = students.filter(function(student) {
            return student.id < 1000;
        });

        students.push(...apiStudents);

        searchInput.value = "";
        filterStatus.value = "all";

        displayStudents();
        apiMessage.textContent =
            apiStudents.length + " records loaded successfully!";

    } catch (error) {
        apiMessage.textContent =
            "Unable to load API data. Check your internet and try again.";
        console.error(error);

    } finally {
        apiButton.disabled = false;
    }
}

document.getElementById("loadApiBtn").addEventListener(
    "click",
    loadApiData
);

// Initial display
displayStudents();
