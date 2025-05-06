// 인터랙션 객체
const Interactions = {
    // SNS 포스트 인터랙션 설정
    setupPostInteractions: function() {
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
    },
    
    // 갤러리 필터링 설정
    setupGalleryFilter: function() {
        const filterBtns = document.querySelectorAll('.tab-btn');
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 모든 버튼에서 active 클래스 제거
                filterBtns.forEach(b => b.classList.remove('active'));
                
                // 클릭한 버튼에 active 클래스 추가
                this.classList.add('active');
                
                // 필터 카테고리 가져오기
                const category = this.getAttribute('data-category');
                
                // 갤러리 아이템 필터링
                galleryItems.forEach(item => {
                    if (category === 'all' || item.classList.contains(category)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    },
    
    // 갤러리 이벤트 설정
    setupGalleryEvents: function() {
        // 자세히 보기 버튼 이벤트
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const projectId = this.getAttribute('data-id');
                this.showProjectDetails(projectId);
            }.bind(this));
        });
    },
    
    // 프로젝트 상세 보기 표시
    showProjectDetails: function(projectId) {
        fetch(`data/projects.json`)
            .then(response => response.json())
            .then(data => {
                const project = data.projects.find(p => p.id === projectId);
                
                if (!project) {
                    alert('프로젝트 정보를 찾을 수 없습니다.');
                    return;
                }
                
                // 모달 생성
                const modal = document.createElement('div');
                modal.classList.add('project-modal');
                
                // 모달 내용 설정
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h2>${project.title}</h2>
                        <p class="project-author">제작자: ${project.author}</p>
                        <div class="project-details">
                            ${project.description.map(p => `<p>${p}</p>`).join('')}
                        </div>
                        ${project.images && project.images.length > 0 ?
                            `<div class="project-gallery">
                                ${project.images.map(img => `<img src="${img}" alt="${project.title}">`).join('')}
                            </div>` : ''
                        }
                        ${project.github ?
                            `<a href="${project.github}" target="_blank" class="github-btn">
                                <i class="fab fa-github"></i> GitHub 바로가기
                            </a>` : ''
                        }
                    </div>
                `;
                
                // 모달 추가 및 표시
                document.body.appendChild(modal);
                
                // 모달 닫기 버튼 이벤트
                const closeButton = modal.querySelector('.close-modal');
                closeButton.addEventListener('click', function() {
                    document.body.removeChild(modal);
                });
                
                // 모달 외부 클릭 시 닫기
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        document.body.removeChild(modal);
                    }
                });
            })
            .catch(error => {
                console.error('프로젝트 데이터 로드 실패:', error);
            });
    },
    
    // 멤버 탭 설정
    setupMemberTabs: function() {
        const memberTabs = document.querySelectorAll('.member-tab');
        const memberFeedbacks = document.querySelectorAll('.member-feedback');
        
        memberTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 모든 탭에서 active 클래스 제거
                memberTabs.forEach(t => t.classList.remove('active'));
                
                // 클릭한 탭에 active 클래스 추가
                this.classList.add('active');
                
                // 멤버 ID 가져오기
                const memberId = this.getAttribute('data-member');
                
                // 멤버 피드백 표시/숨김
                memberFeedbacks.forEach(feedback => {
                    feedback.classList.remove('active');
                    
                    if (feedback.id === memberId + '-feedback') {
                        feedback.classList.add('active');
                    }
                });
            });
        });
    },
    
    // 피드백 이벤트 설정
    setupFeedbackEvents: function() {
        // 작업물 보기 버튼 이벤트
        const galleryButtons = document.querySelectorAll('.member-gallery-btn');
        galleryButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // 멤버 ID 가져오기
                const memberId = this.getAttribute('data-filter');
                
                // 갤러리 페이지로 이동 및 필터링 정보 전달
                window.location.hash = 'gallery';
                localStorage.setItem('galleryFilter', memberId);
            });
        });
    }
};
