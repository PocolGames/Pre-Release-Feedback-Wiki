/**
 * 갤러리 모듈
 * 작업물 갤러리를 관리하는 기능을 제공합니다.
 */
class GalleryManager {
    constructor() {
        // 초기 필터 상태
        this.filters = {
            category: 'all',
            author: 'all',
            season: 'all'
        };
        
        // 필터 옵션 저장용 객체
        this.filterOptions = {
            categories: [],
            authors: [],
            seasons: []
        };
        
        // 전체 프로젝트 데이터
        this.projects = [];
        
        // 필터된 프로젝트
        this.filteredProjects = [];
        
        // DOM 요소
        this.galleryGrid = document.querySelector('.gallery-grid');
        
        // 초기화
        this.init();
    }
    
    /**
     * 갤러리 초기화
     */
    async init() {
        try {
            // 갤러리 필터 UI 생성
            this.createFilterUI();
            
            // 프로젝트 데이터 로드
            await this.loadProjectsData();
            
            // 필터 옵션 설정
            this.setupFilterOptions();
            
            // 필터 이벤트 설정
            this.setupFilterEvents();
            
            // 초기 갤러리 렌더링
            this.renderGallery();
        } catch (error) {
            console.error('갤러리 초기화 실패:', error);
            this.showError('갤러리를 불러오는 데 실패했습니다.');
        }
    }
    
    /**
     * 갤러리 필터 UI 생성
     */
    createFilterUI() {
        const gallerySection = document.getElementById('gallery');
        if (!gallerySection) return;
        
        // 이전 탭 제거
        const oldTabs = gallerySection.querySelector('.gallery-tabs');
        if (oldTabs) {
            oldTabs.remove();
        }
        
        // 새 필터 UI 추가
        const filtersHTML = `
            <div class="gallery-filters">
                <div class="filter-group">
                    <label class="filter-label">직군</label>
                    <div class="filter-dropdown">
                        <button class="filter-btn" id="category-filter">
                            <span class="filter-text">전체</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="filter-options" id="category-options">
                            <button class="filter-option active" data-value="all">전체</button>
                            <!-- 동적으로 옵션 추가 -->
                        </div>
                    </div>
                </div>
                
                <div class="filter-group">
                    <label class="filter-label">작업자</label>
                    <div class="filter-dropdown">
                        <button class="filter-btn" id="author-filter">
                            <span class="filter-text">전체</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="filter-options" id="author-options">
                            <button class="filter-option active" data-value="all">전체</button>
                            <!-- 동적으로 옵션 추가 -->
                        </div>
                    </div>
                </div>
                
                <div class="filter-group">
                    <label class="filter-label">시즌</label>
                    <div class="filter-dropdown">
                        <button class="filter-btn" id="season-filter">
                            <span class="filter-text">전체</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                        <div class="filter-options" id="season-options">
                            <button class="filter-option active" data-value="all">전체</button>
                            <!-- 동적으로 옵션 추가 -->
                        </div>
                    </div>
                </div>
                
                <button class="filter-clear" id="clear-filters">
                    <i class="fas fa-undo"></i> 필터 초기화
                </button>
            </div>
        `;
        
        // 필터 UI 삽입
        const sectionTitle = gallerySection.querySelector('.section-title');
        sectionTitle.insertAdjacentHTML('afterend', filtersHTML);
        
        // 갤러리 그리드가 없으면 생성
        if (!this.galleryGrid) {
            const galleryGridHTML = '<div class="gallery-grid"></div>';
            gallerySection.insertAdjacentHTML('beforeend', galleryGridHTML);
            this.galleryGrid = gallerySection.querySelector('.gallery-grid');
        }
    }
    
    /**
     * 프로젝트 데이터 로드
     */
    async loadProjectsData() {
        try {
            const response = await fetch('data/projects.json');
            const data = await response.json();
            this.projects = data.projects;
            this.filteredProjects = [...this.projects];
            
            // 프로젝트에 시즌 정보 추가 (없는 경우 추출)
            this.projects.forEach(project => {
                if (!project.season) {
                    // 제목에서 시즌 정보 추출 (예: Art Feedback Session 1 -> Session 1)
                    const sessionMatch = project.title.match(/Session\s+(\d+)/i);
                    if (sessionMatch) {
                        project.season = `Session ${sessionMatch[1]}`;
                    } else {
                        project.season = '기타';
                    }
                }
            });
            
            return data;
        } catch (error) {
            console.error('프로젝트 데이터 로드 실패:', error);
            throw error;
        }
    }
    
