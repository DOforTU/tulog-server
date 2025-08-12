import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Editor } from './editor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Editor])],
  providers: [],
  controllers: [],
  exports: [],
})
export class EditorModule {}
