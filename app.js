// Helper function to get label class and text by category
function getCategoryLabel(category) {
    switch (category) {
        case 'mandatory':
            return { class: 'label label-mandatory', text: 'Mandatory' };
        case 'optional':
            return { class: 'label label-optional', text: 'Optional' };
        case 'future':
            return { class: 'label label-future', text: 'Future' };
        default:
            return { class: 'label label-other', text: 'Other' };
    }
}
/**
 * Enterprise Agentic AI Production Readiness Checklist Wizard
 * Fixed version with proper tab navigation
 */

// Application state management
const AppState = {
    currentTab: 'overview',
    checklistData: null,
    formData: {
        metadata: {},
        executive: {},
        checklist: {},
        exceptions: {},
        comments: {},
        appendices: {},
        signoffs: {},
        reviewHistory: []
    },
    tabOrder: [
        'overview', 'executive', 'architecture', 'security', 'performance', 
        'monitoring', 'logging', 'testing', 'deployment', 'incident', 
        'documentation', 'compliance', 'business', 'validation', 'appendices', 'export'
    ],
    currentTheme: null,
    isLoading: false
};

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        console.log('Initializing AI Production Readiness Wizard...');
        
        // Show loading indicator
        showLoading();
        
        // Set up event listeners first
        setupEventListeners();
        
        // Initialize theme
        initializeTheme();
        
        // Inject category label CSS
        injectCategoryLabelCSS();
        
        // Load checklist data
        await loadChecklistData();
        
        // Initialize form data
        initializeFormData();
        
        // Render checklist sections
        renderChecklistSections();
        
        // Initialize tab navigation
        switchToTab('overview');
        
        // Update progress indicators
        updateAllProgress();
        
        // Hide loading indicator
        hideLoading();
        
        // Show success message
        showToast('Checklist wizard loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to initialize wizard:', error);
        showToast('Failed to load checklist data. Using fallback.', 'error');
        loadFallbackData();
        switchToTab('overview');
        updateAllProgress();
        hideLoading();
    }
}

/**
 * Initialize theme system
 */
function initializeTheme() {
    const html = document.documentElement;
    const currentScheme = html.getAttribute('data-color-scheme');
    
    if (!currentScheme) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        AppState.currentTheme = prefersDark ? 'dark' : 'light';
        html.setAttribute('data-color-scheme', AppState.currentTheme);
    } else {
        AppState.currentTheme = currentScheme;
    }
    
    // Set initial theme icon
    updateThemeIcon();
}

/**
 * Update theme icon
 */
function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = AppState.currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

/**
 * Inject category label CSS
 */
function injectCategoryLabelCSS() {
    if (!document.getElementById('category-label-style')) {
        const style = document.createElement('style');
        style.id = 'category-label-style';
        style.innerHTML = `
            .label {
                display: inline-block;
                padding: 3px 12px;
                margin-left: 12px;
                margin-right: 2px;
                border-radius: 12px;
                font-weight: 500;
                font-style: italic;
                color: #fff !important;
                font-size: 0.85em;
                border: 1px solid rgba(0,0,0,0.08);
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                cursor: pointer;
                transition: background 0.2s, box-shadow 0.2s;
                outline: none;
                letter-spacing: 0.01em;
                vertical-align: middle;
                min-width: 70px;
                text-align: center;
            }
            .label-mandatory { background: linear-gradient(135deg, #e53935, #d32f2f) !important; }
            .label-optional  { background: linear-gradient(135deg, #43a047, #388e3c) !important; }
            .label-future    { background: linear-gradient(135deg, #1e88e5, #1976d2) !important; }
            .label-other     { background: linear-gradient(135deg, #757575, #616161) !important; }
            .label:hover, .label:focus {
                box-shadow: 0 2px 6px rgba(0,0,0,0.12);
                transform: translateY(-1px);
            }
            
            .exception-btn {
                background: linear-gradient(135deg, #ff9800, #f57c00);
                color: white;
                border: none;
                padding: 2px 8px;
                border-radius: 8px;
                font-size: 0.75em;
                font-weight: 500;
                margin-left: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .exception-btn:hover {
                background: linear-gradient(135deg, #f57c00, #ef6c00);
                transform: translateY(-1px);
            }
            
            .exception-badge {
                background: linear-gradient(135deg, #4caf50, #388e3c);
                color: white;
                padding: 2px 8px;
                border-radius: 8px;
                font-size: 0.75em;
                font-weight: 500;
                margin-left: 8px;
                display: inline-block;
            }
            
            .has-exception {
                border-left: 4px solid #4caf50;
                background: rgba(76, 175, 80, 0.05);
            }
            
            .exception-details {
                margin-top: 8px;
                padding: 8px;
                background: rgba(255, 152, 0, 0.1);
                border-radius: 6px;
                font-size: 0.85em;
                color: #666;
            }
            
            .exception-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
            }
            
            .exception-modal-content {
                background: white;
                margin: 15% auto;
                padding: 20px;
                border-radius: 12px;
                width: 80%;
                max-width: 500px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            }
            
            .exception-modal h3 {
                margin-top: 0;
                color: #333;
            }
            
            .exception-form-group {
                margin-bottom: 15px;
            }
            
            .exception-form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #555;
            }
            
            .exception-form-group input,
            .exception-form-group textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .exception-form-group textarea {
                height: 80px;
                resize: vertical;
            }
            
            .exception-modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .exception-modal-buttons button {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }
            
            .exception-save-btn {
                background: #4caf50;
                color: white;
            }
            
            .exception-cancel-btn {
                background: #f5f5f5;
                color: #666;
            }
            
            .comment-btn {
                background: linear-gradient(135deg, #2196f3, #1976d2);
                color: white;
                border: none;
                padding: 2px 8px;
                border-radius: 8px;
                font-size: 0.75em;
                font-weight: 500;
                margin-left: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            .comment-btn:hover {
                background: linear-gradient(135deg, #1976d2, #1565c0);
                transform: translateY(-1px);
            }
            
            .comment-display {
                margin-top: 8px;
                padding: 10px;
                background: rgba(33, 150, 243, 0.05);
                border-left: 3px solid #2196f3;
                border-radius: 6px;
                font-size: 0.9em;
            }
            
            .comment-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 5px;
            }
            
            .comment-delete-btn {
                background: #f44336;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }
            .comment-delete-btn:hover {
                background: #d32f2f;
            }
            
            .comment-text {
                color: #333;
                line-height: 1.4;
                margin-bottom: 5px;
                white-space: pre-wrap;
            }
            
            .comment-meta {
                font-size: 0.8em;
                color: #666;
                font-style: italic;
            }
            
            .comment-modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
            }
            
            .comment-modal-content {
                background: white;
                margin: 15% auto;
                padding: 20px;
                border-radius: 12px;
                width: 80%;
                max-width: 500px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            }
            
            .comment-modal h3 {
                margin-top: 0;
                color: #333;
            }
            
            .comment-form-group {
                margin-bottom: 15px;
            }
            
            .comment-form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #555;
            }
            
            .comment-form-group input,
            .comment-form-group textarea {
                width: 100%;
                padding: 8px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .comment-form-group textarea {
                height: 100px;
                resize: vertical;
            }
            
            .comment-modal-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
            }
            
            .comment-modal-buttons button {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
            }
            
            .comment-save-btn {
                background: #2196f3;
                color: white;
            }
            
            .comment-cancel-btn {
                background: #f5f5f5;
                color: #666;
            }
            
            .category-stats-container {
                margin-top: 30px;
                padding: 20px;
                background: var(--color-surface);
                border-radius: 12px;
                border: 1px solid var(--color-border);
            }
            
            .category-stats-container h3 {
                margin-top: 0;
                margin-bottom: 20px;
                color: var(--color-text);
                font-size: 1.2em;
                font-weight: 600;
            }
            
            .stats-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.9em;
                background: var(--color-surface);
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            }
            
            .stats-table th {
                background: var(--color-primary);
                color: white;
                padding: 12px 8px;
                text-align: center;
                font-weight: 600;
                font-size: 0.85em;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .stats-table td {
                padding: 12px 8px;
                border-bottom: 1px solid var(--color-border);
                vertical-align: middle;
            }
            
            .stats-table tbody tr:hover {
                background: rgba(var(--color-teal-500-rgb), 0.05);
            }
            
            .stats-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            .category-label-inline {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-weight: 500;
                font-style: italic;
                color: #fff;
                font-size: 0.8em;
                text-transform: capitalize;
            }
            
            .progress-cell {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .mini-progress-bar {
                flex: 1;
                height: 6px;
                background: rgba(0,0,0,0.1);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .mini-progress-fill {
                height: 100%;
                background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
                transition: width 0.3s ease;
            }
            
            .status-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 0.75em;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-complete {
                background: linear-gradient(135deg, #4caf50, #388e3c);
                color: white;
            }
            
            .status-good {
                background: linear-gradient(135deg, #8bc34a, #689f38);
                color: white;
            }
            
            .status-warning {
                background: linear-gradient(135deg, #ff9800, #f57c00);
                color: white;
            }
            
            .status-poor {
                background: linear-gradient(135deg, #f44336, #d32f2f);
                color: white;
            }
            
            .status-low-priority {
                background: linear-gradient(135deg, #ff9800, #f57c00);
                color: white;
            }
            
            @media (max-width: 768px) {
                .stats-table {
                    font-size: 0.8em;
                }
                
                .stats-table th,
                .stats-table td {
                    padding: 8px 4px;
                }
                
                .category-label-inline {
                    font-size: 0.7em;
                    padding: 2px 8px;
                }
            }
        `;
        document.head.appendChild(style);
        console.log('Category label CSS injected successfully');
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = btn.getAttribute('data-tab');
            if (tabId) {
                console.log('Tab button clicked:', tabId);
                switchToTab(tabId);
            }
        });
    });
    
    // Previous/Next navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigatePrevious();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateNext();
        });
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();
        });
    }
    
    // Export buttons
    setupExportListeners();
    
    // Form change listeners
    document.addEventListener('change', handleFormChange);
    document.addEventListener('input', handleFormInput);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

