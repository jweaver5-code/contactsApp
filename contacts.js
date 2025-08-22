// --- Storage Helpers ---
function saveContactsToStorage(contacts) {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}
function loadContactsFromStorage() {
  return JSON.parse(localStorage.getItem('contacts')) || [];
}

function saveEventsToStorage(events) {
  localStorage.setItem('events', JSON.stringify(events));
}

function loadEventsFromStorage() {
  return JSON.parse(localStorage.getItem('events')) || ['aims', 'grace-hopper'];
}

// --- Buttons ---
function createDeleteButton(card, contacts) {
  const btn = document.createElement('button');
  btn.textContent = '×';
  btn.className = 'deleteContact';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const index = contacts.indexOf(card.contactData);
    if (index > -1) contacts.splice(index, 1);
    saveContactsToStorage(contacts);
    renderAllContacts(contacts);
  });
  return btn;
}

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
    sortAndRenderContacts(contacts);
    saveContactsToStorage(contacts);
  });
  return btn;
}

function createFavoriteButton(card, contacts) {
  const btn = document.createElement('button');
  btn.innerHTML = card.contactData.favorite ? '⭐' : '☆';
  btn.className = 'favoriteContact';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    card.contactData.favorite = !card.contactData.favorite;
    btn.innerHTML = card.contactData.favorite ? '⭐' : '☆';
    sortAndRenderContacts(contacts);
    saveContactsToStorage(contacts);
  });
  return btn;
}

function createAddProfilePictureButton(card, contacts) {
  const btn = document.createElement('button');
  btn.textContent = 'Add Profile Picture';
  btn.className = 'addProfilePicture';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const newImageUrl = prompt('Enter new profile picture URL:', card.contactData.image);
    if (newImageUrl !== null && newImageUrl.trim() !== '') {
      card.contactData.image = newImageUrl.trim();
      updateCard(card, card.contactData, contacts);
      sortAndRenderContacts(contacts);
      saveContactsToStorage(contacts);
    }
  });
  return btn;
}

