// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 사이드바 메뉴 이벤트 설정
    setupNavigation();
    
    // 데이터 로드
    loadData();
    
    // 해시 변경 이벤트 리스너
    window.addEventListener('hashchange', handleHashChange);
    
    // 초기 페이지 로드
    handleHashChange();
});

// 네비게이션 설정
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 기본 이벤트 방지
            e.preventDefault();
            
            // 해시 변경
            window.location.hash = this.getAttribute('href').substring(1);
        });
    });
}

// 해시 변경 처리
function handleHashChange() {
    let pageId = window.location.hash.substring(1) || 'home';
    
    // 특수 페이지 처리 (apply-info는 상단 메뉴에 없음)
    if (pageId === 'apply-info') {
        // 메뉴 선택 상태 초기화
        const allLinks = document.querySelectorAll('.nav-links li');
        allLinks.forEach(link => link.classList.remove('active'));
    } else {
        // 메뉴 활성화 상태 변경
        updateActiveMenu(pageId);
    }
    
    // 페이지 표시
    showPage(pageId);
    
    // 제한된 콘텐츠 수동으로 처리 (인증 관련 JS에서 처리하기 위해)
    if (typeof handleRestrictedContent === 'function') {
        setTimeout(handleRestrictedContent, 100);
    }
}

// 메뉴 활성화 상태 업데이트
function updateActiveMenu(pageId) {
    const allLinks = document.querySelectorAll('.nav-links li');
    allLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`.nav-links li a[href="#${pageId}"]`);
    if (activeLink) {
        activeLink.parentElement.classList.add('active');
    }
}

// 페이지 표시
function showPage(pageId) {
    const allSections = document.querySelectorAll('main section');
    allSections.forEach(section => {
        section.classList.remove('active-section');
        section.classList.add('hidden-section');
    });
    
    const activeSection = document.getElementById(pageId);
    if (activeSection) {
        activeSection.classList.remove('hidden-section');
        activeSection.classList.add('active-section');
        
        // 피드백 페이지로 전환시 초기화
        if (pageId === 'feedback') {
            resetFeedbackPage();
        }
        
        // 로그인 페이지로 전환시 초기화
        if (pageId === 'login') {
            // 비밀번호 입력 필드 초기화
            const passwordInput = document.getElementById('password-input');
            const loginError = document.getElementById('login-error');
            if (passwordInput) {
                passwordInput.value = '';
                if (loginError) loginError.textContent = '';
            }
        }
        
        // 페이지 상단으로 스크롤
        window.scrollTo(0, 0);
    }
}

// 피드백 페이지 초기화
function resetFeedbackPage() {
    // 드롭다운 버튼 초기화
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.querySelector('.dropdown-text').textContent = '멤버 선택';
    });
    
    // 드롭다운 컨텐츠 닫기
    document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.remove('show');
    });
    
    // 메버 옵션 초기화
    document.querySelectorAll('.member-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // 모든 피드백 컨텐츠 완전히 제거
    document.querySelectorAll('.member-feedback').forEach(feedback => {
        feedback.classList.remove('active');
        feedback.style.display = 'none';
        feedback.style.opacity = '0';
    });
    
    // 초기 메시지 표시
    const initialMessage = document.querySelector('.initial-message');
    if (initialMessage) {
        initialMessage.style.visibility = 'visible';
        initialMessage.style.position = 'relative';
        initialMessage.style.height = 'auto';
        initialMessage.style.minHeight = '200px';
        initialMessage.style.padding = '50px 0';
    }
}

// 데이터 로드
function loadData() {
    // 포스트 데이터 로드
    fetch('data/posts.json')
        .then(response => response.json())
        .then(data => {
            loadPosts(data);
        })
        .catch(error => {
            console.error('포스트 데이터 로드 실패:', error);
            document.getElementById('posts-container').innerHTML = '<div class="error-message">포스트 데이터를 불러오는 데 실패했습니다.</div>';
        });
    
    // 멤버 및 피드백 데이터 로드
    Promise.all([
        fetch('data/members.json').then(res => res.json()),
        fetch('data/feedbacks.json').then(res => res.json())
    ])
    .then(([membersData, feedbacksData]) => {
        loadMembers(membersData);
        loadFeedbacks(membersData, feedbacksData);
    })
    .catch(error => {
        console.error('멤버/피드백 데이터 로드 실패:', error);
        document.querySelector('.member-tabs').innerHTML = '<div class="error-message">데이터를 불러오는 데 실패했습니다.</div>';
    });

    // 갤러리 매니저 초기화
    import('./components/galleryManager.js')
        .then(module => {
            const GalleryManager = module.default;
            window.galleryManager = new GalleryManager();
        })
        .catch(error => {
            console.error('갤러리 관리자 로드 실패:', error);
            const galleryGrid = document.querySelector('.gallery-grid');
            if (galleryGrid) {
                galleryGrid.innerHTML = '<div class="error-message">갤러리를 불러오는 데 실패했습니다.</div>';
            }
        });
}

