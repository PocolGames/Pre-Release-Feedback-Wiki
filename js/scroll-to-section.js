// 목차 클릭 시 정확한 위치로 이동하도록 설정
document.querySelectorAll('.toc a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        let targetId = this.getAttribute('href').substring(1);
        let targetElement = document.getElementById(targetId);
    
        if (targetElement) {
            let navHeight = document.querySelector('nav').offsetHeight; // 네비게이션 바 높이 자동 감지
            let targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight - 10; // 보정값 추가
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});