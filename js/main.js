// 로그인 상태를 관리하는 변수
let isLoggedIn = false;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    console.log('문서 로드 완료');
    
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 사이드바 메뉴 이벤트 설정
    setupNavigation();
    
    // 데이터 로드
    loadData();
    
    // 로그인 버튼 이벤트 리스너
    setupLoginButton();
    
    // 지원 방법 버튼 이벤트 리스너
    setupApplyButton();
    
    // 해시 변경 이벤트 리스너
    window.addEventListener('hashchange', handleHashChange);
    
    // 초기 페이지 로드
    handleHashChange();
});

// 로그인 상태 확인
function checkLoginStatus() {
    // localStorage에서 로그인 상태 확인
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // 로그인 상태에 따라 문서 바디에 클래스 추가/제거
    if (isLoggedIn) {
        document.body.classList.add('logged-in');
    } else {
        document.body.classList.remove('logged-in');
    }
    
    // 로그인 상태에 따라 UI 업데이트
    updateUIByLoginStatus();
    
    // 콘솔에 로그인 상태 출력 (디버깅용)
    console.log('로그인 상태:', isLoggedIn);
}

// 네비게이션 설정
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 기본 이벤트 방지
            e.preventDefault();
            
            // 로그아웃 액션 체크 (data-action이 logout인 경우)
            if(this.getAttribute('data-action') === 'logout') {
                // 여기서는 기본 이벤트 막고 handleLogout 함수가 처리
                handleLogout.call(this, e);
            } else {
                // 해시 변경
                window.location.hash = this.getAttribute('href').substring(1);
            }
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
    
    // 각 액티브 섹션에 데이터-페이지-아이디 속성 추가
    const activeSection = document.querySelector('.active-section');
    if (activeSection) {
        activeSection.setAttribute('data-page-id', pageId);
    }
    
    // 제한된 콘텐츠 처리 - 지연 시간을 늘려 페이지 전환 효과가 끝난 후 실행되도록 함
    setTimeout(handleRestrictedContent, 200);
    
    console.log('페이지 전환:', pageId);
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
            // 이미 로그인되어 있는 경우 처리
            const passwordInput = document.getElementById('password-input');
            const loginButton = document.getElementById('login-button');
            const loginError = document.getElementById('login-error');
            
            if (isLoggedIn && passwordInput && loginButton && loginError) {
                passwordInput.disabled = true;
                passwordInput.value = '********';
                loginError.textContent = '이미 로그인되어 있습니다.';
                loginError.style.color = 'var(--accent-color)';
                loginButton.textContent = '환영합니다!';
                loginButton.classList.add('login-success-btn');
            } else {
                // 비밀번호 입력 필드 초기화
                if (passwordInput) {
                    passwordInput.value = '';
                    passwordInput.disabled = false;
                    if (loginError) loginError.textContent = '';
                    if (loginButton) {
                        loginButton.textContent = '로그인';
                        loginButton.classList.remove('login-success-btn');
                    }
                }
            }
        }
        
        // 페이지 상단으로 스크롤
        window.scrollTo(0, 0);
    }
}

// 로그인 버튼 설정
function setupLoginButton() {
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    
    // 이미 로그인되어 있는 경우 UI 업데이트
    if (isLoggedIn && loginButton && loginError && passwordInput) {
        loginError.textContent = '이미 로그인되어 있습니다.';
        loginError.style.color = 'var(--accent-color)';
        loginError.classList.add('login-success');
        loginButton.textContent = '환영합니다!';
        loginButton.classList.add('login-success-btn');
        passwordInput.disabled = true;
        passwordInput.value = '********';
    }
    
    if (loginButton && passwordInput) {
        // 로그인 버튼 클릭 이벤트
        loginButton.addEventListener('click', function() {
            // 이미 로그인된 상태이면 무시
            if (isLoggedIn) return;
            
            // 올바른 비밀번호 확인
            if (passwordInput.value === 'pre') {
                // 로그인 성공
                isLoggedIn = true;
                localStorage.setItem('isLoggedIn', 'true');
                
                // 부모 요소에 로그인 상태 표시
                document.body.classList.add('logged-in');
                
                // 성공 메시지
                loginError.textContent = '로그인 성공!';
                loginError.style.color = 'var(--accent-color)';
                loginError.classList.add('login-success');
                
                // 로그인 버튼 업데이트
                loginButton.textContent = '환영합니다!';
                loginButton.classList.add('login-success-btn');
                
                // 입력 필드 비활성화
                passwordInput.disabled = true;
                
                // UI 업데이트
                updateUIByLoginStatus();
                
                // 콘솔에 로그인 성공 메시지 (디버깅용)
                console.log('로그인 성공!');
                
                // 홈 화면으로 이동 (1초 지연)
                setTimeout(() => {
                    window.location.hash = 'home';
                }, 1000);
            } else {
                // 로그인 실패
                loginError.textContent = '비밀번호가 일치하지 않습니다.';
                loginError.style.color = 'var(--error-color)';
                
                // 입력 필드 초기화
                passwordInput.value = '';
                passwordInput.focus();
                
                // 콘솔에 로그인 실패 메시지 (디버깅용)
                console.log('로그인 실패: 비밀번호 불일치');
            }
        });
        
        // 엔터 키 이벤트
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginButton.click();
            }
        });
    } else {
        // 요소를 찾지 못한 경우 콘솔에 오류 메시지 출력 (디버깅용)
        console.error('로그인 요소를 찾을 수 없습니다:', {
            loginButton: !!loginButton,
            passwordInput: !!passwordInput,
            loginError: !!loginError
        });
    }
}

