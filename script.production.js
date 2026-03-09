// Production script – uses only window.__PROJECTS_DATA__ (embedded). No Supabase, no localStorage.

(function() {
    'use strict';

    const DATA = window.__PROJECTS_DATA__ || { projects: [], siteSettings: {} };
    const projects = DATA.projects || [];
    const siteSettings = DATA.siteSettings || {};

    function getProjectsData() {
        return { projects };
    }

    function getFeaturedProjects() {
        return projects.filter(p => p.featured === true).slice(0, 4);
    }

    function getProjectBySlug(slug) {
        return projects.find(p => p.id === slug) || null;
    }

    function createProjectCard(project) {
        const card = document.createElement('a');
        card.href = 'project.html?slug=' + encodeURIComponent(project.id);
        card.className = 'project-card';

        const image = document.createElement('img');
        image.src = project.thumbnail || '';
        image.alt = project.title;
        image.className = 'project-card-image';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%231a1a1a" width="800" height="450"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="24"%3EImage%3C/text%3E%3C/svg%3E';
        };

        const content = document.createElement('div');
        content.className = 'project-card-content';

        const title = document.createElement('h3');
        title.className = 'project-card-title';
        title.textContent = project.title;

        const headline = document.createElement('p');
        headline.className = 'project-card-headline';
        headline.textContent = project.headline || '';

        const link = document.createElement('span');
        link.className = 'project-card-link';
        link.textContent = 'View →';

        content.appendChild(title);
        if (project.project_type) {
            const typeLabel = document.createElement('span');
            typeLabel.className = 'project-card-type';
            typeLabel.textContent = project.project_type;
            content.appendChild(typeLabel);
        }
        content.appendChild(headline);
        content.appendChild(link);
        card.appendChild(image);
        card.appendChild(content);

        return card;
    }

    function loadFeaturedProjects() {
        const grid = document.getElementById('featured-projects-grid');
        if (!grid) return;

        const featured = getFeaturedProjects();
        grid.innerHTML = '';

        if (featured.length === 0) {
            grid.innerHTML = '<p class="loading">No featured projects yet.</p>';
            return;
        }

        featured.forEach(project => {
            grid.appendChild(createProjectCard(project));
        });
    }

    function loadAllProjects() {
        const grid = document.getElementById('all-projects-grid');
        if (!grid) return;

        const data = getProjectsData();
        grid.innerHTML = '';

        if (data.projects.length === 0) {
            grid.innerHTML = '<p class="loading">No projects yet.</p>';
            return;
        }

        data.projects.forEach(project => {
            grid.appendChild(createProjectCard(project));
        });
    }

    function updateProjectMetaTags(project) {
        const title = (project.title ? project.title + ' - ' : '') + 'Bashir Garguom';
        document.title = title;
        const desc = project.headline || project.description || 'Commercial film project by Bashir Garguom';
        const img = project.thumbnail || (project.media && project.media.poster) || '';

        function setMeta(name, content) {
            let el = document.querySelector('meta[name="' + name + '"]');
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('name', name);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content || '');
        }
        function setProp(prop, content) {
            let el = document.querySelector('meta[property="' + prop + '"]');
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute('property', prop);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content || '');
        }

        setMeta('title', title);
        setMeta('description', desc);
        setProp('og:title', title);
        setProp('og:description', desc);
        setProp('og:image', img);
        setProp('og:url', window.location.href);
    }

    function addProjectStructuredData(project) {
        const existing = document.getElementById('project-structured-data');
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.id = 'project-structured-data';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: project.title,
            description: project.headline || project.description,
            image: project.thumbnail || (project.media && project.media.poster),
            author: { '@type': 'Person', name: 'Bashir Garguom' },
            datePublished: project.year || null
        });
        document.head.appendChild(script);
    }

    function loadProjectDetails() {
        const content = document.getElementById('project-content');
        if (!content) return;

        const urlParams = new URLSearchParams(window.location.search);
        const projectSlug = urlParams.get('slug') || urlParams.get('id');

        if (!projectSlug) {
            content.innerHTML = '<p class="loading">Project not found.</p>';
            return;
        }

        const project = getProjectBySlug(projectSlug);

        if (!project) {
            content.innerHTML = '<p class="loading">Project not found.</p>';
            return;
        }

        const media = project.media || { type: 'image', url: '', poster: '' };
        let html = '<div class="project-header"><h1 class="project-title">' + escapeHtml(project.title) + '</h1><p class="project-headline">' + escapeHtml(project.headline || '') + '</p></div>';

        html += '<div class="project-media">';
        if (media.type === 'video' && media.url) {
            if (typeof window.createVideoEmbed === 'function') {
                html += window.createVideoEmbed(media.url, media.poster || project.thumbnail || '');
            } else {
                html += '<div class="video-container"><video controls poster="' + escapeAttr(media.poster || project.thumbnail || '') + '" preload="metadata" playsinline><source src="' + escapeAttr(media.url) + '" type="video/mp4">Your browser does not support the video tag.</video></div>';
            }
        } else if (media.url) {
            html += '<img src="' + escapeAttr(media.url) + '" alt="' + escapeAttr(project.title) + '" loading="lazy" decoding="async">';
        }
        html += '</div>';

        html += '<p class="project-description">' + escapeHtml(project.description || '') + '</p>';

        if (project.gallery_images && project.gallery_images.length > 0) {
            html += '<div class="project-gallery">';
            project.gallery_images.forEach(function(url) {
                html += '<img src="' + escapeAttr(url) + '" alt="' + escapeAttr(project.title) + '" class="project-gallery-image" loading="lazy" decoding="async">';
            });
            html += '</div>';
        }

        html += '<div class="project-details">';
        if (project.client) {
            html += '<div class="project-detail-item"><span class="project-detail-label">Client</span><span class="project-detail-value">' + escapeHtml(project.client) + '</span></div>';
        }
        if (project.project_type) {
            html += '<div class="project-detail-item"><span class="project-detail-label">Project Type</span><span class="project-detail-value">' + escapeHtml(project.project_type) + '</span></div>';
        }
        if (project.project_role) {
            html += '<div class="project-detail-item"><span class="project-detail-label">Role</span><span class="project-detail-value">' + escapeHtml(project.project_role) + '</span></div>';
        }
        if (project.year) {
            html += '<div class="project-detail-item"><span class="project-detail-label">Year</span><span class="project-detail-value">' + escapeHtml(project.year) + '</span></div>';
        }
        html += '</div>';

        content.innerHTML = html;

        updateProjectMetaTags(project);
        addProjectStructuredData(project);
    }

    function escapeHtml(s) {
        if (!s) return '';
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    function escapeAttr(s) {
        if (!s) return '';
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function loadHeroPortrait() {
        const bgContainer = document.getElementById('hero-portrait-background');
        const bgImage = document.getElementById('hero-portrait-bg-image');
        if (!bgContainer || !bgImage) return;

        const url = siteSettings.hero_portrait_image;
        if (url) {
            bgImage.src = url;
            bgImage.onload = function() { bgContainer.style.display = 'block'; };
            bgImage.onerror = function() { bgContainer.style.display = 'none'; };
        } else {
            bgContainer.style.display = 'none';
        }
    }

    function loadAboutBackground() {
        const container = document.getElementById('about-background-image');
        const image = document.getElementById('about-bg-img');
        if (!container || !image) return;

        const url = siteSettings.about_background_image;
        if (url && url.trim() !== '') {
            image.onload = function() { container.classList.add('has-image'); };
            image.onerror = function() { container.classList.remove('has-image'); };
            image.src = url;
            if (image.complete && image.naturalWidth) container.classList.add('has-image');
        } else {
            container.classList.remove('has-image');
        }
    }

    function loadContactBackground() {
        const container = document.getElementById('contact-background-image');
        const image = document.getElementById('contact-bg-img');
        if (!container || !image) return;

        const url = siteSettings.contact_image;
        if (url && url.trim() !== '') {
            image.onload = function() { container.classList.add('has-image'); };
            image.onerror = function() { container.classList.remove('has-image'); };
            image.src = url;
            if (image.complete && image.naturalWidth) container.classList.add('has-image');
        } else {
            container.classList.remove('has-image');
        }
    }

    function loadContactInfo() {
        const emailBtn = document.getElementById('contact-email-btn');
        const phoneBtn = document.getElementById('contact-phone-btn');
        const whatsappBtn = document.getElementById('contact-whatsapp-btn');
        const instagramBtn = document.getElementById('contact-instagram-btn');

        if (!emailBtn || !phoneBtn || !whatsappBtn || !instagramBtn) return;

        const email = siteSettings.contact_email || null;
        const phone = siteSettings.contact_phone || null;
        const whatsapp = siteSettings.contact_whatsapp || null;
        const instagram = siteSettings.contact_instagram || null;

        if (email) {
            emailBtn.href = 'mailto:' + email;
            emailBtn.style.display = 'flex';
        } else { emailBtn.style.display = 'none'; }

        if (phone) {
            phoneBtn.href = 'tel:' + phone;
            phoneBtn.style.display = 'flex';
        } else { phoneBtn.style.display = 'none'; }

        if (whatsapp) {
            whatsappBtn.href = 'https://wa.me/' + (whatsapp.replace(/[^\d+]/g, ''));
            whatsappBtn.style.display = 'flex';
        } else { whatsappBtn.style.display = 'none'; }

        if (instagram) {
            instagramBtn.href = instagram;
            instagramBtn.style.display = 'flex';
        } else { instagramBtn.style.display = 'none'; }

        const contactInfoContainer = document.getElementById('contact-info');
        const emailInfo = document.getElementById('contact-email-info');
        const phoneInfo = document.getElementById('contact-phone-info');
        const emailValue = document.getElementById('contact-email-value');
        const phoneValue = document.getElementById('contact-phone-value');

        if (emailValue) { emailValue.textContent = email || ''; }
        if (emailInfo) { emailInfo.style.display = email ? 'flex' : 'none'; }
        if (phoneValue) { phoneValue.textContent = phone || ''; }
        if (phoneInfo) { phoneInfo.style.display = phone ? 'flex' : 'none'; }
        if (contactInfoContainer) {
            contactInfoContainer.style.display = (email || phone) ? 'flex' : 'none';
        }
    }

    function initializePages() {
        if (document.getElementById('hero-portrait-background')) loadHeroPortrait();
        if (document.getElementById('about-background-image')) loadAboutBackground();
        if (document.getElementById('contact-background-image')) loadContactBackground();
        if (document.getElementById('contact-buttons')) loadContactInfo();
        if (document.getElementById('featured-projects-grid')) loadFeaturedProjects();
        if (document.getElementById('all-projects-grid')) loadAllProjects();
        if (document.getElementById('project-content')) loadProjectDetails();
    }

    function initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu-toggle');
        const navLinks = document.getElementById('nav-links');
        const body = document.body;

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', function() {
                menuToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
                body.classList.toggle('menu-open');
            });

            const links = navLinks.querySelectorAll('a');
            for (var i = 0; i < links.length; i++) {
                links[i].addEventListener('click', function() {
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    body.classList.remove('menu-open');
                });
            }

            document.addEventListener('click', function(e) {
                if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    body.classList.remove('menu-open');
                }
            });
        }
    }

    function initNavigationScroll() {
        const nav = document.querySelector('.nav');
        if (!nav) return;

        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    function initFadeInAnimations() {
        const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -80px 0px' };
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const sections = document.querySelectorAll('section:not(.hero)');
        sections.forEach(function(section) {
            section.classList.add('scroll-reveal');
            observer.observe(section);
        });

        const headings = document.querySelectorAll('.section-subheading, .section-title-large');
        headings.forEach(function(heading, index) {
            heading.classList.add('scroll-reveal');
            heading.style.transitionDelay = (index * 0.1) + 's';
            observer.observe(heading);
        });

        function observeProjectCards() {
            const cards = document.querySelectorAll('.project-card:not(.observed)');
            cards.forEach(function(card, index) {
                card.classList.add('scroll-reveal', 'observed');
                card.style.transitionDelay = (index * 0.08) + 's';
                observer.observe(card);
            });
        }
        observeProjectCards();
        setTimeout(observeProjectCards, 500);
        setTimeout(observeProjectCards, 1000);
    }

    function init() {
        initializePages();
        initNavigationScroll();
        initMobileMenu();
        setTimeout(initFadeInAnimations, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