// 포스트 로드
function loadPosts(data) {
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
    setupPostInteractions();
}

// 멤버 로드
function loadMembers(data) {
    // 프로그래머 드롭다운
    const programmerDropdown = document.querySelector('.programmer-dropdown-content');
    if (programmerDropdown) {
        let programmerHTML = '';
        
        // 프로그래머 필터링
        const programmers = data.members.filter(member => member.category === 'programmer');
        
        programmers.forEach((member, index) => {
            programmerHTML += `
                <button class="member-option" data-member="${member.id}">${member.name}</button>
            `;
        });
        
        programmerDropdown.innerHTML = programmerHTML;
    }
    
    // 디자이너 드롭다운
    const designerDropdown = document.querySelector('.designer-dropdown-content');
    if (designerDropdown) {
        let designerHTML = '';
        
        // 디자이너 필터링
        const designers = data.members.filter(member => member.category === 'designer');
        
        designers.forEach((member, index) => {
            designerHTML += `
                <button class="member-option" data-member="${member.id}">${member.name}</button>
            `;
        });
        
        designerDropdown.innerHTML = designerHTML;
    }
    
    // 이벤트 리스너 설정
    setupMemberDropdowns();
}

// 피드백 로드
function loadFeedbacks(membersData, feedbacksData) {
    const feedbackContainer = document.querySelector('.feedback-container');
    if (!feedbackContainer) return;
    
    let feedbacksHTML = '<div class="initial-message"><p>멤버를 선택하여 피드백 내용을 확인하세요.</p></div>';
    
    // 각 멤버별 피드백 HTML 생성
    membersData.members.forEach(member => {
        // 해당 멤버의 피드백 필터링
        const memberFeedbacks = feedbacksData.feedbacks.filter(f => f.memberId === member.id);
        
        feedbacksHTML += `
            <div class="member-feedback" id="${member.id}-feedback">
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
    setupFeedbackEvents();
}

// 멤버 드롭다운 설정
function setupMemberDropdowns() {
    // 드롭다운 버튼 클릭 이벤트
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');
    const dropdownContents = document.querySelectorAll('.dropdown-content');
    const memberOptions = document.querySelectorAll('.member-option');
    const memberFeedbacks = document.querySelectorAll('.member-feedback');
    const initialMessage = document.querySelector('.initial-message');
    
    // 드롭다운 버튼 클릭 시 드롭다운 컨텐츠 표시/숨기기
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const dropdownContent = this.nextElementSibling;
            
            // 다른 모든 드롭다운 닫기
            dropdownContents.forEach(content => {
                if (content !== dropdownContent) {
                    content.classList.remove('show');
                    content.previousElementSibling.classList.remove('active');
                }
            });
            
            // 클릭한 드롭다운 토글
            this.classList.toggle('active');
            dropdownContent.classList.toggle('show');
            
            // 드롭다운이 열릴 때 초기 메시지 숨기기
            if (dropdownContent.classList.contains('show')) {
                initialMessage.style.visibility = 'hidden';
                initialMessage.style.position = 'absolute';
                initialMessage.style.height = '0';
                initialMessage.style.minHeight = '0';
                initialMessage.style.padding = '0';
            } else if (!document.querySelector('.member-feedback.active')) {
                // 활성화된 피드백이 없을 때만 초기 메시지 다시 표시
                initialMessage.style.visibility = 'visible';
                initialMessage.style.position = 'relative';
                initialMessage.style.height = 'auto';
                initialMessage.style.minHeight = '200px';
                initialMessage.style.padding = '50px 0';
            }
        });
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.member-dropdown')) {
            dropdownBtns.forEach(btn => btn.classList.remove('active'));
            dropdownContents.forEach(content => content.classList.remove('show'));
        }
    });
    
    // 멤버 옵션 클릭 이벤트 설정
    memberOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 멤버 ID 가져오기
            const memberId = this.getAttribute('data-member');
            const selectedFeedback = document.getElementById(memberId + '-feedback');
            const dropdownBtn = this.closest('.dropdown-content').previousElementSibling;
            const currentDropdown = this.closest('.member-dropdown');
            
            // 이미 선택된 옵션인지 확인
            if (this.classList.contains('active')) {
                return; // 이미 활성화된 경우 완료
            }
            
            // 현재 선택한 드롭다운이 아닌 다른 드롭다운 초기화
            document.querySelectorAll('.member-dropdown').forEach(dropdown => {
                if (dropdown !== currentDropdown) {
                    // 드롭다운 버튼 텍스트 초기화
                    const otherBtn = dropdown.querySelector('.dropdown-btn');
                    otherBtn.querySelector('.dropdown-text').textContent = '멤버 선택';
                    otherBtn.classList.remove('active');
                    
                    // 드롭다운 컨텐츠 닫기
                    dropdown.querySelector('.dropdown-content').classList.remove('show');
                    
                    // 모든 옵션 비활성화
                    dropdown.querySelectorAll('.member-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                }
            });
            
            // 모든 옵션에서 active 클래스 제거
            this.closest('.dropdown-content').querySelectorAll('.member-option').forEach(op => {
                op.classList.remove('active');
            });
            
            // 클릭한 옵션에 active 클래스 추가
            this.classList.add('active');
            
            // 드롭다운 버튼 텍스트 변경
            dropdownBtn.querySelector('.dropdown-text').textContent = this.textContent;
            
            // 드롭다운 닫기
            this.closest('.dropdown-content').classList.remove('show');
            dropdownBtn.classList.remove('active');
            
            // 초기 메시지 완전히 제거 - 여기서 모든 처리
            const initialMsg = document.querySelector('.initial-message');
            initialMsg.style.visibility = 'hidden';
            initialMsg.style.position = 'absolute';
            initialMsg.style.height = '0';
            initialMsg.style.minHeight = '0';
            initialMsg.style.padding = '0';
            
            // 모든 피드백 완전히 제거
            document.querySelectorAll('.member-feedback').forEach(feedback => {
                feedback.classList.remove('active');
                feedback.style.display = 'none';
                feedback.style.opacity = '0';
            });
            
            // 선택한 피드백만 표시 (지연 적용)
            setTimeout(() => {
                if (selectedFeedback) {
                    selectedFeedback.style.display = 'block';
                    void selectedFeedback.offsetWidth; // 레이아웃 재계산 강제
                    selectedFeedback.classList.add('active');
                    selectedFeedback.style.opacity = '1';
                }
            }, 50);
        });
    });
}

// 피드백 이벤트 설정
function setupFeedbackEvents() {
    // 작업물 보기 버튼 이벤트
    const galleryButtons = document.querySelectorAll('.member-gallery-btn');
    galleryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 갤러리 페이지로 이동
            setTimeout(() => {
                const memberId = this.getAttribute('data-filter');
                
                // 멤버 정보를 기반으로 갤러리 필터 설정
                if (window.galleryManager) {
                    // 멤버 ID에 따라 작업자 필터 설정
                    const membersMatch = memberId.match(/^(\w+)(\d+)?$/);
                    if (membersMatch) {
                        const memberName = document.querySelector(`.member-option[data-member="${memberId}"]`).textContent;
                        if (memberName) {
                            window.galleryManager.filterByAuthor(memberName);
                        }
                    }
                }
            }, 100);
        });
    });
}

// 포스트 인터랙션 설정
function setupPostInteractions() {
    // 좋아요 버튼 인터랙션
    const likeButtons = document.querySelectorAll('.post-reaction');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            const countText = this.textContent.trim().split(' ')[1];
            let count = parseInt(countText);
            
            if (icon.classList.contains('far')) {
                // 좋아요 추가
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = 'var(--like-color)';
                count++;
            } else {
                // 좋아요 취소
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
                count--;
            }
            
            this.innerHTML = `<i class="${icon.className}"></i> ${count}`;
        });
    });
    
    // 댓글 버튼 인터랙션
    const commentButtons = document.querySelectorAll('.post-comments');
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('댓글 기능은 현재 준비 중입니다.');
        });
    });
    
    // 공유 버튼 인터랙션
    const shareButtons = document.querySelectorAll('.post-share');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            alert('공유 기능은 현재 준비 중입니다.');
        });
    });
}