function createAssignEventButton(card, contacts) {
  const btn = document.createElement('button');
  btn.textContent = 'Assign to Event';
  btn.className = 'assignEvent';
  btn.addEventListener('click', e => {
    e.stopPropagation();
    
    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'event-dropdown-container';
    
    // Create dropdown
    const dropdown = document.createElement('select');
    dropdown.className = 'event-dropdown';
    
    // Add "none" option
    const noneOption = document.createElement('option');
    noneOption.value = 'none';
    noneOption.textContent = 'No Event';
    dropdown.appendChild(noneOption);
    
    // Add event options
    const events = loadEventsFromStorage();
    events.forEach(event => {
      const option = document.createElement('option');
      option.value = event;
      if (event === 'aims') {
        option.textContent = 'AIMS';
      } else if (event === 'grace-hopper') {
        option.textContent = 'Grace Hopper';
      } else {
        option.textContent = event.charAt(0).toUpperCase() + event.slice(1);
      }
      dropdown.appendChild(option);
    });
    
    // Set current selection
    const currentEvent = card.contactData.event || 'none';
    dropdown.value = currentEvent;
    
    // Handle selection change
    dropdown.addEventListener('change', () => {
      const selectedEvent = dropdown.value;
      if (selectedEvent === 'none') {
        delete card.contactData.event;
      } else {
        card.contactData.event = selectedEvent;
      }
      
      // Update the contact and save
      updateCard(card, card.contactData, contacts);
      sortAndRenderContacts(contacts);
      saveContactsToStorage(contacts);
      
      // Remove dropdown
      dropdownContainer.remove();
    });
    
    // Add dropdown to container
    dropdownContainer.appendChild(dropdown);
    
    // Position dropdown near the button
    const rect = btn.getBoundingClientRect();
    dropdownContainer.style.position = 'absolute';
    dropdownContainer.style.top = `${rect.bottom + 5}px`;
    dropdownContainer.style.left = `${rect.left}px`;
    dropdownContainer.style.zIndex = '1000';
    
    // Add to document
    document.body.appendChild(dropdownContainer);
    
    // Focus dropdown
    dropdown.focus();
    
    // Close dropdown when clicking outside
    const closeDropdown = (event) => {
      if (!dropdownContainer.contains(event.target) && event.target !== btn) {
        dropdownContainer.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    
    // Delay adding listener to avoid immediate closure
    setTimeout(() => {
      document.addEventListener('click', closeDropdown);
    }, 100);
  });
  return btn;
}

// --- Update Card ---
function updateCard(card, data, contacts) {
  card.innerHTML = '';
  if (data.image) {
    const img = document.createElement('img');
    img.src = data.image;
    card.appendChild(img);
  }
  const details = document.createElement('div');
  details.className = 'contact-details';
  details.innerHTML = `<h3>${data.name}</h3>
                       <p>Company: ${data.company || 'N/A'}</p>
                       <p class="notes">Notes: ${data.notes || ''}</p>`;
  card.appendChild(details);
  card.contactData = data;
  attachControls(card, contacts);
  card.classList.toggle('favorite-highlight', data.favorite);
}

// --- Attach Controls ---
function attachControls(card, contacts) {
  if (!card.querySelector('.deleteContact')) card.appendChild(createDeleteButton(card, contacts));
  if (!card.querySelector('.editContact')) card.appendChild(createEditButton(card, contacts));
  if (!card.querySelector('.favoriteContact')) card.appendChild(createFavoriteButton(card, contacts));
  if (!card.querySelector('.addProfilePicture')) card.appendChild(createAddProfilePictureButton(card, contacts));
  if (!card.querySelector('.assignEvent')) card.appendChild(createAssignEventButton(card, contacts));
}

// --- Render Contact ---
function renderContact(data, container, contacts) {
  const card = document.createElement('div');
  card.className = 'contact-card';
  card.contactData = data;
  updateCard(card, data, contacts);
  container.appendChild(card);
}

// --- Render All Contacts ---
function renderAllContacts(contacts, eventFilter = null) {
  const container = document.querySelector('.contact-list');
  container.innerHTML = '';
  
  let filteredContacts = contacts;
  let headerText = '📋 All Contacts';
  
  // Filter contacts by event if specified
  if (eventFilter && eventFilter !== 'all') {
    filteredContacts = contacts.filter(contact => contact.event === eventFilter);
    headerText = `🎉 ${eventFilter.charAt(0).toUpperCase() + eventFilter.slice(1)} Contacts`;
  }
  
  // Separate contacts into favorited and unfavorited groups
  const favorited = filteredContacts.filter(contact => contact.favorite);
  const unfavorited = filteredContacts.filter(contact => !contact.favorite);
  
  // Render favorited contacts first
  if (favorited.length > 0) {
    const favoriteHeader = document.createElement('div');
    favoriteHeader.className = 'section-header';
    favoriteHeader.innerHTML = '<h2>⭐ Favorites</h2>';
    container.appendChild(favoriteHeader);
    
    favorited.forEach(contact => renderContact(contact, container, contacts));
  }
  
  // Render unfavorited contacts
  if (unfavorited.length > 0) {
    const unfavoritedHeader = document.createElement('div');
    unfavoritedHeader.className = 'section-header';
    unfavoritedHeader.innerHTML = `<h2>${headerText}</h2>`;
    container.appendChild(unfavoritedHeader);
    
    unfavorited.forEach(contact => renderContact(contact, container, contacts));
  }
}

// --- Sort favorites to top, then alphabetically within each group ---
function sortAndRenderContacts(contacts) {
  contacts.sort((a, b) => {
    // First, sort by favorite status (favorites first)
    if (a.favorite !== b.favorite) {
      return b.favorite ? 1 : -1;
    }
    // Then sort alphabetically by name within each group
    return a.name.localeCompare(b.name);
  });
  renderAllContacts(contacts);
}

// --- Load / Add Contacts ---
let contacts = loadContactsFromStorage();
let events = loadEventsFromStorage();
let currentEventFilter = null;

sortAndRenderContacts(contacts);

// Function to add new event
function addNewEvent() {
  const newEventName = prompt('Enter new event name:');
  if (newEventName && newEventName.trim() !== '') {
    const eventName = newEventName.trim().toLowerCase();
    if (!events.includes(eventName)) {
      events.push(eventName);
      saveEventsToStorage(events);
      updateEventsList();
    } else {
      alert('Event already exists!');
    }
  }
}

// Function to delete event
function deleteEvent(eventName) {
  if (confirm(`Are you sure you want to delete the "${eventName}" event? Contacts will be kept but removed from this event.`)) {
    // Remove event from events list
    const eventIndex = events.indexOf(eventName);
    if (eventIndex > -1) {
      events.splice(eventIndex, 1);
      saveEventsToStorage(events);
      
      // Remove event assignment from contacts (but keep the contacts)
      contacts.forEach(contact => {
        if (contact.event === eventName) {
          delete contact.event;
        }
      });
      saveContactsToStorage(contacts);
      
      // Update the display
      updateEventsList();
      sortAndRenderContacts(contacts);
      
      // If we're currently viewing this event, go back to all contacts
      if (currentEventFilter === eventName) {
        showAllContacts();
      }
    }
  }
}

// Function to show event page
function showEventPage(eventName) {
  const contactList = document.querySelector('.contact-list');
  const eventPage = document.getElementById('eventPage');
  const eventPageTitle = document.getElementById('eventPageTitle');
  
  // Hide contact list, show event page
  contactList.style.display = 'none';
  eventPage.style.display = 'block';
  
  // Set the current event filter so new contacts can be assigned to this event
  currentEventFilter = eventName;
  
  // Set event title
  let displayName;
  if (eventName === 'aims') {
    displayName = 'AIMS';
  } else if (eventName === 'grace-hopper') {
    displayName = 'Grace Hopper';
  } else {
    displayName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
  }
  eventPageTitle.textContent = `🎉 ${displayName} Contacts`;
  
  // Filter and render contacts for this event
  const eventContacts = contacts.filter(contact => contact.event === eventName);
  renderEventContacts(eventContacts, eventName);
}

// Function to render event contacts
function renderEventContacts(eventContacts, eventName) {
  const container = document.getElementById('eventContactsList');
  container.innerHTML = '';
  
  if (eventContacts.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #ccc; font-style: italic;">No contacts assigned to this event yet.</p>';
    return;
  }
  
  // Separate contacts into favorited and unfavorited groups
  const favorited = eventContacts.filter(contact => contact.favorite);
  const unfavorited = eventContacts.filter(contact => !contact.favorite);
  
  // Render favorited contacts first
  if (favorited.length > 0) {
    const favoriteHeader = document.createElement('div');
    favoriteHeader.className = 'section-header';
    favoriteHeader.innerHTML = '<h2>⭐ Favorites</h2>';
    container.appendChild(favoriteHeader);
    
    favorited.forEach(contact => renderContact(contact, container, contacts));
  }
  
  // Render unfavorited contacts
  if (unfavorited.length > 0) {
    const unfavoritedHeader = document.createElement('div');
    unfavoritedHeader.className = 'section-header';
    let displayName;
    if (eventName === 'aims') {
      displayName = 'AIMS';
    } else if (eventName === 'grace-hopper') {
      displayName = 'Grace Hopper';
    } else {
      displayName = eventName.charAt(0).toUpperCase() + eventName.slice(1);
    }
    unfavoritedHeader.innerHTML = `<h2>🎉 ${displayName} Contacts</h2>`;
    container.appendChild(unfavoritedHeader);
    
    unfavorited.forEach(contact => renderContact(contact, container, contacts));
  }
}

// Function to show all contacts (main page)
function showAllContacts() {
  const contactList = document.querySelector('.contact-list');
  const eventPage = document.getElementById('eventPage');
  
  // Show contact list, hide event page
  contactList.style.display = 'block';
  eventPage.style.display = 'none';
  
  // Reset filter and show all contacts
  currentEventFilter = null;
  sortAndRenderContacts(contacts);
}

// Function to update events list in menu
function updateEventsList() {
  const eventsList = document.getElementById('eventsList');
  if (eventsList) {
    eventsList.innerHTML = '';
    
    // Add "All Events" option
    const allEventsItem = document.createElement('div');
    allEventsItem.className = 'event-item';
    allEventsItem.dataset.event = 'all';
    allEventsItem.textContent = 'All Events';
    allEventsItem.addEventListener('click', () => showAllContacts());
    eventsList.appendChild(allEventsItem);
    
    // Add each event
    events.forEach(event => {
      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';
      eventItem.dataset.event = event;
      
      // Event name
      const eventName = document.createElement('span');
      if (event === 'aims') {
        eventName.textContent = 'AIMS';
      } else if (event === 'grace-hopper') {
        eventName.textContent = 'Grace Hopper';
      } else {
        eventName.textContent = event.charAt(0).toUpperCase() + event.slice(1);
      }
      eventItem.appendChild(eventName);
      
      // Delete button (only for non-default events)
      if (event !== 'aims' && event !== 'grace-hopper') {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-event-btn';
        deleteBtn.dataset.event = event;
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteEvent(event);
        });
        eventItem.appendChild(deleteBtn);
      }
      
      // Click to view event page
      eventItem.addEventListener('click', () => {
        showEventPage(event);
      });
      
      eventsList.appendChild(eventItem);
    });
  }
}

