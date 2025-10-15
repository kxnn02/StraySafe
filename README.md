# 🐾 StraySafe

**StraySafe** is a community-based web app designed to help people **register their pets**, **report stray animals**, **sponsor treatments**, and **adopt pets**.  
It aims to connect pet owners, rescuers, and barangays to create a safer and more caring environment for animals.

---

## 🌟 Features

### 🐕 Pet Registration
- Register owned pets with details such as:
  - Name  
  - Species  
  - Age  
  - Gender  
- Upload a pet photo.  
- Mark services received:
  - Kapon (Spay/Neuter)
  - Anti-Rabies Vaccine (ARV)
  - 4-in-1 Vaccine
  - Deworming

### 🐾 Stray Reporting
- Report stray animals found in your area.
- Provide details like:
  - Species  
  - Location Found  
  - Condition or Notes  
- Optionally include your contact information (for follow-up).

### 💖 Sponsor & Adoption
- **Sponsor Treatment** button — lets users sponsor a pet’s treatment (Kapon, ARV, 4-in-1, Deworming).
- **Adopt Me** button — for users who want to adopt a pet.
- Both redirect to pages that show the barangay’s contact information.

### 📋 Lists
- **Pet List Page** shows all registered pets with their details and photo.
- **Strays List Page** shows all reported strays.
- Each card includes:
  - Pet/Stray details  
  - Buttons for “Sponsor Treatment” and “Adopt Me”

### 🏠 Navigation
- “Back to Home” button is available on:
  - Pet Registration Form  
  - Stray Report Form  
  - Pet List  
  - Strays List  

---

## 🛠️ Tech Stack

| Component | Technology Used |
|------------|----------------|
| Frontend | HTML, CSS, JavaScript |
| Database | Supabase |
| Hosting | GitHub Pages / Netlify |
| Styling | Custom CSS (Global + Page-specific styles) |

---

## 📁 Folder Structure

```
StraySafe/
│
├── index.html                # Homepage
├── pet-form.html             # Pet registration form
├── stray-form.html           # Stray report form
├── pet-list.html             # Displays all registered pets
├── strays-list.html          # Displays all reported strays
├── sponsor.html              # Contact info for sponsoring
├── adopt.html                # Contact info for adoption
│
├── css/
│   ├── global.css            # Shared styles
│   ├── pet-form.css          # Pet form styles
│   ├── stray-form.css        # Stray form styles
│
├── js/
│   ├── supabase-integration.js  # Handles data with Supabase
│
└── assets/
    └── (images, icons, etc.)
```

---

## ⚙️ How to Set Up Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/StraySafe.git
   ```

2. **Open the folder**
   ```bash
   cd StraySafe
   ```

3. **Set up Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project.
   - Copy your project’s **URL** and **anon key**.

4. **Update your credentials**
   Open `js/supabase-integration.js` and replace the placeholders:
   ```js
   const supabaseUrl = 'https://your-project.supabase.co';
   const supabaseKey = 'your-anon-key';
   const supabase = createClient(supabaseUrl, supabaseKey);
   ```

5. **Run locally**
   - Open `index.html` directly in your browser, **or**
   - Use VS Code’s **Live Server** extension.

---

## 📞 Contact Pages

### 🩺 Sponsor a Treatment
When users click “Sponsor Treatment”, they are redirected to:
```
sponsor.html
```
This page displays the barangay’s contact information for coordination and payment of pet treatments.

### 🏡 Adopt a Pet
When users click “Adopt Me”, they are redirected to:
```
adopt.html
```
This page shows adoption contact details and steps to adopt a registered or rescued pet.

---

## 💡 Future Improvements
- Add authentication for admin or barangay staff.
- Include status tracking (e.g., “Adopted”, “Sponsored”, “Needs Help”).
- Add notifications for new reports or sponsorships.
- Include Google Maps API for reporting strays with location pins.

---

## 🧑‍💻 Developers

**StraySafe Team**  
San Sebastian College - Recoletos, Manila  
Bachelor of Science in Information Technology  

Developed by:
- Kenneth Clein T. Fernandez  
- Andrei Baguisa

---

## ❤️ Acknowledgements
- **Supabase** for the free database and storage.
- **San Sebastian College - Recoletos** for project guidance.
- Everyone who helps keep stray animals safe.

---

## 📜 License

This project is open-source.  
You may modify and use it for educational purposes.

---

> “Every pet deserves a safe and loving home.” 🐶🐱
