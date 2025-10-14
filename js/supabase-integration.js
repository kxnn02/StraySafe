// ========================================
// SUPABASE CONFIGURATION
// ========================================
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://qyqjjwxxoqezmekdfiiu.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5cWpqd3h4b3Flem1la2RmaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzAyMzcsImV4cCI6MjA3NjAwNjIzN30.gEIYybb4Zic-bysS9j-yBCI6VYQ6nQNEXchK9X3j81o'; // Your anon public key



// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========================================
// PET REGISTRATION HANDLER
// ========================================
async function handlePetRegistration(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('.submit-btn');
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Registering...';
    
    try {
        // Get all checkbox values for services
        const serviceCheckboxes = form.querySelectorAll('input[name="services"]:checked');
        const services = {
            kapon: false,
            arv: false,
            four_in_one: false,
            deworming: false
        };
        
        serviceCheckboxes.forEach(checkbox => {
            if (checkbox.value === 'kapon') services.kapon = true;
            if (checkbox.value === 'arv') services.arv = true;
            if (checkbox.value === '4in1') services.four_in_one = true;
            if (checkbox.value === 'deworm') services.deworming = true;
        });
        
        // Prepare pet data
        const petData = {
            owner_name: form.querySelector('#owner-name').value.trim(),
            contact_number: form.querySelector('#contact-number').value.trim(),
            email: form.querySelector('#email').value.trim() || null,
            pet_name: form.querySelector('#pet-name').value.trim(),
            species: form.querySelector('#species').value,
            age: form.querySelector('#age').value.trim(),
            gender: form.querySelector('#gender').value,
            kapon: services.kapon,
            arv: services.arv,
            four_in_one: services.four_in_one,
            deworming: services.deworming,
            photo_url: ''
        };
        
        // Handle photo upload
        const photoInput = form.querySelector('#pet-photo');
        if (photoInput.files.length > 0) {
            showMessage('info', 'Uploading photo...');
            const photoUrl = await uploadPhoto(photoInput.files[0], 'pet-photos');
            if (photoUrl) {
                petData.photo_url = photoUrl;
            }
        }
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('pets')
            .insert([petData])
            .select();
        
        if (error) throw error;
        
        // Success!
        showMessage('success', `${petData.pet_name} has been registered successfully!`);
        form.reset();
        
        // Optional: Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error registering pet:', error);
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
    
    // Disable submit button
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    try {
        // Prepare stray data
        const strayData = {
            species: form.querySelector('#species').value,
            location: form.querySelector('#location').value.trim(),
            condition: form.querySelector('#condition').value.trim() || null,
            reporter_name: form.querySelector('#reporter-name').value.trim() || null,
            reporter_phone: form.querySelector('#reporter-phone').value.trim() || null,
            reporter_email: form.querySelector('#reporter-email').value.trim() || null,
            photo_url: ''
        };
        
        // Handle photo upload
        const photoInput = form.querySelector('#stray-photo');
        if (photoInput.files.length > 0) {
            showMessage('info', 'Uploading photo...');
            const photoUrl = await uploadPhoto(photoInput.files[0], 'stray-photos');
            if (photoUrl) {
                strayData.photo_url = photoUrl;
            }
        }
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('strays')
            .insert([strayData])
            .select();
        
        if (error) throw error;
        
        // Success!
        showMessage('success', 'Stray report submitted successfully! Thank you for helping.');
        form.reset();
        
        // Optional: Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error submitting stray report:', error);
        showMessage('error', 'Failed to submit report. Please try again.');
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
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'Photo must be less than 5MB');
            return null;
        }
        
        // Create unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file);
        
        if (error) {
            console.error('Photo upload error:', error);
            showMessage('error', 'Photo upload failed. Continuing without photo.');
            return null;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
        
        return urlData.publicUrl;
        
    } catch (error) {
        console.error('Error uploading photo:', error);
        return null;
    }
}

// ========================================
// LOAD AND DISPLAY PETS
// ========================================
async function loadPets() {
    try {
        const container = document.getElementById('pets-container');
        if (!container) return;
        
        container.innerHTML = '<p style="text-align: center;">Loading pets...</p>';
        
        const { data: pets, error } = await supabase
            .from('pets')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayPets(pets, container);
        
    } catch (error) {
        console.error('Error loading pets:', error);
        const container = document.getElementById('pets-container');
        if (container) {
            container.innerHTML = '<p style="color: red;">Failed to load pets.</p>';
        }
    }
}