// 지원 방법 버튼 설정
function setupApplyButton() {
    const applyButton = document.getElementById('apply-button');
    
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            // 지원 방법 페이지로 이동
            window.location.hash = 'apply-info';
        });
    }
}

// 로그인 상태에 따라 UI 업데이트
function updateUIByLoginStatus() {
    // 로그인 버튼/섹션 업데이트
    const loginNav = document.querySelector('.nav-links li a[href="#login"]');
    if (loginNav) {
        const loginText = loginNav.querySelector('.nav-text');
        
        if (isLoggedIn) {
            // 로그인 상태이면 "로그아웃"으로 변경
            loginText.textContent = '로그아웃';
            
            // 클릭 이벤트 변경 (데이터 속성 추가)
            loginNav.setAttribute('data-action', 'logout');
        } else {
            // 로그아웃 상태이면 "로그인"으로 변경
            loginText.textContent = '로그인';
            
            // 데이터 속성 제거
            loginNav.removeAttribute('data-action');
        }
    } else {
        console.error('로그인 네비게이션 요소를 찾을 수 없습니다.');
    }
    
    // 제한된 콘텐츠 처리 호출
    handleRestrictedContent();
}

// 로그아웃 처리
function handleLogout(e) {
    e.preventDefault(); // 기본 이벤트 방지
    
    // data-action 속성이 logout인지 확인
    if (this.getAttribute('data-action') === 'logout') {
        // 로그아웃 확인
        if (confirm('로그아웃 하시겠습니까?')) {
            // 로그아웃 처리
            isLoggedIn = false;
            localStorage.removeItem('isLoggedIn');
            
            // 콘솔에 로그아웃 메시지 (디버깅용)
            console.log('로그아웃 성공!');
            
            // 공통 요소에서 로그인 상태 표시 제거
            document.body.classList.remove('logged-in');
            
            // UI 업데이트
            updateUIByLoginStatus();
            
            // 현재 제한된 페이지에 있다면 홈으로 이동
            const currentHash = window.location.hash.substring(1);
            if (currentHash === 'gallery' || currentHash === 'feedback') {
                window.location.hash = 'home';
            }
        }
    } else {
        // 일반 네비게이션 동작 (로그아웃이 아닌 경우)
        console.log('일반 네비게이션 - 로그인 페이지로 이동');
    }
}

