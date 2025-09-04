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
  window.onclick = function (event) {
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

  function showConfirmation(message) {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'confirm-dialog';
      container.innerHTML = `
            <div class="confirm-content">
                <p>${message}</p>
                <div class="confirm-buttons">
                    <button class="confirm-yes">Yes</button>
                    <button class="confirm-no">No</button>
                </div>
            </div>`;
      const style = document.createElement('style');
      style.innerHTML = `
            .confirm-dialog { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.2s; }
            .confirm-content { background: white; padding: 25px 35px; border-radius: 8px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.3); animation: slideIn 0.2s; }
            .confirm-content p { margin: 0 0 20px; font-size: 1.1em; }
            .confirm-buttons button { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 0 10px; font-weight: bold; transition: transform 0.1s; }
            .confirm-buttons button:hover { transform: scale(1.05); }
            .confirm-yes { background-color: #d63323; color: white; }
            .confirm-no { background-color: #ccc; }`;
      document.head.appendChild(style);
      document.body.appendChild(container);

      const cleanup = () => {
        document.body.removeChild(container);
        document.head.removeChild(style);
      };
      container.querySelector('.confirm-yes').onclick = () => { cleanup(); resolve(true); };
      container.querySelector('.confirm-no').onclick = () => { cleanup(); resolve(false); };
    });
  }

  function fetchBusesData() {
    fetch(`${API_BASE_URL}/buses/full`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#buses-management-table tbody');
        tbody.innerHTML = data.map(bus => `
                <tr data-id="${bus.id}"> <td>${bus.bus_number}</td>
                    <td>${bus.capacity}</td>
                    <td>${bus.driver || '-'}</td>
                    <td><span class="status ${bus.status}">${bus.status}</span></td>
                    <td>
                        <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`).join('');
      })
      .catch(err => console.error('Error fetching buses data:', err));
  }

  function fetchRoutesData() {
    fetch(`${API_BASE_URL}/routes`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#routes-management-table tbody');
        tbody.innerHTML = data.map(route => `
                <tr data-id="${route.route_id}"> <td>R${route.route_id.toString().padStart(3, '0')}</td>
                    <td>${route.origin}</td>
                    <td>${route.destination}</td>
                    <td>${route.distance_km}</td>
                    <td>${route.hours}h ${route.minutes}m</td>
                    <td>
                        <button class="action-btn edit"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`).join('');
      })
      .catch(err => console.error('Error fetching routes data:', err));
  }

  function fetchBookingsData() {
    fetch(`${API_BASE_URL}/bookings`)
      .then(response => response.json())
      .then(data => {
        const tbody = document.querySelector('#bookings-management-table tbody');
        tbody.innerHTML = data.map(booking => `
                <tr data-id="${booking.booking_id}"> <td>B${booking.booking_id.toString().padStart(3, '0')}</td>
                    <td>${booking.passenger_name}</td>
                    <td>${booking.bus_number}</td>
                    <td>${booking.route}</td>
                    <td>${new Date(booking.booking_time).toLocaleDateString()}</td>
                    <td>₹${booking.amount}</td>
                    <td><span class="status ${booking.status}">${booking.status}</span></td>
                    <td>
                        <button class="action-btn view"><i class="fas fa-eye"></i></button>
                        <button class="action-btn cancel"><i class="fas fa-times"></i></button>
                    </td>
                </tr>`).join('');
      })
      .catch(err => console.error('Error fetching bookings data:', err));
  }

  document.addEventListener('click', async (e) => {
    const target = e.target.closest('.action-btn');
    if (!target) return;
    const id = target.closest('tr').dataset.id;
    const view = target.closest('.view').id;

    if (target.classList.contains('edit')) {
      if (view === 'buses-view') openBusModalForEdit(id);
      if (view === 'routes-view') openRouteModalForEdit(id);
    } else if (target.classList.contains('delete')) {
      if (view === 'buses-view' && await showConfirmation('Are you sure you want to delete this bus?')) deleteItem('buses', id, fetchBusesData);
      if (view === 'routes-view' && await showConfirmation('Are you sure you want to delete this route?')) deleteItem('routes', id, fetchRoutesData);
    } else if (target.classList.contains('cancel')) {
      if (await showConfirmation('Are you sure you want to cancel this booking?')) cancelBooking(id);
    }
  });

  // --- New Edit Functions ---
  async function openBusModalForEdit(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/buses/details/${id}`);
      if (!res.ok) throw new Error('Failed to fetch bus details.');
      const bus = await res.json();

      modalTitle.textContent = 'Edit Bus';
      modalForm.innerHTML = `
            <label for="bus_number">Bus Number:</label><input type="text" id="bus_number" name="bus_number" value="${bus.bus_number}" required>
            <label for="capacity">Capacity:</label><input type="number" id="capacity" name="capacity" value="${bus.capacity}" required>
            <label for="driver_id">Driver:</label><select id="driver_id" name="driver_id"></select>
            <label for="bus_stop_id">Home Bus Stop:</label><select id="bus_stop_id" name="bus_stop_id"></select>
            <label for="status">Status:</label><select id="status" name="status"></select>
            <label for="bus_type">Bus Type:</label><select id="bus_type" name="bus_type"></select>
            <button type="submit">Update Bus</button>`;

      await Promise.all([
        populateSelect('driver_id', '/drivers/list', 'id', 'name'),
        populateSelect('bus_stop_id', '/bus_stops/list', 'id', 'name')
      ]);

      document.getElementById('driver_id').value = bus.driver_id || '';
      document.getElementById('bus_stop_id').value = bus.bus_stop_id || '';
      document.getElementById('status').innerHTML = `<option value="active">Active</option><option value="maintenance">Maintenance</option>`;
      document.getElementById('status').value = bus.status;
      document.getElementById('bus_type').innerHTML = `<option value="AC">AC</option><option value="Non-AC">Non-AC</option><option value="Sleeper">Sleeper</option><option value="Seater">Seater</option>`;
      document.getElementById('bus_type').value = bus.bus_type;

      openModal();
      modalForm.onsubmit = handleFormUpdate.bind(null, 'buses', id, fetchBusesData);
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Error opening edit modal for bus:', err);
    }
  }

  async function openRouteModalForEdit(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/details/${id}`);
      if (!res.ok) throw new Error('Failed to fetch route details.');
      const route = await res.json();

      modalTitle.textContent = 'Edit Route';
      modalForm.innerHTML = `
            <label for="origin_bus_stop_id">Origin:</label><select id="origin_bus_stop_id" name="origin_bus_stop_id" required></select>
            <label for="destination_bus_stop_id">Destination:</label><select id="destination_bus_stop_id" name="destination_bus_stop_id" required></select>
            <label for="distance_km">Distance (km):</label><input type="number" step="0.1" id="distance_km" name="distance_km" value="${route.distance_km}" required>
            <label for="duration_min">Duration (minutes):</label><input type="number" id="duration_min" name="duration_min" value="${route.duration_min}" required>
            <label for="fare">Fare (₹):</label><input type="number" step="0.01" id="fare" name="fare" value="${route.fare}" required>
            <button type="submit">Update Route</button>`;

      await Promise.all([
        populateSelect('origin_bus_stop_id', '/bus_stops/list', 'id', 'name'),
        populateSelect('destination_bus_stop_id', '/bus_stops/list', 'id', 'name')
      ]);

      document.getElementById('origin_bus_stop_id').value = route.origin_bus_stop_id;
      document.getElementById('destination_bus_stop_id').value = route.destination_bus_stop_id;

      openModal();
      modalForm.onsubmit = handleFormUpdate.bind(null, 'routes', id, fetchRoutesData);
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Error opening edit modal for route:', err);
    }
  }

  // --- Generic Update Handler ---
  async function handleFormUpdate(endpoint, id, refreshFn, e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(modalForm).entries());

    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed to update ${endpoint}.`);

      showNotification(result.message, 'success');
      closeModal();
      refreshFn();
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
      console.error(`Error updating ${endpoint}:`, err);
    }
  }

  // --- Generic Delete Handler ---
  async function deleteItem(endpoint, id, refreshFn) {
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Failed to delete ${endpoint}.`);

      showNotification(result.message, 'success');
      refreshFn();
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
      console.error(`Error deleting ${endpoint}:`, err);
    }
  }
  // --- New Bus Deletion Function with Confirmation ---
  async function deleteBus(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/buses/${id}`, { method: 'DELETE' });
      const result = await res.json();

      if (res.status === 409) { // Conflict detected
        const userConfirmed = await showConfirmation(result.error + '. Do you want to delete it anyway?');
        if (userConfirmed) {
          const forceRes = await fetch(`${API_BASE_URL}/buses/${id}?force=true`, { method: 'DELETE' });
          const forceResult = await forceRes.json();
          if (!forceRes.ok) throw new Error(forceResult.error || 'Failed to force delete bus.');
          showNotification(forceResult.message, 'success');
        } else {
          return; // User cancelled
        }
      } else if (!res.ok) {
        throw new Error(result.error || 'Failed to delete bus.');
      } else {
        showNotification(result.message, 'success');
      }

      fetchBusesData();
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Error deleting bus:', err);
    }
  }

  // Update the main event listener to use the new function
  document.addEventListener('click', async (e) => {
    const target = e.target.closest('.action-btn');
    if (!target) return;
    const row = target.closest('tr');
    const id = row.dataset.id;
    const view = target.closest('.view').id;

    if (target.classList.contains('edit')) {
      if (view === 'buses-view') openBusModalForEdit(id);
      if (view === 'routes-view') openRouteModalForEdit(id);
    } else if (target.classList.contains('delete')) {
      if (view === 'buses-view') {
        await deleteBus(id);
      } else if (view === 'routes-view') {
        await deleteItem('routes', id, fetchRoutesData);
      }
    } else if (target.classList.contains('cancel')) {
      if (await showConfirmation('Are you sure you want to cancel this booking?')) cancelBooking(id);
    }
  });
  // --- Booking Cancellation Handler ---
  async function cancelBooking(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, { method: 'PUT' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to cancel booking.');

      showNotification(result.message, 'success');
      fetchBookingsData();
      fetchDashboardData();
    } catch (err) {
      showNotification(err.message, 'error');
      console.error('Error cancelling booking:', err);
    }
  }

  async function deleteItem(endpoint, id, refreshFn) {
    const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!res.ok) return showNotification(result.error, 'error');
    showNotification(result.message, 'success');
    refreshFn();
    fetchDashboardData();
  }

  async function cancelBooking(id) {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, { method: 'PUT' });
    const result = await res.json();
    if (!res.ok) return showNotification(result.error, 'error');
    showNotification(result.message, 'success');
    fetchBookingsData();
    fetchDashboardData();
  }
  // Initialize dashboard data on first load
  fetchDashboardData();
});