/**
 * Setup export button listeners
 */
function setupExportListeners() {
    const exportWordBtn = document.getElementById('exportWordBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    
    if (exportWordBtn) {
        exportWordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportToDocument('docx');
        });
    }
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', (e) => {
            e.preventDefault();
            exportToDocument('pdf');
        });
    }
}

/**
 * Load comprehensive checklist data
 */
async function loadChecklistData() {
    // External URLs commented out - using local JSON file instead
   
    //const dataUrl = 'https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/54750e8e8fd81f055a4730a58c4bd273/7a328bff-aa60-4d0c-bb29-0acf534fd71a/fb059c0e.json';
    
    // Use local JSON file instead
    const dataUrl = './complete_checklist_comprehensive.json';
    
    try {
        console.log('Loading checklist data from local file...');
        const response = await fetch(dataUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
    AppState.checklistData = await response.json();
    console.log('Loaded checklist data successfully from local file');
    console.log('[DEBUG] Checklist Data:', AppState.checklistData);
        
    } catch (error) {
        console.error('Error loading checklist data:', error);
        throw error;
    }
}

/**
 * Load fallback data if external data fails
 */
function loadFallbackData() {
    AppState.checklistData = {
        sections: [
            {
                id: "system_architecture",
                title: "System Architecture",
                description: "Architecture and design considerations",
                items: [
                    {
                        id: "arch_001",
                        text: "Architecture design documented",
                        description: "Complete system architecture has been documented and reviewed"
                    },
                    {
                        id: "arch_002", 
                        text: "Scalability requirements defined",
                        description: "Performance and scalability requirements have been clearly defined"
                    },
                    {
                        id: "arch_003",
                        text: "Data flow diagrams created",
                        description: "Comprehensive data flow diagrams showing AI model interactions"
                    }
                ]
            },
            {
                id: "security_compliance",
                title: "Security & Compliance", 
                description: "Security and compliance requirements",
                items: [
                    {
                        id: "sec_001",
                        text: "Security review completed",
                        description: "Comprehensive security review has been conducted"
                    },
                    {
                        id: "sec_002",
                        text: "Data privacy compliance verified",
                        description: "All data privacy and compliance requirements have been verified"
                    },
                    {
                        id: "sec_003",
                        text: "Access controls implemented",
                        description: "Proper access controls and authentication mechanisms are in place"
                    }
                ]
            },
            {
                id: "performance_scalability",
                title: "Performance & Scalability",
                description: "Performance testing and scalability validation",
                items: [
                    {
                        id: "perf_001",
                        text: "Load testing completed",
                        description: "Comprehensive load testing has been performed"
                    },
                    {
                        id: "perf_002",
                        text: "Performance benchmarks established",
                        description: "Clear performance benchmarks and SLAs have been defined"
                    }
                ]
            }
        ]
    };
    
    initializeFormData();
    renderChecklistSections();
}

/**
 * Initialize form data structure
 */
function initializeFormData() {
    // Initialize metadata fields
    const metadataFields = ['project_name', 'version_release', 'date', 'dri', 'reviewers', 'target_production_date', 'rollback_deadline'];
    metadataFields.forEach(field => {
        if (!AppState.formData.metadata[field]) {
            AppState.formData.metadata[field] = '';
        }
    });
    
    // Initialize executive summary fields
    const executiveFields = ['brief_description', 'business_impact', 'key_risks', 'success_criteria'];
    executiveFields.forEach(field => {
        if (!AppState.formData.executive[field]) {
            AppState.formData.executive[field] = '';
        }
    });
    
    // Initialize appendices
    const appendixFields = [
        'appendix_a_critical_dependencies',
        'appendix_b_performance_benchmarks', 
        'appendix_c_security_review_results',
        'appendix_d_test_results_summary',
        'appendix_e_rollback_procedures'
    ];
    appendixFields.forEach(field => {
        if (!AppState.formData.appendices[field]) {
            AppState.formData.appendices[field] = '';
        }
    });
    
    // Initialize sign-offs
    const signoffFields = ['engineering_manager', 'security_team', 'infrastructure_sre', 'product_manager', 'compliance_officer'];
    signoffFields.forEach(field => {
        if (!AppState.formData.signoffs[field]) {
            AppState.formData.signoffs[field] = '';
        }
    });
    
    // Initialize checklist items
    if (AppState.checklistData && AppState.checklistData.sections) {
        AppState.checklistData.sections.forEach(section => {
            // Initialize direct section items
            if (section.items) {
                section.items.forEach(item => {
                    if (!AppState.formData.checklist[item.id]) {
                        AppState.formData.checklist[item.id] = false;
                    }
                });
            }
            // Initialize items inside subsections
            if (section.subsections && Array.isArray(section.subsections)) {
                section.subsections.forEach(subsection => {
                    if (subsection.items) {
                        subsection.items.forEach(item => {
                            if (!AppState.formData.checklist[item.id]) {
                                AppState.formData.checklist[item.id] = false;
                            }
                        });
                    }
                });
            }
        });
        console.log('[DEBUG] Checklist Items Initialized:', Object.keys(AppState.formData.checklist));
    }
    
    // Initialize review history
    if (AppState.formData.reviewHistory.length === 0) {
        AppState.formData.reviewHistory = [
            { date: '', reviewer: '', comments: '' },
            { date: '', reviewer: '', comments: '' },
            { date: '', reviewer: '', comments: '' }
        ];
    }
}

/**
 * Render checklist sections in their respective tabs
 */
function renderChecklistSections() {
    if (!AppState.checklistData || !AppState.checklistData.sections) {
        console.log('No checklist data to render');
        return;
    }
    
    // Map sections to tabs
    const sectionTabMap = {
        '1-system-architecture-and-design': 'architecture',
        '2-security-and-compliance': 'security',
        '3-performance-and-scalability': 'performance',
        '4-monitoring-and-observability': 'monitoring',
        '5-logging-and-tracing': 'logging',
        '6-testing-and-quality-assurance': 'testing',
        '7-deployment-and-rollback': 'deployment',
        '8-incident-response-and-recovery': 'incident',
        '9-documentation-and-knowledge-transfer': 'documentation',
        '10-compliance-and-governance': 'compliance',
        '11-business-readiness': 'business',
        '12-final-validation': 'validation'
    };
    
    Object.entries(sectionTabMap).forEach(([sectionId, tabId]) => {
        const section = AppState.checklistData.sections.find(sec => sec.id === sectionId);
        const container = document.querySelector(`#tab-${tabId} .checklist-container`);
        console.log(`[DEBUG] Tab: ${tabId}, SectionId: ${sectionId}, Found section:`, section);
        if (container) {
            let html = '';
            if (section && Array.isArray(section.subsections) && section.subsections.length > 0) {
                section.subsections.forEach(subsection => {
                    html += renderChecklistSubsection(subsection);
                });
                container.innerHTML = html;
                console.log(`[DEBUG] Rendered ${section.subsections.length} subsections for section ${section.id} in tab ${tabId}`);
            } else {
                html = '<div class="checklist-section-empty">No checklist items found for this section.</div>';
                container.innerHTML = html;
                console.log(`[DEBUG] No subsections/items found for section ${sectionId} in tab ${tabId}`);
            }
        } else {
            console.log(`[DEBUG] Container not found for tab ${tabId}`);
        }
    });
    
    // Update export summary after rendering sections
    updateExportSummary();
}

/**
 * Render a single checklist subsection
 */
function renderChecklistSubsection(subsection) {
    let html = `
        <div class="checklist-section">
            <div class="checklist-section-header">
                <h3 class="checklist-section-title">${subsection.title}</h3>
            </div>
            <div class="checklist-items">
    `;
    if (subsection.items && subsection.items.length > 0) {
        subsection.items.forEach(item => {
            const isChecked = AppState.formData.checklist[item.id] || false;
            const labelInfo = getCategoryLabel(item.category);
            const hasException = AppState.formData.exceptions && AppState.formData.exceptions[item.id];
            const hasComment = AppState.formData.comments && AppState.formData.comments[item.id];
            const isMandatory = item.category === 'mandatory';
            
            html += `
                <div class="checklist-item ${isChecked ? 'completed' : ''} ${hasException ? 'has-exception' : ''}" data-item-id="${item.id}">
                    <input type="checkbox" 
                           id="${item.id}" 
                           name="${item.id}"
                           ${isChecked ? 'checked' : ''}>
                    <div class="checklist-item-content">
                        <label for="${item.id}" class="checklist-item-title">${item.text}</label>
                        <span class="${labelInfo.class}">${labelInfo.text}</span>
                        ${isMandatory && !hasException ? `<button class="exception-btn" onclick="showExceptionModal('${item.id}', '${item.text.replace(/'/g, "\\'")}')">Exception</button>` : ''}
                        ${hasException ? `<div class="exception-badge">Exception Granted</div>
                            <button class="exception-btn" style="background: linear-gradient(135deg, #f44336, #d32f2f); margin-left: 4px;" onclick="removeException('${item.id}')">Remove</button>` : ''}
                        <button class="comment-btn" onclick="showCommentModal('${item.id}', '${item.text.replace(/'/g, "\\'")}')">
                            ${hasComment ? 'Edit Comment' : 'Add Comment'}
                        </button>
                        <p class="checklist-item-description">${item.description || ''}</p>
                        ${hasComment ? `<div class="comment-display">
                            <div class="comment-header">
                                <strong>Comment:</strong>
                                <button class="comment-delete-btn" onclick="removeComment('${item.id}')" title="Delete comment">×</button>
                            </div>
                            <div class="comment-text">${hasComment.text}</div>
                            <div class="comment-meta">By: ${hasComment.author} | ${hasComment.date}</div>
                        </div>` : ''}
                        ${hasException ? `<div class="exception-details">
                            <strong>Exception Reason:</strong> ${hasException.reason}<br>
                            <strong>Approved by:</strong> ${hasException.approver}<br>
                            <strong>Date:</strong> ${hasException.date}
                        </div>` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        html += `<div class="checklist-section-empty">No checklist items found for this subsection.</div>`;
    }
    html += '</div></div>';
    return html;
}

/**
 * Render a single checklist section
 */
function renderChecklistSection(section) {
    let html = `
        <div class="checklist-section">
            <div class="checklist-section-header">
                <h3 class="checklist-section-title">${section.title}</h3>
                <p class="checklist-section-description">${section.description || ''}</p>
            </div>
            <div class="checklist-items">
    `;
    
    section.items.forEach(item => {
        const isChecked = AppState.formData.checklist[item.id] || false;
        const labelInfo = getCategoryLabel(item.category);
        const hasException = AppState.formData.exceptions && AppState.formData.exceptions[item.id];
        const hasComment = AppState.formData.comments && AppState.formData.comments[item.id];
        const isMandatory = item.category === 'mandatory';
        
        html += `
            <div class="checklist-item ${isChecked ? 'completed' : ''} ${hasException ? 'has-exception' : ''}" data-item-id="${item.id}">
                <input type="checkbox" 
                       id="${item.id}" 
                       name="${item.id}"
                       ${isChecked ? 'checked' : ''}>
                <div class="checklist-item-content">
                    <label for="${item.id}" class="checklist-item-title">${item.text}</label>
                    <span class="${labelInfo.class}">${labelInfo.text}</span>
                    ${isMandatory && !hasException ? `<button class="exception-btn" onclick="showExceptionModal('${item.id}', '${item.text.replace(/'/g, "\\'")}')">Exception</button>` : ''}
                    ${hasException ? `<div class="exception-badge">Exception Granted</div>
                        <button class="exception-btn" style="background: linear-gradient(135deg, #f44336, #d32f2f); margin-left: 4px;" onclick="removeException('${item.id}')">Remove</button>` : ''}
                    <button class="comment-btn" onclick="showCommentModal('${item.id}', '${item.text.replace(/'/g, "\\'")}')">
                        ${hasComment ? 'Edit Comment' : 'Add Comment'}
                    </button>
                    <p class="checklist-item-description">${item.description || ''}</p>
                    ${hasComment ? `<div class="comment-display">
                        <div class="comment-header">
                            <strong>Comment:</strong>
                            <button class="comment-delete-btn" onclick="removeComment('${item.id}')" title="Delete comment">×</button>
                        </div>
                        <div class="comment-text">${hasComment.text}</div>
                        <div class="comment-meta">By: ${hasComment.author} | ${hasComment.date}</div>
                    </div>` : ''}
                    ${hasException ? `<div class="exception-details">
                        <strong>Exception Reason:</strong> ${hasException.reason}<br>
                        <strong>Approved by:</strong> ${hasException.approver}<br>
                        <strong>Date:</strong> ${hasException.date}
                    </div>` : ''}
                </div>
            </div>
        `;
    });
    
    html += '</div></div>';
    return html;
}

/**
 * Switch to specific tab - COMPLETELY FIXED VERSION
 */
function switchToTab(tabId) {
    console.log(`Switching to tab: ${tabId}`);
    
    // Validate tab exists
    if (!AppState.tabOrder.includes(tabId)) {
        console.error('Invalid tab ID:', tabId);
        return;
    }
    
    // Hide all tab contents first
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show target tab content
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.add('active');
        console.log(`Activated tab content: tab-${tabId}`);
    } else {
        console.error(`Tab content not found: tab-${tabId}`);
        return;
    }
    
    // Update tab button states
    document.querySelectorAll('.tab-nav-btn').forEach(btn => {
        const btnTabId = btn.getAttribute('data-tab');
        if (btnTabId === tabId) {
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
        } else {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        }
    });
    
    // Update current tab state
    AppState.currentTab = tabId;
    console.log(`Current tab updated to: ${tabId}`);
    
    // Update navigation controls
    updateNavigationInfo();
    updateNavigationButtons();
    
    // Special handling for export tab
    if (tabId === 'export') {
        setTimeout(() => updateExportSummary(), 100);
    }
    
    // Setup checklist event listeners for the newly visible tab
    if (['architecture', 'security', 'performance', 'monitoring', 'logging', 'testing', 
         'deployment', 'incident', 'documentation', 'compliance', 'business', 'validation'].includes(tabId)) {
        setupChecklistInteractions();
    }
}

/**
 * Setup checklist interactions for the current tab
 */
function setupChecklistInteractions() {
    // Remove existing listeners to prevent duplicates
    document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(checkbox => {
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        
        newCheckbox.addEventListener('change', (e) => {
            const itemId = e.target.id;
            toggleChecklistItem(itemId);
        });
    });
}

/**
 * Toggle checklist item completion
 */
function toggleChecklistItem(itemId) {
    console.log(`Toggling checklist item: ${itemId}`);
    
    AppState.formData.checklist[itemId] = !AppState.formData.checklist[itemId];
    
    // Update UI
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
        if (AppState.formData.checklist[itemId]) {
            itemElement.classList.add('completed');
        } else {
            itemElement.classList.remove('completed');
        }
    }
    
    // Update progress
    updateAllProgress();
    
    // Update export summary
    updateExportSummary();
    
    // Show feedback
    const action = AppState.formData.checklist[itemId] ? 'completed' : 'unchecked';
    showToast(`Item ${action}`, 'success');
}

/**
 * Navigate to previous tab
 */
function navigatePrevious() {
    const currentIndex = AppState.tabOrder.indexOf(AppState.currentTab);
    if (currentIndex > 0) {
        const prevTab = AppState.tabOrder[currentIndex - 1];
        switchToTab(prevTab);
    }
}

/**
 * Navigate to next tab
 */
function navigateNext() {
    // Basic validation for required fields
    if (!validateCurrentTab()) {
        showToast('Please complete all required fields before proceeding', 'error');
        return;
    }
    
    const currentIndex = AppState.tabOrder.indexOf(AppState.currentTab);
    if (currentIndex < AppState.tabOrder.length - 1) {
        const nextTab = AppState.tabOrder[currentIndex + 1];
        switchToTab(nextTab);
    }
}

/**
 * Validate current tab
 */
function validateCurrentTab() {
    const tab = AppState.currentTab;
    let isValid = true;
    
    if (tab === 'overview') {
        // Check required fields
        const requiredFields = ['project_name', 'dri', 'target_production_date'];
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !field.value.trim()) {
                isValid = false;
            }
        });
        
        // Check radio buttons
        const serviceType = document.querySelector('input[name="service_type"]:checked');
        const criticalityLevel = document.querySelector('input[name="criticality_level"]:checked');
        
        if (!serviceType || !criticalityLevel) {
            isValid = false;
        }
        
    } else if (tab === 'executive') {
        const requiredFields = ['brief_description', 'business_impact', 'key_risks', 'success_criteria'];
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !field.value.trim()) {
                isValid = false;
            }
        });
    }
    
    return isValid;
}

/**
 * Update navigation info to show current section name
 */
function updateNavigationInfo() {
    const sectionNames = {
        'overview': 'Overview & Metadata',
        'executive': 'Executive Summary', 
        'architecture': 'System Architecture',
        'security': 'Security & Compliance',
        'performance': 'Performance & Scalability',
        'monitoring': 'Monitoring & Observability',
        'logging': 'Logging & Tracing',
        'testing': 'Testing & QA',
        'deployment': 'Deployment & Rollback',
        'incident': 'Incident Response',
        'documentation': 'Documentation',
        'compliance': 'Compliance & Governance',
        'business': 'Business Readiness',
        'validation': 'Final Validation',
        'appendices': 'Appendices',
        'export': 'Review & Export'
    };
    
    const sectionInfo = document.getElementById('currentSectionName');
    if (sectionInfo) {
        const sectionName = sectionNames[AppState.currentTab] || 'Unknown Section';
        sectionInfo.textContent = sectionName;
    }
}

/**
 * Update navigation buttons
 */
function updateNavigationButtons() {
    const currentIndex = AppState.tabOrder.indexOf(AppState.currentTab);
    const totalTabs = AppState.tabOrder.length;
    
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.disabled = currentIndex === 0;
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
    }
    
    if (nextBtn) {
        if (currentIndex === totalTabs - 1) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'block';
            nextBtn.disabled = false;
        }
    }
}

/**
 * Handle form changes
 */
function handleFormChange(e) {
    const target = e.target;
    const name = target.name || target.id;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    
    // Store form data based on context
    if (name && AppState.currentTab === 'overview') {
        AppState.formData.metadata[name] = value;
    } else if (name && AppState.currentTab === 'executive') {
        AppState.formData.executive[name] = value;
    } else if (name && AppState.currentTab === 'appendices') {
        AppState.formData.appendices[name] = value;
    } else if (name && AppState.currentTab === 'validation') {
        if (name.includes('appendix_')) {
            AppState.formData.appendices[name] = value;
        } else {
            AppState.formData.signoffs[name] = value;
        }
    }
    
    // Update progress
    updateAllProgress();
}

/**
 * Handle form input (for real-time updates)
 */
function handleFormInput(e) {
    handleFormChange(e);
}

/**
 * Update all progress indicators
 */
function updateAllProgress() {
    // Update overall progress
    updateOverallProgress();
}

/**
 * Get progress functions
 */
function getOverviewProgress() {
    let completed = 0;
    const allFields = ['project_name', 'version_release', 'date', 'dri', 'reviewers', 'target_production_date', 'rollback_deadline'];
    allFields.forEach(field => {
        if (AppState.formData.metadata[field]) completed++;
    });
    return Math.min(completed, 7);
}

function getExecutiveProgress() {
    const fields = ['brief_description', 'business_impact', 'key_risks', 'success_criteria'];
    return fields.filter(field => AppState.formData.executive[field]).length;
}

function getAppendicesProgress() {
    const fields = ['appendix_a_critical_dependencies', 'appendix_b_performance_benchmarks', 'appendix_c_security_review_results', 'appendix_d_test_results_summary', 'appendix_e_rollback_procedures'];
    return fields.filter(field => AppState.formData.appendices[field]).length;
}

/**
 * Update overall progress
 */
function updateOverallProgress() {
    const totalItems = getTotalItemsCount();
    const completedItems = getCompletedItemsCount();
    let percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    percentage = Math.min(percentage, 100);
    
    const progressEl = document.getElementById('overallProgress');
    const progressFill = document.getElementById('overallProgressFill');
    
    if (progressEl) {
        progressEl.textContent = `${percentage}% Complete`;
    }
    
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
    }
}

function getTotalItemsCount() {
    // Metadata: 7 fields
    const metadataFields = ['project_name', 'version_release', 'date', 'dri', 'reviewers', 'target_production_date', 'rollback_deadline'];
    // Executive: 4 fields
    const executiveFields = ['brief_description', 'business_impact', 'key_risks', 'success_criteria'];
    // Appendices: 5 fields
    const appendicesFields = ['appendix_a_critical_dependencies', 'appendix_b_performance_benchmarks', 'appendix_c_security_review_results', 'appendix_d_test_results_summary', 'appendix_e_rollback_procedures'];

    let total = metadataFields.length + executiveFields.length + appendicesFields.length;
    if (AppState.checklistData && AppState.checklistData.sections) {
        AppState.checklistData.sections.forEach(section => {
            // Count direct section items
            if (section.items) total += section.items.length;
            // Count items inside subsections
            if (section.subsections && Array.isArray(section.subsections)) {
                section.subsections.forEach(subsection => {
                    if (subsection.items) total += subsection.items.length;
                });
            }
        });
    }
    return total;
}

function getCompletedItemsCount() {
    // Count completed metadata fields
    const metadataFields = ['project_name', 'version_release', 'date', 'dri', 'reviewers', 'target_production_date', 'rollback_deadline'];
    let completed = metadataFields.filter(field => AppState.formData.metadata[field]).length;

    // Count completed executive fields
    const executiveFields = ['brief_description', 'business_impact', 'key_risks', 'success_criteria'];
    completed += executiveFields.filter(field => AppState.formData.executive[field]).length;

    // Count completed appendices fields
    const appendicesFields = ['appendix_a_critical_dependencies', 'appendix_b_performance_benchmarks', 'appendix_c_security_review_results', 'appendix_d_test_results_summary', 'appendix_e_rollback_procedures'];
    completed += appendicesFields.filter(field => AppState.formData.appendices[field]).length;

    // Only count checklist items that are present in the checklist sections
    let checklistItemIds = [];
    if (AppState.checklistData && AppState.checklistData.sections) {
        AppState.checklistData.sections.forEach(section => {
            if (section.items) {
                checklistItemIds = checklistItemIds.concat(section.items.map(item => item.id));
            }
        });
    }
    completed += checklistItemIds.filter(id => AppState.formData.checklist[id]).length;

    return completed;
}

/**
 * Get checklist items by category
 */
function getChecklistItemsByCategory() {
    const categories = {
        mandatory: { total: 0, completed: 0, exceptions: 0, comments: 0 },
        optional: { total: 0, completed: 0, exceptions: 0, comments: 0 },
        future: { total: 0, completed: 0, exceptions: 0, comments: 0 },
        other: { total: 0, completed: 0, exceptions: 0, comments: 0 }
    };

    if (AppState.checklistData && AppState.checklistData.sections) {
        AppState.checklistData.sections.forEach(section => {
            // Process direct section items
            if (section.items) {
                section.items.forEach(item => {
                    const category = item.category || 'other';
                    if (categories[category]) {
                        categories[category].total++;
                        if (AppState.formData.checklist[item.id]) {
                            categories[category].completed++;
                        }
                        if (AppState.formData.exceptions && AppState.formData.exceptions[item.id]) {
                            categories[category].exceptions++;
                        }
                        if (AppState.formData.comments && AppState.formData.comments[item.id]) {
                            categories[category].comments++;
                        }
                    }
                });
            }
            // Process items inside subsections
            if (section.subsections && Array.isArray(section.subsections)) {
                section.subsections.forEach(subsection => {
                    if (subsection.items) {
                        subsection.items.forEach(item => {
                            const category = item.category || 'other';
                            if (categories[category]) {
                                categories[category].total++;
                                if (AppState.formData.checklist[item.id]) {
                                    categories[category].completed++;
                                }
                                if (AppState.formData.exceptions && AppState.formData.exceptions[item.id]) {
                                    categories[category].exceptions++;
                                }
                                if (AppState.formData.comments && AppState.formData.comments[item.id]) {
                                    categories[category].comments++;
                                }
                            }
                        });
                    }
                });
            }
        });
    }

    return categories;
}

/**
 * Update export summary
 */
function updateExportSummary() {
    const categories = getChecklistItemsByCategory();
    
    // Hide the old completion summary section since we're replacing it
    const oldCompletionSummary = document.querySelector('.completion-summary');
    if (oldCompletionSummary) {
        oldCompletionSummary.style.display = 'none';
    }
    
    // Create or update category statistics table
    let categoryStatsContainer = document.getElementById('categoryStatsContainer');
    if (!categoryStatsContainer) {
        // Find the export container and insert the table at the beginning
        const exportContainer = document.querySelector('.export-container');
        if (exportContainer) {
            categoryStatsContainer = document.createElement('div');
            categoryStatsContainer.id = 'categoryStatsContainer';
            categoryStatsContainer.className = 'category-stats-container card';
            // Insert at the beginning of export container
            exportContainer.insertBefore(categoryStatsContainer, exportContainer.firstChild);
        }
    }

    if (categoryStatsContainer) {
        categoryStatsContainer.innerHTML = `
            <h3 style="text-align: center;">Completion Summary by Category</h3>
            <div class="category-stats-table">
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Total</th>
                            <th>Completed</th>
                            <th>Completion %</th>
                            <th>Exceptions</th>
                            <th>Comments</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(categories).map(([category, stats]) => {
                            const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
                            
                            // Different thresholds for mandatory vs non-mandatory categories
                            let statusClass, statusText;
                            if (category === 'mandatory') {
                                // Strict thresholds for mandatory items
                                statusClass = completionPct === 100 ? 'status-complete' : 
                                             completionPct >= 80 ? 'status-good' :
                                             completionPct >= 50 ? 'status-warning' : 'status-poor';
                                statusText = completionPct === 100 ? 'Complete' :
                                            completionPct >= 80 ? 'Good' :
                                            completionPct >= 50 ? 'In Progress' : 'Needs Attention';
                            } else {
                                // Relaxed thresholds for optional, future, and other items
                                statusClass = completionPct === 100 ? 'status-complete' : 
                                             completionPct >= 60 ? 'status-good' :
                                             completionPct >= 30 ? 'status-warning' : 'status-low-priority';
                                statusText = completionPct === 100 ? 'Complete' :
                                            completionPct >= 60 ? 'Good' :
                                            completionPct >= 30 ? 'In Progress' : 'Low Priority';
                            }
                            
                            return `
                                <tr>
                                    <td>
                                        <span class="category-label-inline label-${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                                    </td>
                                    <td>${stats.total}</td>
                                    <td>${stats.completed}</td>
                                    <td>
                                        <div class="progress-cell">
                                            <span>${completionPct}%</span>
                                            <div class="mini-progress-bar">
                                                <div class="mini-progress-fill" style="width: ${completionPct}%"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>${stats.exceptions}</td>
                                    <td>${stats.comments}</td>
                                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

/**
 * Export to document
 */
function exportToDocument(format) {
    showToast(`Generating ${format.toUpperCase()} document...`, 'info');
    console.log('[DEBUG] exportToDocument called with format:', format);
    showToast(`Generating ${format.toUpperCase()} document...`, 'info');
    if (format === 'docx') {
        if (!window.docx) {
            showToast('Error: docx library is not loaded. Cannot export as Word document.', 'error');
            console.error('[ERROR] docx library is not available on window.docx');
            return;
        }
        // Use docx library for professional Word export
        const { Document, Packer, Paragraph, HeadingLevel, TextRun } = window.docx;
        // Build all content as a single continuous section with larger font size
        const children = [];
        // Title
        children.push(new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { after: 300 },
            children: [new TextRun({ text: 'Enterprise Agentic AI Production Readiness Checklist', bold: true, size: 48 })]
        }));
        children.push(new Paragraph({
            spacing: { after: 400 },
            children: [new TextRun({ text: `Generated on: ${new Date().toLocaleDateString()}`, size: 28 })]
        }));

        // Project Information
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 200 }, children: [new TextRun({ text: 'Project Information', bold: true, size: 32 })] }));
        Object.entries(AppState.formData.metadata).forEach(([key, value]) => {
            if (value) {
                children.push(new Paragraph({ children: [new TextRun({ text: `${key.replace(/_/g, ' ')}: ${value}`, size: 28 })] }));
            }
        });

        // Executive Summary
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 200 }, children: [new TextRun({ text: 'Executive Summary', bold: true, size: 32 })] }));
        Object.entries(AppState.formData.executive).forEach(([key, value]) => {
            if (value) {
                children.push(new Paragraph({ children: [new TextRun({ text: `${key.replace(/_/g, ' ')}: ${value}`, size: 28 })] }));
            }
        });

        // Checklist Items
        if (AppState.checklistData && AppState.checklistData.sections) {
            const seenSectionTitles = new Set();
            AppState.checklistData.sections.forEach(section => {
                if (seenSectionTitles.has(section.title)) return;
                seenSectionTitles.add(section.title);
                children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { after: 100 }, children: [new TextRun({ text: section.title, bold: true, size: 30 })] }));
                if (section.subsections) {
                    const seenSubsectionTitles = new Set();
                    section.subsections.forEach(subsection => {
                        if (seenSubsectionTitles.has(subsection.title)) return;
                        seenSubsectionTitles.add(subsection.title);
                        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { after: 80 }, children: [new TextRun({ text: subsection.title, bold: true, size: 28 })] }));
                        if (subsection.items) {
                            subsection.items.forEach(item => {
                                children.push(new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${AppState.formData.checklist[item.id] ? '[✓]' : '[ ]'} ${item.text}`,
                                            bold: AppState.formData.checklist[item.id],
                                            size: 26
                                        })
                                    ]
                                }));
                            });
                        }
                    });
                }
                if (section.items) {
                    section.items.forEach(item => {
                        children.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${AppState.formData.checklist[item.id] ? '[✓]' : '[ ]'} ${item.text}`,
                                    bold: AppState.formData.checklist[item.id],
                                    size: 26
                                })
                            ]
                        }));
                    });
                }
            });
        }

        // Appendices
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 200 }, children: [new TextRun({ text: 'Appendices', bold: true, size: 32 })] }));
        Object.entries(AppState.formData.appendices).forEach(([key, value]) => {
            if (value) {
                children.push(new Paragraph({ children: [new TextRun({ text: `${key.replace(/_/g, ' ')}: ${value}`, size: 28 })] }));
            }
        });

        // Review History (if present)
        if (AppState.formData.reviewHistory && AppState.formData.reviewHistory.length > 0) {
            children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 200 }, children: [new TextRun({ text: 'Review History', bold: true, size: 32 })] }));
            AppState.formData.reviewHistory.forEach(entry => {
                if (entry.date || entry.reviewer || entry.comments) {
                    children.push(new Paragraph({ children: [new TextRun({ text: `Date: ${entry.date}, Reviewer: ${entry.reviewer}, Comments: ${entry.comments}`, size: 28 })] }));
                }
            });
        }

        const doc = new Document({ sections: [{ children }] });
        Packer.toBlob(doc).then(blob => {
            const filename = generateFilename('docx');
            downloadFile(blob, filename);
            showToast('Word document exported successfully!', 'success');
        });
    } else if (format === 'pdf') {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            showToast('Error: jsPDF library is not loaded. Cannot export as PDF.', 'error');
            console.error('[ERROR] jsPDF library is not available on window.jspdf.jsPDF');
            return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 15;
        const leftMargin = 10;
        const rightMargin = 200;
        const bottomMargin = 285; // jsPDF default page height is 297mm, leave some space
        function checkPageBreak() {
            if (y > bottomMargin) {
                doc.addPage();
                y = 15;
            }
        }

        doc.setFont('helvetica');
        doc.setFontSize(18);
        doc.text('Enterprise Agentic AI Production Readiness Checklist', leftMargin, y);
        y += 10; checkPageBreak();
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, leftMargin, y);
        y += 10; checkPageBreak();

        // Project Information
        doc.setFontSize(14);
        doc.text('Project Information', leftMargin, y);
        y += 8; checkPageBreak();
        doc.setFontSize(10);
        Object.entries(AppState.formData.metadata).forEach(([key, value]) => {
            if (value) {
                doc.text(`${key.replace(/_/g, ' ')}: ${value}`, leftMargin + 2, y);
                y += 6; checkPageBreak();
            }
        });
        y += 4; checkPageBreak();

        // Executive Summary
        doc.setFontSize(14);
        doc.text('Executive Summary', leftMargin, y);
        y += 8; checkPageBreak();
        doc.setFontSize(10);
        Object.entries(AppState.formData.executive).forEach(([key, value]) => {
            if (value) {
                doc.text(`${key.replace(/_/g, ' ')}: ${value}`, leftMargin + 2, y);
                y += 6; checkPageBreak();
            }
        });
        y += 4; checkPageBreak();

        // Checklist Items
        if (AppState.checklistData && AppState.checklistData.sections) {
            const seenSectionTitles = new Set();
            AppState.checklistData.sections.forEach(section => {
                if (seenSectionTitles.has(section.title)) return;
                seenSectionTitles.add(section.title);
                doc.setFontSize(12);
                doc.text(section.title, leftMargin, y);
                y += 7; checkPageBreak();
                doc.setFontSize(10);
                if (section.subsections) {
                    const seenSubsectionTitles = new Set();
                    section.subsections.forEach(subsection => {
                        if (seenSubsectionTitles.has(subsection.title)) return;
                        seenSubsectionTitles.add(subsection.title);
                        doc.text(subsection.title, leftMargin + 2, y);
                        y += 6; checkPageBreak();
                        if (subsection.items) {
                            subsection.items.forEach(item => {
                                doc.text(`${AppState.formData.checklist[item.id] ? '[✓]' : '[ ]'} ${item.text}`, leftMargin + 6, y);
                                y += 6; checkPageBreak();
                            });
                        }
                    });
                }
                if (section.items) {
                    section.items.forEach(item => {
                        doc.text(`${AppState.formData.checklist[item.id] ? '[✓]' : '[ ]'} ${item.text}`, leftMargin + 4, y);
                        y += 6; checkPageBreak();
                    });
                }
                y += 4; checkPageBreak();
            });
        }

        // Appendices
        doc.setFontSize(14);
        doc.text('Appendices', leftMargin, y);
        y += 8; checkPageBreak();
        doc.setFontSize(10);
        Object.entries(AppState.formData.appendices).forEach(([key, value]) => {
            if (value) {
                doc.text(`${key.replace(/_/g, ' ')}: ${value}`, leftMargin + 2, y);
                y += 6; checkPageBreak();
            }
        });
        y += 4; checkPageBreak();

        // Review History
        if (AppState.formData.reviewHistory && AppState.formData.reviewHistory.length > 0) {
            doc.setFontSize(14);
            doc.text('Review History', leftMargin, y);
            y += 8; checkPageBreak();
            doc.setFontSize(10);
            AppState.formData.reviewHistory.forEach(entry => {
                if (entry.date || entry.reviewer || entry.comments) {
                    doc.text(`Date: ${entry.date}, Reviewer: ${entry.reviewer}, Comments: ${entry.comments}`, leftMargin + 2, y);
                    y += 6; checkPageBreak();
                }
            });
        }

        const filename = generateFilename('pdf');
        doc.save(filename);
        showToast('PDF document exported successfully!', 'success');
    } else {
        // ...existing code...
        const content = generateDocumentContent();
        const filename = generateFilename('txt');
        const blob = new Blob([content], { type: 'text/plain' });
        downloadFile(blob, filename);
        showToast(`Document exported successfully!`, 'success');
    }
}

/**
 * Generate document content
 */
function generateDocumentContent() {
    let content = 'Enterprise Agentic AI Production Readiness Checklist\n';
    content += '='.repeat(60) + '\n';
    content += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Project Information
    content += 'PROJECT INFORMATION\n' + '-'.repeat(20) + '\n';
    Object.entries(AppState.formData.metadata).forEach(([key, value]) => {
        if (value) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            content += `${label}: ${value}\n`;
        }
    });
    
    // Executive Summary
    content += '\nEXECUTIVE SUMMARY\n' + '-'.repeat(20) + '\n';
    Object.entries(AppState.formData.executive).forEach(([key, value]) => {
        if (value) {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            content += `${label}:\n${value}\n\n`;
        }
    });
    
    // Checklist Items
    if (AppState.checklistData && AppState.checklistData.sections) {
        content += 'CHECKLIST ITEMS\n' + '-'.repeat(20) + '\n';
        AppState.checklistData.sections.forEach(section => {
            content += `\n${section.title.toUpperCase()}\n`;
            if (section.items) {
                section.items.forEach(item => {
                    const status = AppState.formData.checklist[item.id] ? '[✓]' : '[ ]';
                    content += `${status} ${item.text}\n`;
                    if (item.description) {
                        content += `    ${item.description}\n`;
                    }
                });
            }
        });
    }
    
    return content;
}

/**
 * Generate filename
 */
function generateFilename(extension) {
    const projectName = AppState.formData.metadata.project_name || 'ai-checklist';
    const date = new Date().toISOString().split('T')[0];
    const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${sanitizedName}-production-readiness-${date}.${extension}`;
}

/**
 * Download file helper
 */
function downloadFile(content, filename) {
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Toggle theme - FIXED
 */
function toggleTheme() {
    const html = document.documentElement;
    AppState.currentTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-color-scheme', AppState.currentTheme);
    updateThemeIcon();
    showToast(`Switched to ${AppState.currentTheme} theme`, 'success');
}

/**
 * Handle keyboard navigation
 */
function handleKeyboardNavigation(e) {
    if (e.ctrlKey) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigatePrevious();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigateNext();
        }
    }
    
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        toggleTheme();
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}

/**
 * Show/hide loading indicator
 */
function showLoading() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = 'flex';
    AppState.isLoading = true;
}

