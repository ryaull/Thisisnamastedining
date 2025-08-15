import { db } from '/js/config/firebase.js';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from './env.js';
import { showModal, hideModal, showToast } from './ui.js';
import { tagCategories } from './config/tags.js';

const menuRef = collection(db, "menu");

let menuData = []; // Cache for sorting
let currentSort = { key: 'name', order: 'asc' };

function renderMenuTable() {
  const menuBody = document.getElementById("menuBody");
  menuBody.innerHTML = "";

  menuData.forEach(itemObj => {
    const { id, ...item } = itemObj;
    const row = menuBody.insertRow();
    row.className = 'fade-in';

    // Cell 1: Image
    const imgCell = row.insertCell();
    const img = document.createElement('img');
    img.src = item.imageUrl || '';
    img.width = 100;
    imgCell.appendChild(img);

    // Cell 2: Name
    const nameCell = row.insertCell();
    nameCell.textContent = item.name;

    // Cell 3: Price
    const priceCell = row.insertCell();
    priceCell.textContent = `${item.currency || ''} ${item.price ? item.price.toFixed(2) : 'N/A'}`;

    // Cell 4: Description
    const descCell = row.insertCell();
    descCell.textContent = item.description;

    // Cell 5: Tags
    const tagsCell = row.insertCell();
    tagsCell.textContent = item.tags ? item.tags.join(', ') : '';

    // Cell 6: Actions
    const actionsCell = row.insertCell();
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.className = 'edit-item-btn';

    editButton.addEventListener("click", () => showEditModal(item, id));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-item-btn';

    deleteButton.addEventListener("click", async () => {
      showDeleteConfirmModal(id, item.name);
    });

    actionsCell.append(editButton, deleteButton);
  });
}

export async function renderMenu() {
  const querySnapshot = await getDocs(menuRef);
  menuData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  sortMenu(); // Perform initial sort
  renderTags();
}

function sortMenu(key) {
  if (key) {
    if (currentSort.key === key) {
      currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
      currentSort.key = key;
      currentSort.order = 'asc';
    }
  }

  menuData.sort((a, b) => {
    const valA = a[currentSort.key];
    const valB = b[currentSort.key];
    let comparison = 0;
    if (valA > valB) comparison = 1;
    if (valA < valB) comparison = -1;
    return currentSort.order === 'desc' ? comparison * -1 : comparison;
  });

  renderMenuTable();
}

function renderTags() {
  const container = document.getElementById('tags-container');
  if (!container) return;
  container.innerHTML = '';
  for (const category in tagCategories) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'tag-category';
    const categoryTitle = document.createElement('h4');
    categoryTitle.textContent = category;
    categoryDiv.appendChild(categoryTitle);

    tagCategories[category].forEach(tag => {
      const tagButton = document.createElement('button');
      tagButton.type = 'button';
      tagButton.textContent = tag;
      tagButton.className = 'tag-btn';
      tagButton.dataset.tag = tag;
      tagButton.addEventListener('click', () => {
        tagButton.classList.toggle('selected');
        updateTagsInput();
      });
      categoryDiv.appendChild(tagButton);
    });
    container.appendChild(categoryDiv);
  }
}

function updateTagsInput() {
  const selectedTags = Array.from(document.querySelectorAll('#tags-container .tag-btn.selected')).map(btn => btn.dataset.tag);
  const tagsInput = document.getElementById('tags');
  if (tagsInput) {
    tagsInput.value = selectedTags.join(',');
  }

  const selectedTagsContainer = document.getElementById('selected-tags-container');
  if (selectedTagsContainer) {
    selectedTagsContainer.innerHTML = '';
    selectedTags.forEach(tag => {
      const tagElement = document.createElement('div');
      tagElement.className = 'selected-tag';
      tagElement.textContent = tag;
      selectedTagsContainer.appendChild(tagElement);
    });
  }
}

const clearTagsBtn = document.getElementById('clear-tags-btn');
if (clearTagsBtn) {
    clearTagsBtn.addEventListener('click', () => {
      document.querySelectorAll('#tags-container .tag-btn.selected').forEach(btn => btn.classList.remove('selected'));
      updateTagsInput();
    });
}

document.querySelectorAll('#menuTable th[data-sort]').forEach(header => {
  header.addEventListener('click', () => {
    sortMenu(header.dataset.sort);
  });
});

