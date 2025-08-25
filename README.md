# 프로젝트 협업 규칙

## 브랜치 전략

기능별 접두사 + 이슈번호

- 예시:  
  - `feature/1`  
  - `fix/3`


## Git Issue 활용 방식

Git Issue는 **프로젝트 완성을 위해 개발자가 수행해야 하는 기능 단위 작업을 세분화**해서 관리하기

- 자신이 맡은 기능을 **기능 단위로 쪼개어 Issue 등록**
- Issue 제목은 간결하게, 내용은 구체적으로 작성
- 할당(Assignee), 마일스톤, 라벨 등을 활용해 업무 분류

### 예시

- **제목:** 유저 로그인 API 구현
- **내용:**
  - JWT 토큰 생성
  - 로그인 실패 예외 처리
  - 유닛 테스트 작성



## WBS (Work Breakdown Structure) 사용 방식

WBS는 위에서 세분화한 작업을 **언제 누가 어떻게 진행했는지를 기록**하는 용도로 사용합니다.

- 각 Issue를 수행하는 작업 일정을 기록
- 시작일, 종료일, 담당자, 상태 등 포함
- 팀원 간 작업 진행 상황 공유 및 일정 관리 목적

---

# NBE6-8-1-Team08 프론트엔드

###  설치 및 실행 방법


```bash


git clone https://github.com/Devcourse-BE6-8-2-Team04/Frontend.git
cd Team4_Frontend/frontend
npm install
npm install clsx lucide-react
npm install react-slick slick-carousel
npm install --save-dev @types/react-slick

npm run dev
```


- 기본 접속 주소: http://localhost:3000

