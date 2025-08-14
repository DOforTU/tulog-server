import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Editor } from './editor.entity';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Editor])],
  providers: [EditorService],
  controllers: [EditorController],
  exports: [],
})
export class EditorModule {}
