// public/js/script.js

const apiUrl = 'http://localhost:3000';

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = 'students.html'; // Redirect to students page
        } else {
            document.getElementById('loginError').innerText = data.message;
        }
    } catch (error) {
        console.error('Login error:', error);
    }
});

document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const email = document.getElementById('email').value;
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${apiUrl}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ name, age, email }),
        });

        if (response.ok) {
            loadStudents(); // Refresh the student list
        }
    } catch (error) {
        console.error('Error adding student:', error);
    }
});

async function loadStudents() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/students`, {
        headers: { 'Authorization': token },
    });
    const students = await response.json();
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '';

    students.forEach(student => {
        const li = document.createElement('li');
        li.innerText = `${student.name} - ${student.age} - ${student.email}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Delete';
        deleteBtn.onclick = async () => {
            await fetch(`${apiUrl}/students/${student._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token },
            });
            loadStudents(); // Refresh the list
        };
        
        li.appendChild(deleteBtn);
        studentList.appendChild(li);
    });
}

// Load students on page load
if (document.getElementById('studentList')) {
    loadStudents();
}

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html'; // Redirect to login page
});
