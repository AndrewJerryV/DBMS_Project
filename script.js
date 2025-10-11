document.addEventListener('DOMContentLoaded', function () {
  const API_BASE_URL = 'http://localhost:3000';

  const staffId = localStorage.getItem('staffId');
  if (!staffId) {
    window.location.href = 'staff.html';
    return;
  }

  fetchDashboardData();

  const views = {
    dashboard: document.getElementById('dashboard-view'),
    buses: document.getElementById('buses-view'),
    routes: document.getElementById('routes-view'),
    bookings: document.getElementById('bookings-view'),
  };

  const menuItems = document.querySelectorAll('.sidebar li');
  let currentView = 'dashboard';

  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  themeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-theme');
    localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
  });

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-theme');
    themeToggle.checked = true;
  }

  const profileInfo = document.querySelector('.profile-info');
  const profileMenu = document.querySelector('.profile-menu');
  const logoutButton = document.getElementById('logout-button');

  profileInfo.addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('active');
  });

  window.addEventListener('click', () => {
    if (profileMenu.classList.contains('active')) {
      profileMenu.classList.remove('active');
    }
  });

  logoutButton.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'staff.html';
  });

  menuItems.forEach(item => {
    item.addEventListener('click', function () {
      const viewName = this.getAttribute('data-view');
      if (viewName === currentView) return;
      menuItems.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      views[currentView].classList.remove('active-view');
      views[viewName].classList.add('active-view');
      currentView = viewName;
      fetchDataForView(viewName);
    });
  });

  function fetchDataForView(viewName) {
    switch (viewName) {
      case 'dashboard': fetchDashboardData(); break;
      case 'buses': fetchBusesData(); break;
      case 'routes': fetchRoutesData(); break;
      case 'bookings': fetchBookingsData(); break;
    }
  }

  const modal = document.getElementById('add-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');
  const closeButton = document.querySelector('.modal .close-button');

  function openModal() { modal.style.display = 'block'; }
  function closeModal() { modal.style.display = 'none'; modalForm.innerHTML = ''; }

  closeButton.onclick = closeModal;
  window.onclick = function (event) {
    if (event.target == modal) closeModal();
  }

  function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + type;
    setTimeout(() => { notification.className = 'notification'; }, 3000);
  }

  async function populateSelect(selectId, url, valueField, textField) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`);
      const data = await response.json();
      const select = document.getElementById(selectId);
      select.innerHTML = '<option value="">-- Please Select --</option>';
      data.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueField];
        option.textContent = item[textField];
        select.appendChild(option);
      });
    } catch (error) { console.error(`Error populating select ${selectId}:`, error); }
  }

  let bookingsChartInstance = null, utilizationChartInstance = null;

  function renderBookingsChart() {
    fetch(`${API_BASE_URL}/dashboard/bookings-by-day`).then(res => res.json()).then(chartData => {
        const ctx = document.getElementById('bookingsChart').getContext('2d');
        if (bookingsChartInstance) bookingsChartInstance.destroy();
        bookingsChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: chartData.labels,
            datasets: [{
              label: 'Bookings', data: chartData.data,
              backgroundColor: 'rgba(240, 101, 43, 0.2)',
              borderColor: 'rgba(240, 101, 43, 1)',
              borderWidth: 1
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
      });
  }

  function renderUtilizationChart() {
    fetch(`${API_BASE_URL}/dashboard/bus-utilization`).then(res => res.json()).then(utilizationData => {
        const ctx = document.getElementById('utilizationChart').getContext('2d');
        if (utilizationChartInstance) utilizationChartInstance.destroy();
        utilizationChartInstance = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: utilizationData.map(item => item.status.charAt(0).toUpperCase() + item.status.slice(1)),
            datasets: [{
              label: 'Bus Utilization', data: utilizationData.map(item => item.count),
              backgroundColor: ['rgba(46, 204, 113, 0.7)', 'rgba(241, 196, 15, 0.7)'],
              hoverOffset: 4
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      });
  }

  function fetchDashboardData() {
    fetch(`${API_BASE_URL}/staff/details/${staffId}`).then(res => res.json()).then(data => {
        document.getElementById('user-name').textContent = data.name;
        document.getElementById('user-role').textContent = data.role.charAt(0).toUpperCase() + data.role.slice(1);
      });
    fetch(`${API_BASE_URL}/dashboard/summary`).then(res => res.json()).then(data => {
        document.getElementById('totalBuses').textContent = data.totalBuses;
        document.getElementById('totalRoutes').textContent = data.totalRoutes;
        document.getElementById('totalBookings').textContent = data.totalBookings;
        document.getElementById('totalRevenue').textContent = `₹${(data.totalRevenue || 0).toLocaleString()}`;
      });
    fetch(`${API_BASE_URL}/buses`).then(res => res.json()).then(data => {
        document.querySelector('#busTable tbody').innerHTML = data.map(bus => `<tr><td>${bus.bus_number}</td><td>${bus.capacity}</td><td>${bus.driver || '-'}</td></tr>`).join('');
      });
    fetch(`${API_BASE_URL}/drivers`).then(res => res.json()).then(data => {
        document.querySelector('#driverTable tbody').innerHTML = data.map(driver => `<tr><td>${driver.driver}</td><td>${driver.assigned_bus || '—'}</td></tr>`).join('');
      });
    renderBookingsChart();
    renderUtilizationChart();
  }

  function fetchBusesData() {
    fetch(`${API_BASE_URL}/buses/full`).then(res => res.json()).then(data => {
        document.querySelector('#buses-management-table tbody').innerHTML = data.map(bus => `
            <tr data-id="${bus.id}">
              <td>${bus.bus_number}</td><td>${bus.capacity}</td><td>${bus.driver || '-'}</td>
              <td><span class="status ${bus.status}">${bus.status}</span></td>
              <td><button class="action-btn edit"><i class="fas fa-edit"></i></button><button class="action-btn delete"><i class="fas fa-trash"></i></button></td>
            </tr>`).join('');
      });
  }

  function fetchRoutesData() {
    fetch(`${API_BASE_URL}/routes`).then(res => res.json()).then(data => {
        document.querySelector('#routes-management-table tbody').innerHTML = data.map(route => `
            <tr data-id="${route.route_id}">
              <td>R${route.route_id.toString().padStart(3, '0')}</td><td>${route.origin}</td><td>${route.destination}</td>
              <td>${route.distance_km}</td><td>${route.hours}h ${route.minutes}m</td>
              <td><button class="action-btn edit"><i class="fas fa-edit"></i></button><button class="action-btn delete"><i class="fas fa-trash"></i></button></td>
            </tr>`).join('');
      });
  }

  function fetchBookingsData() {
    fetch(`${API_BASE_URL}/bookings`).then(res => res.json()).then(data => {
        document.querySelector('#bookings-management-table tbody').innerHTML = data.map(booking => `
            <tr data-id="${booking.booking_id}">
              <td>B${booking.booking_id.toString().padStart(3, '0')}</td><td>${booking.passenger_name}</td>
              <td>${booking.bus_number}</td><td>${booking.route}</td>
              <td>${new Date(booking.booking_time).toLocaleDateString()}</td><td>₹${booking.amount}</td>
              <td><span class="status ${booking.status.toLowerCase()}">${booking.status}</span></td>
              <td><button class="action-btn cancel"><i class="fas fa-times"></i></button></td>
            </tr>`).join('');
      });
  }

  document.querySelector('#buses-view .add-button').addEventListener('click', () => {
    modalTitle.textContent = 'Add New Bus';
    modalForm.innerHTML = `<label>Bus Number:</label><input type="text" name="bus_number" required><label>Capacity:</label><input type="number" name="capacity" required><label>Driver:</label><select id="driver_id" name="driver_id"></select><label>Home Bus Stop:</label><select id="bus_stop_id" name="bus_stop_id"></select><label>Status:</label><select name="status"><option value="active">Active</option><option value="maintenance">Maintenance</option></select><label>Bus Type:</label><select name="bus_type"><option value="AC">AC</option><option value="Non-AC">Non-AC</option></select><button type="submit">Add Bus</button>`;
    populateSelect('driver_id', '/drivers/list', 'id', 'name');
    populateSelect('bus_stop_id', '/bus_stops/list', 'id', 'name');
    openModal();
    modalForm.onsubmit = handleFormSubmit.bind(null, 'buses', fetchBusesData);
  });

  document.querySelector('#routes-view .add-button').addEventListener('click', () => {
    modalTitle.textContent = 'Add New Route';
    modalForm.innerHTML = `<label>Origin:</label><select id="origin_bus_stop_id" name="origin_bus_stop_id" required></select><label>Destination:</label><select id="destination_bus_stop_id" name="destination_bus_stop_id" required></select><label>Distance (km):</label><input type="number" step="0.1" name="distance_km" required><label>Duration (minutes):</label><input type="number" name="duration_min" required><label>Fare (₹):</label><input type="number" step="0.01" name="fare" required><button type="submit">Add Route</button>`;
    populateSelect('origin_bus_stop_id', '/bus_stops/list', 'id', 'name');
    populateSelect('destination_bus_stop_id', '/bus_stops/list', 'id', 'name');
    openModal();
    modalForm.onsubmit = handleFormSubmit.bind(null, 'routes', fetchRoutesData);
  });

  document.querySelector('#bookings-view .add-button').addEventListener('click', () => {
    modalTitle.textContent = 'Create New Booking';
    modalForm.innerHTML = `
        <label for="passenger-email">Passenger Email:</label>
        <input type="email" id="passenger-email" list="passenger-datalist" placeholder="Type email to search or add new" required>
        <datalist id="passenger-datalist"></datalist>
        <label for="passenger-name">Passenger Name:</label>
        <input type="text" id="passenger-name" placeholder="Name" required>
        <label for="passenger-phone">Passenger Phone:</label>
        <input type="tel" id="passenger-phone" placeholder="Phone (optional)">
        <label for="origin_bus_stop_id">From:</label>
        <select id="origin_bus_stop_id" required></select>
        <label for="destination_bus_stop_id">To:</label>
        <select id="destination_bus_stop_id" required></select>
        <button type="button" id="find-trips-btn">Find Available Trips</button>
        <div id="trip-results-container"></div>`;
    populateSelect('origin_bus_stop_id', '/bus_stops/list', 'id', 'name');
    populateSelect('destination_bus_stop_id', '/bus_stops/list', 'id', 'name');
    openModal();
  });

  modalForm.addEventListener('input', debounce(handlePassengerAutocomplete, 300));
  modalForm.addEventListener('change', handlePassengerSelection);
  modalForm.addEventListener('click', (e) => {
    if (e.target.id === 'find-trips-btn') findAndDisplayTrips();
    if (e.target.classList.contains('book-trip-btn')) handleBookNowClick(e);
  });

  async function handlePassengerAutocomplete(e) {
    if (e.target.id !== 'passenger-email') return;
    const emailInput = e.target;
    const searchTerm = emailInput.value;
    const datalist = document.getElementById('passenger-datalist');
    if (emailInput.dataset.selected !== 'true') {
        emailInput.removeAttribute('data-id');
        document.getElementById('passenger-name').value = '';
        document.getElementById('passenger-phone').value = '';
    }
    emailInput.dataset.selected = 'false';
    if (searchTerm.length < 2) {
        datalist.innerHTML = '';
        return;
    }
    const response = await fetch(`${API_BASE_URL}/passengers/search?term=${searchTerm}`);
    const passengers = await response.json();
    datalist.innerHTML = passengers.map(p => 
        `<option value="${p.email}" data-id="${p.id}" data-name="${p.name}" data-phone="${p.phone || ''}">${p.name}</option>`
    ).join('');
  }

  function handlePassengerSelection(e) {
    if (e.target.id !== 'passenger-email') return;
    const emailInput = e.target;
    const datalist = document.getElementById('passenger-datalist');
    const selectedOption = Array.from(datalist.options).find(opt => opt.value === emailInput.value);
    if (selectedOption) {
        document.getElementById('passenger-name').value = selectedOption.dataset.name;
        document.getElementById('passenger-phone').value = selectedOption.dataset.phone;
        emailInput.setAttribute('data-id', selectedOption.dataset.id);
        emailInput.dataset.selected = 'true';
    }
  }
  
  async function findAndDisplayTrips() {
    const originId = document.getElementById('origin_bus_stop_id').value;
    const destinationId = document.getElementById('destination_bus_stop_id').value;
    const resultsContainer = document.getElementById('trip-results-container');
    if (!originId || !destinationId || originId === destinationId) {
        resultsContainer.innerHTML = `<p style="color: red;">Please select valid origin and destination.</p>`;
        return;
    }
    resultsContainer.innerHTML = `<p>Searching...</p>`;
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/find-trips?originId=${originId}&destinationId=${destinationId}`);
        const trips = await response.json();
        if (!response.ok) throw new Error(trips.error);
        if (trips.length === 0) {
            resultsContainer.innerHTML = `<p>No scheduled trips found.</p>`;
            return;
        }
        resultsContainer.innerHTML = '<h4>Available Trips:</h4>' + trips.map(trip => {
            const departure = new Date(trip.departure_time).toLocaleString();
            const arrival = new Date(trip.arrival_time).toLocaleString();
            return `
            <div class="trip-option">
                <p><strong>Fare:</strong> ₹${trip.fare}</p>
                <p><strong>Departure:</strong> ${departure}</p>
                <p><strong>Arrival:</strong> ${arrival}</p>
                <p><strong>Bus:</strong> ${trip.bus_number} (${trip.bus_type})</p>
                <div class="booking-action-area">
                    <input type="text" class="seat-number-input" placeholder="Seat No." required>
                    <select class="payment-method-select">
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="netbanking">Netbanking</option>
                    </select>
                    <button class="book-trip-btn" data-bus-id="${trip.bus_id}" data-route-id="${trip.route_id}" data-amount="${trip.fare}">Book Now</button>
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        resultsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
  }
  
  async function getOrCreatePassenger(name, email, phone) {
      const emailInput = document.getElementById('passenger-email');
      const existingId = emailInput.getAttribute('data-id');
      if (existingId) return existingId;
      try {
          const response = await fetch(`${API_BASE_URL}/passengers`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, email, phone }),
          });
          const result = await response.json();
          if (!response.ok && response.status !== 200) throw new Error(result.error);
          if(response.status === 201) showNotification('New passenger created!', 'success');
          return result.passengerId;
      } catch (error) {
          showNotification(error.message, 'error');
          return null;
      }
  }

  async function handleBookNowClick(e) {
      e.preventDefault();
      const name = document.getElementById('passenger-name').value.trim();
      const email = document.getElementById('passenger-email').value.trim();
      const phone = document.getElementById('passenger-phone').value.trim();
      if (!name || !email) {
          showNotification('Passenger Name and Email are required.', 'error');
          return;
      }
      const passengerId = await getOrCreatePassenger(name, email, phone);
      if (!passengerId) return;
      const button = e.target;
      const tripOptionDiv = button.closest('.trip-option');
      const seatNumberInput = tripOptionDiv.querySelector('.seat-number-input');
      const paymentMethodSelect = tripOptionDiv.querySelector('.payment-method-select');
      const seatNumber = seatNumberInput.value.trim();
      if (!seatNumber) {
          showNotification('Please enter a seat number.', 'error');
          seatNumberInput.focus();
          return;
      }
      const bookingData = { 
          passenger_id: passengerId, 
          bus_id: button.dataset.busId, 
          route_id: button.dataset.routeId, 
          amount: button.dataset.amount, 
          seat_number: seatNumber, 
          payment_method: paymentMethodSelect.value, 
          payment_status: 'pending' // Set default status to pending
      };
      try {
          const response = await fetch(`${API_BASE_URL}/bookings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(bookingData),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          showNotification(result.message, 'success');
          closeModal();
          fetchBookingsData();
          fetchDashboardData();
      } catch (error) {
          showNotification(error.message, 'error');
      }
  }

  async function handleFormSubmit(endpoint, refreshFunction, e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(modalForm).entries());
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      showNotification(result.message, 'success');
      closeModal();
      refreshFunction();
      fetchDashboardData();
    } catch (error) { showNotification(error.message, 'error'); }
  }

  function showConfirmation(message) {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      container.className = 'confirm-dialog';
      container.innerHTML = `<div class="confirm-content"><p>${message}</p><div class="confirm-buttons"><button class="confirm-yes">Yes</button><button class="confirm-no">No</button></div></div>`;
      document.body.appendChild(container);
      const cleanup = () => document.body.removeChild(container);
      container.querySelector('.confirm-yes').onclick = () => { cleanup(); resolve(true); };
      container.querySelector('.confirm-no').onclick = () => { cleanup(); resolve(false); };
    });
  }

  async function deleteWithForce(endpoint, id, refreshFn) {
    try {
      let res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'DELETE' });
      let result = await res.json();
      if (res.status === 409) {
        if (await showConfirmation(result.error + '. Delete anyway?')) {
          const forceRes = await fetch(`${API_BASE_URL}/${endpoint}/${id}?force=true`, { method: 'DELETE' });
          result = await forceRes.json();
          if (!forceRes.ok) throw new Error(result.error);
        } else { return; }
      } else if (!res.ok) { throw new Error(result.error); }
      showNotification(result.message, 'success');
      refreshFn();
      fetchDashboardData();
    } catch (err) { showNotification(err.message, 'error'); }
  }

  document.addEventListener('click', async (e) => {
    const target = e.target.closest('.action-btn');
    if (!target) return;
    const row = target.closest('tr');
    if (!row) return;
    const id = row.dataset.id;
    const view = target.closest('.view').id;
    if (target.classList.contains('edit')) {
      if (view === 'buses-view') openBusModalForEdit(id);
      if (view === 'routes-view') openRouteModalForEdit(id);
    } else if (target.classList.contains('delete')) {
      if (view === 'buses-view' && await showConfirmation('Delete this bus?')) await deleteWithForce('buses', id, fetchBusesData);
      else if (view === 'routes-view' && await showConfirmation('Delete this route?')) await deleteWithForce('routes', id, fetchRoutesData);
    } else if (target.classList.contains('cancel') && await showConfirmation('Cancel this booking?')) await cancelBooking(id);
  });

  async function openBusModalForEdit(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/buses/details/${id}`);
      if (!res.ok) throw new Error('Failed to fetch bus details.');
      const bus = await res.json();
      modalTitle.textContent = 'Edit Bus';
      modalForm.innerHTML = `<label>Bus Number:</label><input type="text" name="bus_number" value="${bus.bus_number}" required><label>Capacity:</label><input type="number" name="capacity" value="${bus.capacity}" required><label>Driver:</label><select id="driver_id" name="driver_id"></select><label>Home Bus Stop:</label><select id="bus_stop_id" name="bus_stop_id"></select><label>Status:</label><select name="status" value="${bus.status}"><option value="active">Active</option><option value="maintenance">Maintenance</option></select><label>Bus Type:</label><select name="bus_type" value="${bus.bus_type}"><option value="AC">AC</option><option value="Non-AC">Non-AC</option></select><button type="submit">Update Bus</button>`;
      await Promise.all([ populateSelect('driver_id', '/drivers/list', 'id', 'name'), populateSelect('bus_stop_id', '/bus_stops/list', 'id', 'name') ]);
      document.getElementById('driver_id').value = bus.driver_id || '';
      document.getElementById('bus_stop_id').value = bus.bus_stop_id || '';
      openModal();
      modalForm.onsubmit = handleFormUpdate.bind(null, 'buses', id, fetchBusesData);
    } catch (err) { showNotification(err.message, 'error'); }
  }

  async function openRouteModalForEdit(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/details/${id}`);
      if (!res.ok) throw new Error('Failed to fetch route details.');
      const route = await res.json();
      modalTitle.textContent = 'Edit Route';
      modalForm.innerHTML = `<label>Origin:</label><select id="origin_bus_stop_id" name="origin_bus_stop_id"></select><label>Destination:</label><select id="destination_bus_stop_id" name="destination_bus_stop_id"></select><label>Distance (km):</label><input type="number" step="0.1" name="distance_km" value="${route.distance_km}" required><label>Duration (minutes):</label><input type="number" name="duration_min" value="${route.duration_min}" required><label>Fare (₹):</label><input type="number" step="0.01" name="fare" value="${route.fare}" required><button type="submit">Update Route</button>`;
      await Promise.all([ populateSelect('origin_bus_stop_id', '/bus_stops/list', 'id', 'name'), populateSelect('destination_bus_stop_id', '/bus_stops/list', 'id', 'name') ]);
      document.getElementById('origin_bus_stop_id').value = route.origin_bus_stop_id;
      document.getElementById('destination_bus_stop_id').value = route.destination_bus_stop_id;
      openModal();
      modalForm.onsubmit = handleFormUpdate.bind(null, 'routes', id, fetchRoutesData);
    } catch (err) { showNotification(err.message, 'error'); }
  }

  async function handleFormUpdate(endpoint, id, refreshFn, e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(modalForm).entries());
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      showNotification(result.message, 'success');
      closeModal();
      refreshFn();
      fetchDashboardData();
    } catch (err) { showNotification(err.message, 'error'); }
  }

  async function cancelBooking(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, { method: 'PUT' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      showNotification(result.message, 'success');
      fetchBookingsData();
      fetchDashboardData();
    } catch (err) { showNotification(err.message, 'error'); }
  }

  function filterTable(tableSelector, searchTerm) {
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
    const tableBody = document.querySelector(tableSelector);
    if (!tableBody) return;
    tableBody.querySelectorAll('tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(lowerCaseSearchTerm) ? '' : 'none';
    });
  }

  ['bus-search', 'route-search', 'booking-search'].forEach(id => {
      document.getElementById(id).addEventListener('input', (e) => {
          const tableId = id.replace('-search', '-management-table');
          filterTable(`#${tableId} tbody`, e.target.value);
      });
  });

  function debounce(func, delay) {
      let timeout;
      return function(...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), delay);
      };
  }
  
  fetchDashboardData();
});