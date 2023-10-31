module.exports = {
  INTERNAL_SERVER_ERR: `Internal Server Error\n서버에서 문제가 발생했습니다.\n나중에 다시 시도해 주세요.`,
  NOT_FOUND: "해당 페이지를 찾을 수 없습니다.",
  PROCESS_ERR: "요청하신 페이지를 처리하는 중 오류가 발생했습니다.",
  AUTH: {
    NEED_EMAIL: "이메일을 입력해주세요.",
    NEED_PW: "비밀번호를 입력해주세요.",
    NEED_ALL: "이메일과 비밀번호는 필수입니다.",
    EXISTING_EMAIL: "이미 가입된 이메일 주소입니다.",
    UNMATCHED_PW: "비밀번호와 일치하지 않습니다.",
    WRONG_EMAIL_PW: "이메일 주소 또는 비밀번호를 잘못 입력하셨습니다.",
    UNAUTHORIZED: "접근 권한이 없습니다./n로그인한 상태가 아닙니다.",
    NOT_FOUND_TOKEN: "Token을 찾을 수 없습니다.",
    NEED_REFRESH_TOKEN: "Refresh Token이 필요합니다.",
    INVALID_REFRESH_TOKEN: "Refresh Token이 유효하지 않습니다.",
    INVALID_ACCESS_TOKEN: "Access Token이 유효하지 않습니다.",
  },
  CALENDAR: {
    EMPTY_LIST: "현재 생성된 WonderBox 캘린더가 없습니다.",
    FAILED_UPDATE: "캘린더 저장에 실패했습니다.",
    FAILED_POST: "캘린더 생성에 실패했습니다.",
    UPDATE_SUCCESS: "캘린더가 정상적으로 업데이트 되었습니다.",
    POST_SUCCESS: "캘린더가 정상적으로 생성 되었습니다.",
    DELETE_SUCCESS: "캘린더가 정상적으로 삭제되었습니다.",
    INVALID_OPTION: "해당 항목을 찾을 수 없습니다.",
    NOT_FOUND_BASE_INFO: "캘린더 기본 정보를 찾을 수 없습니다."
  },
}
