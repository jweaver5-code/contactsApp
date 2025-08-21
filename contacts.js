document.addEventListener('DOMContentLoaded', () => {
    const addContactButton = document.getElementById('addContact');

    const createDeleteButton = () => {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '×';
        deleteButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #8b5e3c;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 16px;
            cursor: pointer;
        `;
        deleteButton.addEventListener('click', (e) => {
            e.target.closest('.contact-card').remove();
            saveContactsToLocalStorage();
        });
        return deleteButton;
    };

    const createEditButton = (card) => {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 50px;
            background: #6e4f4f;
            color: #fff;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            font-size: 12px;
            cursor: pointer;
        `;
        editButton.addEventListener('click', () => {
            const name = prompt('Edit Name:', card.querySelector('h3').textContent);
            const company = prompt('Edit Company:', card.querySelector('p:nth-of-type(1)').textContent.replace('Company: ', ''));
            const notes = prompt('Edit Notes:', card.querySelector('.notes').textContent.replace('Notes: ', ''));
            const profilePicture = prompt('Edit Profile Picture URL:', card.querySelector('img').src);

            if (name) card.querySelector('h3').textContent = name;
            if (company) card.querySelector('p:nth-of-type(1)').textContent = `Company: ${company}`;
            if (notes) card.querySelector('.notes').textContent = `Notes: ${notes}`;
            if (profilePicture) card.querySelector('img').src = profilePicture;
        });
        return editButton;
    };

    const createContactPopup = (card) => {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const popupContent = document.createElement('div');
        popupContent.style.cssText = `
            background: #fff;
            padding: 40px;
            border-radius: 8px;
            max-width: 600px;
            width: 100%;
            height: 80%;
            text-align: center;
            position: relative;
            overflow-y: auto;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #8b5e3c;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 16px;
            cursor: pointer;
        `;
        closeButton.addEventListener('click', () => {
            popup.remove();
        });

        const profilePicture = document.createElement('img');
        profilePicture.src = card.querySelector('img').src;
        profilePicture.alt = 'Profile Picture';
        profilePicture.style.cssText = 'width: 200px; height: 200px; margin-bottom: 20px;';

        const name = document.createElement('h2');
        name.textContent = card.querySelector('h3').textContent;

        const company = document.createElement('p');
        company.textContent = `Company: ${card.querySelector('p:nth-of-type(1)').textContent.replace('Company: ', '')}`;

        const notes = document.createElement('p');
        notes.textContent = `Notes: ${card.querySelector('.notes').textContent.replace('Notes: ', '')}`;

        popupContent.appendChild(closeButton);
        popupContent.appendChild(profilePicture);
        popupContent.appendChild(name);
        popupContent.appendChild(company);
        popupContent.appendChild(notes);
        popup.appendChild(popupContent);

        document.body.appendChild(popup);
    };

    const saveContactsToLocalStorage = () => {
        const contacts = [];
        document.querySelectorAll('.contact-card').forEach(card => {
            contacts.push({
                name: card.querySelector('h3').textContent,
                company: card.querySelector('p:nth-of-type(1)').textContent.replace('Company: ', ''),
                notes: card.querySelector('.notes').textContent.replace('Notes: ', ''),
                profilePicture: card.querySelector('img').src
            });
        });
        localStorage.setItem('contacts', JSON.stringify(contacts));
    };

    const loadContactsFromLocalStorage = () => {
        const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        const container = document.querySelector('.container');
        container.innerHTML = ''; // Clear existing content to avoid duplication
        contacts.forEach(contact => {
            const newCard = document.createElement('div');
            newCard.className = 'contact-card';
            newCard.style.position = 'relative';
            newCard.innerHTML = `
                <img src='${contact.profilePicture}' alt='Profile Picture'>
                <div class='contact-details'>
                    <h3>${contact.name}</h3>
                    <p>Company: ${contact.company}</p>
                    <p class='notes'>Notes: ${contact.notes}</p>
                </div>
            `;
            const deleteButton = createDeleteButton();
            const editButton = createEditButton(newCard);
            newCard.appendChild(deleteButton);
            newCard.appendChild(editButton);
            container.appendChild(newCard);

            newCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('deleteContact') && !e.target.textContent.includes('Edit')) {
                    createContactPopup(newCard);
                }
            });
        });
    };

    document.addEventListener('DOMContentLoaded', () => {
        loadContactsFromLocalStorage();

        document.querySelectorAll('.contact-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('deleteContact') && !e.target.textContent.includes('Edit')) {
                    createContactPopup(card);
                }
            });
        });

        addContactButton.addEventListener('click', () => {
            const name = document.getElementById('newName').value;
            const company = document.getElementById('newCompany').value;
            const notes = document.getElementById('newNotes').value;

            if (name || company || notes) {
                const container = document.querySelector('.container');
                const newCard = document.createElement('div');
                newCard.className = 'contact-card';
                newCard.style.position = 'relative';
                newCard.innerHTML = `
                    <img src='https://via.placeholder.com/120' alt='Profile Picture'>
                    <div class='contact-details'>
                        <h3>${name || 'Unnamed'}</h3>
                        <p>Company: ${company || 'Unknown'}</p>
                        <p class='notes'>Notes: ${notes || 'No notes provided.'}</p>
                    </div>
                `;
                const deleteButton = createDeleteButton();
                const editButton = createEditButton(newCard);
                newCard.appendChild(deleteButton);
                newCard.appendChild(editButton);
                container.appendChild(newCard);

                newCard.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('deleteContact') && !e.target.textContent.includes('Edit')) {
                        createContactPopup(newCard);
                    }
                });

                document.getElementById('newName').value = '';
                document.getElementById('newCompany').value = '';
                document.getElementById('newNotes').value = '';

                saveContactsToLocalStorage();
            } else {
                alert('Please fill out at least one field to add a new contact.');
            }
        });

        document.querySelectorAll('.deleteContact').forEach(button => {
            button.addEventListener('click', () => {
                saveContactsToLocalStorage();
            });
        });
    });
});
