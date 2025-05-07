// 인증 관련 JavaScript

// 로그인 상태를 관리하는 변수
let isLoggedIn = false;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkLoginStatus();
    
    // 로그인 버튼 이벤트 리스너
    setupLoginButton();
    
    // 지원 방법 버튼 이벤트 리스너
    setupApplyButton();
    
    // 제한된 콘텐츠 처리
    handleRestrictedContent();
});

// 로그인 상태 확인
function checkLoginStatus() {
    // localStorage에서 로그인 상태 확인
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // 로그인 상태에 따라 UI 업데이트
    updateUIByLoginStatus();
}

// 로그인 버튼 설정
function setupLoginButton() {
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    
    if (loginButton && passwordInput) {
        // 로그인 버튼 클릭 이벤트
        loginButton.addEventListener('click', function() {
            // 올바른 비밀번호 확인
            if (passwordInput.value === 'pre') {
                // 로그인 성공
                isLoggedIn = true;
                localStorage.setItem('isLoggedIn', 'true');
                
                // 성공 메시지
                loginError.textContent = '로그인 성공!';
                loginError.style.color = 'green';
                
                // UI 업데이트
                updateUIByLoginStatus();
                
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
            }
        });
        
        // 엔터 키 이벤트
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginButton.click();
            }
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
            
            // 로그아웃 이벤트 리스너 추가
            loginNav.addEventListener('click', handleLogout);
        } else {
            // 로그아웃 상태이면 "로그인"으로 변경
            loginText.textContent = '로그인';
            
            // 데이터 속성 제거
            loginNav.removeAttribute('data-action');
            
            // 이전 이벤트 리스너 제거 시도
            loginNav.removeEventListener('click', handleLogout);
        }
    }
    
    // 제한된 콘텐츠 처리
    handleRestrictedContent();
}

// 로그아웃 처리
function handleLogout(e) {
    if (this.getAttribute('data-action') === 'logout') {
        e.preventDefault();
        
        // 로그아웃 확인
        if (confirm('로그아웃 하시겠습니까?')) {
            // 로그아웃 처리
            isLoggedIn = false;
            localStorage.removeItem('isLoggedIn');
            
            // UI 업데이트
            updateUIByLoginStatus();
            
            // 현재 제한된 페이지에 있다면 홈으로 이동
            const currentHash = window.location.hash.substring(1);
            if (currentHash === 'gallery' || currentHash === 'feedback') {
                window.location.hash = 'home';
            }
        }
    }
}

// 제한된 콘텐츠 처리
function handleRestrictedContent() {
    // 갤러리와 피드백 섹션 요소
    const gallerySection = document.getElementById('gallery');
    const feedbackSection = document.getElementById('feedback');
    
    if (gallerySection && feedbackSection) {
        if (isLoggedIn) {
            // 로그인 상태: 제한 해제
            removeRestriction(gallerySection);
            removeRestriction(feedbackSection);
        } else {
            // 비로그인 상태: 제한 적용
            applyRestriction(gallerySection);
            applyRestriction(feedbackSection);
            
            // 현재 페이지가 제한된 페이지인지 확인
            const currentHash = window.location.hash.substring(1);
            if (currentHash === 'gallery' || currentHash === 'feedback') {
                // 페이지 상단으로 스크롤
                window.scrollTo(0, 0);
            }
        }
    }
}

// 제한 적용
function applyRestriction(element) {
    // 이미 처리되어 있는지 확인
    if (!element.classList.contains('restricted-content')) {
        // 제한 클래스 추가
        element.classList.add('restricted-content');
        
        // 기존 오버레이 제거 (중복 방지)
        const existingOverlay = element.querySelector('.login-overlay');
        if (existingOverlay) {
            element.removeChild(existingOverlay);
        }
        
        // 오버레이 생성 및 추가
        const overlay = document.createElement('div');
        overlay.className = 'login-overlay';
        overlay.innerHTML = `
            <p>로그인이 필요한 페이지입니다.</p>
            <button class="goto-login-btn">로그인 하기</button>
        `;
        
        // 오버레이를 콘텐츠 보다 앞에 추가 (첫번째 자식으로)
        element.prepend(overlay);
        
        // 로그인 버튼 이벤트 리스너
        const loginBtn = overlay.querySelector('.goto-login-btn');
        loginBtn.addEventListener('click', function() {
            window.location.hash = 'login';
        });
    }
}

// 제한 해제
function removeRestriction(element) {
    // 제한 클래스 제거
    element.classList.remove('restricted-content');
    
    // 오버레이 제거
    const overlay = element.querySelector('.login-overlay');
    if (overlay) {
        element.removeChild(overlay);
    }
}
