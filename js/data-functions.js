// 피드백 페이지 초기화
function resetFeedbackPage() {
    // 드롭다운 버튼 텍스트 초기화
    const dropdownBtns = document.querySelectorAll('.dropdown-btn .dropdown-text');
    dropdownBtns.forEach(btn => {
        btn.textContent = '멤버 선택';
    });
    
    // 드롭다운 버튼 클래스 초기화
    document.querySelectorAll('.dropdown-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 드롭다운 콘텐츠 클래스 초기화
    document.querySelectorAll('.dropdown-content').forEach(content => {
        content.classList.remove('show');
    });
    
    // 모든 멤버 옵션 초기화
    document.querySelectorAll('.member-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // 모든 피드백 클래스 초기화
    document.querySelectorAll('.member-feedback').forEach(feedback => {
        feedback.classList.remove('active');
        feedback.style.display = 'none';
        feedback.style.opacity = '0';
    });
    
    // 초기 메시지 표시
    const initialMessage = document.querySelector('.initial-message');
    if (initialMessage) {
        initialMessage.style.display = 'block'; // display 속성 추가
        initialMessage.style.visibility = 'visible';
        initialMessage.style.position = 'relative';
        initialMessage.style.height = 'auto';
        initialMessage.style.minHeight = '200px';
        initialMessage.style.padding = '50px 0';
        initialMessage.style.opacity = '1'; // 투명도 설정
        initialMessage.style.pointerEvents = 'auto'; // 이벤트 활성화
    }
    
    console.log('피드백 페이지 초기화 완료');
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
    const initialMessage = document.querySelector('.initial-message');
    
    if (!dropdownBtns.length) return;
    
    console.log('멤버 드롭다운 이벤트 설정');
    
    // 드롭다운 버튼 클릭 시 드롭다운 컨텐츠 표시/숨기기
    dropdownBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const dropdownContent = this.nextElementSibling;
            if (!dropdownContent) return;
            
            // 다른 모든 드롭다운 닫기
            dropdownContents.forEach(content => {
                if (content !== dropdownContent) {
                    content.classList.remove('show');
                    if (content.previousElementSibling) {
                        content.previousElementSibling.classList.remove('active');
                    }
                }
            });
            
            // 클릭한 드롭다운 토글
            this.classList.toggle('active');
            dropdownContent.classList.toggle('show');
            
            // 드롭다운이 열릴 때 초기 메시지 숨기기 처리
            const isActive = document.querySelector('.member-feedback.active');
            if (initialMessage) {
                // 활성화된 피드백이 있으면 초기 메시지 완전히 숨김
                if (isActive) {
                    console.log('활성화된 피드백 있음 - 초기 메시지 숨김');
                    initialMessage.style.display = 'none';
                    initialMessage.style.visibility = 'hidden';
                    initialMessage.style.position = 'absolute';
                    initialMessage.style.opacity = '0';
                } else {
                    // 드롭다운 상태에 따른 초기 메시지 처리
                    if (dropdownContent.classList.contains('show')) {
                        console.log('드롭다운 열림 - 초기 메시지 축소');
                        initialMessage.style.visibility = 'hidden';
                        initialMessage.style.position = 'absolute';
                        initialMessage.style.height = '0';
                        initialMessage.style.minHeight = '0';
                        initialMessage.style.padding = '0';
                    } else if (!document.querySelector('.dropdown-content.show')) {
                        // 모든 드롭다운이 닫힌 상태면 초기 메시지 표시
                        console.log('모든 드롭다운 닫힘 - 초기 메시지 표시');
                        initialMessage.style.display = 'block';
                        initialMessage.style.visibility = 'visible';
                        initialMessage.style.position = 'relative';
                        initialMessage.style.height = 'auto';
                        initialMessage.style.minHeight = '200px';
                        initialMessage.style.padding = '50px 0';
                        initialMessage.style.opacity = '1';
                    }
                }
            }
        });
    });
    
    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.member-dropdown')) {
            dropdownBtns.forEach(btn => btn.classList.remove('active'));
            dropdownContents.forEach(content => content.classList.remove('show'));
            
            // 활성화된 멤버 피드백이 없으면 초기 메시지 표시
            const isActive = document.querySelector('.member-feedback.active');
            if (!isActive && initialMessage) {
                console.log('활성화된 피드백 없음 - 초기 메시지 표시');
                initialMessage.style.display = 'block';
                initialMessage.style.visibility = 'visible';
                initialMessage.style.position = 'relative';
                initialMessage.style.height = 'auto';
                initialMessage.style.minHeight = '200px';
                initialMessage.style.padding = '50px 0';
                initialMessage.style.opacity = '1';
            }
        }
    });
    
    // 멤버 옵션 클릭 이벤트 설정
    memberOptions.forEach(option => {
        option.addEventListener('click', function() {
            console.log('멤버 옵션 클릭');
            
            // 멤버 ID 가져오기
            const memberId = this.getAttribute('data-member');
            const selectedFeedback = document.getElementById(memberId + '-feedback');
            const dropdownContent = this.closest('.dropdown-content');
            if (!dropdownContent) return;
            
            const dropdownBtn = dropdownContent.previousElementSibling;
            const currentDropdown = this.closest('.member-dropdown');
            
            // 이미 선택된 옵션인지 확인
            if (this.classList.contains('active')) {
                console.log('이미 선택된 옵션');
                return; // 이미 활성화된 경우 완료
            }
            
            // 현재 선택한 드롭다운이 아닌 다른 드롭다운 초기화
            document.querySelectorAll('.member-dropdown').forEach(dropdown => {
                if (dropdown !== currentDropdown) {
                    // 드롭다운 버튼 텍스트 초기화
                    const otherBtn = dropdown.querySelector('.dropdown-btn');
                    if (otherBtn) {
                        const textElement = otherBtn.querySelector('.dropdown-text');
                        if (textElement) textElement.textContent = '멤버 선택';
                        otherBtn.classList.remove('active');
                    }
                    
                    // 드롭다운 컨텐츠 닫기
                    const content = dropdown.querySelector('.dropdown-content');
                    if (content) content.classList.remove('show');
                    
                    // 모든 옵션 비활성화
                    dropdown.querySelectorAll('.member-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                }
            });
            
            // 모든 옵션에서 active 클래스 제거
            dropdownContent.querySelectorAll('.member-option').forEach(op => {
                op.classList.remove('active');
            });
            
            // 클릭한 옵션에 active 클래스 추가
            this.classList.add('active');
            
            // 드롭다운 버튼 텍스트 변경
            if (dropdownBtn) {
                const textElement = dropdownBtn.querySelector('.dropdown-text');
                if (textElement) textElement.textContent = this.textContent;
                dropdownBtn.classList.remove('active');
            }
            
            // 드롭다운 닫기
            dropdownContent.classList.remove('show');
            
            // 초기 메시지 완전히 제거 (이 부분 강화)
            if (initialMessage) {
                console.log('멤버 선택시 초기 메시지 제거');
                initialMessage.style.display = 'none'; // display 속성 사용
                initialMessage.style.visibility = 'hidden';
                initialMessage.style.position = 'absolute';
                initialMessage.style.height = '0';
                initialMessage.style.minHeight = '0';
                initialMessage.style.padding = '0';
                initialMessage.style.opacity = '0';
                initialMessage.style.pointerEvents = 'none';
            }
            
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
            if (!icon) return;
            
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

// 글로벌 스코프로 노출
window.loadPosts = loadPosts;
window.loadMembers = loadMembers;
window.loadFeedbacks = loadFeedbacks;
window.resetFeedbackPage = resetFeedbackPage;
window.setupMemberDropdowns = setupMemberDropdowns;
window.setupFeedbackEvents = setupFeedbackEvents;
window.setupPostInteractions = setupPostInteractions;