function showEditModal(item, id) {
  const template = document.getElementById('edit-item-template');
  const form = template.content.cloneNode(true).querySelector('form');

  console.log('Original item.tags:', item.tags);

  // Ensure item.tags is an array
  const itemTags = Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []);

  console.log('Processed itemTags for modal:', itemTags);

  // Populate form fields
  form.elements.name.value = item.name;
  form.elements.price.value = item.price;
  form.elements.currency.value = item.currency || 'USD'; // Set default or existing currency
  form.elements.description.value = item.description;
  form.elements.tags.value = itemTags.join(', ');

  console.log('Edit Modal Form Elements:');
  console.log('Name Input:', form.elements.name, 'Value:', form.elements.name.value);
  console.log('Price Input:', form.elements.price, 'Value:', form.elements.price.value);
  console.log('Currency Input:', form.elements.currency, 'Value:', form.elements.currency.value);
  console.log('Description Input:', form.elements.description, 'Value:', form.elements.description.value);
  console.log('Tags Input:', form.elements.tags, 'Value:', form.elements.tags.value);
  console.log('Image Input:', form.elements.image);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedData = {
      name: formData.get('name'),
      price: parseFloat(formData.get('price')),
      currency: formData.get('currency'), // Get currency from form
      description: formData.get('description'),
      tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag), // Ensure tags are cleaned
    };

    const imageFile = form.elements.image.files[0];
    if (imageFile) {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", imageFile);
      cloudinaryFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // WARNING: Using unsigned upload presets is insecure.
      // Implement signed uploads for production environments.
      try {
        const res = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: cloudinaryFormData
        });
        const data = await res.json();
        updatedData.imageUrl = data.secure_url;
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        showToast("Failed to upload new image.", "error");
        return; // Prevent updating item if image upload fails
      }
    } else {
      updatedData.imageUrl = item.imageUrl; // Keep existing image if no new one is selected
    }

    // IMPORTANT: In a production environment, all data modifications (add, update, delete)
    // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
    // to prevent unauthorized access and data corruption.
    try {
      await updateDoc(doc(db, "menu", id), updatedData);
      hideModal();
      await renderMenu(); // Re-fetch and render
      showToast("Item updated successfully!");
    } catch (error) {
      console.error("Error updating item:", error);
      showToast("Failed to update item.", "error");
    }
  });

  // Show the modal first
  showModal("Edit Menu Item", form);

  // Then, render categorized tags after the modal content is in the DOM
  
}

function showDeleteConfirmModal(id, name) {
  const template = document.getElementById('delete-item-template');
  const content = template.content.cloneNode(true);
  content.querySelector('strong').textContent = name;

  const confirmBtn = content.querySelector('.confirm-delete-btn');
  confirmBtn.addEventListener('click', async () => {
    try {
      await deleteDoc(doc(db, "menu", id));
      hideModal();
      await renderMenu(); // Re-fetch and render
      showToast("Item deleted.");
    } catch (error) {
      console.error("Error deleting item:", error);
      showToast("Failed to delete item.", "error");
    }
  });
  showModal("Confirm Deletion", content);
}

const addItemForm = document.getElementById("add-item-form");
if (addItemForm) {
    addItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("item");
      const priceInput = document.getElementById("price");
      const currencyInput = document.getElementById("currency-add");
      const descriptionInput = document.getElementById("description");
      const tagsInput = document.getElementById("tags");
      const imageInput = document.getElementById("image");
      const file = imageInput.files[0];
    
      const newItem = {
        name: nameInput.value,
        price: parseFloat(priceInput.value),
        currency: currencyInput.value, // Add currency to new item
        description: descriptionInput.value,
        tags: tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag), // Ensure tags are cleaned
        imageUrl: null
      };
    
      try {
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    
          // WARNING: Using unsigned upload presets is insecure.
          // Implement signed uploads for production environments.
          const res = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData
          });
          const data = await res.json();
          newItem.imageUrl = data.secure_url;
        }
    
        // IMPORTANT: In a production environment, all data modifications (add, update, delete)
        // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
        // to prevent unauthorized access and data corruption.
        await addDoc(menuRef, newItem);
    
        e.target.reset(); // Reset the form fields
        document.querySelectorAll('#tags-container .tag-btn.selected').forEach(btn => btn.classList.remove('selected'));
        updateTagsInput();
        showToast("New item added successfully!");
        await renderMenu(); // Re-fetch and render the menu dynamically instead of full page reload
      } catch (error) {
        console.error("Error adding item:", error);
        showToast("Failed to add item. See console for details.", "error");
      }
    });
}
