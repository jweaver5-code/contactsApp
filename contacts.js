// --- Helper Functions ---
function saveContactsToStorage(contacts) {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function loadContactsFromStorage() {
    return JSON.parse(localStorage.getItem('contacts')) || [];
}

// --- Create Delete Button ---
function createDeleteButton(card, contacts) {
    const btn = document.createElement('button');
    btn.textContent = '×';
    btn.className = 'deleteContact';
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const index = contacts.indexOf(card.contactData);
        if (index > -1) contacts.splice(index, 1);
        saveContactsToStorage(contacts);
        card.remove();
    });
    return btn;
}

// --- Create Edit Button ---
function createEditButton(card, contacts) {
    const btn = document.createElement('button');
    btn.textContent = 'Edit';
    btn.className = 'editContact';
    btn.addEventListener('click', e => {
        e.stopPropagation();
        const data = card.contactData;
        const name = prompt('Edit Name:', data.name);
        const company = prompt('Edit Company:', data.company);
        const notes = prompt('Edit Notes:', data.notes);
        const image = prompt('Edit Image URL or leave blank:', data.image);

        if (name !== null) data.name = name.trim() || data.name;
        if (company !== null) data.company = company.trim();
        if (notes !== null) data.notes = notes.trim();
        if (image !== null) data.image = image.trim();

        updateCard(card, data, contacts);
        saveContactsToStorage(contacts);
    });
    return btn;
}

// --- Update Card ---
function updateCard(card, data, contacts) {
    card.innerHTML = '';

    // Image or placeholder frame
    if (data.image) {
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = 'Profile Picture';
        card.appendChild(img);
    } else {
        const frame = document.createElement('div');
        frame.className = 'empty-frame';
        frame.innerHTML = `<button class="add-picture-btn">+ Add Picture</button>`;
        card.appendChild(frame);

        frame.querySelector('.add-picture-btn').addEventListener('click', e => {
            e.stopPropagation();
            const url = prompt('Enter image URL:');
            if (url) {
                data.image = url.trim();
                updateCard(card, data, contacts);
                saveContactsToStorage(contacts);
            }
        });
    }

    // Contact details
    const details = document.createElement('div');
    details.className = 'contact-details';
    details.innerHTML = `
        <h3>${data.name}</h3>
        <p class="company">Company: ${data.company || 'N/A'}</p>
        <p class="notes">Notes: ${data.notes || ''}</p>
    `;

    card.appendChild(details);
    card.contactData = data;
    attachControls(card, contacts);
}

// --- Attach Controls ---
function attachControls(card, contacts) {
    card.style.position = 'relative';

    if (!card.querySelector('.deleteContact')) {
        card.appendChild(createDeleteButton(card, contacts));
    }
    if (!card.querySelector('.editContact')) {
        card.appendChild(createEditButton(card, contacts));
    }

    card.addEventListener('click', e => {
        if (!e.target.classList.contains('deleteContact') &&
            !e.target.classList.contains('editContact') &&
            !e.target.classList.contains('add-picture-btn')) {
            createContactPopup(card);
        }
    });
}

// --- Render Contact ---
function renderContact(data, container, contacts) {
    const card = document.createElement('div');
    card.className = 'contact-card';
    card.contactData = data;
    updateCard(card, data, contacts);
    container.appendChild(card);
}

// --- Contact Popup ---
function createContactPopup(card) {
    const data = card.contactData;
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.8); display:flex;
        justify-content:center; align-items:center; z-index:1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #fff; padding:40px; border-radius:8px;
        max-width:600px; width:100%; height:80%;
        text-align:center; position:relative; overflow-y:auto;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '10px';
    closeBtn.style.right = '10px';
    closeBtn.addEventListener('click', () => popup.remove());

    if (data.image) {
        const img = document.createElement('img');
        img.src = data.image;
        img.alt = 'Profile Picture';
        img.style.width = '200px';
        img.style.height = '200px';
        content.appendChild(img);
    }

    const name = document.createElement('h2');
    name.textContent = data.name;
    const company = document.createElement('p');
    company.textContent = `Company: ${data.company || 'N/A'}`;
    const notes = document.createElement('p');
    notes.textContent = `Notes: ${data.notes || ''}`;

    content.append(closeBtn, name, company, notes);
    popup.appendChild(content);
    document.body.appendChild(popup);
}

// --- Load All Contacts ---
const container = document.querySelector('.container');
let contacts = loadContactsFromStorage();
contacts.forEach(contact => renderContact(contact, container, contacts));

// --- Add New Contact ---
document.getElementById('addContact').addEventListener('click', () => {
    const name = document.getElementById('newName').value.trim() || 'Unnamed';
    const company = document.getElementById('newCompany').value.trim() || '';
    const notes = document.getElementById('newNotes').value.trim() || '';

    const newContact = { name, company, notes, image: '' };
    contacts.push(newContact);
    saveContactsToStorage(contacts);
    renderContact(newContact, container, contacts);

    // clear inputs
    document.getElementById('newName').value = '';
    document.getElementById('newCompany').value = '';
    document.getElementById('newNotes').value = '';
});

// --- Search ---
document.getElementById('searchBar').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll('.contact-card').forEach(card => {
        const data = card.contactData;
        const match = data.name.toLowerCase().includes(query) ||
                      data.company.toLowerCase().includes(query) ||
                      data.notes.toLowerCase().includes(query);
        card.style.display = match ? 'flex' : 'none';
    });
});
