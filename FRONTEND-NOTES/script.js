const API_URL = "http://localhost:5000/api/notes";

// DOM Elements
const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const notesContainer = document.getElementById("notesContainer");
const notesCount = document.getElementById("notesCount");
const searchInput = document.getElementById("searchInput");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const formTitleText = document.getElementById("formTitleText");

// Custom Modal Elements
const deleteModalBackdrop = document.getElementById("deleteModalBackdrop");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

// Toasts Container
const toastContainer = document.getElementById("toastContainer");

let editId = null;
let allNotes = [];
let noteToDeleteId = null;

// Parse Hidden Theme from Note Content
function parseNoteTheme(content, id) {
    const match = content.match(/<!--theme:(\w+)-->$/);
    if (match && match[1]) {
        const theme = match[1];
        const cleanContent = content.replace(/<!--theme:\w+-->$/, '').trim();
        return { theme, content: cleanContent };
    }
    
    // Stable fallback color based on note ID hash
    const themes = ['indigo', 'rose', 'emerald', 'amber', 'cyan', 'violet'];
    const hash = Array.from(id || '').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const theme = themes[hash % themes.length];
    return { theme, content };
}

// Format Date
function formatNoteDate(dateString) {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    
    return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render Notes
function renderNotes(notes) {
    notesContainer.innerHTML = "";
    notesCount.textContent = notes.length;

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3>No notes found</h3>
                <p>Create a new note or adjust your search filter.</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        const { theme, content: cleanContent } = parseNoteTheme(note.content, note._id);
        const formattedDate = formatNoteDate(note.createdAt || note.updatedAt);

        // Escape content safely for onclick handler parameters
        const escapedTitle = note.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const escapedContent = cleanContent.replace(/'/g, "\\'").replace(/"/g, '&quot;');

        const noteEl = document.createElement("div");
        noteEl.className = `note theme-${theme}`;
        noteEl.id = `note-${note._id}`;
        
        noteEl.innerHTML = `
            <div class="note-header">
                <h3>${note.title}</h3>
                <span class="note-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${formattedDate}
                </span>
            </div>
            <p class="note-content">${cleanContent}</p>

            <div class="actions">
                <button
                    class="icon-btn icon-btn-edit"
                    onclick="editNote('${note._id}', '${escapedTitle}', '${escapedContent}', '${theme}')"
                    title="Edit Note"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>

                <button
                    class="icon-btn icon-btn-delete"
                    onclick="triggerDeleteNote('${note._id}')"
                    title="Delete Note"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;
        notesContainer.appendChild(noteEl);
    });
}

// Get Notes from backend
async function getNotes() {
    try {
        const response = await fetch(API_URL);
        allNotes = await response.json();
        filterNotes();
    } catch(error) {
        console.error(error);
        showToast("Failed to fetch notes from server.", "error");
    }
}

// Filter Notes dynamically based on Search Input
function filterNotes() {
    const query = searchInput.value.toLowerCase().trim();
    if (query === "") {
        renderNotes(allNotes);
    } else {
        const filtered = allNotes.filter(note => {
            const { content: cleanContent } = parseNoteTheme(note.content, note._id);
            return note.title.toLowerCase().includes(query) || cleanContent.toLowerCase().includes(query);
        });
        renderNotes(filtered);
    }
}

// Search Input Listener
searchInput.addEventListener("input", filterNotes);

// Toast Notification Manager
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '';
    if (type === 'success') {
        icon = `<svg class="toast-icon-success" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === 'error') {
        icon = `<svg class="toast-icon-error" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
    } else {
        icon = `<svg class="toast-icon-info" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('transitionend', () => {
            toast.remove();
        });
    }, 3000);
}

// Add or Update Note
noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedThemeOption = document.querySelector('input[name="noteTheme"]:checked');
    const selectedTheme = selectedThemeOption ? selectedThemeOption.value : "indigo";

    // Serialize theme inside notes content
    const serializedContent = `${contentInput.value.trim()} <!--theme:${selectedTheme}-->`;

    const noteData = {
        title: titleInput.value.trim(),
        content: serializedContent
    };

    try {
        if (editId) {
            const response = await fetch(`${API_URL}/${editId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                showToast("Note updated successfully!", "success");
            } else {
                throw new Error("Failed to update note");
            }
            
            // Reset edit state
            exitEditMode();
        } else {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(noteData)
            });

            if (response.ok) {
                showToast("New note created!", "success");
            } else {
                throw new Error("Failed to create note");
            }
        }

        noteForm.reset();
        
        // Ensure default theme option is selected after resetting
        const defaultRadio = document.querySelector('input[name="noteTheme"][value="indigo"]');
        if (defaultRadio) defaultRadio.checked = true;

        getNotes();

    } catch(error) {
        console.error(error);
        showToast(error.message || "Something went wrong.", "error");
    }
});

// Delete Trigger (Custom Modal)
function triggerDeleteNote(id) {
    noteToDeleteId = id;
    deleteModalBackdrop.classList.add("active");
}

// Cancel Delete Button
cancelDeleteBtn.addEventListener("click", () => {
    deleteModalBackdrop.classList.remove("active");
    noteToDeleteId = null;
});

// Confirm Delete Button
confirmDeleteBtn.addEventListener("click", async () => {
    if (!noteToDeleteId) return;
    
    // Hide Modal immediately
    deleteModalBackdrop.classList.remove("active");
    
    const targetId = noteToDeleteId;
    noteToDeleteId = null;

    // Apply exit animation first on Note Card
    const noteEl = document.getElementById(`note-${targetId}`);
    if (noteEl) {
        noteEl.classList.add("exit-animation");
    }

    // Wait for animation to finish before calling API
    setTimeout(async () => {
        try {
            const response = await fetch(`${API_URL}/${targetId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                showToast("Note deleted successfully.", "info");
                // Remove note from local array and re-render
                allNotes = allNotes.filter(n => n._id !== targetId);
                filterNotes();
            } else {
                throw new Error("Failed to delete note");
            }
        } catch(error) {
            console.error(error);
            showToast("Failed to delete note.", "error");
            getNotes(); // Refresh note list from DB on failure
        }
    }, 400);
});

// Click outside modal to close
deleteModalBackdrop.addEventListener("click", (e) => {
    if (e.target === deleteModalBackdrop) {
        deleteModalBackdrop.classList.remove("active");
        noteToDeleteId = null;
    }
});

// Edit Note
function editNote(id, title, content, theme) {
    titleInput.value = title;
    contentInput.value = content;
    editId = id;

    // Set correct theme radio input
    const themeRadio = document.querySelector(`input[name="noteTheme"][value="${theme}"]`);
    if (themeRadio) themeRadio.checked = true;

    // Enhance UI to show Edit mode
    noteForm.classList.add("editing");
    formTitleText.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Edit Note
    `;
    submitBtn.querySelector("span").textContent = "Update Note";
    cancelEditBtn.style.display = "inline-flex";

    // Scroll smoothly to form container
    window.scrollTo({
        top: noteForm.offsetTop - 40,
        behavior: 'smooth'
    });
}

// Exit Edit Mode helper
function exitEditMode() {
    editId = null;
    noteForm.classList.remove("editing");
    formTitleText.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Create a Note
    `;
    submitBtn.querySelector("span").textContent = "Save Note";
    cancelEditBtn.style.display = "none";
    
    noteForm.reset();
    const defaultRadio = document.querySelector('input[name="noteTheme"][value="indigo"]');
    if (defaultRadio) defaultRadio.checked = true;
}

// Cancel Edit Button click event
cancelEditBtn.addEventListener("click", exitEditMode);

// Initialize Application
getNotes();