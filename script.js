document.addEventListener('DOMContentLoaded', function () {
  const API_BASE_URL = 'http://localhost:3000';

  // Initialize views
  const views = {
    dashboard: document.getElementById('dashboard-view'),
    buses: document.getElementById('buses-view'),
    routes: document.getElementById('routes-view'),
    bookings: document.getElementById('bookings-view')
  };

  // Initialize menu items
  const menuItems = document.querySelectorAll('.sidebar li');
  let currentView = 'dashboard';

  // --- Navigation Logic ---
  menuItems.forEach(item => {
    item.addEventListener('click', function () {
      const viewName = this.getAttribute('data-view');
      if (viewName === currentView) return;

      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');

      views[currentView].classList.remove('active-view');
      views[viewName].classList.add('active-view');
      currentView = viewName;

      // Fetch data for the newly activated view
      fetchDataForView(viewName);
    });
  });

  function fetchDataForView(viewName) {
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
  }

  // --- Modal Logic ---
  const modal = document.getElementById('add-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');
  const closeButton = document.querySelector('.modal .close-button');

  function openModal() {
    modal.style.display = 'block';
  }

  function closeModal() {
    modal.style.display = 'none';
    modalForm.innerHTML = ''; // Clear form content on close
  }

  closeButton.onclick = closeModal;
  window.onclick = function(event) {
    if (event.target == modal) {
      closeModal();
    }
  }
  
  // --- Notification Logic ---
  function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
  }

  // --- Form Population Helper ---
  async function populateSelect(selectId, url, valueField, textField) {
      try {
          const response = await fetch(`${API_BASE_URL}${url}`);
          const data = await response.json();
          const select = document.getElementById(selectId);
          select.innerHTML = '<option value="">-- Please Select --</option>'; // Default empty option
          data.forEach(item => {
              const option = document.createElement('option');
              option.value = item[valueField];
              option.textContent = item[textField];
              select.appendChild(option);
          });
      } catch (error) {
          console.error(`Error populating select ${selectId}:`, error);
          showNotification(`Failed to load data for form.`, 'error');
      }
  }

  // --- Data Fetching Functions ---
  function fetchDashboardData() {
    fetch(`${API_BASE_URL}/dashboard/summary`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('totalBuses').textContent = data.totalBuses;
        document.getElementById('totalRoutes').textContent = data.totalRoutes;
        document.getElementById('totalBookings').textContent = data.totalBookings;
        document.getElementById('totalRevenue').textContent = `₹${(data.totalRevenue || 0).toLocaleString()}`;
      })
      .catch(err => console.error('Error fetching summary:', err));

    fetch(`${API_BASE_URL}/buses`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#busTable tbody');
        tbody.innerHTML = '';
        data.forEach(bus => {
          tbody.innerHTML += `<tr><td>${bus.bus_number}</td><td>${bus.capacity}</td><td>${bus.driver || '-'}</td></tr>`;
        });
      })
      .catch(err => console.error('Error fetching buses:', err));

    fetch(`${API_BASE_URL}/drivers`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#driverTable tbody');
        tbody.innerHTML = '';
        data.forEach(driver => {
          tbody.innerHTML += `<tr><td>${driver.driver}</td><td>${driver.assigned_bus || '—'}</td></tr>`;
        });
      })
      .catch(err => console.error('Error fetching drivers:', err));
  }

  function fetchBusesData() {
    fetch(`${API_BASE_URL}/buses/full`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#buses-management-table tbody');
        tbody.innerHTML = '';
        data.forEach(bus => {
          tbody.innerHTML += `
            <tr>
              <td>${bus.bus_number}</td>
              <td>${bus.capacity}</td>
              <td>${bus.driver || '-'}</td>
              <td><span class="status ${bus.status}">${bus.status}</span></td>
              <td>
                <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`;
        });
      })
      .catch(err => console.error('Error fetching buses data:', err));
  }

  function fetchRoutesData() {
    fetch(`${API_BASE_URL}/routes`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#routes-management-table tbody');
        tbody.innerHTML = '';
        data.forEach(route => {
          const duration = `${route.hours}h ${route.minutes}m`;
          tbody.innerHTML += `
            <tr>
              <td>R${route.route_id.toString().padStart(3, '0')}</td>
              <td>${route.origin}</td>
              <td>${route.destination}</td>
              <td>${route.distance_km}</td>
              <td>${duration}</td>
              <td>
                <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`;
        });
      })
      .catch(err => console.error('Error fetching routes data:', err));
  }

  function fetchBookingsData() {
    fetch(`${API_BASE_URL}/bookings`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#bookings-management-table tbody');
        tbody.innerHTML = '';
        data.forEach(booking => {
          const formattedDate = new Date(booking.booking_time).toLocaleDateString();
          tbody.innerHTML += `
            <tr>
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
            </tr>`;
        });
      })
      .catch(err => console.error('Error fetching bookings data:', err));
  }

  // --- "Add New" Button Event Listeners ---

  document.querySelector('#buses-view .add-button').addEventListener('click', () => {
    modalTitle.textContent = 'Add New Bus';
    modalForm.innerHTML = `
        <label for="bus_number">Bus Number:</label><input type="text" id="bus_number" name="bus_number" required>
        <label for="capacity">Capacity:</label><input type="number" id="capacity" name="capacity" required>
        <label for="driver_id">Driver:</label><select id="driver_id" name="driver_id"></select>
        <label for="bus_stop_id">Home Bus Stop:</label><select id="bus_stop_id" name="bus_stop_id"></select>
        <label for="status">Status:</label><select id="status" name="status"><option value="active">Active</option><option value="maintenance">Maintenance</option></select>
        <label for="bus_type">Bus Type:</label><select id="bus_type" name="bus_type"><option value="AC">AC</option><option value="Non-AC">Non-AC</option><option value="Sleeper">Sleeper</option><option value="Seater">Seater</option></select>
        <button type="submit">Add Bus</button>`;
    populateSelect('driver_id', '/drivers/list', 'id', 'name');
    populateSelect('bus_stop_id', '/bus_stops/list', 'id', 'name');
    openModal();
    modalForm.onsubmit = handleFormSubmit.bind(null, 'buses', fetchBusesData);
  });
  
  document.querySelector('#routes-view .add-button').addEventListener('click', () => {
    modalTitle.textContent = 'Add New Route';
    modalForm.innerHTML = `
      <label for="origin_bus_stop_id">Origin:</label><select id="origin_bus_stop_id" name="origin_bus_stop_id" required></select>
      <label for="destination_bus_stop_id">Destination:</label><select id="destination_bus_stop_id" name="destination_bus_stop_id" required></select>
      <label for="distance_km">Distance (km):</label><input type="number" step="0.1" id="distance_km" name="distance_km" required>
      <label for="duration_min">Duration (minutes):</label><input type="number" id="duration_min" name="duration_min" required>
      <label for="fare">Fare (₹):</label><input type="number" step="0.01" id="fare" name="fare" required>
      <button type="submit">Add Route</button>`;
    populateSelect('origin_bus_stop_id', '/bus_stops/list', 'id', 'name');
    populateSelect('destination_bus_stop_id', '/bus_stops/list', 'id', 'name');
    openModal();
    modalForm.onsubmit = handleFormSubmit.bind(null, 'routes', fetchRoutesData);
  });

  document.querySelector('#bookings-view .add-button').addEventListener('click', () => {
    modalTitle.textContent = 'Create New Booking';
    modalForm.innerHTML = `
        <label for="passenger_id">Passenger:</label><select id="passenger_id" name="passenger_id" required></select>
        <label for="bus_id">Bus:</label><select id="bus_id" name="bus_id" required></select>
        <label for="route_id">Route:</label><select id="route_id" name="route_id" required></select>
        <label for="seat_number">Seat Number:</label><input type="text" id="seat_number" name="seat_number" required>
        <label for="amount">Amount (₹):</label><input type="number" step="0.01" id="amount" name="amount" required>
        <label for="payment_method">Payment Method:</label><select id="payment_method" name="payment_method"><option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="netbanking">Netbanking</option></select>
        <label for="payment_status">Payment Status:</label><select id="payment_status" name="payment_status"><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option></select>
        <button type="submit">Create Booking</button>`;
    populateSelect('passenger_id', '/passengers/list', 'id', 'name');
    populateSelect('bus_id', '/buses/list', 'id', 'bus_number');
    populateSelect('route_id', '/routes/list', 'id', 'route_name');
    openModal();
    modalForm.onsubmit = handleFormSubmit.bind(null, 'bookings', fetchBookingsData);
  });

  // Generic form submission handler
  async function handleFormSubmit(endpoint, refreshFunction, e) {
      e.preventDefault();
      const formData = new FormData(modalForm);
      const data = Object.fromEntries(formData.entries());
      
      try {
          const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
          });
          const result = await response.json();
          if (!response.ok) {
              throw new Error(result.error || `Failed to add item to ${endpoint}`);
          }
          
          showNotification(result.message, 'success');
          closeModal();
          refreshFunction(); // Refresh the table
          fetchDashboardData(); // Also refresh dashboard stats
      } catch (error) {
          console.error(`Error adding to ${endpoint}:`, error);
          showNotification(error.message, 'error');
      }
  }

  // Initialize dashboard data on first load
  fetchDashboardData();
});
