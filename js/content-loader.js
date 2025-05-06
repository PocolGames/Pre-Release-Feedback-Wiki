// 콘텐츠 로더 객체
const ContentLoader = {
    // 현재 활성화된 페이지
    activePage: 'home',
    
    // 페이지 초기화
    init: function() {
        // 해시 변경 이벤트 리스너
        window.addEventListener('hashchange', this.handleHashChange.bind(this));
        
        // 초기 페이지 로드
        this.handleHashChange();
    },
    
    // 해시 변경 처리
    handleHashChange: function() {
        let pageId = window.location.hash.substring(1) || 'home';
        this.loadPage(pageId);
    },
    
    // 페이지 로드
    loadPage: function(pageId) {
        const mainContent = document.getElementById('main-content');
        
        // 로딩 표시
        mainContent.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> 로딩 중...</div>';
        
        // 메뉴 활성화 상태 변경
        this.updateActiveMenu(pageId);
        
        // HTML 페이지 파일 로드
        fetch(`pages/${pageId}.html`)
            .then(response => response.text())
            .then(html => {
                mainContent.innerHTML = html;
                
                // 페이지별 데이터 로드
                this.loadPageData(pageId);
                
                // 페이지별 이벤트 리스너 설정
                this.setupPageEvents(pageId);
            })
            .catch(error => {
                console.error('페이지 로드 실패:', error);
                mainContent.innerHTML = '<div class="error-message">페이지를 불러오는 데 실패했습니다.</div>';
            });
    },
    
    // 메뉴 활성화 상태 업데이트
    updateActiveMenu: function(pageId) {
        const allLinks = document.querySelectorAll('.nav-links li');
        allLinks.forEach(link => link.classList.remove('active'));
        
        const activeLink = document.querySelector(`.nav-links li a[href="#${pageId}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }
    },
    
    // 페이지별 데이터 로드
    loadPageData: function(pageId) {
        switch(pageId) {
            case 'home':
                this.loadPosts();
                break;
            case 'gallery':
                this.loadProjects();
                break;
            case 'feedback':
                this.loadMembers();
                this.loadFeedbacks();
                break;
            // 다른 페이지는 기본 HTML만 로드
        }
    },
    
    // 활동 내역 포스트 로드
    loadPosts: function() {
        fetch('data/posts.json')
            .then(response => response.json())
            .then(data => {
                const postsContainer = document.getElementById('posts-container');
                if (!postsContainer) return;
                
                let postsHTML = '';
                
                // 포스트 데이터로 HTML 생성
                data.posts.forEach(post => {
                    postsHTML += `
                        <div class="post">
                            <div class="post-header">
                                <div class="post-avatar">PR</div>
                                <div class="post-info">
                                    <h3>${post.title}</h3>
                                    <span class="post-date">${post.date}</span>
                                </div>
                            </div>
                            <div class="post-content">
                                ${post.content.map(p => `<p>${p}</p>`).join('')}
                            </div>
                            <div class="post-footer">
                                <span class="post-reaction"><i class="far fa-heart"></i> ${post.likes}</span>
                                <span class="post-comments"><i class="far fa-comment"></i> ${post.comments}</span>
                                <span class="post-share"><i class="far fa-share-square"></i></span>
                            </div>
                        </div>
                    `;
                });
                
                postsContainer.innerHTML = postsHTML;
                
                // 이벤트 리스너 설정
                Interactions.setupPostInteractions();
            })
            .catch(error => {
                console.error('포스트 데이터 로드 실패:', error);
            });
    },
    
    // 프로젝트(작업물) 로드
    loadProjects: function() {
        fetch('data/projects.json')
            .then(response => response.json())
            .then(data => {
                const galleryGrid = document.querySelector('.gallery-grid');
                if (!galleryGrid) return;
                
                let projectsHTML = '';
                
                // 프로젝트 데이터로 HTML 생성
                data.projects.forEach(project => {
                    projectsHTML += `
                        <div class="gallery-item ${project.category}">
                            <div class="gallery-image ${project.image ? '' : 'placeholder'}">
                                ${project.image 
                                    ? `<img src="${project.image}" alt="${project.title}">` 
                                    : `<div class="image-placeholder">${project.categoryName} 작업물</div>`
                                }
                            </div>
                            <div class="gallery-info">
                                <h3>${project.title}</h3>
                                <p>${project.author}</p>
                                <div class="gallery-links">
                                    <a href="#" class="view-btn" data-id="${project.id}"><i class="fas fa-eye"></i> 자세히 보기</a>
                                    ${project.github 
                                        ? `<a href="${project.github}" target="_blank" class="github-btn"><i class="fab fa-github"></i> GitHub</a>` 
                                        : ''
                                    }
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                galleryGrid.innerHTML = projectsHTML;
                
                // 이벤트 리스너 설정
                Interactions.setupGalleryEvents();
            })
            .catch(error => {
                console.error('프로젝트 데이터 로드 실패:', error);
            });
    },
    
    // 멤버 정보 로드
    loadMembers: function() {
        fetch('data/members.json')
            .then(response => response.json())
            .then(data => {
                const memberTabs = document.querySelector('.member-tabs');
                if (!memberTabs) return;
                
                let tabsHTML = '';
                
                // 멤버 탭 HTML 생성
                data.members.forEach((member, index) => {
                    tabsHTML += `
                        <button class="member-tab ${index === 0 ? 'active' : ''}" 
                                data-member="${member.id}">${member.name}</button>
                    `;
                });
                
                memberTabs.innerHTML = tabsHTML;
                
                // 이벤트 리스너 설정
                Interactions.setupMemberTabs();
            })
            .catch(error => {
                console.error('멤버 데이터 로드 실패:', error);
            });
    },
    
    // 피드백 내용 로드
    loadFeedbacks: function() {
        Promise.all([
            fetch('data/members.json').then(res => res.json()),
            fetch('data/feedbacks.json').then(res => res.json())
        ])
        .then(([membersData, feedbacksData]) => {
            const feedbackContainer = document.querySelector('.feedback-container');
            if (!feedbackContainer) return;
            
            let feedbacksHTML = '';
            
            // 각 멤버별 피드백 HTML 생성
            membersData.members.forEach((member, index) => {
                // 해당 멤버의 피드백 필터링
                const memberFeedbacks = feedbacksData.feedbacks.filter(f => f.memberId === member.id);
                
                feedbacksHTML += `
                    <div class="member-feedback ${index === 0 ? 'active' : ''}" id="${member.id}-feedback">
                        <div class="member-info">
                            <h3>${member.name}</h3>
                            <p>${member.role}</p>
                            <div class="member-links">
                                <a href="#gallery" class="member-gallery-btn" data-filter="${member.id}">
                                    <i class="fas fa-images"></i> 작업물 보기
                                </a>
                                ${member.github 
                                    ? `<a href="${member.github}" target="_blank" class="github-btn">
                                         <i class="fab fa-github"></i> GitHub
                                       </a>` 
                                    : ''
                                }
                            </div>
                        </div>
                        
                        <div class="feedback-list">
                `;
                
                // 피드백 항목 추가
                if (memberFeedbacks.length > 0) {
                    memberFeedbacks.forEach(feedback => {
                        feedbacksHTML += `
                            <div class="feedback-item">
                                <div class="feedback-header">
                                    <h4>${feedback.title}</h4>
                                    <span class="feedback-date">${feedback.date}</span>
                                </div>
                                <div class="feedback-content">
                                    ${feedback.content.map(p => `<p>${p}</p>`).join('')}
                                </div>
                            </div>
                        `;
                    });
                } else {
                    feedbacksHTML += `
                        <div class="no-feedback">
                            <p>아직 피드백 내용이 없습니다.</p>
                        </div>
                    `;
                }
                
                feedbacksHTML += `
                        </div>
                    </div>
                `;
            });
            
            feedbackContainer.innerHTML = feedbacksHTML;
            
            // 이벤트 리스너 설정
            Interactions.setupFeedbackEvents();
        })
        .catch(error => {
            console.error('피드백 데이터 로드 실패:', error);
        });
    },
    
    // 페이지별 이벤트 리스너 설정
    setupPageEvents: function(pageId) {
        switch(pageId) {
            case 'home':
                Interactions.setupPostInteractions();
                break;
            case 'gallery':
                Interactions.setupGalleryFilter();
                break;
            case 'feedback':
                Interactions.setupMemberTabs();
                Interactions.setupFeedbackEvents();
                break;
        }
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    ContentLoader.init();
});
