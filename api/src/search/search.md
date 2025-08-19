# tag로 검색기능

사용자는 태그를 검색함으로써 연관된 게시글과 작성한 유저정보를 가져올 수 있다.

tag를 query로 받고 --> postService에서 게시글을 가져오는 방식으로 진행 --> post를 통해서 유저정보를 가져오는데 public으로 가져올것

post.editor가 있을거임 배열에 담긴 역할이 분배된 유저정보를 가져옴 postCardDto로 post를 반환한다.

postCardDto는 유저에게 최소한으로 보여주는 게시글 정보이다.
