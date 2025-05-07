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
    
    // 해시 변경 이벤트 리스너
    window.addEventListener('hashchange', function() {
        // 페이지 변경 시 제한된 콘텐츠 다시 처리
        setTimeout(function() {
            handleRestrictedContent();
        }, 100);
    });
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
    
    // 제한된 콘텐츠 처리 호출
    handleRestrictedContent();
    
    // 해시 변경 없이 현재 화면 새로고침 효과를 주기 위해
    // 현재 페이지 다시 로드
    const currentHash = window.location.hash.substring(1) || 'home';
    showPage(currentHash);
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
    }
}

// 제한된 콘텐츠 처리
function handleRestrictedContent() {
    // 갤러리와 피드백 섹션 요소
    const gallerySection = document.getElementById('gallery');
    const feedbackSection = document.getElementById('feedback');
    
    // 모든 오버레이 제거 (기존 오버레이 초기화)
    const allOverlays = document.querySelectorAll('.login-overlay');
    allOverlays.forEach(overlay => {
        overlay.remove();
    });
    
    // 현재 페이지 확인
    const currentPage = window.location.hash.substring(1) || 'home';
    
    // 로그인 페이지인 경우 오버레이 추가하지 않고 종료
    if (currentPage === 'login') {
        return;
    }
    
    if (gallerySection && feedbackSection) {
        if (isLoggedIn) {
            // 로그인 상태: 제한 해제
            gallerySection.classList.remove('restricted-content');
            feedbackSection.classList.remove('restricted-content');
        } else {
            // 비로그인 상태: 제한 적용
            
            // 갤러리 페이지 제한 처리
            if (currentPage === 'gallery') {
                gallerySection.classList.add('restricted-content');
                
                // 오버레이 생성 및 추가
                const overlay = createLoginOverlay('gallery');
                gallerySection.parentNode.insertBefore(overlay, gallerySection);
            }
            
            // 피드백 페이지 제한 처리
            if (currentPage === 'feedback') {
                feedbackSection.classList.add('restricted-content');
                
                // 오버레이 생성 및 추가
                const overlay = createLoginOverlay('feedback');
                feedbackSection.parentNode.insertBefore(overlay, feedbackSection);
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
const overlay = document.createElement('div');
overlay.className = 'login-overlay';
overlay.id = `${id}-overlay`;
overlay.innerHTML = `
<p>로그인이 필요한 페이지입니다.</p>
<button class="goto-login-btn">로그인 하기</button>
`;

// 로그인 버튼 이벤트 리스너
const loginBtn = overlay.querySelector('.goto-login-btn');
loginBtn.addEventListener('click', function() {
window.location.hash = 'login';
});

return overlay;
}


