import { db } from '/js/config/firebase.js';
import { tagCategories as predefinedCategorizedTags } from '/js/config/tags.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast, showModal, hideModal } from './ui.js';

const customTagsRef = collection(db, "customTags");
export let customCategorizedTags = {};
let selectedCategory = null;

// Load custom tags from Firestore
export async function loadCustomTags() {
    const querySnapshot = await getDocs(customTagsRef);
    customCategorizedTags = {};
    querySnapshot.forEach(docSnap => {
        customCategorizedTags[docSnap.id] = docSnap.data().tags;
    });
    window.customCategorizedTags = customCategorizedTags;
}

// Render the list of categories in the sidebar
function renderCategoryList() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    const allCategories = { ...predefinedCategorizedTags, ...customCategorizedTags };

    for (const category in allCategories) {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.textContent = category;
        categoryItem.dataset.category = category;

        if (selectedCategory === category) {
            categoryItem.classList.add('active');
        }

        // Add a delete button for custom categories
        if (!predefinedCategorizedTags.hasOwnProperty(category)) {
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-category-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                confirmDeleteCategory(category);
            };
            categoryItem.appendChild(deleteBtn);
        }
        
        categoryItem.onclick = () => {
            selectedCategory = category;
            renderCategoryList();
            renderTagsForCategory(category);
        };
        categoryList.appendChild(categoryItem);
    }
}

// Render tags for the selected category
function renderTagsForCategory(category) {
    const tagsDisplayArea = document.getElementById('tags-display-area');
    const selectedCategoryTitle = document.getElementById('selected-category-title');
    const tagsList = document.getElementById('tags-list');
    
    selectedCategoryTitle.textContent = category;
    tagsList.innerHTML = '';

    const allCategories = { ...predefinedCategorizedTags, ...customCategorizedTags };
    const tags = allCategories[category] || [];

    tags.forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-item';
        tagItem.textContent = tag;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-tag-btn';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            confirmDeleteTag(category, tag);
        };
        tagItem.appendChild(deleteBtn);
        tagsList.appendChild(tagItem);
    });
}

// Confirmation dialog for deleting a category
function confirmDeleteCategory(category) {
    showModal('Confirm Deletion', `<p>Are you sure you want to delete the category "<strong>${category}</strong>" and all its tags?</p>`, () => {
        deleteCategory(category);
        hideModal();
    });
}

// Confirmation dialog for deleting a tag
function confirmDeleteTag(category, tag) {
    showModal('Confirm Deletion', `<p>Are you sure you want to delete the tag "<strong>${tag}</strong>" from "<strong>${category}</strong>"?</p>`, () => {
        deleteTag(category, tag);
        hideModal();
    });
}

// Delete a category
async function deleteCategory(category) {
    // IMPORTANT: In a production environment, all data modifications (add, update, delete)
    // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
    // to prevent unauthorized access and data corruption.
    try {
        await deleteDoc(doc(db, "customTags", category));
        showToast(`Category "${category}" deleted.`);
        selectedCategory = null;
        await loadCustomTags();
        renderCategoryList();
        renderTagsForCategory(null);
    } catch (error) {
        console.error("Error deleting category:", error);
        showToast("Failed to delete category.", "error");
    }
}

// Delete a tag
async function deleteTag(category, tag) {
    const isPredefined = predefinedCategorizedTags.hasOwnProperty(category) && predefinedCategorizedTags[category].includes(tag);
    if (isPredefined) {
        showToast("Cannot delete tags from predefined categories.", "error");
        return;
    }

    const currentTags = (customCategorizedTags[category] || []).filter(t => t !== tag);
    // IMPORTANT: In a production environment, all data modifications (add, update, delete)
    // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
    // to prevent unauthorized access and data corruption.
    try {
        await updateDoc(doc(db, "customTags", category), { tags: currentTags });
        showToast(`Tag "${tag}" deleted from ${category}.`);
        await loadCustomTags();
        renderTagsForCategory(category);
    } catch (error) {
        console.error("Error deleting tag:", error);
        showToast("Failed to delete tag.", "error");
    }
}

// Setup event listeners and initial rendering
export async function setupAdminTags() {
    await loadCustomTags();
    renderCategoryList();
    if (!selectedCategory) {
        document.getElementById('tags-display-area').style.display = 'none';
    }

    document.getElementById('add-category-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newCategoryName = document.getElementById('newCategoryName').value.trim();
        if (newCategoryName && !predefinedCategorizedTags[newCategoryName] && !customCategorizedTags[newCategoryName]) {
            // IMPORTANT: In a production environment, all data modifications (add, update, delete)
            // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
            // to prevent unauthorized access and data corruption.
            try {
                await setDoc(doc(db, "customTags", newCategoryName), { tags: [] });
                showToast(`Category "${newCategoryName}" added.`);
                document.getElementById('newCategoryName').value = '';
                await loadCustomTags();
                renderCategoryList();
            } catch (error) {
                console.error("Error adding category:", error);
                showToast("Failed to add category.", "error");
            }
        } else {
            showToast("Category already exists or is a predefined category.", "error");
        }
    });

    document.getElementById('add-tag-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newTagName = document.getElementById('newTagName').value.trim();
        if (selectedCategory && newTagName) {
            const allCategories = { ...predefinedCategorizedTags, ...customCategorizedTags };
            const currentTags = allCategories[selectedCategory] || [];
            if (!currentTags.includes(newTagName)) {
                const updatedTags = [...(customCategorizedTags[selectedCategory] || []), newTagName];
                // IMPORTANT: In a production environment, all data modifications (add, update, delete)
                // should be validated and authorized on a secure backend (e.g., Firebase Cloud Functions)
                // to prevent unauthorized access and data corruption.
                try {
                    await setDoc(doc(db, "customTags", selectedCategory), { tags: updatedTags }, { merge: true });
                    showToast(`Tag "${newTagName}" added to ${selectedCategory}.`);
                    document.getElementById('newTagName').value = '';
                    await loadCustomTags();
                    renderTagsForCategory(selectedCategory);
                } catch (error) {
                    console.error("Error adding tag:", error);
                    showToast("Failed to add tag.", "error");
                }
            } else {
                showToast("Tag already exists in this category.", "error");
            }
        } else if (!selectedCategory) {
            showToast("Please select a category first.", "error");
        }
    });
}