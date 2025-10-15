// ========================================
// SUPABASE CONFIGURATION
// ========================================
const SUPABASE_URL = 'https://qyqjjwxxoqezmekdfiiu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cWpqd3h4b3Flem1la2RmaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzAyMzcsImV4cCI6MjA3NjAwNjIzN30.gEIYybb4Zic-bysS9j-yBCI6VYQ6nQNEXchK9X3j81o';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// PET REGISTRATION HANDLER
// ========================================
async function handlePetRegistration(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('.submit-btn');
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';

    try {
        const serviceCheckboxes = form.querySelectorAll('input[name="services"]:checked');
        const services = { kapon: false, arv: false, four_in_one: false, deworming: false };

        serviceCheckboxes.forEach(cb => {
            if (cb.value === 'kapon') services.kapon = true;
            if (cb.value === 'arv') services.arv = true;
            if (cb.value === '4in1') services.four_in_one = true;
            if (cb.value === 'deworm') services.deworming = true;
        });

        const petData = {
            owner_name: form.querySelector('#owner-name').value.trim(),
            contact_number: form.querySelector('#contact-number').value.trim(),
            email: form.querySelector('#email').value.trim() || null,
            pet_name: form.querySelector('#pet-name').value.trim(),
            species: form.querySelector('#species').value,
            age: form.querySelector('#age').value.trim(),
            gender: form.querySelector('#gender').value,
            ...services,
            photo_url: ''
        };

        const photoInput = form.querySelector('#pet-photo');
        if (photoInput.files.length > 0) {
            showMessage('info', 'Uploading photo...');
            const photoUrl = await uploadPhoto(photoInput.files[0], 'pet-photos');
            if (photoUrl) petData.photo_url = photoUrl;
        }

        const { error } = await supabase.from('pets').insert([petData]);
        if (error) throw error;

        showMessage('success', `${petData.pet_name} has been registered successfully!`);
        setTimeout(() => {
            window.location.href = 'pet-list.html';
        }, 1500);
    } catch (error) {
        console.error(error);
        showMessage('error', 'Failed to register pet. Please try again.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Register Pet';
    }
}

// ========================================
// STRAY REPORT HANDLER
// ========================================
async function handleStrayReport(event) {
    event.preventDefault();

    const form = event.target;
    const submitButton = form.querySelector('.submit-btn');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        const strayData = {
            species: form.querySelector('#species').value,
            location: form.querySelector('#location').value.trim(),
            condition: form.querySelector('#condition').value.trim() || null,
            reporter_name: form.querySelector('#reporter-name').value.trim() || null,
            reporter_phone: form.querySelector('#reporter-phone').value.trim() || null,
            reporter_email: form.querySelector('#reporter-email').value.trim() || null,
            photo_url: ''
        };

        const photoInput = form.querySelector('#stray-photo');
        if (photoInput.files.length > 0) {
            showMessage('info', 'Uploading photo...');
            const photoUrl = await uploadPhoto(photoInput.files[0], 'stray-photos');
            if (photoUrl) strayData.photo_url = photoUrl;
        }

        const { error } = await supabase.from('strays').insert([strayData]);
        if (error) throw error;

        showMessage('success', 'Stray report submitted successfully!');
        setTimeout(() => {
            window.location.href = 'strays-list.html';
        }, 1500);
    } catch (error) {
        console.error(error);
        showMessage('error', 'Failed to submit stray report.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Report';
    }
}

// ========================================
// PHOTO UPLOAD HANDLER
// ========================================
async function uploadPhoto(file, bucketName) {
    try {
        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'Photo must be less than 5MB');
            return null;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file);
        if (uploadError) {
            console.error(uploadError);
            showMessage('error', 'Photo upload failed.');
            return null;
        }

        const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        return data.publicUrl;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// ========================================
// DISPLAY PETS
// ========================================
async function loadPets() {
    const container = document.getElementById('pets-container');
    if (!container) return;

    container.innerHTML = '<p>Loading pets...</p>';
    try {
        const { data, error } = await supabase.from('pets').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        displayPets(data, container);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red;">Failed to load pets.</p>';
    }
}

function displayPets(pets, container) {
    if (!pets.length) {
        container.innerHTML = '<p>No pets registered yet.</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'cards-grid';

    pets.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'pet-card';

        const img = pet.photo_url
            ? `<img src="${pet.photo_url}" class="pet-image">`
            : `<div class="pet-image no-image">🐾</div>`;

        const services = [
            { name: 'Kapon', available: pet.kapon },
            { name: 'ARV', available: pet.arv },
            { name: '4-in-1', available: pet.four_in_one },
            { name: 'Deworming', available: pet.deworming }
        ];

        const servicesHTML = services.map(service => {
            const status = service.available ? 'available' : 'unavailable';
            const icon = service.available ? '✓' : '✕';
            return `
                <div class="service-item ${status}">
                    <span class="service-icon">${icon}</span>
                    <span class="service-name">${service.name}</span>
                </div>
            `;
        }).join('');

        card.innerHTML = `
            ${img}
            <div class="pet-details">
                <h2>${pet.pet_name}</h2>
                <p><strong>Owner:</strong> ${pet.owner_name}</p>
                <p><strong>Contact:</strong> ${pet.contact_number}</p>
                <p><strong>Species:</strong> ${pet.species}</p>
                <p><strong>Age:</strong> ${pet.age}</p>
                <p><strong>Gender:</strong> ${pet.gender}</p>
                <div class="services-section">
                    <div class="services-title">Veterinary Services</div>
                    <div class="services-grid">
                        ${servicesHTML}
                    </div>
                </div>
            </div>
        `;

        // ✅ Buttons for sponsor and adopt
        const actions = document.createElement('div');
        actions.classList.add('actions');

        const sponsorBtn = document.createElement('button');
        sponsorBtn.textContent = 'Sponsor Treatment';
        sponsorBtn.onclick = () => window.location.href = 'sponsor.html';

        const adoptBtn = document.createElement('button');
        adoptBtn.textContent = 'Adopt Me';
        adoptBtn.onclick = () => window.location.href = 'adopt.html';

        actions.appendChild(sponsorBtn);
        actions.appendChild(adoptBtn);
        card.appendChild(actions);

        grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
}

// ========================================
// DISPLAY STRAYS
// ========================================
async function loadStrays() {
    const container = document.getElementById('strays-container');
    if (!container) return;

    container.innerHTML = '<p>Loading stray reports...</p>';
    try {
        const { data, error } = await supabase.from('strays').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        displayStrays(data, container);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:red;">Failed to load stray reports.</p>';
    }
}

function displayStrays(strays, container) {
    if (!strays.length) {
        container.innerHTML = '<p>No stray reports yet.</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'cards-grid';

    strays.forEach(stray => {
        const img = stray.photo_url
            ? `<img src="${stray.photo_url}" class="stray-image">`
            : `<div class="stray-image no-image">📷</div>`;

        const services = [
            { name: 'Kapon', available: stray.kapon },
            { name: 'ARV', available: stray.arv },
            { name: '4-in-1', available: stray.four_in_one },
            { name: 'Deworming', available: stray.deworming }
        ];

        const servicesHTML = services.map(service => {
            const status = service.available ? 'available' : 'unavailable';
            const icon = service.available ? '✓' : '✕';
            return `
                <div class="service-item ${status}">
                    <span class="service-icon">${icon}</span>
                    <span class="service-name">${service.name}</span>
                </div>
            `;
        }).join('');

        const card = document.createElement('div');
        card.className = 'stray-card';
        card.innerHTML = `
            ${img}
            <div class="stray-details">
                <div class="stray-title">
                    <span class="species-badge">${stray.species}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Location:</span>
                    <span class="info-value">${stray.location}</span>
                </div>
                ${stray.condition ? `<div class="condition-box"><strong>Condition:</strong> ${stray.condition}</div>` : ''}
                <div class="reporter-info">
                    <div class="reporter-title">Reported by</div>
                    <div class="info-row">
                        <span class="info-value">${stray.reporter_name || 'Anonymous'}</span>
                    </div>
                    ${stray.reporter_phone ? `<div class="info-row"><span class="info-value">📞 ${stray.reporter_phone}</span></div>` : ''}
                    ${stray.reporter_email ? `<div class="info-row"><span class="info-value">✉️ ${stray.reporter_email}</span></div>` : ''}
                </div>
                <div class="services-section">
                    <div class="services-title">Veterinary Services</div>
                    <div class="services-grid">
                        ${servicesHTML}
                    </div>
                </div>
            </div>
        `;

        // ✅ Buttons for sponsor and adopt
        const actions = document.createElement('div');
        actions.classList.add('actions');

        const sponsorBtn = document.createElement('button');
        sponsorBtn.textContent = 'Sponsor Treatment';
        sponsorBtn.onclick = () => window.location.href = 'sponsor.html';

        const adoptBtn = document.createElement('button');
        adoptBtn.textContent = 'Adopt Me';
        adoptBtn.onclick = () => window.location.href = 'adopt.html';

        actions.appendChild(sponsorBtn);
        actions.appendChild(adoptBtn);
        card.appendChild(actions);

        grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);
}

// ========================================
// MESSAGE SYSTEM
// ========================================
function showMessage(type, message) {
    let el = document.getElementById('notification-message');
    if (!el) {
        el = document.createElement('div');
        el.id = 'notification-message';
        el.style.cssText = 'position:fixed;top:20px;right:20px;padding:15px 25px;border-radius:8px;z-index:9999;';
        document.body.appendChild(el);
    }

    const colors = {
        success: ['#d4edda', '#155724'],
        error: ['#f8d7da', '#721c24'],
        info: ['#d1ecf1', '#0c5460']
    }[type] || ['#d1ecf1', '#0c5460'];

    el.style.backgroundColor = colors[0];
    el.style.color = colors[1];
    el.textContent = message;
    el.style.display = 'block';

    setTimeout(() => (el.style.display = 'none'), 4000);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('StraySafe initialized');

    const petForm = document.querySelector('#pet-registration-form');
    const strayForm = document.querySelector('#stray-report-form');

    if (petForm) petForm.addEventListener('submit', handlePetRegistration);
    if (strayForm) strayForm.addEventListener('submit', handleStrayReport);
    if (document.getElementById('pets-container')) loadPets();
    if (document.getElementById('strays-container')) loadStrays();
});
