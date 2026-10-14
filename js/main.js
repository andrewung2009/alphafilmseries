         // ============================================
         // ⭐ CONFIGURATION SECTION ⭐
         // ============================================
         
         // Google Apps Script URL for form submission
         const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9hnMZ06Hq18SIrP2OI-HjCAK-fjGTCT6qEukKqV00dSv_IZTwGF2dWf7ZJdyWUiEoOA/exec';
         
         // Data Variables (Populated from data.json)
         let trainingVideos = [];
         let weeklyResources = [];
         let weekendResources = {};
         let additionalGuides = [];
                  // Fix mobile menu scroll offset
         let mobileScrollTarget = null;
         const navbarCollapse = document.getElementById('navbarNav');
         
         document.querySelectorAll('#navbarNav .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
               if (window.innerWidth < 992) {
                  e.preventDefault();
                  mobileScrollTarget = this.getAttribute('href');
                  const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
                  if (bsCollapse) bsCollapse.hide();
               }
            });
         });
         
         navbarCollapse.addEventListener('hidden.bs.collapse', function () {
            if (mobileScrollTarget) {
               const target = document.querySelector(mobileScrollTarget);
               if (target) window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
               mobileScrollTarget = null;
            }
         });
         // ============================================
         // 🚫 STOP EDITING HERE - LOGIC BELOW 🚫
         // ============================================         
         // Function to copy link to clipboard
         function copyToClipboard(url, title) {
             if (navigator.clipboard && navigator.clipboard.writeText) {
                 navigator.clipboard.writeText(url)
                     .then(() => showToast(`Link copied: ${title}`, 'success'))
                     .catch(() => fallbackCopyToClipboard(url, title));
             } else {
                 fallbackCopyToClipboard(url, title);
             }
         }
         
         // Fallback for browsers without the Clipboard API
         function fallbackCopyToClipboard(url, title) {
             const textarea = document.createElement('textarea');
             textarea.value = url;
             textarea.style.position = 'fixed';
             document.body.appendChild(textarea);
             textarea.select();
             
             try {
                 const successful = document.execCommand('copy');
                 document.body.removeChild(textarea);
                 
                 if (successful) {
                     showToast(`Link copied: ${title}`, 'success');
                 } else {
                     window.prompt('Copy this link (Ctrl+C, Enter):', url);
                 }
             } catch (err) {
                 document.body.removeChild(textarea);
                 window.prompt('Copy this link (Ctrl+C, Enter):', url);
             }
         }
         
         // Function to show toast notification
         function showToast(message, type = 'success') {
             let toastContainer = document.getElementById('toastContainer');
             if (!toastContainer) {
                 toastContainer = document.createElement('div');
                 toastContainer.id = 'toastContainer';
                 toastContainer.style.cssText = `
                     position: fixed;
                     top: 80px;
                     right: 20px;
                     z-index: 9999;
                 `;
                 document.body.appendChild(toastContainer);
             }
             
             const toast = document.createElement('div');
             toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
             toast.setAttribute('role', 'alert');
             toast.setAttribute('aria-live', 'assertive');
             toast.setAttribute('aria-atomic', 'true');
             toast.style.cssText = `
                 min-width: 250px;
                 margin-bottom: 10px;
                 box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                 border-radius: 8px;
                 animation: slideInRight 0.3s ease;
             `;
             
             toast.innerHTML = `
                 <div class="d-flex">
                     <div class="toast-body">
                         <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                         ${message}
                     </div>
                     <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                 </div>
             `;
             
             toastContainer.appendChild(toast);
             
             const bsToast = new bootstrap.Toast(toast, {
                 autohide: true,
                 delay: 3000
             });
             
             bsToast.show();
             
             toast.addEventListener('hidden.bs.toast', () => {
                 toast.remove();
             });
         }
         
         // Function to initialize everything after DOM is loaded
         async function initializeApp() {
             
             // ============================================
             // 1. FETCH DATA FROM JSON
             // ============================================
             try {
                 const response = await fetch('data/data.json');
                 if (!response.ok) {
                     throw new Error(`HTTP error! status: ${response.status}`);
                 }
                 const data = await response.json();
                 
                 // Assign fetched data to global variables
                 trainingVideos = data.trainingVideos;
weeklyResources = data.weeklyResources;
weekendResources = data.weekendResources;
additionalGuides = data.additionalGuides;

// Populate week dropdown
const weekSelect = document.getElementById('weekNumber');
data.weeklyResources.forEach(w => {
   const opt = document.createElement('option');
   opt.value = w.week;
   opt.textContent = 'Week ' + w.week + ': ' + w.title;
   weekSelect.appendChild(opt);
});
const weekendOpt = document.createElement('option');
weekendOpt.value = 'weekend';
weekendOpt.textContent = 'Weekend Away';
weekSelect.appendChild(weekendOpt);
                 
             } catch (error) {
                 console.error("Could not load data.json:", error);
                 const message = location.protocol === 'file:'
                     ? 'This page was opened directly as a file, and browsers block loading <strong>data/data.json</strong> that way. Run a local server instead: open a terminal in this folder, run <code>python -m http.server 8000</code>, then visit <code>http://localhost:8000</code>.'
                     : `Could not load <strong>data/data.json</strong> (${error.message}). Check that the file exists on the server, then reload the page.`;
                 const alertBox = document.createElement('div');
                 alertBox.className = 'alert alert-danger mt-4';
                 alertBox.setAttribute('role', 'alert');
                 alertBox.innerHTML = message;
                 const heroContent = document.querySelector('.hero-content');
                 if (heroContent) {
                     heroContent.prepend(alertBox);
                 } else {
                     document.body.prepend(alertBox);
                 }
                 return; // Stop execution if data fails
             }
         
             // ============================================
             // 2. DYNAMIC CONTENT GENERATION
             // ============================================
             
             // Quick Access Button
             createQuickAccessButton();
             
             // Smooth scrolling & Navbar logic
             setupNavigation();
             
             // Generate HTML Content
             generateTrainingVideos();
             generateWeeklyResources();
             generateWeekendResources();
             generateAdditionalGuides();
             
             // Setup Video Modal & Observers
             setupInteractions();
         }
         
         // Helper function for Quick Access Button creation
         function createQuickAccessButton() {
             const quickAccessBtn = document.createElement('div');
             quickAccessBtn.id = 'quickAccessBtn';
             quickAccessBtn.style.cssText = `
                 position: fixed;
                 bottom: 30px;
                 right: 30px;
                 z-index: 1000;
                 opacity: 0;
                 transform: translateY(20px);
                 transition: all 0.3s ease;
                 pointer-events: none;
             `;
             
             const toggleBtn = document.createElement('button');
             toggleBtn.className = 'quick-access-toggle';
             toggleBtn.style.cssText = `
                 width: 60px;
                 height: 60px;
                 border-radius: 50%;
                 background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                 border: none;
                 color: white;
                 font-size: 1.5rem;
                 cursor: pointer;
                 box-shadow: 0 4px 15px rgba(198, 40, 40, 0.3);
                 transition: all 0.3s ease;
             `;
             toggleBtn.innerHTML = '<i class="fas fa-compass"></i>';
             
             const menu = document.createElement('div');
             menu.id = 'quickAccessMenu';
             menu.style.cssText = `
                 position: absolute;
                 bottom: 70px;
                 right: 0;
                 background: white;
                 border-radius: 12px;
                 box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                 padding: 0.5rem;
                 opacity: 0;
                 transform: translateY(10px);
                 transition: all 0.3s ease;
                 pointer-events: none;
                 min-width: 180px;
             `;
             
             const menuItems = [
                 { href: '#getready', text: 'Get Ready' },
                 { href: '#weekly', text: 'Week-by-Week' },
                 { href: '#weekend', text: 'Weekend Away' },
                 { href: '#makebetter', text: 'Share What Works' },
                 { href: '#guides', text: 'Resources' }
             ];
             
             menuItems.forEach(item => {
                 const link = document.createElement('a');
                 link.href = item.href;
                 link.className = 'quick-access-item';
                 link.textContent = item.text;
                 link.style.cssText = `
                     display: block;
                     padding: 0.75rem 1rem;
                     color: #333;
                     text-decoration: none;
                     border-radius: 8px;
                     transition: all 0.2s ease;
                     font-size: 0.9rem;
                 `;
                 link.addEventListener('mouseenter', () => {
                     link.style.background = 'var(--light-bg)';
                     link.style.color = 'var(--primary-color)';
                     link.style.transform = 'translateX(5px)';
                 });
                 link.addEventListener('mouseleave', () => {
                     link.style.background = 'transparent';
                     link.style.color = '#333';
                     link.style.transform = 'translateX(0)';
                 });
                 menu.appendChild(link);
             });
             
             toggleBtn.addEventListener('click', () => {
                 if (menu.style.opacity === '1') {
                     menu.style.opacity = '0';
                     menu.style.transform = 'translateY(10px)';
                     menu.style.pointerEvents = 'none';
                 } else {
                     menu.style.opacity = '1';
                     menu.style.transform = 'translateY(0)';
                     menu.style.pointerEvents = 'all';
                 }
             });
             
             toggleBtn.addEventListener('mouseenter', () => {
                 toggleBtn.style.transform = 'scale(1.1)';
                 toggleBtn.style.boxShadow = '0 6px 20px rgba(198, 40, 40, 0.4)';
             });
             toggleBtn.addEventListener('mouseleave', () => {
                 toggleBtn.style.transform = 'scale(1)';
                 toggleBtn.style.boxShadow = '0 4px 15px rgba(198, 40, 40, 0.3)';
             });
             
             quickAccessBtn.appendChild(toggleBtn);
             quickAccessBtn.appendChild(menu);
             document.body.appendChild(quickAccessBtn);
             
             window.addEventListener('scroll', () => {
                 if (window.scrollY > 300) {
                     quickAccessBtn.style.opacity = '1';
                     quickAccessBtn.style.transform = 'translateY(0)';
                     quickAccessBtn.style.pointerEvents = 'all';
                 } else {
                     quickAccessBtn.style.opacity = '0';
                     quickAccessBtn.style.transform = 'translateY(20px)';
                     quickAccessBtn.style.pointerEvents = 'none';
                     menu.style.opacity = '0';
                     menu.style.transform = 'translateY(10px)';
                     menu.style.pointerEvents = 'none';
                 }
             });
             
             document.addEventListener('click', (e) => {
                 if (!quickAccessBtn.contains(e.target) && menu.style.opacity === '1') {
                     menu.style.opacity = '0';
                     menu.style.transform = 'translateY(10px)';
                     menu.style.pointerEvents = 'none';
                 }
             });
         }
         
         // Helper for Navigation setup
         function setupNavigation() {
             // Smooth scrolling
             document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                 anchor.addEventListener('click', function (e) {
                     e.preventDefault();
                     const targetId = this.getAttribute('href');
                     const target = document.querySelector(targetId);
                     
                     if (target) {
                         const navbar = document.getElementById('mainNav');
                         const navbarHeight = navbar.offsetHeight;
                         const targetPosition = target.offsetTop - navbarHeight;
                         
                         window.scrollTo({
                             top: targetPosition,
                             behavior: 'smooth'
                         });
                         
                         // Auto-collapse navbar on mobile
                         const navbarCollapse = document.querySelector('.navbar-collapse');
                         if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                             const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                             bsCollapse.hide();
                         }
                     }
                 });
             });
             
             // Navbar scroll effect
             window.addEventListener('scroll', function() {
                 const navbar = document.getElementById('mainNav');
                 if (window.scrollY > 50) {
                     navbar.classList.add('scrolled');
                 } else {
                     navbar.classList.remove('scrolled');
                 }
             });
         }
         
         // Helper for Interactions (Modals, Observers)
         function setupInteractions() {
             // Video Modal Function
             window.openVideoModal = function(videoUrl, title) {
                 const modal = new bootstrap.Modal(document.getElementById('videoModal'));
                 document.getElementById('videoModalTitle').textContent = title;
                 document.getElementById('videoFrame').src = videoUrl;
                 modal.show();
             };
         
             // Close modal and stop video
             document.getElementById('videoModal').addEventListener('hidden.bs.modal', function () {
                 document.getElementById('videoFrame').src = '';
             });
         
             // Scroll Progress Bar
             window.addEventListener('scroll', function() {
                 const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                 const scrollPosition = window.scrollY;
                 const scrollPercentage = (scrollPosition / scrollHeight) * 100;
                 document.getElementById('scrollProgress').style.width = scrollPercentage + '%';
             });
         
             // Intersection Observer for scroll animations
             const observerOptions = {
                 threshold: 0.1,
                 rootMargin: '0px 0px -50px 0px'
             };
         
             const observer = new IntersectionObserver(function(entries) {
                 entries.forEach(entry => {
                     if (entry.isIntersecting) {
                         entry.target.classList.add('animated');
                         
                         if (entry.target.classList.contains('section')) {
                             const staggerItems = entry.target.querySelectorAll('.stagger-item');
                             staggerItems.forEach((item, index) => {
                                 setTimeout(() => {
                                     item.style.transition = `all 0.6s ease ${index * 0.1}s`;
                                     item.style.opacity = '1';
                                     item.style.transform = 'translateY(0)';
                                 }, 100);
                             });
                         }
                     }
                 });
             }, observerOptions);
         
             document.querySelectorAll('.section, .hero-section').forEach(el => {
                 observer.observe(el);
             });
         
             // Add active state to navigation based on scroll position
             window.addEventListener('scroll', function() {
                 const sections = document.querySelectorAll('section[id]');
                 const scrollY = window.pageYOffset;
         
                 sections.forEach(section => {
                     const sectionHeight = section.offsetHeight;
                     const sectionTop = section.offsetTop - 100;
                     const sectionId = section.getAttribute('id');
                     
                     if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                         document.querySelectorAll('.navbar-nav a').forEach(navLink => {
                             navLink.classList.remove('active');
                             if (navLink.getAttribute('href') === '#' + sectionId) {
                                 navLink.classList.add('active');
                             }
                         });
                     }
                 });
             });
         
             // Initialize hero animation on page load
             setTimeout(() => {
                 document.querySelector('.hero-section').classList.add('animated');
             }, 300);
         }
         
         // ============================================
         // 3. HTML GENERATION FUNCTIONS
         // ============================================
         
         function generateTrainingVideos() {
             const container = document.getElementById('trainingVideosAccordion');
             let html = '';
             
             html += `
             <div class="accordion-item weekly-accordion">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#trainingVideos">
                        <i class="fas fa-play-circle me-2"></i> Training Videos
                    </button>
                </h2>
                <div id="trainingVideos" class="accordion-collapse collapse" data-bs-parent="#trainingVideosAccordion">
                    <div class="accordion-body">
                        <div class="row justify-content-center">
             `;
             
             trainingVideos.forEach((video, index) => {
             html += `
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="training-video-item">
                        <h5 class="training-video-title">${video.title}</h5>
                        <a href="#" class="week-resource-action" onclick="openVideoModal('${video.url}', 'Training: ${video.title}'); return false;">
                            <i class="fas fa-play"></i> Watch Now
                        </a>
                    </div>
                </div>
             `;
             });
             
             html += `
                        </div>
                    </div>
                </div>
             </div>
             `;
             
             container.innerHTML = html;
         }
         
         function generateWeeklyResources() {
             const container = document.getElementById('weeklyAccordion');
             let html = '';
             
             weeklyResources.forEach((week, index) => {
                 const isExpanded = '';
                 const isCollapsed = 'collapsed';
                 
                 html += `
                     <div class="accordion-item weekly-accordion">
                         <h2 class="accordion-header">
                             <button class="accordion-button ${isCollapsed}" type="button" data-bs-toggle="collapse" data-bs-target="#week${week.week}">
                                 <i class="fas fa-calendar-week me-2"></i> Week ${week.week}: ${week.title}
                             </button>
                         </h2>
                         <div id="week${week.week}" class="accordion-collapse collapse ${isExpanded}" data-bs-parent="#weeklyAccordion">
                             <div class="accordion-body">
                                 <div class="week-resources">
                                     <div class="week-resource-card">
                                         <div class="week-resource-type">
                                             <i class="fas fa-play-circle me-1"></i> Alpha Talk
                                         </div>
                                         <h5 class="week-resource-title">${week.talk.title}</h5>
                                         <a href="#" class="week-resource-action" onclick="openVideoModal('${week.talk.url}', '${week.talk.title}'); return false;">
                                             <i class="fas fa-play"></i> Watch Now
                                         </a>
                                     </div>
                                     <div class="week-resource-card">
                                         <div class="week-resource-type">
                                             <i class="fas fa-users me-1"></i> Hosts and Helpers Briefing
                                         </div>
                                         <h5 class="week-resource-title">${week.briefing.title}</h5>
                                         <a href="#" class="week-resource-action" onclick="openVideoModal('${week.briefing.url}', '${week.briefing.title}'); return false;">
                                             <i class="fas fa-play"></i> Watch Now
                                         </a>
                                     </div>
                                     <div class="week-resource-card">
                                         <div class="accordion week-accordion" id="icebreakerAccordion${week.week}">
                                             <div class="accordion-item">
                                                 <h2 class="accordion-header">
                                                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#icebreaker${week.week}">
                                                         <i class="fas fa-snowflake me-1"></i> ${week.icebreaker.title}
                                                     </button>
                                                 </h2>
                                                 <div id="icebreaker${week.week}" class="accordion-collapse collapse" data-bs-parent="#icebreakerAccordion${week.week}">
                                                     <div class="accordion-body">
                                                         <ul>
                                                             ${week.icebreaker.content.map(point => `<li>${point}</li>`).join('')}
                                                         </ul>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                     <div class="week-resource-card">
                                         <div class="accordion week-accordion" id="discussionAccordion${week.week}">
                                             <div class="accordion-item">
                                                 <h2 class="accordion-header">
                                                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#discussion${week.week}">
                                                         <i class="fas fa-comments me-1"></i> ${week.discussion.title}
                                                     </button>
                                                 </h2>
                                                 <div id="discussion${week.week}" class="accordion-collapse collapse" data-bs-parent="#discussionAccordion${week.week}">
                                                     <div class="accordion-body">
                                                         <ul>
                                                             ${week.discussion.content.map(question => `<li>${question}</li>`).join('')}
                                                         </ul>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                     <div class="week-resource-card">
                                         <div class="accordion week-accordion" id="tipsAccordion${week.week}">
                                             <div class="accordion-item">
                                                 <h2 class="accordion-header">
                                                     <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#tips${week.week}">
                                                         <i class="fas fa-lightbulb me-1"></i> ${week.tips.title}
                                                     </button>
                                                 </h2>
                                                 <div id="tips${week.week}" class="accordion-collapse collapse" data-bs-parent="#tipsAccordion${week.week}">
                                                     <div class="accordion-body">
                                                         <ul>
                                                             ${week.tips.content.map(tip => `<li>${tip}</li>`).join('')}
                                                         </ul>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                     <div class="week-resource-card">
                                         <div class="week-resource-type">
                                             <i class="fas fa-file-alt me-1"></i> Guest Guide
                                         </div>
                                         <h5 class="week-resource-title">${week.guide.title}</h5>
                                         <div class="resource-actions">
                                             <a href="${week.guide.url}" class="week-resource-action" target="_blank">
                                                 <i class="fas fa-download"></i> Download
                                             </a>
                                             <button class="week-resource-action copy-btn" onclick="copyToClipboard('${week.guide.url}', '${week.guide.title}')" title="Copy link">
                                                 <i class="fas fa-link"></i> Copy Link
                                             </button>
                                         </div>
                                     </div>
                                     <div class="week-resource-card">
                                         <div class="week-resource-type">
                                             <i class="fas fa-users-cog me-1"></i> Team Guide
                                         </div>
                                         <h5 class="week-resource-title">${week.teamGuide.title}</h5>
                                         <div class="resource-actions">
                                             <a href="${week.teamGuide.url}" class="week-resource-action" target="_blank">
                                                 <i class="fas fa-download"></i> Download
                                             </a>
                                             <button class="week-resource-action copy-btn" onclick="copyToClipboard('${week.teamGuide.url}', '${week.teamGuide.title}')" title="Copy link">
                                                 <i class="fas fa-link"></i> Copy Link
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 `;
             });
             
             container.innerHTML = html;
         }
         
         function generateWeekendResources() {
             const container = document.getElementById('weekendAccordion');
             let html = '';
             
             // Training Videos dropdown
             html += `
             <div class="accordion-item weekly-accordion">
             <h2 class="accordion-header">
               <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#weekendTrainingVideos">
                   <i class="fas fa-graduation-cap me-2"></i> Training Videos
               </button>
             </h2>
             <div id="weekendTrainingVideos" class="accordion-collapse collapse" data-bs-parent="#weekendAccordion">
               <div class="accordion-body">
                   <div class="week-resources">
             `;
             
             weekendResources.trainingVideos.forEach(video => {
             html += `
             <div class="week-resource-card">
               <h5 class="week-resource-title">${video.title}</h5>
               <a href="#" class="week-resource-action" onclick="openVideoModal('${video.url}', '${video.title}'); return false;">
                   <i class="fas fa-play"></i> Watch Now
               </a>
             </div>
             `;
             });
             
             html += `
                   </div>
               </div>
             </div>
             </div>
             
             <!-- Alpha Talk dropdown -->
             <div class="accordion-item weekly-accordion">
             <h2 class="accordion-header">
               <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#weekendTalks">
                   <i class="fas fa-play-circle me-2"></i> Alpha Talk
               </button>
             </h2>
             <div id="weekendTalks" class="accordion-collapse collapse" data-bs-parent="#weekendAccordion">
               <div class="accordion-body">
                   <div class="week-resources">
             `;
             
             weekendResources.mainTalks.forEach(talk => {
             html += `
             <div class="week-resource-card">
               <h5 class="week-resource-title">${talk.title}</h5>
               <a href="#" class="week-resource-action" onclick="openVideoModal('${talk.url}', '${talk.title}'); return false;">
                   <i class="fas fa-play"></i> Watch Now
               </a>
             </div>
             `;
             });
             
             html += `
                   </div>
               </div>
             </div>
             </div>
             `;
             
             // Guest Guide dropdown
             html += `
             <div class="accordion-item weekly-accordion">
             <h2 class="accordion-header">
               <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#weekendGuestGuides">
                   <i class="fas fa-file-alt me-2"></i> Guest Guide
               </button>
             </h2>
             <div id="weekendGuestGuides" class="accordion-collapse collapse" data-bs-parent="#weekendAccordion">
               <div class="accordion-body">
                   <div class="week-resources">
             `;
             
             weekendResources.guides.forEach(guide => {
             html += `
             <div class="week-resource-card">
               <h5 class="week-resource-title">${guide.title}</h5>
               <div class="resource-actions">
                   <a href="${guide.url}" class="week-resource-action" target="_blank">
                       <i class="fas fa-download"></i> Download
                   </a>
                   <button class="week-resource-action copy-btn" onclick="copyToClipboard('${guide.url}', '${guide.title}')" title="Copy link">
                       <i class="fas fa-link"></i> Copy Link
                   </button>
               </div>
             </div>
             `;
             });
             
             html += `
                   </div>
               </div>
             </div>
             </div>
             `;
             
             // Team Guide dropdown
             html += `
             <div class="accordion-item weekly-accordion">
             <h2 class="accordion-header">
               <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#weekendTeamGuides">
                   <i class="fas fa-users-cog me-2"></i> Team Guide
               </button>
             </h2>
             <div id="weekendTeamGuides" class="accordion-collapse collapse" data-bs-parent="#weekendAccordion">
               <div class="accordion-body">
                   <div class="week-resources">
             `;
             
             weekendResources.teamGuides.forEach(guide => {
             html += `
             <div class="week-resource-card">
               <h5 class="week-resource-title">${guide.title}</h5>
               <div class="resource-actions">
                   <a href="${guide.url}" class="week-resource-action" target="_blank">
                       <i class="fas fa-download"></i> Download
                   </a>
                   <button class="week-resource-action copy-btn" onclick="copyToClipboard('${guide.url}', '${guide.title}')" title="Copy link">
                       <i class="fas fa-link"></i> Copy Link
                   </button>
               </div>
             </div>
             `;
             });
             
             html += `
                   </div>
               </div>
             </div>
             </div>
             `;
             
             container.innerHTML = html;
         }
         
         function generateAdditionalGuides() {
             const container = document.getElementById('guidesGrid');
             let html = '';
             
             additionalGuides.forEach(guide => {
                 html += `
                     <div class="col-lg-4 col-md-6 mb-4 guide-item stagger-item">
                         <div class="guide-card">
                             <div class="guide-header">
                                 <div class="guide-icon">
                                     <i class="${guide.icon}"></i>
                                 </div>
                                 <h5 class="guide-title">${guide.title}</h5>
                             </div>
                             <p class="guide-description">${guide.description}</p>
                             <div class="guide-actions">
                                 <a href="${guide.url}" class="guide-link" target="_blank">
                                     <i class="fas fa-download"></i> Download
                                 </a>
                                 <button class="guide-link copy-btn" onclick="copyToClipboard('${guide.url}', '${guide.title}')" title="Copy link">
                                     <i class="fas fa-link"></i> Copy Link
                                 </button>
                             </div>
                         </div>
                     </div>
                 `;
             });
             
             container.innerHTML = html;
         }
         
         // Wait for DOM to be fully loaded before initializing
         document.addEventListener('DOMContentLoaded', initializeApp);
         // Function to show form status message
         function showFormStatus(type, message) {
          const statusElement = document.getElementById('formStatus');
          statusElement.textContent = message;
          statusElement.className = 'form-status ' + type;
          statusElement.style.display = 'block';
          
          // Hide the message after 5 seconds
          setTimeout(() => {
              statusElement.style.display = 'none';
          }, 5000);
         }
         
         // Form submission handler with Google Sheets integration
         document.getElementById('feedbackForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          // Get form data
          const formData = {
              name: document.getElementById('name').value,
              role: document.getElementById('role').value,
              category: document.getElementById('category').value,
              weekNumber: document.getElementById('weekNumber').value,
              idea: document.getElementById('idea').value,
              timestamp: new Date().toISOString()
          };
          
          // Show loading state
          const submitBtn = document.getElementById('submitBtn');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
          submitBtn.disabled = true;
          
          // Check if Google Script URL is configured
          // Note: We check against a placeholder just in case it wasn't updated, 
          // but your current code has the URL filled in.
          if (GOOGLE_SCRIPT_URL === 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec') {
              showFormStatus('error', 'Google Sheets integration is not configured. Please set up your Google Apps Script and update the GOOGLE_SCRIPT_URL variable.');
              submitBtn.innerHTML = originalBtnText;
              submitBtn.disabled = false;
              return;
          }
          
          // Send data to Google Sheets via Google Apps Script
          // text/plain avoids a CORS preflight, so the real response can be read
          fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              mode: 'cors',
              headers: {
                  'Content-Type': 'text/plain;charset=utf-8',
              },
              body: JSON.stringify(formData)
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json().catch(() => ({}));
          })
          .then(() => {
              showFormStatus('success', 'Thank you for sharing! Your ideas will help others create welcoming spaces where faith can grow.');
              document.getElementById('feedbackForm').reset();
          })
          .catch(error => {
              console.error('Error submitting form:', error);
              showFormStatus('error', 'There was an error submitting your form. Please try again later.');
          })
          .finally(() => {
              // Restore button state
              submitBtn.innerHTML = originalBtnText;
              submitBtn.disabled = false;
          });
         });