// 제한된 콘텐츠 처리
function handleRestrictedContent() {
    console.log('제한된 콘텐츠 처리 실행');
    
    // 갤러리와 피드백 섹션 요소
    const gallerySection = document.getElementById('gallery');
    const feedbackSection = document.getElementById('feedback');
    
    // 현재 페이지 확인
    const currentPage = window.location.hash.substring(1) || 'home';
    console.log('현재 페이지:', currentPage);
    
    // 로그인 페이지인 경우 오버레이 처리하지 않고 종료
    if (currentPage === 'login') {
        return;
    }
    
    // 중요: 모든 오버레이를 먼저 제거
    const allOverlays = document.querySelectorAll('.login-overlay');
    allOverlays.forEach(overlay => {
        console.log('오버레이 제거:', overlay.id);
        overlay.parentNode.removeChild(overlay);
    });
    
    if (gallerySection && feedbackSection) {
        // 모든 제한된 콘텐츠 클래스 초기화
        gallerySection.classList.remove('restricted-content');
        feedbackSection.classList.remove('restricted-content');
        
        if (isLoggedIn) {
            // 로그인 상태: 제한 해제
            console.log('로그인 상태: 제한 해제');
        } else {
            // 비로그인 상태: 제한 적용
            console.log('비로그인 상태: 제한 적용');
            
            // 갤러리 페이지 제한 처리
            if (currentPage === 'gallery') {
                console.log('갤러리 페이지 제한 처리');
                gallerySection.classList.add('restricted-content');
                
                // 오버레이 생성 및 추가
                const galleryOverlay = createLoginOverlay('gallery');
                gallerySection.parentNode.insertBefore(galleryOverlay, gallerySection);
                
                // 애니메이션 활성화를 위한 클래스 추가
                setTimeout(() => {
                    galleryOverlay.classList.add('show');
                }, 10);
                
                console.log('갤러리 오버레이 추가됨');
            }
            
            // 피드백 페이지 제한 처리
            if (currentPage === 'feedback') {
                console.log('피드백 페이지 제한 처리');
                feedbackSection.classList.add('restricted-content');
                
                // 오버레이 생성 및 추가
                const feedbackOverlay = createLoginOverlay('feedback');
                feedbackSection.parentNode.insertBefore(feedbackOverlay, feedbackSection);
                
                // 애니메이션 활성화를 위한 클래스 추가
                setTimeout(() => {
                    feedbackOverlay.classList.add('show');
                }, 10);
                
                console.log('피드백 오버레이 추가됨');
            }
            
            // 페이지 상단으로 스크롤
            if (currentPage === 'gallery' || currentPage === 'feedback') {
                window.scrollTo(0, 0);
            }
        }
    }
}

// 로그인 오버레이 생성 함수
function createLoginOverlay(id) {
    // 기존 오버레이 제거 (동일 ID가 있는 경우)
    const existingOverlay = document.getElementById(`${id}-overlay`);
    if (existingOverlay) {
        existingOverlay.parentNode.removeChild(existingOverlay);
        console.log(`기존 ${id} 오버레이 제거됨`);
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'login-overlay';
    overlay.id = `${id}-overlay`;
    
    // 각 섹션별 맞춤 메시지 설정
    let customMessage = '로그인이 필요한 페이지입니다.';
    if (id === 'gallery') {
        customMessage = '작업물 갤러리를 보려면 로그인이 필요합니다.';
    } else if (id === 'feedback') {
        customMessage = '피드백 내용을 확인하려면 로그인이 필요합니다.';
    }
    
    overlay.innerHTML = `
        <p>${customMessage}</p>
        <button class="goto-login-btn">로그인 하기</button>
    `;
    
    // 로그인 버튼 이벤트 리스너
    const loginBtn = overlay.querySelector('.goto-login-btn');
    loginBtn.addEventListener('click', function() {
        window.location.hash = 'login';
    });
    
    return overlay;
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
            const postsContainer = document.getElementById('posts-container');
            if (postsContainer) {
                postsContainer.innerHTML = '<div class="error-message">포스트 데이터를 불러오는 데 실패했습니다.</div>';
            }
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
        const memberTabs = document.querySelector('.member-tabs');
        if (memberTabs) {
            memberTabs.innerHTML = '<div class="error-message">데이터를 불러오는 데 실패했습니다.</div>';
        }
    });

    // 갤러리 매니저 초기화
    // 비모듈 방식으로 갤러리 관리자 로드
    try {
        // 스크립트 동적 추가
        const galleryScript = document.createElement('script');
        galleryScript.src = 'js/components/galleryManager.js';
        galleryScript.onload = function() {
            // 갤러리 관리자 초기화 (스크립트가 로드된 후)
            if (typeof GalleryManager !== 'undefined') {
                window.galleryManager = new GalleryManager();
                console.log('갤러리 관리자 로드 성공');
            } else {
                console.error('GalleryManager 클래스를 찾을 수 없습니다.');
            }
        };
        galleryScript.onerror = function() {
            console.error('갤러리 관리자 스크립트 로드 실패');
            const galleryGrid = document.querySelector('.gallery-grid');
            if (galleryGrid) {
                galleryGrid.innerHTML = '<div class="error-message">갤러리를 불러오는 데 실패했습니다.</div>';
            }
        };
        document.head.appendChild(galleryScript);
    } catch (error) {
        console.error('갤러리 관리자 로드 실패:', error);
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            galleryGrid.innerHTML = '<div class="error-message">갤러리를 불러오는 데 실패했습니다.</div>';
        }
    }
}