function displayPets(pets, container) {
    container.innerHTML = '';
    
    if (!pets || pets.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No pets registered yet.</p>';
        return;
    }
    
    pets.forEach(pet => {
        const card = document.createElement('div');
        card.className = 'pet-card';
        
        // Build services list
        const services = [];
        if (pet.kapon) services.push('Kapon');
        if (pet.arv) services.push('ARV');
        if (pet.four_in_one) services.push('4-in-1');
        if (pet.deworming) services.push('Deworming');
        const servicesText = services.length > 0 ? services.join(', ') : 'None';
        
        card.innerHTML = `
            ${pet.photo_url ? `<img src="${pet.photo_url}" alt="${pet.pet_name}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
            <div style="padding: 15px;">
                <h3>${pet.pet_name}</h3>
                <p><strong>Owner:</strong> ${pet.owner_name}</p>
                <p><strong>Contact:</strong> ${pet.contact_number}</p>
                <p><strong>Species:</strong> ${pet.species}</p>
                <p><strong>Age:</strong> ${pet.age}</p>
                <p><strong>Gender:</strong> ${pet.gender}</p>
                <p><strong>Services:</strong> ${servicesText}</p>
                <p style="font-size: 0.9em; color: #666;">Registered: ${new Date(pet.created_at).toLocaleDateString()}</p>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ========================================
// LOAD AND DISPLAY STRAYS
// ========================================
async function loadStrays() {
    try {
        const container = document.getElementById('strays-container');
        if (!container) return;
        
        container.innerHTML = '<p style="text-align: center;">Loading stray reports...</p>';
        
        const { data: strays, error } = await supabase
            .from('strays')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayStrays(strays, container);
        
    } catch (error) {
        console.error('Error loading strays:', error);
        const container = document.getElementById('strays-container');
        if (container) {
            container.innerHTML = '<p style="color: red;">Failed to load stray reports.</p>';
        }
    }
}

function displayStrays(strays, container) {
    container.innerHTML = '';
    
    if (!strays || strays.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No stray reports yet.</p>';
        return;
    }
    
    strays.forEach(stray => {
        const card = document.createElement('div');
        card.className = 'stray-card';
        
        card.innerHTML = `
            ${stray.photo_url ? `<img src="${stray.photo_url}" alt="Stray ${stray.species}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
            <div style="padding: 15px;">
                <h3>${stray.species.charAt(0).toUpperCase() + stray.species.slice(1)}</h3>
                <p><strong>Location:</strong> ${stray.location}</p>
                ${stray.condition ? `<p><strong>Condition:</strong> ${stray.condition}</p>` : ''}
                ${stray.reporter_name ? `<p><strong>Reporter:</strong> ${stray.reporter_name}</p>` : ''}
                ${stray.reporter_phone ? `<p><strong>Contact:</strong> ${stray.reporter_phone}</p>` : ''}
                <p style="font-size: 0.9em; color: #666;">Reported: ${new Date(stray.created_at).toLocaleDateString()}</p>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ========================================
// MESSAGE DISPLAY
// ========================================
function showMessage(type, message) {
    let messageDiv = document.getElementById('notification-message');
    
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'notification-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 9999;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(messageDiv);
    }
    
    // Style based on type
    const styles = {
        success: { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        error: { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' },
        info: { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' }
    };
    
    const style = styles[type] || styles.info;
    messageDiv.style.backgroundColor = style.bg;
    messageDiv.style.color = style.color;
    messageDiv.style.border = `1px solid ${style.border}`;
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('StraySafe initialized!');
    
    // Check which page we're on and attach appropriate handlers
    
    // Pet registration form
    const petForm = document.querySelector('form');
    if (petForm && document.querySelector('#pet-name')) {
        petForm.addEventListener('submit', handlePetRegistration);
        console.log('Pet registration form ready');
    }
    
    // Stray report form
    if (petForm && document.querySelector('#location')) {
        petForm.addEventListener('submit', handleStrayReport);
        console.log('Stray report form ready');
    }
    
    // Load pets list
    if (document.getElementById('pets-container')) {
        loadPets();
    }
    
    // Load strays list
    if (document.getElementById('strays-container')) {
        loadStrays();
    }
});