document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const apiFilter = document.getElementById('apiFilter');
    const dateFilter = document.getElementById('dateFilter');
    const noRecords = document.getElementById('noRecords');
    const activityTable = document.getElementById('activityTable');
    const paginationContainer = document.getElementById('pagination');
    const recordsPerPage = 15;
    const exportCSVButton = document.getElementById('exportCSV');
    const exportExcelButton = document.getElementById('exportExcel');
    
    // Initialize variables
    let filters = {};
    let totalPages = 1;
    let currentPage = 1;

    // Get the logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
        alert('User is not logged in.');
        window.location.href = 'login.html'; // Redirect to login page
        return;
    }

    // Fetch activities based on current page and filters
    async function fetchActivities(page = 1, filters = {}) {
        try {
            const { api, date } = filters;
            const queryParams = new URLSearchParams({
                user_id: user.id,
                api: api || '',
                date: date || '',
                page: page,
            });

            const response = await fetch(`https://braincloud.cmsa.digital/srphp/fetchActivities.php?${queryParams}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (data.success) {
                totalPages = data.pagination.total_pages;
                currentPage = page; // Update the current page after the filter
                renderActivities(data.activities);
                renderPagination(data.pagination);
            } else {
                handleNoRecords();
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            handleNoRecords();
        }
    }

    // Render activities in the table
    function renderActivities(activities) {
        const tableBody = document.getElementById('activityTableBody');
        tableBody.innerHTML = '';

        if (activities.length === 0) {
            handleNoRecords();
        } else {
            activityTable.style.display = 'table';
            noRecords.style.display = 'none';
            activities.forEach(activity => {
                const row = `<tr>
                    <td>${activity.activity_id}</td>
                    <td>${activity.api_name}</td>
                    <td>${activity.action_description}</td>
                    <td>${activity.formatted_date}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        }
    }

    // Render pagination buttons
    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        const { total_pages, current_page } = pagination;

        if (total_pages > 1) {
            for (let i = 1; i <= total_pages; i++) {
                const pageButton = document.createElement('button');
                pageButton.textContent = i;
                pageButton.className = i === current_page ? 'active' : '';
                pageButton.addEventListener('click', () => fetchActivities(i, filters));
                paginationContainer.appendChild(pageButton);
            }
        }
    }

    // Handle when there are no records to display
    function handleNoRecords() {
        activityTable.style.display = 'none';
        noRecords.style.display = 'block';
        paginationContainer.innerHTML = '';
    }

    // Event listener for applying filters
    document.getElementById('applyFilters').addEventListener('click', () => {
        filters = { api: apiFilter.value, date: dateFilter.value };
        fetchActivities(1, filters); // Fetch from page 1 after filter
    });

    // Event listener for clearing filters
    document.getElementById('clearFilters').addEventListener('click', () => {
        apiFilter.value = '';
        dateFilter.value = '';
        filters = {};
        fetchActivities(1, filters); // Fetch from page 1 after clearing filter
    });

    async function fetchExportActivities(format = 'csv') {
        try {
            const { api, date } = filters;
            const queryParams = new URLSearchParams({
                user_id: user.id,
                api: api || '',
                date: date || '',
                format: format
            });
        
            const response = await fetch(`https://braincloud.cmsa.digital/srphp/exportActivities.php?${queryParams}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });

            console.log('Export Response Status:', response.status);
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            // Log response text before converting it to a blob
            const responseText = await response.text();
            console.log('Response text:', responseText); // Check if the response has valid data
            
            // If the response is empty, exit early
            if (!responseText.trim()) {
                alert('No data to export.');
                return;
            }
    
            // Convert response to a blob
            const blob = new Blob([responseText], { type: 'text/csv' });
            console.log('Blob received:', blob);
    
            if (blob.size === 0) {
                console.error('Received empty blob, nothing to download');
                alert('No data to export.');
                return;
            }
    
            // Create an object URL for the blob
            const url = window.URL.createObjectURL(blob);
            console.log('Object URL created:', url);
    
            // Create a link element to download the file
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', format === 'csv' ? 'activities.csv' : 'activities.xlsx');
    
            // Programmatically click the link to trigger the download
            document.body.appendChild(link);
            link.click();
    
            // Clean up by removing the link element
            document.body.removeChild(link);
            
            // Revoke the object URL to free up resources
            window.URL.revokeObjectURL(url);
            console.log('Download initiated successfully.');
    
        } catch (error) {
            console.error('Error exporting activities:', error);
            alert('An error occurred while exporting activities. Please try again.');
        }
    }
    
    // Event listeners for exporting activities
    exportCSVButton.addEventListener('click', () => fetchExportActivities('csv'));
    exportExcelButton.addEventListener('click', () => fetchExportActivities('xlsx'));

    // Initial fetch of activities on page load
    fetchActivities();
});

// Navigation Toggle
const toggleNav = document.getElementById('toggle-nav');
const leftNav = document.getElementById('left-nav');
const logoutBtn = document.getElementById('logout-btn');

// Toggle navigation menu
toggleNav.addEventListener('click', () => {
    leftNav.classList.toggle('show');
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('user');
        alert('Logged out successfully.');
        window.location.href = 'login.html'; 
    }
  });

// Close navigation when clicking outside
document.addEventListener('click', (e) => {
    if (!leftNav.contains(e.target) && !toggleNav.contains(e.target)) {
        leftNav.classList.remove('show');
    }
});