    /**
     * 필터 옵션 설정
     */
    setupFilterOptions() {
        // 고유한 카테고리, 작업자, 시즌 추출
        const categories = [...new Set(this.projects.map(p => p.category))];
        const authors = [...new Set(this.projects.map(p => p.author))];
        const seasons = [...new Set(this.projects.map(p => p.season))];
        
        // 필터 옵션 저장
        this.filterOptions = {
            categories: categories.map(category => ({
                value: category,
                label: category === 'programmer' ? '프로그래머' : '디자이너'
            })),
            authors: authors.map(author => ({
                value: author,
                label: author
            })),
            seasons: seasons.map(season => ({
                value: season,
                label: season
            }))
        };
        
        // 필터 옵션 UI 업데이트
        this.updateFilterOptionsUI();
    }
    
    /**
     * 필터 옵션 UI 업데이트
     */
    updateFilterOptionsUI() {
        // 카테고리 옵션 업데이트
        const categoryOptions = document.getElementById('category-options');
        if (categoryOptions) {
            let categoryHTML = '<button class="filter-option active" data-value="all">전체</button>';
            
            this.filterOptions.categories.forEach(category => {
                categoryHTML += `
                    <button class="filter-option" data-value="${category.value}">
                        ${category.label}
                    </button>
                `;
            });
            
            categoryOptions.innerHTML = categoryHTML;
        }
        
        // 작업자 옵션 업데이트
        const authorOptions = document.getElementById('author-options');
        if (authorOptions) {
            let authorHTML = '<button class="filter-option active" data-value="all">전체</button>';
            
            this.filterOptions.authors.forEach(author => {
                authorHTML += `
                    <button class="filter-option" data-value="${author.value}">
                        ${author.label}
                    </button>
                `;
            });
            
            authorOptions.innerHTML = authorHTML;
        }
        
        // 시즌 옵션 업데이트
        const seasonOptions = document.getElementById('season-options');
        if (seasonOptions) {
            let seasonHTML = '<button class="filter-option active" data-value="all">전체</button>';
            
            this.filterOptions.seasons.forEach(season => {
                seasonHTML += `
                    <button class="filter-option" data-value="${season.value}">
                        ${season.label}
                    </button>
                `;
            });
            
            seasonOptions.innerHTML = seasonHTML;
        }
    }
    