function hideLoading() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) loader.style.display = 'none';
    AppState.isLoading = false;
}

/**
 * Exception Management Functions
 */
function showExceptionModal(itemId, itemText) {
    const existingModal = document.getElementById('exceptionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'exceptionModal';
    modal.className = 'exception-modal';
    modal.innerHTML = `
        <div class="exception-modal-content">
            <h3>Exception Request</h3>
            <p><strong>Item:</strong> ${itemText}</p>
            <form id="exceptionForm">
                <div class="exception-form-group">
                    <label for="exceptionReason">Exception Reason *</label>
                    <textarea id="exceptionReason" placeholder="Please provide a detailed reason for this exception..." required></textarea>
                </div>
                <div class="exception-form-group">
                    <label for="exceptionApprover">Approved By *</label>
                    <input type="text" id="exceptionApprover" placeholder="Name of approver/authority" required>
                </div>
                <div class="exception-form-group">
                    <label for="exceptionDate">Date</label>
                    <input type="date" id="exceptionDate" value="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="exception-modal-buttons">
                    <button type="button" class="exception-cancel-btn" onclick="closeExceptionModal()">Cancel</button>
                    <button type="button" class="exception-save-btn" onclick="saveException('${itemId}')">Grant Exception</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.getElementById('exceptionReason').focus();
}

function closeExceptionModal() {
    const modal = document.getElementById('exceptionModal');
    if (modal) {
        modal.remove();
    }
}

function saveException(itemId) {
    const reason = document.getElementById('exceptionReason').value.trim();
    const approver = document.getElementById('exceptionApprover').value.trim();
    const date = document.getElementById('exceptionDate').value;
    
    if (!reason || !approver) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Initialize exceptions object if it doesn't exist
    if (!AppState.formData.exceptions) {
        AppState.formData.exceptions = {};
    }
    
    // Save exception
    AppState.formData.exceptions[itemId] = {
        reason: reason,
        approver: approver,
        date: date,
        timestamp: new Date().toISOString()
    };
    
    // Re-render the current tab to show the exception
    renderChecklistSections();
    
    // Update export summary
    updateExportSummary();
    
    // Close modal
    closeExceptionModal();
    
    // Show success message
    showToast('Exception granted successfully!', 'success');
}

function removeException(itemId) {
    if (AppState.formData.exceptions && AppState.formData.exceptions[itemId]) {
        delete AppState.formData.exceptions[itemId];
        renderChecklistSections();
        updateExportSummary();
        showToast('Exception removed successfully!', 'info');
    }
}

/**
 * Comment Management Functions
 */
function showCommentModal(itemId, itemText) {
    const existingModal = document.getElementById('commentModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const existingComment = AppState.formData.comments && AppState.formData.comments[itemId];
    const isEdit = !!existingComment;
    
    const modal = document.createElement('div');
    modal.id = 'commentModal';
    modal.className = 'comment-modal';
    modal.innerHTML = `
        <div class="comment-modal-content">
            <h3>${isEdit ? 'Edit' : 'Add'} Comment</h3>
            <p><strong>Item:</strong> ${itemText}</p>
            <form id="commentForm">
                <div class="comment-form-group">
                    <label for="commentText">Comment *</label>
                    <textarea id="commentText" placeholder="Enter your comment here..." required>${existingComment ? existingComment.text : ''}</textarea>
                </div>
                <div class="comment-form-group">
                    <label for="commentAuthor">Your Name *</label>
                    <input type="text" id="commentAuthor" placeholder="Your name" value="${existingComment ? existingComment.author : ''}" required>
                </div>
                <div class="comment-modal-buttons">
                    <button type="button" class="comment-cancel-btn" onclick="closeCommentModal()">Cancel</button>
                    <button type="button" class="comment-save-btn" onclick="saveComment('${itemId}')">${isEdit ? 'Update' : 'Save'} Comment</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
    document.getElementById('commentText').focus();
}

function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.remove();
    }
}

function saveComment(itemId) {
    const text = document.getElementById('commentText').value.trim();
    const author = document.getElementById('commentAuthor').value.trim();
    
    if (!text || !author) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Initialize comments object if it doesn't exist
    if (!AppState.formData.comments) {
        AppState.formData.comments = {};
    }
    
    // Save comment
    AppState.formData.comments[itemId] = {
        text: text,
        author: author,
        date: new Date().toLocaleDateString(),
        timestamp: new Date().toISOString()
    };
    
    // Re-render the current tab to show the comment
    renderChecklistSections();
    
    // Update export summary
    updateExportSummary();
    
    // Close modal
    closeCommentModal();
    
    // Show success message
    showToast('Comment saved successfully!', 'success');
}

function removeComment(itemId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        if (AppState.formData.comments && AppState.formData.comments[itemId]) {
            delete AppState.formData.comments[itemId];
            renderChecklistSections();
            updateExportSummary();
            showToast('Comment deleted successfully!', 'info');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);