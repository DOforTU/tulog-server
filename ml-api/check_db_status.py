#!/usr/bin/env python3
"""
데이터베이스 연결 상태 및 포스트 개수 확인 스크립트
"""

import asyncio
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, func
from app.core.database import engine
from app.models.database import Post, User, Editor, Team, Tag
from app.core.config import settings

def check_db_connection():
    """데이터베이스 연결 상태 확인"""
    print("🔍 데이터베이스 연결 상태 확인 중...")
    print(f"📋 DATABASE_URL: {settings.DATABASE_URL}")
    
    try:
        # 데이터베이스 연결 테스트
        with engine.connect() as connection:
            # 기본 연결 테스트
            result = connection.execute(text("SELECT 1"))
            if result.fetchone():
                print("✅ 데이터베이스 연결 성공!")
                
            # PostgreSQL 버전 확인
            version_result = connection.execute(text("SELECT version()"))
            version = version_result.fetchone()[0]
            print(f"🗄️  PostgreSQL 버전: {version.split(',')[0]}")
            
            # 스키마 존재 확인
            schema_result = connection.execute(text("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = 'server_api'
            """))
            if schema_result.fetchone():
                print("✅ server_api 스키마 존재 확인")
            else:
                print("❌ server_api 스키마를 찾을 수 없습니다!")
                return False
                
            return True
    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return False

def check_tables_and_data():
    """테이블 존재 여부 및 데이터 개수 확인"""
    print("\n📊 테이블 및 데이터 확인 중...")
    
    try:
        SessionLocal = sessionmaker(bind=engine)
        session = SessionLocal()
        
        # 각 테이블별 데이터 개수 확인
        tables_info = [
            ("사용자", User, User.id),
            ("포스트", Post, Post.id), 
            ("에디터", Editor, Editor.postId),  # Editor는 복합키라서 postId 사용
            ("팀", Team, Team.id),
            ("태그", Tag, Tag.id)
        ]
        
        for table_name, model, count_field in tables_info:
            try:
                count = session.query(func.count(count_field)).scalar()
                print(f"📄 {table_name}: {count:,}개")
            except Exception as e:
                print(f"❌ {table_name} 테이블 조회 실패: {e}")
        
        # 포스트 상태별 개수 확인
        print("\n📝 포스트 상태별 분석:")
        post_status_query = session.query(
            Post.status, 
            func.count(Post.id).label('count')
        ).group_by(Post.status)
        
        for status, count in post_status_query.all():
            print(f"  - {status}: {count:,}개")
            
        # PUBLIC 포스트만 확인 (검색에 사용되는 포스트)
        public_posts = session.query(func.count(Post.id)).filter(
            Post.status == 'PUBLIC',
            Post.deletedAt.is_(None)
        ).scalar()
        print(f"🔍 검색 가능한 포스트 (PUBLIC, 삭제되지 않음): {public_posts:,}개")
        
        # 최근 포스트 몇 개 확인
        print("\n📋 최근 포스트 샘플:")
        recent_posts = session.query(Post).filter(
            Post.status == 'PUBLIC',
            Post.deletedAt.is_(None)
        ).order_by(Post.createdAt.desc()).limit(5).all()
        
        for i, post in enumerate(recent_posts, 1):
            author = post.author
            author_name = author.nickname if author else "Unknown"
            print(f"  {i}. [{post.id}] {post.title[:50]}... (작성자: {author_name})")
            
        session.close()
        
    except Exception as e:
        print(f"❌ 데이터 조회 실패: {e}")
        return False
        
    return True

def check_ml_requirements():
    """ML 검색을 위한 데이터 요구사항 확인"""
    print("\n🤖 ML 검색 요구사항 확인:")
    
    try:
        SessionLocal = sessionmaker(bind=engine)
        session = SessionLocal()
        
        # 제목과 내용이 있는 포스트 확인
        valid_posts = session.query(func.count(Post.id)).filter(
            Post.status == 'PUBLIC',
            Post.deletedAt.is_(None),
            Post.title.isnot(None),
            Post.title != '',
            Post.content.isnot(None), 
            Post.content != ''
        ).scalar()
        
        print(f"✅ ML 검색 가능한 포스트: {valid_posts:,}개")
        
        # 벡터 인덱스 파일 확인
        import os
        vector_path = settings.VECTOR_DB_PATH
        index_file = os.path.join(vector_path, f"{settings.INDEX_NAME}.faiss")
        
        if os.path.exists(index_file):
            file_size = os.path.getsize(index_file)
            print(f"✅ 벡터 인덱스 파일 존재: {index_file} ({file_size:,} bytes)")
        else:
            print(f"❌ 벡터 인덱스 파일 없음: {index_file}")
            print("💡 python init_vector_index.py 명령으로 인덱스를 생성하세요.")
            
        session.close()
        
    except Exception as e:
        print(f"❌ ML 요구사항 확인 실패: {e}")

def main():
    """메인 실행 함수"""
    print("=" * 60)
    print("🔍 TULOG ML API - 데이터베이스 상태 확인")
    print("=" * 60)
    
    # 1. 데이터베이스 연결 확인
    if not check_db_connection():
        print("❌ 데이터베이스 연결에 실패했습니다. 프로그램을 종료합니다.")
        return
    
    # 2. 테이블 및 데이터 확인
    if not check_tables_and_data():
        print("❌ 데이터 조회에 실패했습니다.")
        return
        
    # 3. ML 요구사항 확인
    check_ml_requirements()
    
    print("\n" + "=" * 60)
    print("✅ 데이터베이스 상태 확인 완료!")
    print("=" * 60)

if __name__ == "__main__":
    main()
