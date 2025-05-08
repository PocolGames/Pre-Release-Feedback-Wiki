/**
 * 피드백 매니저 - 피드백 페이지 관리 기능
 */
class FeedbackManager {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('피드백 매니저 초기화');
        this.setupMemberOptions();
    }
    
    setupMemberOptions() {
        // 멤버 옵션 버튼 찾기
        const memberOptions = document.querySelectorAll('.member-option');
        if (!memberOptions.length) {
            console.log('멤버 옵션을 찾을 수 없음');
            return;
        }
        
        // 초기 메시지 참조
        const initialMessage = document.querySelector('.initial-message');
        
        // 각 멤버 옵션에 클릭 이벤트 추가
        memberOptions.forEach(option => {
            option.addEventListener('click', () => {
                console.log('멤버 옵션 클릭됨!');
                
                // 초기 메시지 제거
                if (initialMessage && initialMessage.parentNode) {
                    console.log('초기 메시지 DOM에서 제거');
                    initialMessage.parentNode.removeChild(initialMessage);
                }
            });
        });
    }
}

// 피드백 페이지에 로드될 때 실행
document.addEventListener('DOMContentLoaded', () => {
    // 페이지 로드 시 피드백 매니저 초기화
    window.feedbackManager = new FeedbackManager();
});

// 해시 변경 시 실행 (SPA 방식으로 페이지 전환 시)
window.addEventListener('hashchange', () => {
    // 피드백 페이지로 전환된 경우에만 초기화
    if (window.location.hash === '#feedback') {
        setTimeout(() => {
            // 페이지 전환 후 약간 지연 시간을 둔 후 초기화
            window.feedbackManager = new FeedbackManager();
        }, 300);
    }
});