// Function to filter contacts by event
function filterContactsByEvent(eventType) {
  currentEventFilter = eventType === 'all' ? null : eventType;
  sortAndRenderContacts(contacts, currentEventFilter);
  
  // Update active states in menu
  document.querySelectorAll('.event-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  
  if (eventType === 'all') {
    document.getElementById('allContactsTab').classList.add('active');
  } else {
    document.querySelector(`[data-event="${eventType}"]`).classList.add('active');
  }
}

// Initialize events list when page loads
// This is now handled in the HTML after the script loads

// --- Add Contact Button ---
document.getElementById('addContact').addEventListener('click', () => {
  const name = document.getElementById('newName').value.trim() || 'Unnamed';
  const company = document.getElementById('newCompany').value.trim();
  const notes = document.getElementById('newNotes').value.trim();
  
  const newContact = { 
    name, 
    company, 
    notes, 
    image: 'https://h-o-m-e.org/wp-content/uploads/2022/04/Blank-Profile-Picture-1.jpg', 
    favorite: false 
  };
  
  // If we're currently viewing a specific event, assign the contact to that event
  if (currentEventFilter && currentEventFilter !== 'all') {
    newContact.event = currentEventFilter;
  }
  
  contacts.push(newContact);
  saveContactsToStorage(contacts);
  
  // If we're viewing an event page, refresh that page. Otherwise, refresh main contacts
  if (currentEventFilter && currentEventFilter !== 'all') {
    // Refresh the event page
    const eventContacts = contacts.filter(contact => contact.event === currentEventFilter);
    renderEventContacts(eventContacts, currentEventFilter);
  } else {
    // Refresh main contacts
    sortAndRenderContacts(contacts);
  }
  
  // Clear the input fields
  document.getElementById('newName').value = '';
  document.getElementById('newCompany').value = '';
  document.getElementById('newNotes').value = '';
});

// --- Search ---
document.getElementById('searchBar').addEventListener('input', function() {
  const query = this.value.toLowerCase();
  document.querySelectorAll('.contact-card').forEach(card => {
    const data = card.contactData;
    const match = data.name.toLowerCase().includes(query) ||
                  data.company.toLowerCase().includes(query) ||
                  data.notes.toLowerCase().includes(query);
    card.style.display = match ? 'flex' : 'none';
  });
});
