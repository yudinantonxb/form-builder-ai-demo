document.addEventListener("DOMContentLoaded", function () {

    // --- Global variables ---
    let generatedForm = null;
    let jsonEditor = null;

    // --- UI elements ---
    const loader = document.getElementById("loader");
    const errorContainer = document.getElementById("error-message");
    const copyButton = document.getElementById("copy-btn");
    const updateButton = document.getElementById("update-btn");
    const suggestionsContainer = document.getElementById("suggestions-pills");
    const editorContainer = document.getElementById("json-editor-container");

    // --- DHTMLX Widgets Initialization ---
    const controlForm = new dhx.Form("prompt-container", {
        css: "dhx_widget--bg_white",
        padding: 0,
        rows: [
            {
                type: "textarea",
                name: "prompt",
                placeholder: "e.g., A login form with email and password...",
                height: 200
            },
            {
                type: "button",
                name: "generate",
                text: "✨ Generate Form",
                size: "medium",
                view: "flat",
                color: "primary",
                full: true
            }
        ]
    });

    const generateButton = controlForm.getItem("generate");

    // --- Monaco Editor Initialization ---
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' } });
    require(['vs/editor/editor.main'], function () {
        jsonEditor = monaco.editor.create(editorContainer, {
            value: JSON.stringify({ message: "Your generated form config will appear here..." }, null, 4), language: 'json',
            theme: 'vs-dark',
            automaticLayout: true,
            readOnly: false,
            minimap: { enabled: false },
            wordWrap: 'on',
            padding: { top: 15 },
            scrollBeyondLastLine: false
        });
    });

    // --- Server-side communication ---
    const socket = io();
    socket.on('connect', () => console.log("Successfully connected to the server!"));

    // --- Main Logic (AI Generation) ---
    generateButton.events.on('click', () => {
        const userRequest = controlForm.getValue().prompt;
        if (!userRequest.trim()) {
            errorContainer.textContent = "Please enter a description for the form.";
            return;
        }

        generateButton.disable();
        loader.style.display = 'block';
        errorContainer.textContent = "";

        if (jsonEditor) {
            jsonEditor.setValue('{\n    "status": "Generating..."\n}');
        }
        if (generatedForm) {
            generatedForm.destructor();
            generatedForm = null;
        }

        socket.emit('generate_form', userRequest, (response) => {
            generateButton.enable();
            loader.style.display = 'none';

            if (response.success) {
                try {
                    const formConfig = JSON.parse(response.json);
                    const prettyJson = JSON.stringify(formConfig, null, 4);
                    if (jsonEditor) {
                        jsonEditor.setValue(prettyJson);
                    }
                    generatedForm = new dhx.Form("form-preview-container", formConfig);
                } catch (e) {
                    console.error("DHTMLX Form/JSON Error:", e);
                    errorContainer.textContent = `Error rendering form: ${e.message}`;
                    if (jsonEditor) {
                        jsonEditor.setValue(`// Error: Invalid JSON or DHTMLX config received\n// ${e.message}\n\n${response.json}`);
                    }
                }
            } else {
                errorContainer.textContent = `An error occurred: ${response.error}`;
                if (jsonEditor) {
                    jsonEditor.setValue(`// Server returned an error`);
                }
            }
        });
    });

    // --- Update from Editor Logic ---
    updateButton.addEventListener('click', () => {
        if (!jsonEditor) return;

        const editedCode = jsonEditor.getValue();
        errorContainer.textContent = "";

        try {
            const formConfig = JSON.parse(editedCode);
            if (generatedForm) {
                generatedForm.destructor();
            }
            generatedForm = new dhx.Form("form-preview-container", formConfig);
            console.log("Form updated successfully from editor content.");
        } catch (e) {
            console.error("Invalid JSON syntax:", e);
            errorContainer.textContent = `Invalid JSON syntax. Error: ${e.message}`;
        }
    });

    // --- Prompt Suggestions Logic ---
const promptSuggestions = [
"A contact form with fields for name, email, textarea and submit button",
"Two columns: first a name and address input, second a select for country and a datepicker.",
"fieldset: input, datepicker; fieldset: avatar, combo, slider; time picker, color picker, select, fieldser: textarea, simple vault; text, radiogroup, checkbox group, checkbox, radio, toggle, toggleGroup",
`col 1 fieldset: input, datepicker; 
col 2 fieldset: checkbox, radio, toggle, toggleGroup;
col 3 fieldset: textarea, simple vault, text, radiogroup, checkbox group; 
col 4 fieldset: avatar, combo, slider, time picker, color picker, select; 
col 5 fieldset: toggle, toggleGroup`,
`row 1
column 1: input width 200, column 2: selectbox width 200, 
row 2
combo
row 3
column 1: 
column 1 datepicker width 200, column 2: timepicker width 200
row 4
slider; 
row 5:
textarea,  
row 6   
submit button`
];
    promptSuggestions.forEach(promptText => {
        const pill = document.createElement('button');
        pill.className = 'prompt-pill';
        pill.textContent = promptText;
        pill.addEventListener('click', () => {
            controlForm.getItem("prompt").setValue(promptText);
        });
        suggestionsContainer.appendChild(pill);
    });

    // --- Copy-to-Clipboard Logic ---
    copyButton.addEventListener('click', () => {
        if (!jsonEditor) return;
        const codeToCopy = jsonEditor.getValue();
        navigator.clipboard.writeText(codeToCopy).then(() => {
            copyButton.textContent = "Copied!";
            setTimeout(() => {
                copyButton.textContent = "Copy";
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
});