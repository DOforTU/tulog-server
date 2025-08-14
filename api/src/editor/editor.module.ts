import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Editor } from './editor.entity';
import { Post } from 'src/post/post.entity';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';
import { EditorRepository } from './editor.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Editor, Post])],
  providers: [EditorService, EditorRepository],
  controllers: [EditorController],
  exports: [EditorService, EditorRepository],
})
export class EditorModule {}
