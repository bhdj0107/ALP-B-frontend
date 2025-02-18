<template>
    <div class="user-profile">
        <span class="user-profile-text">유저 이름</span> <!-- 유저 이름 텍스트 -->
        <button class="user-profile-button">로그아웃</button>
        <button class="user-profile-button">회원가입</button>
        <button class="user-profile-button">로그인</button>
    </div>
</template>

<script>
export default {
    props: {
        user: Object
    }
}
</script>

<style scoped>
.user-profile-button {
    background-color: #d5006d; /* 버튼 배경색 */
    color: #ffffff; /* 버튼 텍스트 색상 */
    border: 2px solid #4a1c2e; /* 변경: 버튼 테두리 색상 */
    border-radius: 4px;
    padding: 0.45rem 0.9rem; /* 패딩을 줄여서 크기 감소 */
    font-size: 0.9rem; /* 폰트 크기를 줄여서 크기 감소 */
    cursor: pointer;
    transition: background-color 0.3s;
}

.user-profile-button:hover {
    background-color: #b0004d; /* 버튼 호버 색상 */
}

/* 추가: 유저 프로필 텍스트 스타일 */
.user-profile-text {
    color: #c71585; /* 변경: 짙은 분홍색 텍스트 색상 */
    margin: 0 0.5rem; /* 좌우 여백 */
}
</style> 