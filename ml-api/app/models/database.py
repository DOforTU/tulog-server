from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "user"
    __table_args__ = {"schema": "server_api"}
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    nickname = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)  # USER-DEFINED enum type
    profilePicture = Column("profilePicture", String)
    isActive = Column("isActive", Boolean)
    createdAt = Column("createdAt", DateTime)
    updatedAt = Column("updatedAt", DateTime)
    deletedAt = Column("deletedAt", DateTime, nullable=True)
    
    # Relationships
    editors = relationship("Editor", back_populates="user")

class Post(Base):
    __tablename__ = "post"
    __table_args__ = {"schema": "server_api"}
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    excerpt = Column(Text)
    thumbnailImage = Column("thumbnailImage", String)
    status = Column(String)  # USER-DEFINED enum type
    viewCount = Column("viewCount", Integer)
    likeCount = Column("likeCount", Integer) 
    commentCount = Column("commentCount", Integer)
    teamId = Column("teamId", Integer, ForeignKey("server_api.team.id"), nullable=True)
    createdAt = Column("createdAt", DateTime)
    updatedAt = Column("updatedAt", DateTime)
    deletedAt = Column("deletedAt", DateTime, nullable=True)
    
    # Relationships
    team = relationship("Team", back_populates="posts")
    tags = relationship("PostTag", back_populates="post")
    editors = relationship("Editor", back_populates="post")
    
    # Helper properties to get the author (owner) of the post
    @property
    def author(self):
        """Get the author (OWNER) of this post from editors relationship"""
        for editor in self.editors:
            if editor.role == 'OWNER':
                return editor.user
        return None
    
    @property
    def author_id(self):
        """Get the author's user ID"""
        author = self.author
        return author.id if author else None

class Editor(Base):
    __tablename__ = "editor"
    __table_args__ = {"schema": "server_api"}
    
    postId = Column("postId", Integer, ForeignKey("server_api.post.id"), primary_key=True)
    userId = Column("userId", Integer, ForeignKey("server_api.user.id"), primary_key=True)
    role = Column(String)  # 'OWNER', 'EDITOR', etc.
    createdAt = Column("createdAt", DateTime)
    
    # Relationships
    post = relationship("Post", back_populates="editors")
    user = relationship("User", back_populates="editors")

class Team(Base):
    __tablename__ = "team"
    __table_args__ = {"schema": "server_api"}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    introduction = Column(Text)  # 실제 필드명: introduction
    maxMember = Column("maxMember", Integer, default=10)  # 실제 필드
    visibility = Column(String)  # ONLY_INVITE, INVITE_AND_REQUEST
    mainImage = Column("mainImage", String)  # 실제 필드명: mainImage
    createdAt = Column("createdAt", DateTime)
    updatedAt = Column("updatedAt", DateTime)
    deletedAt = Column("deletedAt", DateTime, nullable=True)
    
    # Relationships
    posts = relationship("Post", back_populates="team")

class Tag(Base):
    __tablename__ = "tag"
    __table_args__ = {"schema": "server_api"}
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    createdAt = Column("createdAt", DateTime)

class PostTag(Base):
    __tablename__ = "post_tag"
    __table_args__ = {"schema": "server_api"}
    
    postId = Column("postId", Integer, ForeignKey("server_api.post.id"), primary_key=True)
    tagId = Column("tagId", Integer, ForeignKey("server_api.tag.id"), primary_key=True)
    createdAt = Column("createdAt", DateTime)
    
    # Relationships
    post = relationship("Post", back_populates="tags")
    tag = relationship("Tag")
