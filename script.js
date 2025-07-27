document.addEventListener('DOMContentLoaded', function () {
  // Initialize views
  const views = {
    dashboard: document.getElementById('dashboard-view'),
    buses: document.getElementById('buses-view'),
    routes: document.getElementById('routes-view'),
    bookings: document.getElementById('bookings-view')
  };

  // Initialize menu items
  const menuItems = document.querySelectorAll('.sidebar li');

  // Set initial active view
  let currentView = 'dashboard';

  // Add click event listeners to menu items
  menuItems.forEach(item => {
    item.addEventListener('click', function () {
      const viewName = this.getAttribute('data-view');

      // Skip if already active
      if (viewName === currentView) return;

      // Update menu active state
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      // Hide current view and show new view
      views[currentView].classList.remove('active-view');
      views[viewName].classList.add('active-view');
      currentView = viewName;

      // Fetch data when switching to a view
      switch (viewName) {
        case 'dashboard':
          fetchDashboardData();
          break;
        case 'buses':
          fetchBusesData();
          break;
        case 'routes':
          fetchRoutesData();
          break;
        case 'bookings':
          fetchBookingsData();
          break;
      }
    });
  });

  // Fetch dashboard data
  function fetchDashboardData() {
    fetch('http://localhost:3000/dashboard/summary')
      .then(response => response.json())
      .then(data => {
        document.getElementById('totalBuses').textContent = data.totalBuses;
        document.getElementById('totalRoutes').textContent = data.totalRoutes;
        document.getElementById('totalBookings').textContent = data.totalBookings;
        document.getElementById('totalRevenue').textContent = `₹${data.totalRevenue.toLocaleString()}`;
      })
      .catch(err => console.error('Error fetching summary:', err));

    // Fetch buses data
    fetch('http://localhost:3000/buses')
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#busTable tbody');
        tbody.innerHTML = '';
        data.forEach(bus => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${bus.bus_number}</td>
            <td>${bus.capacity}</td>
            <td>${bus.driver || '-'}</td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => console.error('Error fetching buses:', err));

    // Fetch drivers data
    fetch('http://localhost:3000/drivers')
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#driverTable tbody');
        tbody.innerHTML = '';
        data.forEach(driver => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${driver.driver}</td>
            <td>${driver.assigned_bus || '—'}</td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => console.error('Error fetching drivers:', err));
  }

  // Fetch buses management data
  function fetchBusesData() {
    fetch('http://localhost:3000/buses/full')
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#buses-management-table tbody');
        tbody.innerHTML = '';
        data.forEach(bus => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${bus.bus_number}</td>
            <td>${bus.capacity}</td>
            <td>${bus.driver || '-'}</td>
            <td><span class="status ${bus.status}">${bus.status}</span></td>
            <td>
              <button class="action-btn edit"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete"><i class="fas fa-trash"></i></button>
            </td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => console.error('Error fetching buses data:', err));
  }

  // Fetch routes data
  function fetchRoutesData() {
    fetch('http://localhost:3000/routes')
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#routes-management-table tbody');
        tbody.innerHTML = '';
        data.forEach(route => {
          const duration = `${route.hours}h ${route.minutes}m`;
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>R${route.route_id.toString().padStart(3, '0')}</td>
            <td>${route.origin}</td>
            <td>${route.destination}</td>
            <td>${route.distance_km}</td>
            <td>${duration}</td>
            <td>
              <button class="action-btn edit"><i class="fas fa-edit"></i></button>
              <button class="action-btn delete"><i class="fas fa-trash"></i></button>
            </td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => console.error('Error fetching routes data:', err));
  }

  // Fetch bookings data
  function fetchBookingsData() {
    fetch('http://localhost:3000/bookings')
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#bookings-management-table tbody');
        tbody.innerHTML = '';
        data.forEach(booking => {
          const formattedDate = new Date(booking.booking_date).toLocaleDateString();
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>B${booking.booking_id.toString().padStart(3, '0')}</td>
            <td>${booking.passenger_name}</td>
            <td>${booking.bus_number}</td>
            <td>${booking.route}</td>
            <td>${formattedDate}</td>
            <td>₹${booking.amount}</td>
            <td><span class="status ${booking.status}">${booking.status}</span></td>
            <td>
              <button class="action-btn view"><i class="fas fa-eye"></i></button>
              <button class="action-btn cancel"><i class="fas fa-times"></i></button>
            </td>
          `;
          tbody.appendChild(row);
        });
      })
      .catch(err => console.error('Error fetching bookings data:', err));
  }

  // Add event listener for the "Add Bus" button
  document.querySelector('.add-button').addEventListener('click', function () {
    alert('Add Bus functionality would go here');
  });
  
  // Profile dropdown functionality
  const profileInfo = document.querySelector('.profile-info');
  profileInfo.addEventListener('click', function () {
    alert('Profile menu would open here');
  });

  // Initialize dashboard data
  fetchDashboardData();
});