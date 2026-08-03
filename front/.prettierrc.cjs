module.exports = {
  singleQuote: true, // 문자열은 작은따옴표
  semi: true, // 문장 끝에 세미콜론 추가
  useTabs: false, // 들여쓰기는 스페이스 사용
  tabWidth: 2, // 들여쓰기 폭 2칸
  trailingComma: 'all', // 여러 줄일 때 마지막 요소 뒤에도 콤마 추가
  printWidth: 80, // 한 줄 최대 길이
  bracketSpacing: true, // 객체 리터럴 중괄호 안쪽 공백 { foo }
  arrowParens: 'always', // 화살표 함수 인자 괄호 항상 표시 (x) => x
  endOfLine: 'auto' // 기존 파일의 줄바꿈 문자(LF/CRLF) 유지
}