    /**
     * 필터 이벤트 설정
     */
    setupFilterEvents() {
        // 드롭다운 토글 이벤트
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const dropdown = btn.nextElementSibling;
                
                // 다른 모든 드롭다운 닫기
                document.querySelectorAll('.filter-options').forEach(d => {
                    if (d !== dropdown) {
                        d.classList.remove('show');
                    }
                });
                
                // 현재 드롭다운 토글
                dropdown.classList.toggle('show');
                btn.classList.toggle('active');
            });
        });
        
        // 필터 옵션 클릭 이벤트
        document.addEventListener('click', e => {
            if (e.target.classList.contains('filter-option')) {
                const filterType = e.target.closest('.filter-options').id.split('-')[0]; // category, author, season
                const value = e.target.dataset.value;
                const btnText = e.target.textContent.trim();
                
                // 필터 업데이트
                this.updateFilter(filterType, value);
                
                // 버튼 텍스트 업데이트
                const filterBtn = document.getElementById(`${filterType}-filter`);
                filterBtn.querySelector('.filter-text').textContent = btnText;
                
                // 드롭다운 닫기
                e.target.closest('.filter-options').classList.remove('show');
                filterBtn.classList.remove('active');
                
                // 활성 옵션 업데이트
                e.target.closest('.filter-options').querySelectorAll('.filter-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // 갤러리 업데이트
                this.applyFilters();
            }
        });
        
        // 필터 초기화 버튼 이벤트
        const clearBtn = document.getElementById('clear-filters');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
        
        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', e => {
            if (!e.target.closest('.filter-dropdown')) {
                document.querySelectorAll('.filter-options').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
        });
    }
    
    /**
     * 필터 업데이트
     * @param {string} filterType - 필터 유형 (category, author, season)
     * @param {string} value - 필터 값
     */
    updateFilter(filterType, value) {
        this.filters[filterType] = value;
    }
    
    /**
     * 필터 적용
     */
    applyFilters() {
        // 필터링 로직
        this.filteredProjects = this.projects.filter(project => {
            // 카테고리 필터
            if (this.filters.category !== 'all' && project.category !== this.filters.category) {
                return false;
            }
            
            // 작업자 필터
            if (this.filters.author !== 'all' && project.author !== this.filters.author) {
                return false;
            }
            
            // 시즌 필터
            if (this.filters.season !== 'all' && project.season !== this.filters.season) {
                return false;
            }
            
            return true;
        });
        
        // 갤러리 렌더링
        this.renderGallery();
    }
    
    /**
     * 필터 초기화
     */
    resetFilters() {
        // 필터 상태 초기화
        this.filters = {
            category: 'all',
            author: 'all',
            season: 'all'
        };
        
        // UI 업데이트
        document.querySelectorAll('.filter-btn .filter-text').forEach(span => {
            span.textContent = '전체';
        });
        
        document.querySelectorAll('.filter-options').forEach(dropdown => {
            dropdown.querySelectorAll('.filter-option').forEach(option => {
                option.classList.remove('active');
                if (option.dataset.value === 'all') {
                    option.classList.add('active');
                }
            });
        });
        
        // 갤러리 업데이트
        this.filteredProjects = [...this.projects];
        this.renderGallery();
    }
    
    /**
     * 갤러리 렌더링
     */
    renderGallery() {
        if (!this.galleryGrid) return;
        
        // 로딩 요소 추가
        this.galleryGrid.innerHTML = '<div class="loading-projects"><i class="fas fa-spinner fa-spin"></i> 작업물 로딩 중...</div>';
        
        // 약간의 지연으로 로딩 표시 효과
        setTimeout(() => {
            if (this.filteredProjects.length === 0) {
                // 프로젝트가 없는 경우
                this.galleryGrid.innerHTML = `
                    <div class="no-projects">
                        <i class="fas fa-search"></i>
                        <p>필터에 맞는 작업물이 없습니다.</p>
                    </div>
                `;
                return;
            }
            
            let galleryHTML = '';
            
            // 프로젝트 아이템 생성
            this.filteredProjects.forEach(project => {
                galleryHTML += this.createProjectItemHTML(project);
            });
            
            // 갤러리 그리드 업데이트
            this.galleryGrid.innerHTML = galleryHTML;
            
            // 상세 보기 이벤트 설정
            this.setupProjectDetailEvents();
        }, 300);
    }
    
    /**
     * 프로젝트 아이템 HTML 생성
     * @param {Object} project - 프로젝트 데이터
     * @return {string} 프로젝트 아이템 HTML
     */
    createProjectItemHTML(project) {
        // 태그 생성
        const tags = [];
        
        // 카테고리 태그
        if (project.categoryName) {
            tags.push(project.categoryName);
        }
        
        // 시즌 태그
        if (project.season) {
            tags.push(project.season);
        }
        
        // 태그 HTML
        const tagsHTML = tags.length > 0 
            ? `<div class="project-tags">${tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}</div>` 
            : '';
        
        return `
            <div class="gallery-item" data-id="${project.id}">
                <div class="gallery-image ${project.image ? '' : 'placeholder'}">
                    ${project.image 
                        ? `<img src="${project.image}" alt="${project.title}" loading="lazy">` 
                        : `<div class="image-placeholder">${project.title}</div>`
                    }
                </div>
                <div class="gallery-info">
                    <h3>${project.title}</h3>
                    <p>${project.author}</p>
                    ${tagsHTML}
                    <div class="gallery-links">
                        <a href="#" class="view-btn" data-id="${project.id}">
                            <i class="fas fa-eye"></i> 자세히 보기
                        </a>
                        ${project.github 
                            ? `<a href="${project.github}" target="_blank" class="github-btn">
                                 <i class="fab fa-github"></i> GitHub
                               </a>` 
                            : ''
                        }
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 프로젝트 상세 보기 이벤트 설정
     */
    setupProjectDetailEvents() {
        const viewButtons = document.querySelectorAll('.view-btn');
        
        viewButtons.forEach(button => {
            button.addEventListener('click', e => {
                e.preventDefault();
                const projectId = button.getAttribute('data-id');
                this.showProjectDetails(projectId);
            });
        });
    }
    
    /**
     * 프로젝트 상세 보기 표시
     * @param {string} projectId - 프로젝트 ID
     */
    showProjectDetails(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        
        if (!project) {
            alert('프로젝트 정보를 찾을 수 없습니다.');
            return;
        }
        
        // 시즌 정보 추출
        const season = project.season || '기타';
        
        // 모달 생성
        const modal = document.createElement('div');
        modal.classList.add('project-modal');
        
        // 모달 내용 설정
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>${project.title}</h2>
                <p class="project-author">제작자: ${project.author}</p>
                
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i> ${project.categoryName || (project.category === 'programmer' ? '프로그래머' : '디자이너')}
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i> ${season}
                    </div>
                </div>
                
                <div class="project-details">
                    ${project.description ? project.description.map(p => `<p>${p}</p>`).join('') : ''}
                </div>
                
                ${project.images && project.images.length > 0 ?
                    `<div class="project-gallery">
                        ${project.images.map(img => `<img src="${img}" alt="${project.title}" loading="lazy">`).join('')}
                    </div>` : ''
                }
                
                ${project.github ?
                    `<a href="${project.github}" target="_blank" class="github-btn" style="margin-top: 20px; display: inline-block;">
                        <i class="fab fa-github"></i> GitHub 바로가기
                    </a>` : ''
                }
            </div>
        `;
        
        // 모달 추가
        document.body.appendChild(modal);
        
        // 모달 닫기 이벤트
        const closeButton = modal.querySelector('.close-modal');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // 외부 클릭 시 모달 닫기
        modal.addEventListener('click', e => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // ESC 키 누를 때 모달 닫기
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && document.querySelector('.project-modal')) {
                document.body.removeChild(modal);
            }
        });
        
        // 이미지 클릭 시 확대 보기 (Lightbox)
        const galleryImages = modal.querySelectorAll('.project-gallery img');
        galleryImages.forEach(img => {
            img.addEventListener('click', () => {
                this.showImageLightbox(img.src, project.title);
            });
        });
    }
    
    /**
     * 이미지 라이트박스 표시
     * @param {string} imageSrc - 이미지 경로
     * @param {string} imageAlt - 이미지 대체 텍스트
     */
    showImageLightbox(imageSrc, imageAlt) {
        // 이미 라이트박스가 있으면 제거
        const existingLightbox = document.querySelector('.image-lightbox');
        if (existingLightbox) {
            document.body.removeChild(existingLightbox);
        }
        
        // 라이트박스 생성
        const lightbox = document.createElement('div');
        lightbox.classList.add('image-lightbox');
        
        // 라이트박스 내용 설정
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="close-lightbox">&times;</span>
                <img src="${imageSrc}" alt="${imageAlt || '이미지'}" class="lightbox-image">
                <p class="lightbox-caption">${imageAlt || '이미지'}</p>
            </div>
        `;
        
        // 라이트박스 추가
        document.body.appendChild(lightbox);
        
        // 닫기 이벤트
        const closeButton = lightbox.querySelector('.close-lightbox');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(lightbox);
        });
        
        // 외부 클릭 시 닫기
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
                document.body.removeChild(lightbox);
            }
        });
    }
    
    /**
     * 오류 메시지 표시
     * @param {string} message - 오류 메시지
     */
    showError(message) {
        if (!this.galleryGrid) return;
        
        this.galleryGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// 갤러리 모듈 내보내기
export default GalleryManager;
